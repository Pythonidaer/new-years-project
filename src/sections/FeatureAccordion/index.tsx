import { useState } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import styles from "./FeatureAccordion.module.css";

import {
  Network,
  Sparkles,
  Cloud,
  ShieldCheck,
  Layers,
  Headphones,
} from "lucide-react";

type FeatureItem = {
  id: number;
  title: string;
  content: string;
  ctaLabel: string;
  icon: typeof Network;
  imageLabel: string;
};

const items: FeatureItem[] = [
  {
    id: 1,
    title: "Lorem Ipsum",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ctaLabel: "LOREM IPSUM",
    icon: Network,
    imageLabel: "Lorem Ipsum",
  },
  {
    id: 2,
    title: "Dolor Sit",
    content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ctaLabel: "LOREM IPSUM",
    icon: Sparkles,
    imageLabel: "Dolor Sit",
  },
  {
    id: 3,
    title: "Amet Consectetur",
    content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ctaLabel: "LOREM IPSUM",
    icon: Cloud,
    imageLabel: "Amet Consectetur",
  },
  {
    id: 4,
    title: "Adipiscing Elit",
    content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ctaLabel: "LOREM IPSUM",
    icon: ShieldCheck,
    imageLabel: "Adipiscing Elit",
  },
  {
    id: 5,
    title: "Sed Do Eiusmod",
    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    ctaLabel: "LOREM IPSUM",
    icon: Layers,
    imageLabel: "Sed Do Eiusmod",
  },
  {
    id: 6,
    title: "Tempor Incididunt",
    content: "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.",
    ctaLabel: "LOREM IPSUM",
    icon: Headphones,
    imageLabel: "Tempor Incididunt",
  },
];

export function FeatureAccordion() {

  // Accordion behavior: one item open at all times
  // Initialize with first item's ID, defaulting to 1 if items array is empty
  const firstItemId = items[0]?.id ?? 1;
  const [activeId, setActiveId] = useState<number>(firstItemId);

  // Ensure activeId is valid - if current activeId doesn't exist in items, use first item
  const activeItem = items.find((i) => i.id === activeId) ?? items[0];

  return (
    <Section>
      <Container>
      <h2 className={styles.heading}>Lorem Ipsum</h2>

        <div className={styles.wrapper}>
            
          {/* LEFT: Accordion */}
          <div className={styles.content}>

            <div className={styles.accordion}>
              {items.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                  >
                    <button
                      type="button"
                      className={styles.trigger}
                      onClick={() => setActiveId(item.id)}
                      aria-expanded={isActive}
                    >
                      <h3 className={styles.triggerText}>{item.title}</h3>
                      <Icon icon={item.icon} size={24} className={styles.featureIcon} />
                    </button>

                    {isActive && (
                      <div className={styles.panel}>
                        <p className={styles.panelText}>{item.content}</p>
                        <Button className={styles.ctaButton}>{item.ctaLabel}</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Image (placeholder swaps based on active item) */}
          <div className={styles.image}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>{activeItem.imageLabel}</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

