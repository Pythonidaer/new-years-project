import type { Theme } from './types';
import { defaultTheme } from './default';

// TUF theme
export const tufTheme: Theme = {
  ...defaultTheme,
  bg: '#0f1a33', // Dark navy blue (base with blue tint)
  surface: '#1a2d4d', // Medium blue surface (tank top color influence)
  surfaceDark: '#0a1526', // Deep navy blue (dark base)
  marqueeBg: '#050a14', // Deepest dark navy
  text: '#E8F0FF', // Light blue-white text (high contrast)
  textDark: '#FFFFFF', // Pure white for headings
  muted: '#C0C0C0', // Silver/metallic gray (muted accent)
  border: 'rgba(64, 224, 208, 0.4)', // Turquoise borders
  codeBg: '#1a2d4d', // Medium blue surface for code
  codeText: '#C0C0C0', // Silver/metallic gray code text
  primary: '#4169E1', // Vibrant royal blue (tank top color) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#5B7FD8', // Brighter royal blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
  link: '#40E0D0', // Turquoise links for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#48D1CC', // Medium turquoise for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#40E0D0', // Turquoise focus
  accent: '#40E0D0', // Turquoise accent
  accentAlt: '#7FFFD4', // Bright turquoise accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#050a14', // Deepest dark navy footer
  footerTextMuted: 'rgba(192, 192, 192, 0.75)', // Muted silver text
  footerTextSubtle: 'rgba(192, 192, 192, 0.70)', // Brighter subtle silver text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(64, 224, 208, 0.2)', // Turquoise social bg
  footerBorder: 'rgba(64, 224, 208, 0.3)', // Turquoise borders
  heroStart: '#1a2d4d', // Medium blue start (tank top color)
  heroEnd: '#0f1a33', // Dark navy blue end
  heroRadial: 'rgba(64, 224, 208, 0.25)', // Turquoise glow
  campaignStart: '#40E0D0', // Turquoise (vibrant accent)
  campaignEnd: '#4169E1', // Vibrant royal blue (tank top)
  authorBoxStart: 'rgba(26, 45, 77, 0.9)', // Medium blue
  authorBoxEnd: 'rgba(15, 26, 51, 0.9)', // Darker navy blue
  relatedSectionStart: 'rgba(15, 26, 51, 0.7)', // Dark navy section
  relatedSectionEnd: 'rgba(26, 45, 77, 0.7)', // Lighter blue section
  shadow: 'rgba(64, 224, 208, 0.4)', // Turquoise shadows
  shadowSubtle: 'rgba(64, 224, 208, 0.2)', // Subtle turquoise shadows
};
