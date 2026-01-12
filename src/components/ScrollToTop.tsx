import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that scrolls to the top of the page
 * whenever the route changes, or scrolls to hash anchors if present.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait for the page to render, then scroll to the hash anchor
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const headerOffset = 110; // Account for fixed header height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      // No hash, scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

