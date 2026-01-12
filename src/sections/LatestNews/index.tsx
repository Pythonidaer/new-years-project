import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import styles from "./LatestNews.module.css";

const newsItems = [
  {
    id: 1,
    title: "Lorem Ipsum Dolor Sit Amet",
    date: "January 15, 2024",
    excerpt: "Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    linkLabel: "Lorem Ipsum",
  },
  {
    id: 2,
    title: "Ut Enim Ad Minim Veniam",
    date: "January 10, 2024",
    excerpt: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    linkLabel: "Lorem Ipsum",
  },
  {
    id: 3,
    title: "Duis Aute Irure Dolor",
    date: "January 5, 2024",
    excerpt: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    linkLabel: "Lorem Ipsum",
  },
];

export function LatestNews() {
  return (
    <Section>
      <Container>
        <h2 className={styles.heading}>Latest News</h2>
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

