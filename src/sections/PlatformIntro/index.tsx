import { Container } from "@/layout/Container";
import { Section } from "@/layout/Section";
import { useTheme } from "@/context/useTheme";
import { getGrayscaleFilter } from "@/utils/imageGrayscale";
import containerStyles from "@/layout/Container.module.css";
import styles from "./PlatformIntro.module.css";
import cardStyles from "@/sections/PlatformCards/PlatformCards.module.css";

const cards = [
  {
    id: 1,
    title: "Commonwealth Financial Network",
    description: "Built React UIs from Figma designs, improved workflows with reusable components.",
    image: "/Commonwealth-Financial-Network-Logo.jpeg",
    alt: "Commonwealth Financial Network logo",
  },
  {
    id: 2,
    title: "Boston Children's Hospital",
    description: "Created accessible Drupal themes, deployed to multiple hospital sites via AWS infrastructure.",
    image: "/Boston-Childrens-Hospital-Logo.webp",
    alt: "Boston Children's Hospital logo",
  },
  {
    id: 3,
    title: "WordPress Development",
    description: "Integrated Stripe API for political donations on a City Councilor's website.",
    image: "/WordPress-Freelancing-Logo.jpg",
    alt: "WordPress logo",
  },
  {
    id: 4,
    title: "Carrot",
    description: "Built full-stack features with React, TypeScript, and GraphQL, optimized API caching.",
    image: "/Carrot-Logo.webp",
    alt: "Carrot logo",
  },
];

export function PlatformIntro() {
  const { currentPresetId } = useTheme();
  const isNoirTheme = currentPresetId === 'noir';

  return (
    <Section id="experience">
      <Container className={containerStyles.experience}>
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>
            My Experience
          </h2>
          <div className={styles.content}>
            <p className={styles.text}>
              I've had the opportunity to work across diverse industries—from financial services to healthcare—building user interfaces that solve real-world problems. Each role has shaped my approach to frontend development, emphasizing clean code, user-centric design, and scalable architecture.
            </p>
            <p className={styles.text}>
              Through these experiences, I've developed expertise in React, TypeScript, and modern web technologies while collaborating with cross-functional teams to deliver high-quality applications that users rely on daily.
            </p>
          </div>
        </div>
        <div className={styles.cardsWrapper}>
          <div className={cardStyles.grid}>
            {cards.map((card) => (
              <div key={card.id} className={cardStyles.card}>
                <div className={cardStyles.cardImage}>
                  <img 
                    src={card.image} 
                    alt={card.alt}
                    className={cardStyles.imageContent}
                    style={{ filter: getGrayscaleFilter(isNoirTheme) }}
                  />
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

