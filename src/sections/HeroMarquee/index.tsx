import styles from "./HeroMarquee.module.css";

const images = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/280/157?random=${i + 1}`,
  alt: `Hero marquee image ${i + 1}`,
}));

export function HeroMarquee() {
  // Duplicate items for seamless loop
  const items = [...images, ...images];

  return (
    <div className={styles.marquee}>
      <div className={styles.track}>
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className={styles.item}>
            <img
              src={item.url}
              alt={item.alt}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

