import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import styles from "./TopBanner.module.css";

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);   // user can close permanently
  const [isHidden, setIsHidden] = useState(false);    // scroll-controlled (slides away)
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    const updateVars = () => {
      // If user closed it OR it's scrolled-hidden, treat banner height as 0
      const h =
        isVisible && !isHidden && bannerRef.current
          ? bannerRef.current.offsetHeight
          : 0;

      root.style.setProperty("--banner-height", `${h}px`);
    };

    updateVars();
    window.addEventListener("resize", updateVars);
    return () => window.removeEventListener("resize", updateVars);
  }, [isVisible, isHidden]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop;
        // Tune this threshold to match main site (try 10, 20, 40)
        setIsHidden(y > 20);
        ticking = false;
      });
    };

    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // If user closed it, remove entirely (like now)
  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className={`${styles.banner} ${isHidden ? styles.hidden : ""}`}
    >
      <div className={styles.container}>
        <p className={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
        </p>

        <button
          className={styles.close}
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

