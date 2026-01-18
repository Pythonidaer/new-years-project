import { useMemo, useState, useEffect, useCallback } from "react";
import { Header } from "../sections/Header";
import { BlogHeading } from "../sections/BlogHeading";
import { FeaturedBlogPost } from "../sections/FeaturedBlogPost";
import { BlogFilters } from "../sections/BlogFilters";
import { BlogGrid } from "../sections/BlogGrid";
import { Footer } from "../sections/Footer";
import { MetaTags } from "../components/MetaTags";
import { getAllBlogPosts, getBlogPostSlug } from "../data/blog";
import type { BlogPost } from "../data/blog/types";
import styles from "./Blog.module.css";

export function Blog() {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  const blogPosts = useMemo(
    () => getAllBlogPosts(),
    []
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
    // Exclude the featured post from grid results using slug (unique) instead of id
    const featuredSlug = getBlogPostSlug(featuredPost);
    return filteredPosts.filter((post) => getBlogPostSlug(post) !== featuredSlug);
  }, [filteredPosts, featuredPost]);

  return (
    <main className={styles.main}>
      <MetaTags
        title="Resources | Johnny H."
        description="Technical blog posts, tutorials, and insights on software engineering, React, TypeScript, and web development. Learn from real-world experiences and best practices."
        url="/resources/blog"
        type="website"
        image={featuredPost?.image}
      />
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
