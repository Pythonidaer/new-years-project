import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Container } from "@/layout/Container";
import { Section } from "@/layout/Section";
import styles from "./AgencyLogos.module.css";

const technologies = [
  { id: 1, name: "React", icon: "react" },
  { id: 2, name: "TypeScript", icon: "typescript" },
  { id: 3, name: "Next.js", icon: "nextdotjs" },
  { id: 4, name: "Vite", icon: "vite" },
  { id: 5, name: "Tailwind CSS", icon: "tailwindcss" },
  { id: 6, name: "Ruby on Rails", icon: "rubyonrails" },
  { id: 7, name: "Python", icon: "python" },
  { id: 8, name: "PHP", icon: "php" },
  { id: 9, name: "WordPress", icon: "wordpress" },
  { id: 10, name: "Drupal", icon: "drupal" },
  { id: 11, name: "D3", icon: "d3" },
  { id: 12, name: "Cursor", icon: "cursor" },
  { id: 13, name: "Postgres", icon: "postgresql" },
  { id: 14, name: "Storybook", icon: "storybook" },
];

export function AgencyLogos() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
    skipSnaps: false,
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        setAutoplayEnabled(false); // Stop autoplay on user interaction
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const handleReInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };
    
    const handlePointerDown = () => {
      setAutoplayEnabled(false); // Stop autoplay on drag/interaction
    };
    
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", handleReInit);
    emblaApi.on("pointerDown", handlePointerDown);
    
    // Initialize scroll snaps and selected index asynchronously
    requestAnimationFrame(() => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    });

    // Cleanup event listeners
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", handleReInit);
      emblaApi.off("pointerDown", handlePointerDown);
    };
  }, [emblaApi, onSelect]);

  // Autoplay: advance carousel every second
  useEffect(() => {
    if (!emblaApi || !autoplayEnabled) return;

    const autoplayInterval = setInterval(() => {
      if (emblaApi && autoplayEnabled) {
        emblaApi.scrollNext();
      }
    }, 2000); // Advance every 1 second

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [emblaApi, autoplayEnabled]);

  return (
    <Section variant="alt">
      <Container>
        <h2 className={styles.heading}>Some of the Tech I Know</h2>
      </Container>
      <div className={styles.carouselWrapper}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
              {technologies.map((tech) => (
                <div key={tech.id} className={styles.slide}>
                  <div className={styles.itemInner}>
                    <div className={styles.itemMedia}>
                      <div className={styles.itemImage}>
                        <img
                          src={`https://cdn.simpleicons.org/${tech.icon}`}
                          alt={tech.name}
                          className={styles.logoImage}
                        />
                      </div>
                    </div>
                    <div className={styles.itemContents}>
                      <div className={styles.itemTitleWrapper}>
                        <div className={styles.itemTitle}>{tech.name}</div>
                      </div>
                    </div>
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
    </Section>
  );
}

