import { Link, useLocation } from "react-router-dom";
import { Container } from "@/layout/Container";
import styles from "./Hero.module.css";
import buttonStyles from "@/components/Button.module.css";

export function Hero() {
  const location = useLocation();

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we're already on the home page with #contact, manually scroll
    if (location.pathname === "/" && location.hash === "#contact") {
      e.preventDefault();
      const element = document.querySelector("#contact");
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

  return (
    <section className={styles.hero}>
      <Container>
        <h1 className={styles.title}>
          I create{" "}
          <span className={styles.accent}>beautiful interfaces</span>{" "}
          that users love
        </h1>
        <p className={styles.subtitle}>
          I specialize in React, TypeScript, and modern frontend architecture. I build applications that are fast, accessible, and maintainable.
        </p>
        <div className={styles.cta}>
          <Link to="/#contact" className={buttonStyles.primary} onClick={handleContactClick}>
            Get In Touch
          </Link>
        </div>
      </Container>
    </section>
  );
}

