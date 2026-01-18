import styles from "./BlogSkeleton.module.css";

/**
 * Loading skeleton for blog routes
 * Shows a simple placeholder while blog routes are being lazy-loaded
 * Matches the actual Blog page layout structure
 */
export function BlogSkeleton() {
  return (
    <>
      {/* Header Skeleton - matches actual Header component */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandSkeleton}></div>
          <nav className={styles.navSkeleton}>
            <div className={styles.navLinkSkeleton}></div>
            <div className={styles.navLinkSkeleton}></div>
            <div className={styles.navLinkSkeleton}></div>
            <div className={styles.navLinkSkeleton}></div>
          </nav>
          <div className={styles.ctaSkeleton}></div>
          {/* Mobile hamburger menu skeleton */}
          <div className={styles.hamburgerSkeleton}></div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
        {/* Blog Heading */}
        <div className={styles.headingContainer}>
          <div className={styles.headingSkeleton}></div>
        </div>

        {/* Featured Blog Post Card */}
        <div className={styles.featuredCard}>
          <div className={styles.featuredText}>
            <div className={styles.featuredTitleSkeleton}></div>
            <div className={styles.featuredCtaSkeleton}></div>
          </div>
          <div className={styles.featuredImage}></div>
        </div>

        {/* Filters Section */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterSkeleton}></div>
          <div className={styles.searchSkeleton}></div>
        </div>

        {/* Blog Grid */}
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.gridCard}>
              <div className={styles.gridImage}></div>
              <div className={styles.gridContent}>
                <div className={styles.gridCategory}></div>
                <div className={styles.gridTitle}></div>
                <div className={styles.gridDate}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </main>
      {/* ThemePicker trigger button placeholder - matches fixed position */}
      <div className={styles.themePickerTrigger}></div>
    </>
  );
}

