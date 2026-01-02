import { useMemo } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { useContent } from "../../content/ContentProvider";
import styles from "./PlatformIntro.module.css";
import cardStyles from "../PlatformCards/PlatformCards.module.css";

export function PlatformIntro() {
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
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>
            {t("platformIntro.heading")}
          </h2>
          <div className={styles.content}>
            <p className={styles.text}>
              {t("platformIntro.text1")}
            </p>
            <p className={styles.text}>
              {t("platformIntro.text2")}
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

