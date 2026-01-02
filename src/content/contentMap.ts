import type { ContentSet, TopicId } from "./types";
import { DEFAULT_TOPIC_ID } from "./topics";

/**
 * Content Map
 * 
 * Stores all content sets keyed by topic ID.
 * Each topic should have a complete ContentSet with all required keys.
 * 
 * To add a new topic:
 * 1. Add topic metadata to topics.ts
 * 2. Add a new entry here with the topic ID as the key
 * 3. Provide all content strings for that topic
 */
export const contentByTopic: Record<TopicId, ContentSet> = {
  default: {
    // Hero section
    "hero.title": "Lorem",
    "hero.titleAccent": "dolce decorum",
    "hero.titleSuffix": "ipsum",
    "hero.titleLine2": "dolor sit amet consectetur",
    "hero.subtitle": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "hero.ctaLabel": "Lorem Ipsum",
    
    // Platform Intro section
    "platformIntro.heading": "Lorem Ipsum",
    "platformIntro.text1": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "platformIntro.text2": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    
    // Campaign Banner section
    "campaignBanner.heading": "Lorem",
    "campaignBanner.headingAccent": "Ipsum",
    "campaignBanner.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "campaignBanner.ctaLabel": "Lorem Ipsum",
    
    // Feature Accordion section
    "featureAccordion.heading": "Lorem Ipsum",
    "featureAccordion.item1.title": "Lorem Ipsum",
    "featureAccordion.item1.content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "featureAccordion.item1.ctaLabel": "LOREM IPSUM",
    "featureAccordion.item2.title": "Dolor Sit",
    "featureAccordion.item2.content": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "featureAccordion.item2.ctaLabel": "LOREM IPSUM",
    "featureAccordion.item3.title": "Amet Consectetur",
    "featureAccordion.item3.content": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "featureAccordion.item3.ctaLabel": "LOREM IPSUM",
    "featureAccordion.item4.title": "Adipiscing Elit",
    "featureAccordion.item4.content": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "featureAccordion.item4.ctaLabel": "LOREM IPSUM",
    "featureAccordion.item5.title": "Sed Do Eiusmod",
    "featureAccordion.item5.content": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    "featureAccordion.item5.ctaLabel": "LOREM IPSUM",
    "featureAccordion.item6.title": "Tempor Incididunt",
    "featureAccordion.item6.content": "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.",
    "featureAccordion.item6.ctaLabel": "LOREM IPSUM",
    
    // Platform Cards section
    "platformCards.card1.title": "Lorem Ipsum Dolor",
    "platformCards.card1.description": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "platformCards.card2.title": "Consectetur Adipiscing",
    "platformCards.card2.description": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "platformCards.card3.title": "Elit Sed Do",
    "platformCards.card3.description": "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
    "platformCards.card4.title": "Eiusmod Tempor",
    "platformCards.card4.description": "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
    
    // Customer Spotlight section
    "customerSpotlight.heading": "Lorem Ipsum Dolor",
    "customerSpotlight.testimonial1.quote": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "customerSpotlight.testimonial1.author": "Lorem Ipsum",
    "customerSpotlight.testimonial1.role": "Dolor Sit Amet, Consectetur Adipiscing",
    "customerSpotlight.testimonial2.quote": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "customerSpotlight.testimonial2.author": "Sed Do Eiusmod",
    "customerSpotlight.testimonial2.role": "Tempor Incididunt, Ut Labore",
    "customerSpotlight.testimonial3.quote": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "customerSpotlight.testimonial3.author": "Dolore Magna",
    "customerSpotlight.testimonial3.role": "Aliqua Ut Enim, Minim Veniam",
    
    // Latest News section
    "latestNews.heading": "Latest News",
    "latestNews.item1.title": "Lorem Ipsum Dolor Sit Amet",
    "latestNews.item1.date": "January 15, 2024",
    "latestNews.item1.excerpt": "Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "latestNews.item1.linkLabel": "Lorem Ipsum",
    "latestNews.item2.title": "Ut Enim Ad Minim Veniam",
    "latestNews.item2.date": "January 10, 2024",
    "latestNews.item2.excerpt": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "latestNews.item2.linkLabel": "Lorem Ipsum",
    "latestNews.item3.title": "Duis Aute Irure Dolor",
    "latestNews.item3.date": "January 5, 2024",
    "latestNews.item3.excerpt": "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "latestNews.item3.linkLabel": "Lorem Ipsum",
  },
  
  interview_http: {
    // Hero section
    "hero.title": "HTTP",
    "hero.titleAccent": "in Web Architecture",
    "hero.titleSuffix": "Explained",
    "hero.titleLine2": "",
    "hero.subtitle": "HTTP is the application-layer protocol that defines how clients (browsers, mobile apps, frontends) and servers communicate. It is the contract for requesting resources and receiving responses over the web.",
    "hero.ctaLabel": "Learn More",
    
    // Platform Intro section
    "platformIntro.heading": "Main Responsibilities",
    "platformIntro.text1": "HTTP defines the request–response lifecycle with methods (GET, POST, PUT, PATCH, DELETE) and how a client asks for something and the server replies. It enables stateless communication where each request is independent, which pushes state management to tokens, headers, or backend storage.",
    "platformIntro.text2": "HTTP uses status codes (200, 400, 401, 404, 500), headers, and content types to clearly communicate outcomes and expectations. It enables caching, conditional requests, and compression, which directly impact scalability and speed. HTTP works with HTTPS, authentication headers, and CORS to enforce secure access.",
    
    // Campaign Banner section
    "campaignBanner.heading": "How this affects",
    "campaignBanner.headingAccent": "API Design",
    "campaignBanner.text": "APIs should use HTTP methods and status codes correctly so behavior is predictable and debuggable. Because HTTP is stateless, APIs must be explicit about auth (e.g., JWTs) and idempotency. Good APIs leverage headers, caching, and content negotiation to scale and evolve without breaking clients.",
    "campaignBanner.ctaLabel": "Explore APIs",
    
    // Feature Accordion section
    "featureAccordion.heading": "Main Responsibilities",
    "featureAccordion.item1.title": "Request–Response Lifecycle",
    "featureAccordion.item1.content": "Defines methods (GET, POST, PUT, PATCH, DELETE) and how a client asks for something and the server replies.",
    "featureAccordion.item1.ctaLabel": "LEARN MORE",
    "featureAccordion.item2.title": "Stateless Communication",
    "featureAccordion.item2.content": "Each request is independent, which pushes state management to tokens, headers, or backend storage.",
    "featureAccordion.item2.ctaLabel": "LEARN MORE",
    "featureAccordion.item3.title": "Semantics and Metadata",
    "featureAccordion.item3.content": "Uses status codes (200, 400, 401, 404, 500), headers, and content types to clearly communicate outcomes and expectations.",
    "featureAccordion.item3.ctaLabel": "LEARN MORE",
    "featureAccordion.item4.title": "Caching and Performance",
    "featureAccordion.item4.content": "Enables caching, conditional requests, and compression, which directly impact scalability and speed.",
    "featureAccordion.item4.ctaLabel": "LEARN MORE",
    "featureAccordion.item5.title": "Security Hooks",
    "featureAccordion.item5.content": "Works with HTTPS, authentication headers, and CORS to enforce secure access.",
    "featureAccordion.item5.ctaLabel": "LEARN MORE",
    "featureAccordion.item6.title": "API Design Impact",
    "featureAccordion.item6.content": "APIs should use HTTP methods and status codes correctly so behavior is predictable and debuggable. Good APIs leverage headers, caching, and content negotiation to scale and evolve without breaking clients.",
    "featureAccordion.item6.ctaLabel": "LEARN MORE",
    
    // Platform Cards section
    "platformCards.card1.title": "Request Methods",
    "platformCards.card1.description": "GET, POST, PUT, PATCH, DELETE define how clients interact with server resources.",
    "platformCards.card2.title": "Status Codes",
    "platformCards.card2.description": "200, 400, 401, 404, 500 communicate request outcomes clearly and predictably.",
    "platformCards.card3.title": "Headers & Metadata",
    "platformCards.card3.description": "Content types, caching directives, and authentication headers enable rich communication.",
    "platformCards.card4.title": "Stateless Design",
    "platformCards.card4.description": "Each request is independent, pushing state management to tokens and backend storage.",
    
    // Customer Spotlight section
    "customerSpotlight.heading": "HTTP in Practice",
    "customerSpotlight.testimonial1.quote": "HTTP's stateless nature forces us to design APIs that are explicit about authentication and idempotency, which leads to more robust systems.",
    "customerSpotlight.testimonial1.author": "Senior Backend Engineer",
    "customerSpotlight.testimonial1.role": "API Architecture Team",
    "customerSpotlight.testimonial2.quote": "Understanding HTTP methods and status codes correctly is crucial for building predictable, debuggable APIs that scale.",
    "customerSpotlight.testimonial2.author": "Principal Engineer",
    "customerSpotlight.testimonial2.role": "Platform Engineering",
    "customerSpotlight.testimonial3.quote": "Good APIs leverage HTTP headers, caching, and content negotiation to evolve without breaking clients.",
    "customerSpotlight.testimonial3.author": "Engineering Lead",
    "customerSpotlight.testimonial3.role": "Developer Experience",
    
    // Latest News section
    "latestNews.heading": "Latest News",
    "latestNews.item1.title": "Understanding HTTP Methods",
    "latestNews.item1.date": "January 15, 2024",
    "latestNews.item1.excerpt": "Learn how GET, POST, PUT, PATCH, and DELETE define client-server interactions in modern web applications.",
    "latestNews.item1.linkLabel": "Read More",
    "latestNews.item2.title": "HTTP Status Codes Explained",
    "latestNews.item2.date": "January 10, 2024",
    "latestNews.item2.excerpt": "A comprehensive guide to using status codes correctly for predictable and debuggable API behavior.",
    "latestNews.item2.linkLabel": "Read More",
    "latestNews.item3.title": "Building Stateless APIs",
    "latestNews.item3.date": "January 5, 2024",
    "latestNews.item3.excerpt": "Explore how HTTP's stateless nature shapes API design and state management strategies.",
    "latestNews.item3.linkLabel": "Read More",
  },
  
  interview_http2: {
    // Hero section
    "hero.title": "HTTP/1.1",
    "hero.titleAccent": "vs HTTP/2",
    "hero.titleSuffix": "Comparison",
    "hero.titleLine2": "",
    "hero.subtitle": "Understanding the core differences between HTTP/1.1 and HTTP/2, and how they impact performance and API design in modern web applications.",
    "hero.ctaLabel": "Learn More",
    
    // Platform Intro section
    "platformIntro.heading": "Core Differences",
    "platformIntro.text1": "HTTP/1.1 uses one request per connection at a time (head-of-line blocking), relies on multiple connections, and sends verbose text headers with every request. This creates bottlenecks when loading modern web applications with many resources.",
    "platformIntro.text2": "HTTP/2 uses a single TCP connection with multiplexing, allowing many requests and responses in parallel, and compresses headers. This eliminates head-of-line blocking and significantly reduces connection overhead.",
    
    // Campaign Banner section
    "campaignBanner.heading": "Practical Effects on",
    "campaignBanner.headingAccent": "API Usage",
    "campaignBanner.text": "With HTTP/2, APIs can safely make many small, fine-grained requests without the same performance penalty. It reduces the need for hacks like request batching or resource bundling that were common in HTTP/1.1. API design stays mostly the same, but HTTP/2 rewards clean, granular endpoints and frequent client-server interaction.",
    "campaignBanner.ctaLabel": "Explore APIs",
    
    // Feature Accordion section
    "featureAccordion.heading": "Key Differences",
    "featureAccordion.item1.title": "HTTP/1.1: Head-of-Line Blocking",
    "featureAccordion.item1.content": "Uses one request per connection at a time, causing head-of-line blocking. Requires multiple connections to achieve parallelism, which increases overhead.",
    "featureAccordion.item1.ctaLabel": "LEARN MORE",
    "featureAccordion.item2.title": "HTTP/2: Multiplexing",
    "featureAccordion.item2.content": "Uses a single TCP connection with multiplexing, allowing many requests and responses in parallel. Eliminates blocking and reduces connection overhead.",
    "featureAccordion.item2.ctaLabel": "LEARN MORE",
    "featureAccordion.item3.title": "HTTP/1.1: Verbose Headers",
    "featureAccordion.item3.content": "Sends verbose text headers with every request, increasing bandwidth usage and latency, especially for applications with many small requests.",
    "featureAccordion.item3.ctaLabel": "LEARN MORE",
    "featureAccordion.item4.title": "HTTP/2: Header Compression",
    "featureAccordion.item4.content": "Compresses headers using HPACK, significantly reducing bandwidth and improving performance, especially for APIs with many small requests.",
    "featureAccordion.item4.ctaLabel": "LEARN MORE",
    "featureAccordion.item5.title": "Performance Impact",
    "featureAccordion.item5.content": "HTTP/1.1 can be slow for modern apps because many small requests block each other. HTTP/2 significantly improves page and API performance by reducing latency and eliminating most blocking.",
    "featureAccordion.item5.ctaLabel": "LEARN MORE",
    "featureAccordion.item6.title": "API Design Benefits",
    "featureAccordion.item6.content": "HTTP/2 rewards clean, granular endpoints and frequent client-server interaction. APIs can make many small, fine-grained requests without performance penalties, reducing the need for request batching or resource bundling.",
    "featureAccordion.item6.ctaLabel": "LEARN MORE",
    
    // Platform Cards section
    "platformCards.card1.title": "One Request Per Connection",
    "platformCards.card1.description": "HTTP/1.1 processes one request per connection, causing head-of-line blocking that slows down modern applications.",
    "platformCards.card2.title": "Multiplexing",
    "platformCards.card2.description": "HTTP/2 uses a single connection with multiplexing, allowing parallel requests and responses without blocking.",
    "platformCards.card3.title": "Multiple Connections",
    "platformCards.card3.description": "HTTP/1.1 requires multiple connections for parallelism, increasing overhead and complexity.",
    "platformCards.card4.title": "Header Compression",
    "platformCards.card4.description": "HTTP/2 compresses headers, reducing bandwidth and improving performance for APIs with many requests.",
    
    // Customer Spotlight section
    "customerSpotlight.heading": "HTTP/2 in Practice",
    "customerSpotlight.testimonial1.quote": "HTTP/2's multiplexing allows us to design APIs with many small, granular endpoints without worrying about the performance penalties we faced with HTTP/1.1.",
    "customerSpotlight.testimonial1.author": "Senior Backend Engineer",
    "customerSpotlight.testimonial1.role": "API Architecture Team",
    "customerSpotlight.testimonial2.quote": "The elimination of head-of-line blocking in HTTP/2 has significantly improved our page load times and API response latency.",
    "customerSpotlight.testimonial2.author": "Principal Engineer",
    "customerSpotlight.testimonial2.role": "Platform Engineering",
    "customerSpotlight.testimonial3.quote": "With HTTP/2, we no longer need request batching or resource bundling hacks. Clean, granular endpoints are now a performance advantage.",
    "customerSpotlight.testimonial3.author": "Engineering Lead",
    "customerSpotlight.testimonial3.role": "Developer Experience",
    
    // Latest News section
    "latestNews.heading": "Latest News",
    "latestNews.item1.title": "Understanding HTTP/2 Multiplexing",
    "latestNews.item1.date": "January 20, 2024",
    "latestNews.item1.excerpt": "Learn how HTTP/2's multiplexing eliminates head-of-line blocking and enables parallel request processing in a single connection.",
    "latestNews.item1.linkLabel": "Read More",
    "latestNews.item2.title": "HTTP/2 Performance Improvements",
    "latestNews.item2.date": "January 18, 2024",
    "latestNews.item2.excerpt": "Explore how HTTP/2's header compression and multiplexing significantly improve page and API performance compared to HTTP/1.1.",
    "latestNews.item2.linkLabel": "Read More",
    "latestNews.item3.title": "API Design with HTTP/2",
    "latestNews.item3.date": "January 12, 2024",
    "latestNews.item3.excerpt": "Discover how HTTP/2 enables fine-grained API endpoints and frequent client-server interaction without performance penalties.",
    "latestNews.item3.linkLabel": "Read More",
  },
  
  interview_prototypal: {
    // Hero section
    "hero.title": "Prototypal",
    "hero.titleAccent": "Inheritance",
    "hero.titleSuffix": "in JavaScript",
    "hero.titleLine2": "",
    "hero.subtitle": "Every JavaScript object has an internal [[Prototype]] that points to another object. When you access a property, JS looks on the object first, then walks up the prototype chain until it finds the property or reaches null.",
    "hero.ctaLabel": "Learn More",
    
    // Platform Intro section
    "platformIntro.heading": "How It Works",
    "platformIntro.text1": "Every JavaScript object has an internal [[Prototype]] that points to another object. When you access a property, JavaScript looks on the object first, then walks up the prototype chain until it finds the property or reaches null. This delegation-based model allows objects to share behavior without duplicating methods.",
    "platformIntro.text2": "Prototypal inheritance can be created via constructor functions (function Foo() {} → Foo.prototype), via class syntax (syntactic sugar over prototypes), or via Object.create(proto) for explicit prototype linkage. Each approach provides different levels of control and readability.",
    
    // Campaign Banner section
    "campaignBanner.heading": "When to",
    "campaignBanner.headingAccent": "Leverage It",
    "campaignBanner.text": "Use prototypal inheritance to share behavior across many objects without duplicating methods, especially for lightweight domain objects or performance-sensitive paths. In modern apps, most often rely on class syntax for readability, knowing it still compiles down to prototypes.",
    "campaignBanner.ctaLabel": "Explore Examples",
    
    // Feature Accordion section
    "featureAccordion.heading": "How It's Created",
    "featureAccordion.item1.title": "Constructor Functions",
    "featureAccordion.item1.content": "Create prototypes via constructor functions: function Foo() {} → Foo.prototype. This traditional approach allows you to define shared methods on the constructor's prototype property.",
    "featureAccordion.item1.ctaLabel": "LEARN MORE",
    "featureAccordion.item2.title": "Class Syntax",
    "featureAccordion.item2.content": "Class syntax provides syntactic sugar over prototypes, offering a more familiar syntax for developers coming from classical inheritance languages. It still compiles down to prototypes under the hood.",
    "featureAccordion.item2.ctaLabel": "LEARN MORE",
    "featureAccordion.item3.title": "Object.create()",
    "featureAccordion.item3.content": "Object.create(proto) provides explicit prototype linkage, allowing you to create objects with a specific prototype without using constructors. This gives you fine-grained control over the prototype chain.",
    "featureAccordion.item3.ctaLabel": "LEARN MORE",
    "featureAccordion.item4.title": "Prototype Chain",
    "featureAccordion.item4.content": "When you access a property, JavaScript looks on the object first, then walks up the prototype chain until it finds the property or reaches null. This delegation-based lookup is the core of prototypal inheritance.",
    "featureAccordion.item4.ctaLabel": "LEARN MORE",
    "featureAccordion.item5.title": "Concrete Example",
    "featureAccordion.item5.content": "const locationBase = { isValid() { return this.lat >= -90 && this.lat <= 90; } }; const responderLocation = Object.create(locationBase); responderLocation.lat = 42.5; responderLocation.isValid() works because JS finds isValid on locationBase.",
    "featureAccordion.item5.ctaLabel": "LEARN MORE",
    "featureAccordion.item6.title": "When to Use",
    "featureAccordion.item6.content": "Use prototypal inheritance to share behavior across many objects without duplicating methods, especially for lightweight domain objects or performance-sensitive paths. In modern apps, class syntax offers readability while maintaining prototype-based behavior.",
    "featureAccordion.item6.ctaLabel": "LEARN MORE",
    
    // Platform Cards section
    "platformCards.card1.title": "[[Prototype]] Link",
    "platformCards.card1.description": "Every JavaScript object has an internal [[Prototype]] that points to another object, forming the prototype chain.",
    "platformCards.card2.title": "Property Lookup",
    "platformCards.card2.description": "JavaScript looks on the object first, then walks up the prototype chain until it finds the property or reaches null.",
    "platformCards.card3.title": "Shared Behavior",
    "platformCards.card3.description": "Prototypal inheritance allows objects to share behavior without duplicating methods, reducing memory usage.",
    "platformCards.card4.title": "Delegation Model",
    "platformCards.card4.description": "The delegation-based model enables lightweight domain objects and performance-sensitive code paths.",
    
    // Customer Spotlight section
    "customerSpotlight.heading": "Prototypal Inheritance in Practice",
    "customerSpotlight.testimonial1.quote": "Prototypal inheritance lets us share behavior across many objects without duplicating methods. It's especially powerful for lightweight domain objects where performance matters.",
    "customerSpotlight.testimonial1.author": "Senior JavaScript Engineer",
    "customerSpotlight.testimonial1.role": "Frontend Architecture Team",
    "customerSpotlight.testimonial2.quote": "I use class syntax for readability in modern apps, knowing it still compiles down to prototypes. It gives us the best of both worlds: clean syntax and prototype-based behavior.",
    "customerSpotlight.testimonial2.author": "Principal Engineer",
    "customerSpotlight.testimonial2.role": "Platform Engineering",
    "customerSpotlight.testimonial3.quote": "Object.create() gives us explicit prototype linkage when we need fine-grained control. It's perfect for creating objects with specific prototype chains.",
    "customerSpotlight.testimonial3.author": "Engineering Lead",
    "customerSpotlight.testimonial3.role": "Developer Experience",
    
    // Latest News section
    "latestNews.heading": "Latest News",
    "latestNews.item1.title": "Understanding the Prototype Chain",
    "latestNews.item1.date": "January 25, 2024",
    "latestNews.item1.excerpt": "Learn how JavaScript's prototype chain enables property lookup and method sharing across objects without duplication.",
    "latestNews.item1.linkLabel": "Read More",
    "latestNews.item2.title": "Class Syntax vs Prototypes",
    "latestNews.item2.date": "January 22, 2024",
    "latestNews.item2.excerpt": "Explore how class syntax provides syntactic sugar over prototypes while maintaining the same underlying behavior.",
    "latestNews.item2.linkLabel": "Read More",
    "latestNews.item3.title": "Object.create() for Explicit Prototypes",
    "latestNews.item3.date": "January 19, 2024",
    "latestNews.item3.excerpt": "Discover how Object.create() provides fine-grained control over prototype linkage without using constructors.",
    "latestNews.item3.linkLabel": "Read More",
  },
};

/**
 * Get content set for a topic, with fallback to default
 */
export function getContentSet(topicId: TopicId): ContentSet {
  return contentByTopic[topicId] ?? contentByTopic[DEFAULT_TOPIC_ID];
}

/**
 * Get a specific content string for a topic, with fallback chain:
 * 1. Current topic
 * 2. Default topic
 * 3. Placeholder string
 */
export function getContent(
  topicId: TopicId,
  key: string,
  defaultValue?: string
): string {
  const contentSet = getContentSet(topicId);
  const value = contentSet[key as keyof ContentSet];
  
  if (value !== undefined) {
    return value;
  }
  
  // Try default topic if not current
  if (topicId !== DEFAULT_TOPIC_ID) {
    const defaultSet = contentByTopic[DEFAULT_TOPIC_ID];
    const defaultValue = defaultSet[key as keyof ContentSet];
    if (defaultValue !== undefined) {
      return defaultValue;
    }
  }
  
  // Final fallback
  return defaultValue ?? `[[missing: ${key}]]`;
}

