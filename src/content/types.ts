/**
 * Content System Types
 * 
 * Defines the structure for topic-based content switching.
 */

/**
 * Unique identifier for a content topic (e.g., "default", "interview_http")
 */
export type TopicId = string;

/**
 * Content keys follow a dot-notation pattern: section.element
 * Examples: "hero.title", "hero.subtitle", "cta.primaryLabel"
 */
export type ContentKey = 
  // Hero section
  | "hero.title"
  | "hero.titleAccent"
  | "hero.titleSuffix"
  | "hero.titleLine2"
  | "hero.subtitle"
  | "hero.ctaLabel"
  // Platform Intro section
  | "platformIntro.heading"
  | "platformIntro.text1"
  | "platformIntro.text2"
  // Campaign Banner section
  | "campaignBanner.heading"
  | "campaignBanner.headingAccent"
  | "campaignBanner.text"
  | "campaignBanner.ctaLabel"
  // Feature Accordion section
  | "featureAccordion.heading"
  | "featureAccordion.item1.title"
  | "featureAccordion.item1.content"
  | "featureAccordion.item1.ctaLabel"
  | "featureAccordion.item2.title"
  | "featureAccordion.item2.content"
  | "featureAccordion.item2.ctaLabel"
  | "featureAccordion.item3.title"
  | "featureAccordion.item3.content"
  | "featureAccordion.item3.ctaLabel"
  | "featureAccordion.item4.title"
  | "featureAccordion.item4.content"
  | "featureAccordion.item4.ctaLabel"
  | "featureAccordion.item5.title"
  | "featureAccordion.item5.content"
  | "featureAccordion.item5.ctaLabel"
  | "featureAccordion.item6.title"
  | "featureAccordion.item6.content"
  | "featureAccordion.item6.ctaLabel"
  // Platform Cards section
  | "platformCards.card1.title"
  | "platformCards.card1.description"
  | "platformCards.card2.title"
  | "platformCards.card2.description"
  | "platformCards.card3.title"
  | "platformCards.card3.description"
  | "platformCards.card4.title"
  | "platformCards.card4.description"
  // Customer Spotlight section
  | "customerSpotlight.heading"
  | "customerSpotlight.testimonial1.quote"
  | "customerSpotlight.testimonial1.author"
  | "customerSpotlight.testimonial1.role"
  | "customerSpotlight.testimonial2.quote"
  | "customerSpotlight.testimonial2.author"
  | "customerSpotlight.testimonial2.role"
  | "customerSpotlight.testimonial3.quote"
  | "customerSpotlight.testimonial3.author"
  | "customerSpotlight.testimonial3.role"
  // Latest News section
  | "latestNews.heading"
  | "latestNews.item1.title"
  | "latestNews.item1.date"
  | "latestNews.item1.excerpt"
  | "latestNews.item1.linkLabel"
  | "latestNews.item2.title"
  | "latestNews.item2.date"
  | "latestNews.item2.excerpt"
  | "latestNews.item2.linkLabel"
  | "latestNews.item3.title"
  | "latestNews.item3.date"
  | "latestNews.item3.excerpt"
  | "latestNews.item3.linkLabel";

/**
 * A content set maps content keys to their string values.
 * All keys should be present, but the system will gracefully handle missing ones.
 */
export type ContentSet = Partial<Record<ContentKey, string>>;

/**
 * Metadata about a topic (display name, description, etc.)
 */
export interface TopicMetadata {
  id: TopicId;
  label: string;
  description?: string;
}

