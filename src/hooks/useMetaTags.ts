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

    // Get base URL from window location
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
    const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined;

    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper to set or update meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Standard meta tags
    if (description) {
      setMetaTag('description', description);
    }

    // Open Graph tags
    if (title) {
      setMetaTag('og:title', title, true);
    }
    if (description) {
      setMetaTag('og:description', description, true);
    }
    if (fullImage) {
      setMetaTag('og:image', fullImage, true);
    }
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', siteName, true);

    // Twitter Card tags
    setMetaTag('twitter:card', twitterCard);
    if (title) {
      setMetaTag('twitter:title', title);
    }
    if (description) {
      setMetaTag('twitter:description', description);
    }
    if (fullImage) {
      setMetaTag('twitter:image', fullImage);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);

    // Robots meta tag
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    setMetaTag('robots', robotsContent);

    // Cleanup function (optional - you might want to keep some defaults)
    return () => {
      // Optionally reset to defaults on unmount
      // For now, we'll leave tags as-is since they're page-specific
    };
  }, [title, description, image, url, type, siteName, twitterCard, noindex, nofollow]);
}

