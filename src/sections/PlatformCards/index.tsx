import { useMemo } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { useContent } from "../../content/ContentProvider";
import styles from "./PlatformCards.module.css";

export function PlatformCards() {
  const { t } = useContent();
  
  const cards = useMemo(() => [
    {
      id: 1,
      title: t("platformCards.card1.title"),
      description: t("platformCards.card1.description"),
    },
    {
      id: 2,
      title: t("platformCards.card2.title"),
      description: t("platformCards.card2.description"),
    },
    {
      id: 3,
      title: t("platformCards.card3.title"),
      description: t("platformCards.card3.description"),
    },
    {
      id: 4,
      title: t("platformCards.card4.title"),
      description: t("platformCards.card4.description"),
    },
  ], [t]);

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

