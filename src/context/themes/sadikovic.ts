import type { Theme } from './types';
import { defaultTheme } from './default';

// Sadikovic theme
export const sadikovicTheme: Theme = {
  ...defaultTheme,
  bg: '#0a0a1a', // Very dark blue-black (arena atmosphere)
  surface: '#1a1a2e', // Dark blue-gray surface
  surfaceDark: '#000080', // Deep blue (dark base)
  marqueeBg: '#000000', // Pure black
  text: '#00BFFF', // Electric blue text (stage lights)
  textDark: '#FFFFFF', // White for headings
  muted: '#8A2BE2', // Muted purple
  border: 'rgba(0, 191, 255, 0.3)', // Electric blue borders
  codeBg: '#1a1a2e', // Dark surface for code
  codeText: '#00FFFF', // Cyan code text (bright stage lights)
  primary: '#007ea8', // Darker electric blue for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#00BFFF', // Brighter electric blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
  link: '#00FFFF', // Cyan links (bright stage lights)
  blogLink: '#00FFFF', // Cyan for blog links
  focus: '#FFD700', // Gold focus (patch color)
  accent: '#FFD700', // Gold accent (patch color)
  accentAlt: '#E53935', // Brighter red accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#000000', // Pure black footer
  footerTextMuted: 'rgba(0, 191, 255, 0.75)', // Muted electric blue text
  footerTextSubtle: 'rgba(0, 191, 255, 0.70)', // Brighter subtle electric blue text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(0, 191, 255, 0.15)', // Electric blue social bg
  footerBorder: 'rgba(0, 191, 255, 0.2)', // Electric blue borders
  heroStart: '#4B0082', // Dark purple start (ambient lighting)
  heroEnd: '#000080', // Deep blue end
  heroRadial: 'rgba(0, 191, 255, 0.2)', // Electric blue glow
  campaignStart: '#00BFFF', // Electric blue
  campaignEnd: '#8A2BE2', // Purple
  authorBoxStart: 'rgba(26, 26, 46, 0.9)', // Dark blue-gray
  authorBoxEnd: 'rgba(10, 10, 26, 0.9)', // Darker blue-black
  relatedSectionStart: 'rgba(10, 10, 26, 0.7)', // Dark section
  relatedSectionEnd: 'rgba(26, 26, 46, 0.7)', // Lighter dark section
  shadow: 'rgba(0, 191, 255, 0.4)', // Electric blue shadows
  shadowSubtle: 'rgba(0, 191, 255, 0.2)', // Subtle electric blue shadows
};
