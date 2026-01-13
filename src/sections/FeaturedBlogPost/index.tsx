import { Link } from "react-router-dom";
import { FaCaretRight } from "react-icons/fa";
import type { BlogPost } from "../../data/blog/types";
import { getBlogPostSlug } from "../../data/blog";
import styles from "./FeaturedBlogPost.module.css";

interface FeaturedBlogPostProps {
  post: BlogPost | null;
}

const PLACEHOLDER_POST: BlogPost = {
  id: 0,
  title: "Featured Blog Post",
  date: "Coming Soon",
  excerpt: "Stay tuned for our latest insights and updates.",
  category: "Blog",
  image: "https://picsum.photos/400/300?random=featured",
  link: "/resources/blog",
};

export function FeaturedBlogPost({ post }: FeaturedBlogPostProps) {
  const displayPost = post || PLACEHOLDER_POST;

  return (
    <article className={styles.featuredCard}>
      <div className={styles.content}>
        <h4 className={styles.title}>
          {post ? (
            <Link to={`/resources/blog/${getBlogPostSlug(displayPost)}`}>{displayPost.title}</Link>
          ) : (
            <span>{displayPost.title}</span>
          )}
        </h4>
        {post && (
          <Link to={`/resources/blog/${getBlogPostSlug(displayPost)}`} className={styles.ctaLink}>
            READ THE BLOG
            <FaCaretRight className={styles.triangleRight} size={16} />
          </Link>
        )}
      </div>
      <div className={styles.imageContainer}>
        <img src={displayPost.image} alt={displayPost.title} className={styles.image} />
      </div>
    </article>
  );
}

