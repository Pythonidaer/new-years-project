import { useParams } from "react-router-dom";
import { TopBanner } from "../sections/TopBanner";
import { Header } from "../sections/Header";
import { Footer } from "../sections/Footer";
import { useContent } from "../content/ContentProvider";
import { getBlogPostBySlug } from "../data/blog";
import styles from "./BlogPost.module.css";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { topicId } = useContent();

  if (!slug) {
    return (
      <main>
        <TopBanner />
        <Header />
        <div className={styles.content}>
          <h1>Post not found</h1>
        </div>
        <Footer />
      </main>
    );
  }

  const post = getBlogPostBySlug(topicId, slug);

  if (!post) {
    return (
      <main>
        <TopBanner />
        <Header />
        <div className={styles.content}>
          <h1>Post not found</h1>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <TopBanner />
      <Header />
      <div className={styles.content}>
        <h1 className={styles.title}>{post.title}</h1>
      </div>
      <Footer />
    </main>
  );
}

