import { useEffect } from "react";

export function TopBanner() {
  useEffect(() => {
    document.documentElement.style.setProperty("--banner-height", "0px");
  }, []);

  return null;
}

/*
Employment banner is paused. Restore by replacing TopBanner with this component:

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import styles from "./TopBanner.module.css";

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    const updateVars = () => {
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
        setIsHidden(y > 20);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className={`${styles.banner} ${isHidden ? styles.hidden : ""}`}
    >
      <div className={styles.container}>
        <p className={styles.text}>
        I am currently open to employment opportunities as a frontend-focused software engineer 😁
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
*/
