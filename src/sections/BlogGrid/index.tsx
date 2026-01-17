import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { BlogPost } from "../../data/blog/types";
import { getBlogPostSlug } from "../../data/blog";
import { slugify } from "../../utils/slug";
import { Button } from "../../components/Button";
import styles from "./BlogGrid.module.css";

type Props = {
  posts: BlogPost[];
};

const POSTS_PER_PAGE = 9;

export function BlogGrid({ posts }: Props) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount]
  );

  const hasMore = posts.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + POSTS_PER_PAGE, posts.length));
  };

  return (
    <>
      <div className={styles.grid}>
        {visiblePosts.map((post) => (
          <article key={getBlogPostSlug(post)} className={styles.card}>
            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                <Link to={`/resources/blog/${getBlogPostSlug(post)}`} className={styles.imageLink}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className={styles.image}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </div>
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>
                <Link to={`/resources/blog/${getBlogPostSlug(post)}`} className={styles.titleLink}>
                  {post.title}
                </Link>
              </h3>
              <div className={styles.bottomContent}>
                <Link to={`/resources/tag/${slugify(post.category)}`} className={styles.category}>
                  {post.category}
                </Link>
                <time className={styles.date}>{post.date}</time>
              </div>
            </div>
          </article>
        ))}
      </div>
      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <Button onClick={handleLoadMore}>LOAD MORE</Button>
        </div>
      )}
    </>
  );
}

