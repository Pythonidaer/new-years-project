import { Container } from "@/layout/Container";
import { Section } from "@/layout/Section";
import { useTheme } from "@/context/useTheme";
import { getGrayscaleFilter } from "@/utils/imageGrayscale";
import styles from "./PlatformCards.module.css";

const cards = [
  {
    id: 1,
    title: "Commonwealth Financial Network",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: 2,
    title: "Boston Children's Hospital",
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  },
  {
    id: 3,
    title: "WordPress Development",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
  },
  {
    id: 4,
    title: "Carrot",
    description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
  },
];

export function PlatformCards() {
  const { currentPresetId } = useTheme();
  const isNoirTheme = currentPresetId === 'noir';

  return (
    <Section>
      <Container>
        <div className={styles.grid}>
          {cards.map((card) => (
            <div key={card.id} className={styles.card}>
              <div 
                className={styles.cardImage}
                style={{ filter: getGrayscaleFilter(isNoirTheme) }}
              >
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

