import type { BlogPosts, BlogPost } from "./types";
import defaultPosts from "./default.json";
import interviewHttpPosts from "./interview_http.json";
import interviewHttp2Posts from "./interview_http2.json";
import interviewPrototypalPosts from "./interview_prototypal.json";
import interviewReusableVsFeatureSpecificComponentsPosts from "./interview_reusable_vs_feature_specific_components_a_practical_decision_framework.json";
import type { TopicId } from "../../content/types";
import { slugify } from "../../utils/slug";

export const blogPostsByTopic: Record<TopicId, BlogPosts> = {
  default: defaultPosts as BlogPosts,
  interview_http: interviewHttpPosts as BlogPosts,
  interview_http2: interviewHttp2Posts as BlogPosts,
  interview_prototypal: interviewPrototypalPosts as BlogPosts,
  interview_reusable_vs_feature_specific_components_a_practical_decision_framework: interviewReusableVsFeatureSpecificComponentsPosts as BlogPosts,
};

export function getBlogPostsForTopic(topicId: TopicId): BlogPosts {
  return blogPostsByTopic[topicId] || blogPostsByTopic.default;
}

/**
 * Get all blog posts from all topics combined
 */
export function getAllBlogPosts(): BlogPosts {
  const allPosts: BlogPosts = [];
  Object.values(blogPostsByTopic).forEach((posts) => {
    allPosts.push(...posts);
  });
  return allPosts;
}

/**
 * Get a blog post by slug (searches across all topics)
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
export function getBlogPostTopicId(post: BlogPost): TopicId | null {
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
 * Get related blog posts (next 3 posts from all topics, excluding current post)
 */
export function getRelatedPosts(currentPostId: number, limit: number = 3): BlogPosts {
  const allPosts = getAllBlogPosts();
  
  // Find current post index
  const currentIndex = allPosts.findIndex((p) => p.id === currentPostId);
  
  if (currentIndex === -1) {
    // If post not found, return first N posts
    return allPosts.slice(0, limit);
  }
  
  // Get next posts after current one, wrapping around if needed
  const nextPosts = [];
  for (let i = 1; i <= limit && i < allPosts.length; i++) {
    const index = (currentIndex + i) % allPosts.length;
    nextPosts.push(allPosts[index]);
  }
  
  return nextPosts;
}

