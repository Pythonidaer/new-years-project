import { useParams, Link } from "react-router-dom";
import parse from "html-react-parser";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import { Header } from "../sections/Header";
import { Footer } from "../sections/Footer";
import { MetaTags } from "../components/MetaTags";
import { getBlogPostBySlug, getRelatedPosts, getBlogPostSlug } from "../data/blog";
import { Button } from "../components/Button";
import { BlogGrid } from "../sections/BlogGrid";
import { slugify } from "../utils/slug";
import styles from "./BlogPost.module.css";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
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

  const post = getBlogPostBySlug(slug);

  if (!post) {
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

  const relatedPosts = getRelatedPosts(post.id, 3);
  const postSlug = getBlogPostSlug(post);
  const postUrl = `/resources/blog/${postSlug}`;

  return (
    <main className={styles.main}>
      <MetaTags
        title={`${post.title} | Johnny H.`}
        description={post.excerpt || `Read about ${post.title} on Johnny H.'s technical blog.`}
        image={post.image}
        url={postUrl}
        type="article"
      />
      <Header />
      
      {/* Hero Section */}
      <section 
        className={styles.heroSection}
        style={{ '--hero-bg-image': `url(${post.image})` } as React.CSSProperties}
      >
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.entryTitle}>{post.title}</h1>
            <div className={styles.postMeta}>
              <div className={styles.postAuthors}>
                <span>By: <a href="#author" className={styles.heroAuthorLink}>{post.author || "Senior Engineer"}</a></span>
              </div>
              <div className={styles.postDate}>
                {post.date}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.contentWrapper}>
            <div className={styles.entryContentWrapper}>
              {/* Featured Image - overlaps hero section */}
              <div className={styles.postThumbnail}>
                <img 
                  src={post.image} 
                  alt={post.title}
                  className={styles.featuredImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              {post.content && (
                <div className={styles.postContent}>
                  {parse(post.content)}
                </div>
              )}
            </div>
            
            {/* Footer: Tags, Author, Back Button */}
            <div className={styles.postFooter}>
              {post.tags && post.tags.length > 0 && (
                <div className={styles.postTerms}>
                  {post.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      to={`/resources/tag/${slugify(tag)}`}
                      className={styles.tagLink}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* About the Author */}
              <div id="author" className={styles.authorBox}>
                <h6 className={styles.authorHeading}>About the Author</h6>
                <div className={styles.author}>
                  <div className={styles.authorContent}>
                    <div className={styles.authorHeader}>
                      <div className={styles.authorTitles}>
                        <div className={styles.authorName}>{post.author || "Senior Engineer"}</div>
                      </div>
                    </div>
                    <a 
                      href="https://www.linkedin.com/in/jonamichahammo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.authorLink}
                    >
                      More about this author
                      <FaCaretRight className={styles.authorChevron} size={16} />
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Back to Blog Button */}
              <Link to="/resources/blog" className={styles.backButton}>
                <span className={styles.backButtonInner}>
                  <FaCaretLeft className={styles.backChevron} size={16} />
                  <span>Back to Blog</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Content Section */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedContainer}>
            <div className={styles.relatedHeader}>
              <div className={styles.relatedHeaderLeft}>
                <h3 className={styles.relatedHeading}>Related Content</h3>
              </div>
              <div className={styles.relatedHeaderRight}>
                <Link to="/resources/blog">
                  <Button variant="primary" showChevron>
                    View all
                  </Button>
                </Link>
              </div>
            </div>
            <BlogGrid posts={relatedPosts} />
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

