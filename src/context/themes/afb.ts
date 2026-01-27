import type { Theme } from './types';
import { defaultTheme } from './default';

// AFB theme
export const afbTheme: Theme = {
  ...defaultTheme,
  bg: '#0a1526', // Very dark royal blue (boxing gym atmosphere)
  surface: '#1a2540', // Dark royal blue surface
  surfaceDark: '#0d1a33', // Deep royal blue (dark base)
  marqueeBg: '#050a14', // Deepest dark
  text: '#E8F4FF', // Light blue-white text (glove highlights)
  textDark: '#FFFFFF', // Pure white for headings
  muted: '#9BB5D4', // Muted royal blue
  border: 'rgba(147, 112, 219, 0.3)', // Metallic purple borders
  codeBg: '#1a2540', // Dark surface for code
  codeText: '#FFD700', // Gold code text (glove accents)
  primary: '#4169E1', // Royal blue for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#5B7FD8', // Brighter royal blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
  link: '#9370DB', // Metallic purple links (glove color)
  blogLink: '#FFD700', // Gold for blog links (glove accents)
  focus: '#FFD700', // Gold focus (glove accents)
  accent: '#FFD700', // Gold accent (glove accents)
  accentAlt: '#FF4D4D', // Brighter red accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#050a14', // Deepest dark footer
  footerTextMuted: 'rgba(232, 244, 255, 0.75)', // Muted light blue text
  footerTextSubtle: 'rgba(232, 244, 255, 0.70)', // Brighter subtle light blue text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(147, 112, 219, 0.15)', // Metallic purple social bg
  footerBorder: 'rgba(147, 112, 219, 0.2)', // Metallic purple borders
  heroStart: '#1a2540', // Dark royal blue start
  heroEnd: '#0d1a33', // Deeper royal blue end
  heroRadial: 'rgba(147, 112, 219, 0.2)', // Metallic purple glow
  campaignStart: '#4169E1', // Royal blue
  campaignEnd: '#9370DB', // Metallic purple
  authorBoxStart: 'rgba(26, 37, 64, 0.9)', // Dark royal blue
  authorBoxEnd: 'rgba(13, 26, 51, 0.9)', // Darker royal blue
  relatedSectionStart: 'rgba(13, 26, 51, 0.7)', // Dark section
  relatedSectionEnd: 'rgba(26, 37, 64, 0.7)', // Lighter dark section
  shadow: 'rgba(147, 112, 219, 0.4)', // Metallic purple shadows
  shadowSubtle: 'rgba(147, 112, 219, 0.2)', // Subtle metallic purple shadows
};
