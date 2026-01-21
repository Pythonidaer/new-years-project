import { useEffect, useState } from 'react';
import { getGrayscaleImageUrl } from '@/utils/imageGrayscale';

/**
 * Custom hook to preload an image and track its loading state
 * @param imageUrl - The image URL to preload
 * @param isNoirTheme - Whether noir theme is active (affects grayscale conversion)
 * @returns boolean indicating if image is loaded
 */
export function useImagePreload(imageUrl: string | undefined, isNoirTheme: boolean): boolean {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    const processedUrl = getGrayscaleImageUrl(imageUrl, isNoirTheme);

    // Create preload link for faster LCP
    const link = document.createElement("link");
    link.setAttribute("rel", "preload");
    link.setAttribute("as", "image");
    link.setAttribute("href", processedUrl);
    link.setAttribute("fetchPriority", "high");
    document.head.appendChild(link);

    // Detect when the image is loaded
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Show content even if image fails to load
      setImageLoaded(true);
    };
    img.src = processedUrl;
    
    // Handle already cached images
    if (img.complete) {
      setTimeout(() => setImageLoaded(true), 0);
    }

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [imageUrl, isNoirTheme]);

  return imageLoaded;
}
