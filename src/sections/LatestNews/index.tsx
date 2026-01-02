import { useMemo } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { useContent } from "../../content/ContentProvider";
import styles from "./LatestNews.module.css";

export function LatestNews() {
  const { t } = useContent();
  
  const newsItems = useMemo(() => [
    {
      id: 1,
      title: t("latestNews.item1.title"),
      date: t("latestNews.item1.date"),
      excerpt: t("latestNews.item1.excerpt"),
      linkLabel: t("latestNews.item1.linkLabel"),
    },
    {
      id: 2,
      title: t("latestNews.item2.title"),
      date: t("latestNews.item2.date"),
      excerpt: t("latestNews.item2.excerpt"),
      linkLabel: t("latestNews.item2.linkLabel"),
    },
    {
      id: 3,
      title: t("latestNews.item3.title"),
      date: t("latestNews.item3.date"),
      excerpt: t("latestNews.item3.excerpt"),
      linkLabel: t("latestNews.item3.linkLabel"),
    },
  ], [t]);

  return (
    <Section>
      <Container>
        <h2 className={styles.heading}>{t("latestNews.heading")}</h2>
        <div className={styles.grid}>
          {newsItems.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardImage}>
                <span className={styles.placeholderText}>Image</span>
              </div>
              <div className={styles.cardContent}>
                <time className={styles.date}>{item.date}</time>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardExcerpt}>{item.excerpt}</p>
                <a href="#" className={styles.cardLink}>
                  {item.linkLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

