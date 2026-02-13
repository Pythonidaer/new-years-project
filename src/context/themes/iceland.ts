import type { Theme } from './types';
import { defaultTheme } from './default';

/**
 * Iceland – inspired by the Northern Lights (Aurora Borealis): deep night sky,
 * dark green/teal undertones, vibrant emerald aurora greens, and warm
 * yellow-orange from distant settlement lights.
 */
export const icelandTheme: Theme = {
  ...defaultTheme,
  bg: '#030C0B', // Deep black with subtle green (night sky)
  surface: '#1A2421', // Dark green/teal (aurora-lit sky)
  surfaceDark: '#0D1210', // Deeper dark
  marqueeBg: '#050A09', // Near black
  text: '#E8ECF0', // Light grey (readable on dark)
  textDark: '#FFFFFF', // White for headings
  muted: '#9EADB5', // Mid grey (stars, dim areas)
  border: 'rgba(102, 187, 106, 0.25)', // Subtle aurora green
  codeBg: '#1A2421',
  codeText: '#C8E6C9', // Light green tint
  primary: '#43A047', // Emerald (aurora, WCAG AA with white)
  primaryHover: '#66BB6A', // Brighter aurora green
  primaryContrast: '#FFFFFF',
  link: '#81C784', // Light aurora green (contrast on dark)
  blogLink: '#A5D6A7', // Lighter green for author box
  focus: '#FFC107', // Warm yellow (distant lights)
  accent: '#66BB6A', // Vibrant aurora green
  accentAlt: '#FFB74D', // Warm orange (settlement lights)
  footerBg: '#000000', // Deep black
  footerTextMuted: 'rgba(232, 236, 240, 0.8)',
  footerTextSubtle: 'rgba(232, 236, 240, 0.7)',
  footerSocialBg: 'rgba(102, 187, 106, 0.15)', // Aurora hint
  footerBorder: 'rgba(102, 187, 106, 0.2)',
  heroStart: '#0D1210', // Deep dark
  heroEnd: '#1A2421', // Dark emerald undertone
  heroRadial: 'rgba(102, 187, 106, 0.18)', // Aurora glow
  campaignStart: '#2E7D32', // Deep emerald
  campaignEnd: '#FFC107', // Warm yellow (lights)
  authorBoxStart: 'rgba(26, 36, 33, 0.92)',
  authorBoxEnd: 'rgba(13, 18, 16, 0.92)',
  relatedSectionStart: 'rgba(26, 36, 33, 0.6)',
  relatedSectionEnd: 'rgba(13, 18, 16, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowSubtle: 'rgba(0, 0, 0, 0.25)',
};
