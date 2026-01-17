import { useState, useEffect, useMemo } from "react";
import type { BlogPost } from "../../data/blog/types";
import { getAllUniqueTags } from "../../data/blog";
import { Search, ChevronDown } from "lucide-react";
import styles from "./BlogFilters.module.css";

interface BlogFiltersProps {
  posts: BlogPost[];
  onFilterChange: (filteredPosts: BlogPost[]) => void;
}

export function BlogFilters({ posts, onFilterChange }: BlogFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get all unique tags from posts (includes both categories and tags from post arrays)
  // This ensures the dropdown only shows categories/tags that actually have posts
  const allFilterOptions = useMemo(() => {
    const uniqueTags = getAllUniqueTags();
    return uniqueTags.sort();
  }, []);

  // Filter posts based on search and category/tag
  useEffect(() => {
    let filtered = [...posts]; // Create a copy to avoid mutating

    // Filter by category or tag
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (post) => 
          post.category === selectedCategory || 
          (post.tags && post.tags.includes(selectedCategory))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    onFilterChange(filtered);
  }, [posts, searchQuery, selectedCategory, onFilterChange]);

  return (
    <div className={styles.container}>
      <div className={styles.selectContainer}>
        <div className={styles.selectWrapper}>
          <label htmlFor="category-select" className={styles.srOnly}>
            Filter by Type
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.select}
          >
            <option value="all">Type</option>
            {allFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} size={24} />
        </div>
      </div>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          name="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
}

