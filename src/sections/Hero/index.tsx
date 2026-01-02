import { Button } from "../../components/Button";
import { Container } from "../../layout/Container";
import { useContent } from "../../content/ContentProvider";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useContent();
  
  return (
    <section className={styles.hero}>
      <Container>
        <h1 className={styles.title}>
          {t("hero.title")}{" "}
          <span className={styles.accent}>{t("hero.titleAccent")}</span>{" "}
          {t("hero.titleSuffix")}
          {t("hero.titleLine2") && (
            <>
              <br />
              {t("hero.titleLine2")}
            </>
          )}
        </h1>
        <p className={styles.subtitle}>
          {t("hero.subtitle")}
        </p>
        <div className={styles.cta}>
          <Button>{t("hero.ctaLabel")}</Button>
        </div>
      </Container>
    </section>
  );
}

