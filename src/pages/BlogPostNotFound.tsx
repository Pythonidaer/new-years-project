import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import styles from "./BlogPost.module.css";

/**
 * Component rendered when a blog post is not found
 */
export function BlogPostNotFound() {
  return (
    <main>
      <Header />
      <div className={styles.content}>
        <h1>Post not found</h1>
      </div>
      <Footer />
    </main>
  );
}
