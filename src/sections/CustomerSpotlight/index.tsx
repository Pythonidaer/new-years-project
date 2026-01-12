import { useState } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CustomerSpotlight.module.css";

const testimonials = [
  {
    id: 1,
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Lorem Ipsum",
    role: "Dolor Sit Amet, Consectetur Adipiscing",
  },
  {
    id: 2,
    quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    author: "Sed Do Eiusmod",
    role: "Tempor Incididunt, Ut Labore",
  },
  {
    id: 3,
    quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    author: "Dolore Magna",
    role: "Aliqua Ut Enim, Minim Veniam",
  },
];

export function CustomerSpotlight() {

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
        <h2 className={styles.heading}>Lorem Ipsum Dolor</h2>
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

