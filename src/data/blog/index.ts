import type { BlogPosts, BlogPost } from "./types";

export type { BlogPost, BlogPosts };
import { slugify } from "@/utils/slug";

/**
 * Dynamic loader for blog posts using import.meta.glob
 * This ensures blog JSON files are loaded on-demand and create separate chunks
 * Each JSON file becomes its own chunk, loaded only when needed
 * 
 * Performance benefit: Blog data is NOT in the initial bundle, reducing initial JS payload
 */
const postModules = import.meta.glob<{ default: BlogPosts }>("./*.json", {
  eager: false, // Lazy load - creates separate chunks for each JSON file
});

// Cache for loaded posts by topic ID
let blogPostsByTopic: Record<string, BlogPosts> = {};
let loadPromise: Promise<void> | null = null;

/**
 * Extract topic ID from file path
 * Example: "./default.json" -> "default"
 * Example: "./interview_*.json" -> "interview_*"
 */
function getTopicIdFromPath(path: string): string {
  const filename = path.replace(/^\.\//, "").replace(/\.json$/, "");
  return filename;
}

/**
 * Load all blog posts on-demand and cache them
 * Returns a promise that resolves when all posts are loaded
 * This is called automatically when blog data is first accessed
 */
export function loadAllBlogPosts(): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = Promise.all(
    Object.entries(postModules).map(async ([path, loader]) => {
      const topicId = getTopicIdFromPath(path);
      const module = await loader();
      blogPostsByTopic[topicId] = module.default;
    })
  ).then(() => {
    // All posts loaded and cached
  });

  return loadPromise;
}

/**
 * Get blog posts for a specific topic
 * Note: This will return empty array if posts haven't loaded yet
 * Components should call loadAllBlogPosts() first
 */
export function getBlogPostsForTopic(topicId: string): BlogPosts {
  return blogPostsByTopic[topicId] || blogPostsByTopic.default || [];
}

/**
 * Get all blog posts from all topics combined
 * Note: This will return empty array if posts haven't loaded yet
 * Components should call loadAllBlogPosts() first
 * 
 * Posts from "default" topic are always first (for FeaturedCard)
 */
export function getAllBlogPosts(): BlogPosts {
  const allPosts: BlogPosts = [];
  
  // Always put default posts first (for FeaturedCard)
  if (blogPostsByTopic.default) {
    allPosts.push(...blogPostsByTopic.default);
  }
  
  // Then add all other topics
  Object.entries(blogPostsByTopic).forEach(([topicId, posts]) => {
    if (topicId !== 'default') {
      allPosts.push(...posts);
    }
  });
  
  return allPosts;
}

/**
 * Get a blog post by slug (searches across all topics)
 * Note: This will return null if posts haven't loaded yet
 * Components should call loadAllBlogPosts() first
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const allPosts = getAllBlogPosts();
  
  // Try to find by slug field first, then by generating slug from title
  const post = allPosts.find((p) => {
    if (p.slug) {
      return p.slug === slug;
    }
    return slugify(p.title) === slug;
  });

  return post || null;
}

/**
 * Get the topic ID for a given blog post
 */
export function getBlogPostTopicId(post: BlogPost): string | null {
  for (const [topicId, posts] of Object.entries(blogPostsByTopic)) {
    if (posts.some((p) => p.id === post.id && p.title === post.title)) {
      return topicId;
    }
  }
  return null;
}

/**
 * Get the slug for a blog post (uses existing slug or generates from title)
 */
export function getBlogPostSlug(post: BlogPost): string {
  return post.slug || slugify(post.title);
}

/**
 * Get related blog posts based on shared tags or category.
 * 
 * Uses a scoring algorithm to rank relevance:
 * - Category match: +10 points (category is a stronger signal than individual tags)
 * - Tag match: +5 points per matching tag (case-insensitive)
 * 
 * Posts are sorted by score (highest first) and top N are returned.
 * If fewer than N posts have matches, remaining slots are filled with
 * random posts as a fallback to ensure the section always shows content.
 * 
 * @param currentPost - The blog post to find related posts for
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related blog posts, sorted by relevance score
 */
export function getRelatedPosts(currentPost: BlogPost, limit: number = 3): BlogPosts {
  const allPosts = getAllBlogPosts();
  
  // Exclude current post using slug comparison (not ID) because IDs can be
  // duplicated across different topics, but slugs are unique
  const otherPosts = allPosts.filter((p) => {
    const currentSlug = getBlogPostSlug(currentPost);
    const postSlug = getBlogPostSlug(p);
    return currentSlug !== postSlug;
  });
  
  if (otherPosts.length === 0) {
    return [];
  }
  
  // Score each post based on tag/category matches
  const scoredPosts = otherPosts.map((post) => {
    let score = 0;
    
    // Category match: +10 points
    // Category is weighted higher because it represents broader topic alignment
    if (currentPost.category && post.category && currentPost.category === post.category) {
      score += 10;
    }
    
    // Tag matches: +5 points per matching tag
    // Tags are case-insensitive to handle variations like "React" vs "react"
    if (currentPost.tags && post.tags) {
      const currentTags = new Set(currentPost.tags.map(t => t.toLowerCase()));
      const postTags = new Set(post.tags.map(t => t.toLowerCase()));
      
      currentTags.forEach(tag => {
        if (postTags.has(tag)) {
          score += 5;
        }
      });
    }
    
    return { post, score };
  });
  
  // Filter to posts with at least one match, sort by score (descending), take top N
  const related = scoredPosts
    .filter(item => item.score > 0) // Only include posts with at least one match
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
  
  // Fallback: If we don't have enough matching posts, fill remaining slots
  // with random posts to ensure the "Related Content" section always displays
  // the requested number of posts (improves UX even if relevance is lower)
  if (related.length < limit) {
    const usedSlugs = new Set(related.map(p => getBlogPostSlug(p)));
    const currentSlug = getBlogPostSlug(currentPost);
    const fallback = otherPosts
      .filter(p => {
        const slug = getBlogPostSlug(p);
        return !usedSlugs.has(slug) && slug !== currentSlug;
      })
      .slice(0, limit - related.length);
    
    related.push(...fallback);
  }
  
  return related;
}

/**
 * Get all unique tags from all blog posts (across all topics)
 * Includes both categories and tags arrays
 */
export function getAllUniqueTags(): string[] {
  const allPosts = getAllBlogPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach(post => {
    // Add category as a tag
    if (post.category) {
      tagSet.add(post.category);
    }
    // Add all tags from tags array
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}
