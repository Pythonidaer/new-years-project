import { useMetaTags, type MetaTagsConfig } from '@/hooks/useMetaTags';

/**
 * Declarative component for managing meta tags
 * Usage: <MetaTags title="Page Title" description="..." />
 */
export function MetaTags(config: MetaTagsConfig) {
  useMetaTags(config);
  // This component doesn't render anything
  return null;
}

