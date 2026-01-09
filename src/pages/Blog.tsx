import { useMemo, useState, useEffect, useCallback } from "react";
import { TopBanner } from "../sections/TopBanner";
import { Header } from "../sections/Header";
import { BlogHeading } from "../sections/BlogHeading";
import { FeaturedBlogPost } from "../sections/FeaturedBlogPost";
import { BlogFilters } from "../sections/BlogFilters";
import { BlogGrid } from "../sections/BlogGrid";
import { Footer } from "../sections/Footer";
import { useContent } from "../content/ContentProvider";
import { getBlogPostsForTopic } from "../data/blog";
import type { BlogPost } from "../data/blog/types";
import styles from "./Blog.module.css";

export function Blog() {
  const { topicId } = useContent();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  const blogPosts = useMemo(
    () => getBlogPostsForTopic(topicId),
    [topicId]
  );

  // Stable callback for filter changes
  const handleFilterChange = useCallback((filtered: BlogPost[]) => {
    setFilteredPosts(filtered);
  }, []);

  // Get featured post (always the first post, agnostic to filters)
  const featuredPost = useMemo(() => {
    return blogPosts[0] || null;
  }, [blogPosts]);

  // Initialize filtered posts when blogPosts change
  // This ensures we always start with all posts, then BlogFilters will apply filters
  useEffect(() => {
    setFilteredPosts(blogPosts);
  }, [blogPosts]);

  // Get grid posts (filtered results, excluding the featured post)
  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    // Exclude the featured post from grid results
    return filteredPosts.filter((post) => post.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  return (
    <main className={styles.main}>
      <TopBanner />
      <Header />
      <div className={styles.content}>
        <BlogHeading />
        <FeaturedBlogPost post={featuredPost || null} />
        <BlogFilters posts={blogPosts} onFilterChange={handleFilterChange} />
        <BlogGrid posts={gridPosts} />
      </div>
      <Footer />
    </main>
  );
}
