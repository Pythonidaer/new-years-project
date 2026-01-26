import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import parse from "html-react-parser";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { MetaTags } from "@/components/MetaTags";
// eslint-disable-next-line no-unused-vars -- BlogPost type is used in type annotations on lines 21-22
import { getBlogPostBySlug, getRelatedPosts, getBlogPostSlug, loadAllBlogPosts, type BlogPost } from "@/data/blog";
import { Button } from "@/components/Button";
import { BlogGrid } from "@/sections/BlogGrid";
import { useTheme } from "@/context/useTheme";
import { getGrayscaleImageUrl, getGrayscaleFilter } from "@/utils/imageGrayscale";
import { slugify } from "@/utils/slug";
import { useImagePreload } from "@/hooks/useImagePreload";
import { BlogPostNotFound } from "./BlogPostNotFound";
import { getAuthorName, getMetaDescription, hasTags, hasContent } from "./BlogPost.helpers";
import styles from "./BlogPost.module.css";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const { currentPresetId } = useTheme();
  const isNoirTheme = currentPresetId === 'noir';
  
  // Load blog posts asynchronously
  useEffect(() => {
    if (slug) {
      loadAllBlogPosts().then(() => {
        const foundPost = getBlogPostBySlug(slug);
        if (foundPost) {
          setPost(foundPost);
          setRelatedPosts(getRelatedPosts(foundPost, 3));
        }
      });
    }
  }, [slug]);
  
  // Preload image and track loading state (hook must be called before early returns)
  // Extract imageUrl to ensure hook dependency is stable
  const imageUrl = post?.image;
  const imageLoaded = useImagePreload(imageUrl, isNoirTheme);

  if (!slug || !post) {
    return <BlogPostNotFound />;
  }
  
  // At this point, post is guaranteed to exist, so imageUrl should be defined
  // The hook will re-run if imageUrl changes from undefined to a string
  const postSlug = getBlogPostSlug(post);
  const postUrl = `/resources/blog/${postSlug}`;
  const authorName = getAuthorName(post);
  const metaDescription = getMetaDescription(post);
  const heroImageUrl = getGrayscaleImageUrl(post.image, isNoirTheme);

  return (
    <main className={styles.main}>
      <MetaTags
        title={`${post.title} | Johnny H.`}
        description={metaDescription}
        image={post.image}
        url={postUrl}
        type="article"
      />
      <Header />
      
      {/* Hero Section */}
      <section 
        className={styles.heroSection}
        style={{ 
          '--hero-bg-image': `url(${heroImageUrl})`,
          filter: getGrayscaleFilter(isNoirTheme)
        } as React.CSSProperties}
      >
        {/* Loading Skeleton with Shimmer Animation - Shows immediately */}
        {!imageLoaded && (
          <div className={styles.heroSkeleton}>
            <div className={styles.skeletonShimmer}></div>
          </div>
        )}
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.entryTitle}>{post.title}</h1>
            <div className={styles.postMeta}>
              <div className={styles.postAuthors}>
                <span>By: <a href="#author" className={styles.heroAuthorLink}>{authorName}</a></span>
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
                  src={heroImageUrl} 
                  alt={post.title}
                  className={styles.featuredImage}
                  fetchPriority="high"
                  decoding="async"
                  style={{ filter: getGrayscaleFilter(isNoirTheme) }}
                />
              </div>
              
              {hasContent(post) && post.content && (
                <div className={styles.postContent}>
                  {parse(post.content)}
                </div>
              )}
            </div>
            
            {/* Footer: Tags, Author, Back Button */}
            <div className={styles.postFooter}>
              {hasTags(post) && (
                <div className={styles.postTerms}>
                  {post.tags!.map((tag: string, index: number) => (
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
                <h2 className={styles.authorHeading}>About the Author</h2>
                <div className={styles.author}>
                  <div className={styles.authorContent}>
                    <div className={styles.authorHeader}>
                      <div className={styles.authorTitles}>
                        <div className={styles.authorName}>{authorName}</div>
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

