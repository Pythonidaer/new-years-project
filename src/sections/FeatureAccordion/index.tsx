import { useState, useEffect, useRef } from "react";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { Icon } from "../../components/Icon";
import styles from "./FeatureAccordion.module.css";
import buttonStyles from "../../components/Button.module.css";

import {
  FileText,
  Network,
  Code,
  Film,
  Quote,
  Timer,
} from "lucide-react";

type FeatureItem = {
  id: number;
  title: string;
  content: string;
  ctaLabel: string;
  url: string;
  icon: typeof FileText;
  imageLabel: string;
  image?: string;
};

const items: FeatureItem[] = [
  {
    id: 1,
    title: "Docs Summarizer",
    content: "Chrome extension using OpenAI API to summarize any webpage with interactive features and export options.",
    ctaLabel: "VIEW PROJECT",
    url: "https://chromewebstore.google.com/detail/docs-summarizer/cbohkbdgjdpmoffedjbcdagmhpjdbiag?hl=en-US",
    icon: FileText,
    imageLabel: "Docs Summarizer",
    image: "/Docs_Summarizer_3x4_600x800.png",
  },
  {
    id: 2,
    title: "Mind Map Method",
    content: "Interactive D3.js mind maps for learning topics from AI to WordPress, backed by cognitive science principles.",
    ctaLabel: "VIEW PROJECT",
    url: "https://mindmapmethod.netlify.app/about",
    icon: Network,
    imageLabel: "Mind Map Method",
    image: "/Mind_Map_Method_3x4_600x800.png",
  },
  {
    id: 3,
    title: "Hammond Bytes",
    content: "Personal blog built with Next.js, Strapi, and Railway, exploring new technologies and development.",
    ctaLabel: "VIEW PROJECT",
    url: "https://hammondbytes.netlify.app/",
    icon: Code,
    imageLabel: "Hammond Bytes",
    image: "/Hammond_Bytes_3x4_600x800.png",
  },
  {
    id: 4,
    title: "Movie Watch List",
    content: "Password-protected Next.js app for friends to share and organize movie watchlists by genre.",
    ctaLabel: "VIEW PROJECT",
    url: "https://movie-friend-watch-list.vercel.app/",
    icon: Film,
    imageLabel: "Movie Watch List",
    image: "/Movie_Watch_List_3x4_600x800.png",
  },
  {
    id: 5,
    title: "Peak Scrivening",
    content: "PWA featuring Gary Gulman's 365 comedy quotes with random generation, search, and slideshow modes.",
    ctaLabel: "VIEW PROJECT",
    url: "https://peak-scrivening.vercel.app/",
    icon: Quote,
    imageLabel: "Peak Scrivening",
    image: "/Peak_Scrivening_3x4_600x800.png",
  },
  {
    id: 6,
    title: "PWA Timer",
    content: "Picture-in-Picture timer being converted to Tauri desktop app, expanding beyond browser limitations.",
    ctaLabel: "VIEW PROJECT",
    url: "https://pythonidaer.github.io/vue-pwa-timer/site",
    icon: Timer,
    imageLabel: "PWA Timer",
    image: "/PWA_Timer_3x4_600x800.png",
  },
];

export function FeatureAccordion() {

  // Accordion behavior: one item open at all times
  // Initialize with first item's ID, defaulting to 1 if items array is empty
  const firstItemId = items[0]?.id ?? 1;
  const [activeId, setActiveId] = useState<number>(firstItemId);

  // Refs for height matching
  const controlsWrapperRef = useRef<HTMLDivElement>(null);
  const contentsWrapperRef = useRef<HTMLDivElement>(null);

  // Match heights between left and right columns (desktop only)
  useEffect(() => {
    const matchHeights = () => {
      // Only run on desktop (window width > 990px)
      if (window.innerWidth <= 990) {
        // Reset height on mobile
        if (contentsWrapperRef.current) {
          contentsWrapperRef.current.style.height = "";
        }
        return;
      }

      if (controlsWrapperRef.current && contentsWrapperRef.current) {
        const leftHeight = controlsWrapperRef.current.offsetHeight;
        contentsWrapperRef.current.style.height = `${leftHeight}px`;
      }
    };

    // Match heights on mount, activeId change, and window resize
    matchHeights();
    window.addEventListener("resize", matchHeights);

    // Use a small delay to ensure DOM has updated after activeId change
    const timeoutId = setTimeout(matchHeights, 0);

    return () => {
      window.removeEventListener("resize", matchHeights);
      clearTimeout(timeoutId);
    };
  }, [activeId]);

  return (
    <Section id="projects">
      <Container className={styles.projectsContainer}>
      <h2 className={styles.heading}>Recent Projects</h2>

        <div className={styles.wrapper}>
            
          {/* LEFT: Accordion Controls (Desktop: shows heading + text + button when active) */}
          <div ref={controlsWrapperRef} className={styles.controlsWrapper}>
            <div className={styles.accordion}>
              {items.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                  >
                    <div className={styles.itemInner}>
                      {/* Heading and Icon */}
                      <button
                        type="button"
                        className={styles.trigger}
                        onClick={() => setActiveId(item.id)}
                        aria-expanded={isActive}
                      >
                        <h3 className={styles.triggerText}>{item.title}</h3>
                        <Icon icon={item.icon} size={24} className={styles.featureIcon} />
                      </button>
                      
                      {/* Text and Button (Desktop only, shown when active) */}
                      <div className={styles.controlContent}>
                        <div className={styles.controlText}>
                          <p className={styles.panelText}>{item.content}</p>
                        </div>
                        <div className={styles.controlCtaWrapper}>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${buttonStyles.primary} ${styles.controlCtaButton}`}
                          >
                            {item.ctaLabel}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Image Content (Desktop: image only, Mobile: image + text + button) */}
          <div ref={contentsWrapperRef} className={styles.contentsWrapper}>
            {items.map((item) => {
              const isActive = activeId === item.id;
              const radioId = `feature-accordion-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`${styles.contentItem} ${isActive ? styles.contentItemActive : ""}`}
                >
                  <div className={styles.contentItemInner}>
                    {/* Radio input for mobile toggle */}
                    <input
                      type="radio"
                      id={radioId}
                      name="feature-accordion"
                      value={item.id}
                      checked={isActive}
                      onChange={() => setActiveId(item.id)}
                      className={styles.radioInput}
                    />
                    {/* Label for mobile (shows title + icon) */}
                    <label htmlFor={radioId} className={styles.mobileLabel}>
                      <div className={styles.mobileLabelInner}>{item.title}</div>
                      <Icon icon={item.icon} size={24} className={styles.featureIcon} />
                    </label>
                    {/* Content area: image only on desktop, image + text + button on mobile */}
                    <div className={styles.contentContent}>
                      {/* Image (shown on both desktop and mobile) */}
                      <div className={styles.image}>
                        <div className={styles.imagePlaceholder}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.imageLabel}
                              className={styles.imageContent}
                            />
                          ) : (
                            <span className={styles.placeholderText}>{item.imageLabel}</span>
                          )}
                        </div>
                      </div>
                      {/* Text content (mobile only) */}
                      <div className={styles.textContent}>
                        <div className={styles.textContentInner}>
                          <p className={styles.panelText}>{item.content}</p>
                        </div>
                        <div className={styles.ctaWrapper}>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${buttonStyles.primary} ${styles.ctaButton}`}
                          >
                            {item.ctaLabel}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}

