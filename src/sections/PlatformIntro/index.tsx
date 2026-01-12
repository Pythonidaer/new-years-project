import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import styles from "./PlatformIntro.module.css";
import cardStyles from "../PlatformCards/PlatformCards.module.css";

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

export function PlatformIntro() {
  return (
    <Section>
      <Container>
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>
            Lorem Ipsum
          </h2>
          <div className={styles.content}>
            <p className={styles.text}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p className={styles.text}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
        <div className={styles.cardsWrapper}>
          <div className={cardStyles.grid}>
            {cards.map((card) => (
              <div key={card.id} className={cardStyles.card}>
                <div className={cardStyles.cardImage}>
                  <span className={cardStyles.placeholderText}>Image</span>
                </div>
                <h3 className={cardStyles.cardTitle}>{card.title}</h3>
                <p className={cardStyles.cardDescription}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

