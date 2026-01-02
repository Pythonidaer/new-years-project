import { useState, useMemo } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "../../content/ContentProvider";
import styles from "./CustomerSpotlight.module.css";

export function CustomerSpotlight() {
  const { t } = useContent();
  
  const testimonials = useMemo(() => [
    {
      id: 1,
      quote: t("customerSpotlight.testimonial1.quote"),
      author: t("customerSpotlight.testimonial1.author"),
      role: t("customerSpotlight.testimonial1.role"),
    },
    {
      id: 2,
      quote: t("customerSpotlight.testimonial2.quote"),
      author: t("customerSpotlight.testimonial2.author"),
      role: t("customerSpotlight.testimonial2.role"),
    },
    {
      id: 3,
      quote: t("customerSpotlight.testimonial3.quote"),
      author: t("customerSpotlight.testimonial3.author"),
      role: t("customerSpotlight.testimonial3.role"),
    },
  ], [t]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const scrollNext = () => {
    setSelectedIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const currentTestimonial = testimonials[selectedIndex];

  return (
    <Section variant="alt">
      <Container>
        <h2 className={styles.heading}>{t("customerSpotlight.heading")}</h2>
        <div className={styles.wrapper}>
          <div className={styles.video}>
            <div className={styles.videoPlaceholder}>
              <span className={styles.placeholderText}>Video Player</span>
            </div>
          </div>
          <div className={styles.quote}>
            <div className={styles.quoteContent}>
              <blockquote className={styles.blockquote}>
                "{currentTestimonial.quote}"
              </blockquote>
              <div className={styles.quoteAuthor}>
                <div className={styles.authorName}>{currentTestimonial.author}</div>
                <div className={styles.authorRole}>{currentTestimonial.role}</div>
              </div>
            </div>
            <div className={styles.controls}>
              <button
                className={styles.arrow}
                onClick={scrollPrev}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>
              <div className={styles.dots}>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.dot} ${
                      index === selectedIndex ? styles.dotActive : ""
                    }`}
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <button
                className={styles.arrow}
                onClick={scrollNext}
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

