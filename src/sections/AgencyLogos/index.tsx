import { useCallback, useEffect, useLayoutEffect, useState, useRef, memo } from "react";
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

function AgencyLogosComponent() {
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
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        // Stop autoplay on user interaction
        setAutoplayEnabled(false);
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Store onSelect in ref so effect only depends on emblaApi
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Track handlers for each emblaApi instance using a Map
  const handlersMapRef = useRef<Map<typeof emblaApi, {
    onSelect: () => void;
    handleReInit: () => void;
    handlePointerDown: () => void;
  }>>(new Map());

  // Track previous emblaApi for cleanup
  const prevEmblaApiRef = useRef<typeof emblaApi>(null);

  // Cleanup previous emblaApi when it changes (runs synchronously before main effect)
  useLayoutEffect(() => {
    const prevApi = prevEmblaApiRef.current;
    if (prevApi && prevApi !== emblaApi) {
      const prevHandlers = handlersMapRef.current.get(prevApi);
      if (prevHandlers) {
        prevApi.off("select", prevHandlers.onSelect);
        prevApi.off("reInit", prevHandlers.handleReInit);
        prevApi.off("pointerDown", prevHandlers.handlePointerDown);
        handlersMapRef.current.delete(prevApi);
      }
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      prevEmblaApiRef.current = null;
      return;
    }
    
    // Create handlers and capture them in closure for cleanup
    const handleReInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };
    
    const handlePointerDown = () => {
      // Stop autoplay on drag/interaction
      setAutoplayEnabled(false);
    };
    
    // Use ref to get current onSelect without adding it to dependencies
    const currentOnSelect = () => {
      onSelectRef.current();
    };
    
    // Store handlers in Map for this emblaApi instance (before registering)
    const handlers = {
      onSelect: currentOnSelect,
      handleReInit,
      handlePointerDown,
    };
    handlersMapRef.current.set(emblaApi, handlers);
    
    // Capture emblaApi and handlers in closure for React's automatic cleanup
    const apiForCleanup = emblaApi;
    
    apiForCleanup.on("select", currentOnSelect);
    apiForCleanup.on("reInit", handleReInit);
    apiForCleanup.on("pointerDown", handlePointerDown);
    
    // Initialize scroll snaps and selected index asynchronously
    requestAnimationFrame(() => {
      setScrollSnaps(emblaApi.scrollSnapList());
      currentOnSelect();
    });

    // Update ref for next render
    prevEmblaApiRef.current = emblaApi;

    // Cleanup event listeners - all captured in closure
    // This will run when emblaApi changes or component unmounts
    return () => {
      apiForCleanup.off("select", currentOnSelect);
      apiForCleanup.off("reInit", handleReInit);
      apiForCleanup.off("pointerDown", handlePointerDown);
    };
  }, [emblaApi]);

  // PERFORMANCE OPTIMIZATION: Pause autoplay when carousel is not visible
  // Uses IntersectionObserver to detect when carousel enters/leaves viewport
  useEffect(() => {
    if (!viewportRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false;
        // Only enable autoplay when visible and user hasn't disabled it
        if (!isVisible) {
          setAutoplayEnabled(false);
        }
      },
      // Trigger when at least 10% visible
      { threshold: 0.1 }
    );

    observer.observe(viewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Autoplay: advance carousel every 2 seconds (only when visible)
  useEffect(() => {
    if (!emblaApi || !autoplayEnabled) return;

    // Advance every 2 seconds
    const autoplayInterval = setInterval(() => {
      if (emblaApi && autoplayEnabled) {
        emblaApi.scrollNext();
      }
    }, 2000);

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
        <div 
          className={styles.viewport} 
          ref={(node) => {
            // Handle both Embla ref and our viewport ref
            if (typeof emblaRef === 'function') {
              emblaRef(node);
            }
            viewportRef.current = node;
          }}
        >
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

// PERFORMANCE OPTIMIZATION: Memoize component to prevent unnecessary re-renders
// AgencyLogos doesn't receive props, so it only re-renders when internal state changes
export const AgencyLogos = memo(AgencyLogosComponent);
