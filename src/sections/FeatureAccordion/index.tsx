import { useState, useMemo } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { useContent } from "../../content/ContentProvider";
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

export function FeatureAccordion() {
  const { t } = useContent();
  
  // Build items from content system
  const items: FeatureItem[] = useMemo(() => [
    {
      id: 1,
      title: t("featureAccordion.item1.title"),
      content: t("featureAccordion.item1.content"),
      ctaLabel: t("featureAccordion.item1.ctaLabel"),
      icon: Network,
      imageLabel: t("featureAccordion.item1.title"),
    },
    {
      id: 2,
      title: t("featureAccordion.item2.title"),
      content: t("featureAccordion.item2.content"),
      ctaLabel: t("featureAccordion.item2.ctaLabel"),
      icon: Sparkles,
      imageLabel: t("featureAccordion.item2.title"),
    },
    {
      id: 3,
      title: t("featureAccordion.item3.title"),
      content: t("featureAccordion.item3.content"),
      ctaLabel: t("featureAccordion.item3.ctaLabel"),
      icon: Cloud,
      imageLabel: t("featureAccordion.item3.title"),
    },
    {
      id: 4,
      title: t("featureAccordion.item4.title"),
      content: t("featureAccordion.item4.content"),
      ctaLabel: t("featureAccordion.item4.ctaLabel"),
      icon: ShieldCheck,
      imageLabel: t("featureAccordion.item4.title"),
    },
    {
      id: 5,
      title: t("featureAccordion.item5.title"),
      content: t("featureAccordion.item5.content"),
      ctaLabel: t("featureAccordion.item5.ctaLabel"),
      icon: Layers,
      imageLabel: t("featureAccordion.item5.title"),
    },
    {
      id: 6,
      title: t("featureAccordion.item6.title"),
      content: t("featureAccordion.item6.content"),
      ctaLabel: t("featureAccordion.item6.ctaLabel"),
      icon: Headphones,
      imageLabel: t("featureAccordion.item6.title"),
    },
  ], [t]);

  // Accordion behavior: one item open at all times
  // Initialize with first item's ID, defaulting to 1 if items array is empty
  const firstItemId = items[0]?.id ?? 1;
  const [activeId, setActiveId] = useState<number>(firstItemId);

  // Ensure activeId is valid - if current activeId doesn't exist in items, use first item
  const activeItem = items.find((i) => i.id === activeId) ?? items[0];

  return (
    <Section>
      <Container>
      <h2 className={styles.heading}>{t("featureAccordion.heading")}</h2>

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

