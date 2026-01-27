import type { Theme } from './types';
import { defaultTheme } from './default';

// Trippie theme
export const trippieTheme: Theme = {
  ...defaultTheme,
  bg: '#F0F5ED', // Light green-tinted white (green leaves, white background)
  surface: '#E8F0E0', // Light green surface (leaves)
  surfaceDark: '#1A1A1A', // Black (frame and dress)
  marqueeBg: '#0A0A0A', // Deep black (frame/dress)
  text: '#1A2416', // Very dark green-black (body text)
  textDark: '#000000', // Pure black (frame/dress, headings)
  muted: '#4A5D4A', // Medium green-grey (muted accent)
  border: 'rgba(34, 68, 34, 0.3)', // Dark green borders (leaves)
  codeBg: '#E8F0E0', // Light green for code blocks
  codeText: '#1A2416', // Dark green-black code text
  primary: '#2D5A2D', // Dark green (leaves) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#3D7A3D', // Brighter green on hover
  primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
  link: '#1A4A1A', // Very dark green links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#0A3A0A', // Darkest green for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#3D7A3D', // Green focus ring (leaves)
  accent: '#4A8A4A', // Medium green accent (leaves)
  accentAlt: '#5AAA5A', // Brighter green accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#000000', // Pure black (frame and dress)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(45, 90, 45, 0.15)', // Dark green social bg (leaves)
  footerBorder: 'rgba(45, 90, 45, 0.2)', // Dark green borders (leaves)
  heroStart: '#1A1A1A', // Black start (frame/dress)
  heroEnd: '#0A0A0A', // Deep black end
  heroRadial: 'rgba(45, 90, 45, 0.2)', // Green glow (leaves)
  campaignStart: '#2D5A2D', // Dark green (leaves)
  campaignEnd: '#1A4A1A', // Darker green
  authorBoxStart: 'rgba(232, 240, 224, 0.9)', // Light green
  authorBoxEnd: 'rgba(224, 232, 216, 0.9)', // Slightly darker green
  relatedSectionStart: 'rgba(224, 232, 216, 0.6)', // Green section
  relatedSectionEnd: 'rgba(240, 245, 237, 0.6)', // Light green section
  shadow: 'rgba(26, 52, 26, 0.25)', // Dark green shadows (leaves)
  shadowSubtle: 'rgba(26, 52, 26, 0.12)', // Subtle green shadows
};
