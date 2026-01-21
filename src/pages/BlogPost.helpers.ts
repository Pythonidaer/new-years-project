import type { BlogPost as BlogPostType } from '@/data/blog';

/**
 * Get the author name with fallback
 */
export function getAuthorName(post: BlogPostType): string {
  return post.author || "LLM Writer";
}

/**
 * Get the meta description with fallback
 */
export function getMetaDescription(post: BlogPostType): string {
  return post.excerpt || `Read about ${post.title} on Johnny H.'s technical blog.`;
}

/**
 * Check if post has tags
 */
export function hasTags(post: BlogPostType): boolean {
  return Boolean(post.tags && post.tags.length > 0);
}

/**
 * Check if post has content
 */
export function hasContent(post: BlogPostType): boolean {
  return Boolean(post.content);
}
