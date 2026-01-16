import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { getAllBlogPosts, getBlogPostSlug } from "../../data/blog";
import styles from "./LatestBlogs.module.css";

export function LatestBlogs() {
  // Get 3 most recent blog posts, sorted by date (most recent first)
  const recentPosts = useMemo(() => {
    const allPosts = getAllBlogPosts();
    
    // Sort by date (parse date strings to Date objects for proper sorting)
    const sorted = [...allPosts].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Most recent first
    });
    
    return sorted.slice(0, 3);
  }, []);

  return (
    <Section>
      <Container className={styles.latestBlogsContainer}>
        <h2 className={styles.heading}>Latest Blogs</h2>
        <div className={styles.grid}>
          {recentPosts.map((post) => (
            <article key={post.id} className={styles.card}>
              <div className={styles.cardImage}>
                <Link to={`/resources/blog/${getBlogPostSlug(post)}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className={styles.cardImageContent}
                  />
                </Link>
              </div>
              <div className={styles.cardContent}>
                <time className={styles.date}>{post.date}</time>
                <h3 className={styles.cardTitle}>
                  <Link to={`/resources/blog/${getBlogPostSlug(post)}`} className={styles.cardTitleLink}>
                    {post.title}
                  </Link>
                </h3>
                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                <Link 
                  to={`/resources/blog/${getBlogPostSlug(post)}`} 
                  className={styles.cardLink}
                  aria-label={`Read more about ${post.title}`}
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

