import type { Theme } from './types';
import { defaultTheme } from './default';

// Dalmatian theme
export const dalmatianTheme: Theme = {
  ...defaultTheme,
  bg: '#FFFFFF', // Pure white (background)
  surface: '#F5F5F5', // Off-white surface (subtle contrast)
  surfaceDark: '#000000', // Pure black (black side of hoodie)
  marqueeBg: '#0a0a0a', // Deep black
  text: '#000000', // Pure black text (glasses frames)
  textDark: '#000000', // Black for headings
  muted: '#666666', // Medium gray (muted accent)
  border: 'rgba(0, 0, 0, 0.3)', // Black borders
  codeBg: '#F5F5F5', // Off-white surface for code
  codeText: '#000000', // Black code text
  primary: '#000000', // Pure black (black side of hoodie) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#333333', // Dark gray on hover
  primaryContrast: '#FFFFFF', // White text on black buttons (meets 4.5:1 WCAG AA)
  link: '#8B6914', // Darker gold/bronze links for better contrast on white background (meets 4.5:1 WCAG AA)
  blogLink: '#6B4E0A', // Darker gold/bronze for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#D4AF37', // Warm blonde focus (hair color)
  accent: '#D4AF37', // Warm blonde accent (hair color)
  accentAlt: '#B8941F', // Darker blonde accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#000000', // Pure black footer (black side of hoodie)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.70)', // Brighter subtle white text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(255, 255, 255, 0.15)', // White social bg
  footerBorder: 'rgba(255, 255, 255, 0.2)', // White borders
  heroStart: '#000000', // Pure black start (black side of hoodie)
  heroEnd: '#1a1a1a', // Dark gray end
  heroRadial: 'rgba(212, 175, 55, 0.15)', // Warm blonde glow (hair color)
  campaignStart: '#000000', // Pure black (black side of hoodie)
  campaignEnd: '#FFFFFF', // Pure white (white side of hoodie)
  authorBoxStart: 'rgba(245, 245, 245, 0.9)', // Off-white
  authorBoxEnd: 'rgba(255, 255, 255, 0.9)', // Pure white
  relatedSectionStart: 'rgba(255, 255, 255, 0.7)', // White section
  relatedSectionEnd: 'rgba(245, 245, 245, 0.7)', // Off-white section
  shadow: 'rgba(0, 0, 0, 0.2)', // Black shadows
  shadowSubtle: 'rgba(0, 0, 0, 0.1)', // Subtle black shadows
};
