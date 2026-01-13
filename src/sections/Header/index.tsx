import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FaCaretRight } from "react-icons/fa";
import styles from "./Header.module.css";
import buttonStyles from "../../components/Button.module.css";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isBlogListingPage = location.pathname === "/resources/blog";
  const isBlogPostPage = location.pathname.match(/^\/resources\/blog\/[^/]+$/);
  const isTagPage = location.pathname.match(/^\/resources\/tag\/[^/]+$/);

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we're already on the home page with the same hash, manually scroll
    const hash = (e.currentTarget.getAttribute('href') || '').split('#')[1];
    if (hash && location.pathname === "/" && location.hash === `#${hash}`) {
      e.preventDefault();
      const element = document.querySelector(`#${hash}`);
      if (element) {
        const headerOffset = 110;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = document.documentElement.scrollTop || window.scrollY;
          setIsScrolled(scrollTop >= 90);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Header controls only header height
  useEffect(() => {
    const root = document.documentElement;
    const headerHeight = isScrolled ? 60 : 110;

    root.style.setProperty("--header-height", `${headerHeight}px`);
  }, [isScrolled]);

  // Reset banner-height to 0px on pages without TopBanner
  // This ensures Header doesn't have a gap when TopBanner isn't present
  useEffect(() => {
    const root = document.documentElement;
    
    // Only reset if we're not on the Home page (where TopBanner exists)
    // TopBanner will manage --banner-height on pages where it's present
    if (!isHomePage) {
      root.style.setProperty("--banner-height", "0px");
    }
    // On Home page, let TopBanner manage the variable
  }, [isHomePage]);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""} ${isBlogListingPage ? styles.dark : ""} ${isBlogPostPage || isTagPage ? styles.light : ""}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>Johnny H.</Link>

        <nav className={styles.nav}>
          <Link to="/#experience" className={styles.navLink} onClick={handleHashClick}>
            Experience
            <ChevronRight className={styles.chevron} />
          </Link>
          <Link to="/#projects" className={styles.navLink} onClick={handleHashClick}>
            Projects
            <ChevronRight className={styles.chevron} />
          </Link>
          <Link to="/resources/blog" className={styles.navLink}>
            Resources
            <ChevronRight className={styles.chevron} />
          </Link>
          <Link to="/#contact" className={styles.navLink} onClick={handleHashClick}>
            Contact
            <ChevronRight className={styles.chevron} />
          </Link>
        </nav>

        <a 
          href="https://www.linkedin.com/in/jonamichahammo" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${buttonStyles.primary} ${styles.cta}`}
        >
          Hire Me
          <FaCaretRight className={buttonStyles.chevron} size={16} />
        </a>
      </div>
    </header>
  );
}

