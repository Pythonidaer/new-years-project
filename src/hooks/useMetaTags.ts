import { useEffect } from 'react';

export interface MetaTagsConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Resolves a URL to a full URL, adding base URL if needed
 */
function resolveUrl(url: string | undefined, baseUrl: string): string {
  if (!url) return baseUrl;
  return url.startsWith('http') ? url : `${baseUrl}${url}`;
}

/**
 * Resolves an image URL to a full URL, adding base URL if needed
 */
function resolveImageUrl(image: string | undefined, baseUrl: string): string | undefined {
  if (!image) return undefined;
  return image.startsWith('http') ? image : `${baseUrl}${image}`;
}

/**
 * Gets the base URL from window location
 */
function getBaseUrl(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/**
 * Sets or updates a meta tag in the document head
 */
function setMetaTag(property: string, content: string, isProperty = false): void {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    const attribute = isProperty ? 'property' : 'name';
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Sets the canonical link in the document head
 */
function setCanonicalLink(url: string): void {
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', url);
}

/**
 * Generates robots meta tag content
 */
function generateRobotsContent(noindex: boolean, nofollow: boolean): string {
  const indexValue = noindex ? 'noindex' : 'index';
  const followValue = nofollow ? 'nofollow' : 'follow';
  return `${indexValue}, ${followValue}`;
}

/**
 * Sets conditional meta tags based on provided values
 */
function setConditionalMetaTags(
  tags: Array<{ property: string; content: string | undefined; isProperty?: boolean }>
): void {
  tags.forEach(({ property, content, isProperty = false }) => {
    if (content) {
      setMetaTag(property, content, isProperty);
    }
  });
}

/**
 * Sets Open Graph meta tags
 */
function setOpenGraphTags(
  title: string | undefined,
  description: string | undefined,
  image: string | undefined,
  url: string,
  type: string,
  siteName: string
): void {
  setConditionalMetaTags([
    { property: 'og:title', content: title, isProperty: true },
    { property: 'og:description', content: description, isProperty: true },
    { property: 'og:image', content: image, isProperty: true },
  ]);
  setMetaTag('og:url', url, true);
  setMetaTag('og:type', type, true);
  setMetaTag('og:site_name', siteName, true);
}

/**
 * Sets Twitter Card meta tags
 */
function setTwitterCardTags(
  card: string,
  title: string | undefined,
  description: string | undefined,
  image: string | undefined
): void {
  setMetaTag('twitter:card', card);
  setConditionalMetaTags([
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:image', content: image },
  ]);
}

/**
 * Custom hook to manage document head meta tags for SEO and social sharing
 * Works with React 19 and doesn't require external dependencies
 */
export function useMetaTags(config: MetaTagsConfig) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName = 'Johnny H.',
    twitterCard = 'summary_large_image',
    noindex = false,
    nofollow = false,
  } = config;

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const fullUrl = resolveUrl(url, baseUrl);
    const fullImage = resolveImageUrl(image, baseUrl);

    if (title) {
      document.title = title;
    }

    setConditionalMetaTags([{ property: 'description', content: description }]);
    setOpenGraphTags(title, description, fullImage, fullUrl, type, siteName);
    setTwitterCardTags(twitterCard, title, description, fullImage);
    setCanonicalLink(fullUrl);
    setMetaTag('robots', generateRobotsContent(noindex, nofollow));
  }, [title, description, image, url, type, siteName, twitterCard, noindex, nofollow]);
}

