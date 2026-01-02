import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import styles from "./AgencyLogos.module.css";

const logos = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  name: `Agency ${i + 1}`,
}));

export function AgencyLogos() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    });
    
    // Initialize scroll snaps and selected index asynchronously
    requestAnimationFrame(() => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
  }, [emblaApi, onSelect]);

  return (
    <Section variant="alt">
      <Container>
        <h2 className={styles.heading}>Lorem Ipsum Dolor Sit Amet</h2>
        <div className={styles.carouselWrapper}>
          <div className={styles.viewport} ref={emblaRef}>
            <div className={styles.container}>
              {logos.map((logo) => (
                <div key={logo.id} className={styles.slide}>
                  <div className={styles.logoPlaceholder}>
                    <span className={styles.logoText}>{logo.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.dots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === selectedIndex ? styles.dotActive : ""
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

