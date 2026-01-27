import type { Theme } from './types';
import { defaultTheme } from './default';

// Noname theme
export const nonameTheme: Theme = {
  ...defaultTheme,
  bg: '#E0C0E8', // Light purple/lavender background
  surface: '#F0E0F8', // Lighter purple surface
  surfaceDark: '#6F4A3A', // Dark brown (skin tone)
  marqueeBg: '#D8B8E0', // Slightly darker purple
  text: '#1A1A1A', // Dark black (hair color)
  textDark: '#000000', // Pure black for headings
  muted: '#8B5E4A', // Muted brown
  border: 'rgba(111, 74, 58, 0.3)', // Dark brown borders
  codeBg: '#F0E0F8', // Light purple for code
  codeText: '#1A4A8B', // Dark blue code text for better contrast on light purple
  primary: '#2E6BB8', // Darker blue for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#4A90E2', // Brighter blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons
  link: '#1B5E20', // Darker green for better contrast on light purple background (meets 4.5:1 WCAG AA)
  blogLink: '#1B5E20', // Darker green for better contrast on author box gradient
  focus: '#8BC34A', // Bright green focus (eye color)
  accent: '#FFD700', // Bright yellow (floral accents)
  accentAlt: '#F44336', // Brighter red for better contrast on dark footer
  footerBg: '#1A1A1A', // Dark black (hair color)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(74, 144, 226, 0.15)', // Blue social bg
  footerBorder: 'rgba(255, 255, 255, 0.2)', // White borders
  heroStart: '#D8B8E0', // Light purple start
  heroEnd: '#E0C0E8', // Lighter purple end
  heroRadial: 'rgba(255, 215, 0, 0.15)', // Yellow glow
  campaignStart: '#4A90E2', // Bright blue
  campaignEnd: '#4CAF50', // Green
  authorBoxStart: 'rgba(240, 224, 248, 0.9)', // Light purple
  authorBoxEnd: 'rgba(224, 192, 232, 0.9)', // Slightly darker purple
  relatedSectionStart: 'rgba(224, 192, 232, 0.7)', // Light purple section
  relatedSectionEnd: 'rgba(240, 224, 248, 0.7)', // Lighter purple section
  shadow: 'rgba(111, 74, 58, 0.2)', // Brown shadows
  shadowSubtle: 'rgba(111, 74, 58, 0.1)', // Subtle brown shadows
};
