import type { Theme } from './types';
import { defaultTheme } from './default';

// Bergé theme
export const bergeTheme: Theme = {
  ...defaultTheme,
  bg: '#F0FFF0', // Light green-tinted white (bright green background)
  surface: '#E8FFE8', // Light green surface
  surfaceDark: '#0A2A0A', // Dark green (deep green background)
  marqueeBg: '#0A1A0A', // Very dark green background
  text: '#1A2A1A', // Dark green-black text (readable on light)
  textDark: '#000000', // Black (headings)
  muted: '#4A6B4A', // Medium green-grey (muted accent)
  border: 'rgba(0, 128, 0, 0.25)', // Green borders
  codeBg: '#E8FFE8', // Light green for code blocks
  codeText: '#1A2A1A', // Dark green-black code text
  primary: '#1F7A1F', // Darker forest green for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#228B22', // Lighter green on hover
  primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
  link: '#1A7A1A', // Darker green links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#0A5A0A', // Very dark green for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#1F7A1F', // Darker forest green focus ring
  accent: '#FF1493', // Hot pink (accent color - top/dress)
  accentAlt: '#FF6B9D', // Lighter pink accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0A2A0A', // Dark green footer
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 20, 147, 0.2)', // Subtle hot pink social bg (accent)
  footerBorder: 'rgba(255, 20, 147, 0.25)', // Hot pink borders (accent)
  heroStart: '#0A2A0A', // Dark green start
  heroEnd: '#0A1A0A', // Very dark green end
  heroRadial: 'rgba(31, 122, 31, 0.15)', // Green glow
  campaignStart: '#1F7A1F', // Darker forest green
  campaignEnd: '#1A7A1A', // Darker green
  authorBoxStart: 'rgba(240, 255, 240, 0.95)', // Light green-tinted
  authorBoxEnd: 'rgba(232, 255, 232, 0.95)', // Slightly darker green-tinted
  relatedSectionStart: 'rgba(232, 255, 232, 0.7)', // Green-tinted section
  relatedSectionEnd: 'rgba(240, 255, 240, 0.7)', // Light green-tinted section
  shadow: 'rgba(34, 139, 34, 0.2)', // Green shadows
  shadowSubtle: 'rgba(34, 139, 34, 0.1)', // Subtle green shadows
};
