import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import styles from "./Header.module.css";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <div className={styles.brand}>Lorem Ipsum</div>

        <nav className={styles.nav}>
          <a href="#platform" className={styles.navLink}>
            Lorem Ipsum
          </a>
          <a href="#solutions" className={styles.navLink}>
            Dolor Sit
          </a>
          <a href="#resources" className={styles.navLink}>
            Amet Consectetur
          </a>
          <a href="#company" className={styles.navLink}>
            Adipiscing Elit
          </a>
        </nav>

        <Button className={styles.cta}>Sed Do Eiusmod</Button>
      </div>
    </header>
  );
}

