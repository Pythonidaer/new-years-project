import { useState, useEffect } from "react";
import type { BlogPost } from "../../data/blog/types";
import { Search } from "lucide-react";
import styles from "./BlogFilters.module.css";

interface BlogFiltersProps {
  posts: BlogPost[];
  onFilterChange: (filteredPosts: BlogPost[]) => void;
}

// All available categories
const ALL_CATEGORIES = [
  "Frontend Frameworks",
  "JavaScript & TypeScript",
  "State Management & Data Flow",
  "UI Architecture & Component Design",
  "Styling & Design Systems",
  "Testing & Code Quality",
  "Performance & Optimization",
  "Accessibility",
  // "APIs & Backend Integration", // Commented out - not yet applicable
  // "Tooling, CI/CD & Deployment", // Commented out - not yet applicable
  // "Security & Regulated Environments", // Commented out - not yet applicable
  // "Product Thinking & Ownership", // Commented out - not yet applicable
  // "Collaboration & Engineering Practices", // Commented out - not yet applicable
  // "Observability, Reliability & Support", // Commented out - not yet applicable
  // "Full-Stack Development", // Commented out - not yet applicable
];

export function BlogFilters({ posts, onFilterChange }: BlogFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = [...posts]; // Create a copy to avoid mutating

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
      );
    }

    onFilterChange(filtered);
  }, [posts, searchQuery, selectedCategory, onFilterChange]);

  return (
    <div className={styles.container}>
      <div className={styles.selectContainer}>
        <div className={styles.selectWrapper}>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${styles.select} ${styles.selected}`}
          >
            <option value="all">Type</option>
            {ALL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <svg
            className={styles.chevron}
            width="16"
            height="10"
            viewBox="0 0 16 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 0 L8 10 L13 0" stroke="#134dd1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
}

