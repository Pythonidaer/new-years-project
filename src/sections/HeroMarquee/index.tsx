import styles from "./HeroMarquee.module.css";

const placeholderImages = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  alt: `Placeholder image ${i + 1}`,
}));

export function HeroMarquee() {
  // Duplicate items for seamless loop
  const items = [...placeholderImages, ...placeholderImages];

  return (
    <div className={styles.marquee}>
      <div className={styles.track}>
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className={styles.item}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>Image {item.id + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

