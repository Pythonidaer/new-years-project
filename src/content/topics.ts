import type { TopicMetadata, TopicId } from "./types";

/**
 * Topic Registry
 * 
 * Defines all available content topics. Add new topics here.
 * Each topic must have a corresponding entry in contentMap.ts
 */
export const topics: TopicMetadata[] = [
  {
    id: "default",
    label: "Default (Lorem Ipsum)",
    description: "Default placeholder content",
  },
  {
    id: "interview_http",
    label: "HTTP in Web Architecture (Senior Engineer Answer)",
    description: "Content about HTTP protocols and their role in web architecture",
  },
  {
    id: "interview_http2",
    label: "HTTP/1.1 vs HTTP/2",
    description: "Comparison of HTTP/1.1 and HTTP/2 protocols and their performance implications",
  },
  {
    id: "interview_prototypal",
    label: "Prototypal inheritance in JavaScript",
    description: "Understanding JavaScript's prototypal inheritance model and how it works",
  },
];

/**
 * Default topic ID to use when no topic is selected or an invalid topic is requested.
 */
export const DEFAULT_TOPIC_ID: TopicId = "default";

/**
 * Get topic metadata by ID
 */
export function getTopicById(id: string): TopicMetadata | undefined {
  return topics.find((t) => t.id === id);
}

/**
 * Check if a topic ID is valid
 */
export function isValidTopicId(id: string): boolean {
  return topics.some((t) => t.id === id);
}

