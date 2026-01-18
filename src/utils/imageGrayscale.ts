/**
 * Utility functions for handling grayscale images when Noir theme is active
 */

/**
 * Adds ?grayscale query parameter to picsum.photos URLs when Noir theme is active
 * @param imageUrl - The image URL (may be picsum.photos or other)
 * @param isNoirTheme - Whether the Noir theme is currently active
 * @returns The image URL with ?grayscale added if it's a picsum.photos URL and Noir is active
 */
export function getGrayscaleImageUrl(imageUrl: string, isNoirTheme: boolean): string {
  if (!isNoirTheme) {
    return imageUrl;
  }

  // Check if it's a picsum.photos URL
  if (imageUrl.includes('picsum.photos')) {
    // Check if URL already has query parameters
    const hasQuery = imageUrl.includes('?');
    const separator = hasQuery ? '&' : '?';
    
    // Add grayscale parameter
    return `${imageUrl}${separator}grayscale`;
  }

  // For non-picsum URLs, return as-is (will use CSS filter instead)
  return imageUrl;
}

/**
 * Gets CSS filter style for grayscale when Noir theme is active
 * @param isNoirTheme - Whether the Noir theme is currently active
 * @returns CSS filter string or undefined
 */
export function getGrayscaleFilter(isNoirTheme: boolean): string | undefined {
  return isNoirTheme ? 'grayscale(100%)' : undefined;
}

