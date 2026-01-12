import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import styles from "./PlatformCards.module.css";

const cards = [
  {
    id: 1,
    title: "Lorem Ipsum Dolor",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: 2,
    title: "Consectetur Adipiscing",
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  },
  {
    id: 3,
    title: "Elit Sed Do",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
  },
  {
    id: 4,
    title: "Eiusmod Tempor",
    description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
  },
];

export function PlatformCards() {
  return (
    <Section>
      <Container>
        <div className={styles.grid}>
          {cards.map((card) => (
            <div key={card.id} className={styles.card}>
              <div className={styles.cardImage}>
                <span className={styles.placeholderText}>Image</span>
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

