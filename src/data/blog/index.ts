import type { BlogPosts, BlogPost } from "./types";
import defaultPosts from "./default.json";
import interviewHttpPosts from "./interview_http.json";
import interviewHttp2Posts from "./interview_http2.json";
import interviewPrototypalPosts from "./interview_prototypal.json";
import type { TopicId } from "../../content/types";
import { slugify } from "../../utils/slug";

export const blogPostsByTopic: Record<TopicId, BlogPosts> = {
  default: defaultPosts as BlogPosts,
  interview_http: interviewHttpPosts as BlogPosts,
  interview_http2: interviewHttp2Posts as BlogPosts,
  interview_prototypal: interviewPrototypalPosts as BlogPosts,
};

export function getBlogPostsForTopic(topicId: TopicId): BlogPosts {
  return blogPostsByTopic[topicId] || blogPostsByTopic.default;
}

/**
 * Get a blog post by slug for a given topic
 */
export function getBlogPostBySlug(topicId: TopicId, slug: string): BlogPost | null {
  const posts = getBlogPostsForTopic(topicId);
  
  // Try to find by slug field first, then by generating slug from title
  const post = posts.find((p) => {
    if (p.slug) {
      return p.slug === slug;
    }
    return slugify(p.title) === slug;
  });

  return post || null;
}

/**
 * Get the slug for a blog post (uses existing slug or generates from title)
 */
export function getBlogPostSlug(post: BlogPost): string {
  return post.slug || slugify(post.title);
}

