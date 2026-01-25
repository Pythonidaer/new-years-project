import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/sections/Header";
import { BlogGrid } from "@/sections/BlogGrid";
import { Footer } from "@/sections/Footer";
import { MetaTags } from "@/components/MetaTags";
import { getAllBlogPosts, getAllUniqueTags, loadAllBlogPosts } from "@/data/blog";
import type { BlogPost } from "@/data/blog/types";
import { ALL_CATEGORIES } from "@/data/blog/categories";
import { slugify } from "@/utils/slug";
import { ChevronRight } from "lucide-react";
import styles from "./Blog.module.css";
import tagStyles from "./Tag.module.css";
import headingStyles from "@/sections/BlogHeading/BlogHeading.module.css";

export function Tag() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Load blog posts asynchronously
  useEffect(() => {
    loadAllBlogPosts().then(() => {
      setAllPosts(getAllBlogPosts());
      setAllTags(getAllUniqueTags());
    });
  }, []);
  
  // Find the actual tag/category name from the URL slug (case-insensitive)
  // Check both ALL_CATEGORIES and all unique tags from posts
  const tagName = useMemo(() => {
    if (!categoryName) return null;
    
    // First check ALL_CATEGORIES
    const categoryMatch = ALL_CATEGORIES.find(cat => 
      slugify(cat).toLowerCase() === categoryName.toLowerCase()
    );
    if (categoryMatch) return categoryMatch;
    
    // Then check all unique tags from posts
    const tagMatch = allTags.find(tag => 
      slugify(tag).toLowerCase() === categoryName.toLowerCase()
    );
    return tagMatch || null;
  }, [categoryName, allTags]);
  
  // Filter posts where category matches OR tags array includes the tag
  const filteredPosts = useMemo(() => {
    if (!tagName) return [];
    
    return allPosts.filter(post => 
      post.category === tagName || 
      (post.tags && post.tags.includes(tagName))
    );
  }, [allPosts, tagName]);
  
  if (!categoryName || !tagName) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.content}>
          <div className={`${headingStyles.container} ${tagStyles.container}`}>
            <h1 className={`${headingStyles.heading} ${tagStyles.heading}`}>Category not found</h1>
          </div>
          <Link to="/resources/blog" className={tagStyles.backButton}>
            <span className={tagStyles.backButtonInner}>
              <ChevronRight className={tagStyles.backChevron} size={10} />
              <span>Back to Blog</span>
            </span>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }
  
  const tagUrl = `/resources/tag/${categoryName}`;
  const tagDescription = `Browse ${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''} about ${tagName} on Johnny H.'s technical blog.`;

  return (
    <main className={styles.main}>
      <MetaTags
        title={`${tagName} | Resources | Johnny H.`}
        description={tagDescription}
        url={tagUrl}
        type="website"
      />
      <Header />
      <div className={styles.content}>
        <div className={`${headingStyles.container} ${tagStyles.container}`}>
          <h1 className={`${headingStyles.heading} ${tagStyles.heading}`}>{tagName}</h1>
        </div>
        <div className={tagStyles.gridContainer}>
          <BlogGrid posts={filteredPosts} />
        </div>
      </div>
      <Footer />
    </main>
  );
}

