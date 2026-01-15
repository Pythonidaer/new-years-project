import { useEffect, useState, useRef, startTransition } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FaCaretRight } from "react-icons/fa";
import styles from "./Header.module.css";
import buttonStyles from "../../components/Button.module.css";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathnameRef = useRef(location.pathname);
  const isHomePage = location.pathname === "/";
  const isBlogListingPage = location.pathname === "/resources/blog";
  const isBlogPostPage = location.pathname.match(/^\/resources\/blog\/[^/]+$/);
  const isTagPage = location.pathname.match(/^\/resources\/tag\/[^/]+$/);

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Close mobile menu if open
    setIsMenuOpen(false);
    
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

  const handleMenuLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    // Handle hash links
    if (href.startsWith('/#')) {
      const hash = href.split('#')[1];
      if (location.pathname === "/") {
        // We're on home page, scroll to section
        navigate(href);
        setTimeout(() => {
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
        }, 100);
      } else {
        // Navigate to home page with hash
        navigate(href);
      }
    } else {
      // Regular navigation
      navigate(href);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      startTransition(() => {
        setIsMenuOpen(false);
      });
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

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

  // Update body class for menu state (for TopBanner coordination)
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`${styles.header} ${isScrolled || isMenuOpen ? styles.scrolled : ""} ${isBlogListingPage ? styles.dark : ""} ${isBlogPostPage || isTagPage ? styles.light : ""} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand} onClick={closeMenu}>Johnny H.</Link>

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

          <button
            className={`${styles.hamburgerToggle} ${isMenuOpen ? styles.isOpen : ""}`}
            onClick={toggleMenu}
            aria-label="Mobile Menu Toggle"
            aria-expanded={isMenuOpen}
          >
            <div className={styles.burgerBox}>
              <span className={styles.burgerLine}></span>
              <span className={styles.burgerLine}></span>
              <span className={styles.burgerLine}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.hamburgerOverlay} ${isMenuOpen ? styles.isOpen : ""}`}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile Menu Content */}
      <div className={`${styles.hamburgerContent} ${isMenuOpen ? styles.isOpen : ""}`}>
        <div className={styles.hamburgerContentInner}>
          <ul className={styles.mobileNav} role="menu">
            <li role="menuitem" className={styles.mobileNavItem}>
              <a
                href="/#experience"
                className={styles.mobileNavLink}
                onClick={(e) => handleMenuLinkClick(e, "/#experience")}
              >
                <span className={styles.mobileNavText}>Experience</span>
                <ChevronRight className={styles.mobileChevron} size={28} />
              </a>
            </li>
            <li role="menuitem" className={styles.mobileNavItem}>
              <a
                href="/#projects"
                className={styles.mobileNavLink}
                onClick={(e) => handleMenuLinkClick(e, "/#projects")}
              >
                <span className={styles.mobileNavText}>Projects</span>
                <ChevronRight className={styles.mobileChevron} size={28} />
              </a>
            </li>
            <li role="menuitem" className={styles.mobileNavItem}>
              <a
                href="/resources/blog"
                className={styles.mobileNavLink}
                onClick={(e) => handleMenuLinkClick(e, "/resources/blog")}
              >
                <span className={styles.mobileNavText}>Resources</span>
                <ChevronRight className={styles.mobileChevron} size={28} />
              </a>
            </li>
            <li role="menuitem" className={styles.mobileNavItem}>
              <a
                href="/#contact"
                className={styles.mobileNavLink}
                onClick={(e) => handleMenuLinkClick(e, "/#contact")}
              >
                <span className={styles.mobileNavText}>Contact</span>
                <ChevronRight className={styles.mobileChevron} size={28} />
              </a>
            </li>
          </ul>

          <div className={styles.mobileCta}>
            <a
              href="https://www.linkedin.com/in/jonamichahammo"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileCtaButton}
              onClick={closeMenu}
            >
              Hire Me
              <FaCaretRight className={styles.mobileCtaIcon} size={16} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

