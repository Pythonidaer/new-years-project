import { useState } from "react";
import { Container } from "@/layout/Container";
import { Section } from "@/layout/Section";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CustomerSpotlight.module.css";

export type Testimonial = {
  id: number;
  quote: string;
  author: string;
  role: string;
  image?: string;
  alt?: string;
};

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Jonathan built a clear, reliable and accessible campaign website that fit our needs perfectly. He explained every option and delivered thoughtful solutions on time.",
    author: "Bil Legault",
    role: "Former Salem City Councilor At-Large",
    image: "/bil_legault.webp",
    alt: "Bil Legault",
  },
  {
    id: 2,
    quote: "Johnny showed consistent drive and curiosity while growing from IT intern into developer. He learned quickly, solved problems, and earned trust across teams.",
    author: "Johnathon Broekhuizen",
    role: "Director of IT Services",
    image: "/john_broekhuizen.png",
    alt: "Johnathon Broekhuizen",
  },
  {
    id: 3,
    quote: "Johnny brings strong frontend instincts and communicates complex ideas clearly. I have seen his projects evolve with solid architecture and careful attention.",
    author: "John Bauer",
    role: "Principal Software Engineer",
    image: "/john_bauer.png",
    alt: "John Bauer",
  },
];

type CustomerSpotlightProps = { testimonials?: Testimonial[] };

export function CustomerSpotlight(props: CustomerSpotlightProps = {}) {
  const testimonials = props.testimonials ?? defaultTestimonials;
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
      <Container className={styles.referencesContainer}>
        <h2 className={styles.heading}>References</h2>
        <div className={styles.wrapper}>
          <div className={styles.image}>
            <div className={styles.imageContainer}>
              {currentTestimonial.image ? (
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.alt || currentTestimonial.author}
                  className={styles.imageContent}
                />
              ) : (
                <span className={styles.placeholderText}>Image</span>
              )}
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

