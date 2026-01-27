import type { Theme } from './types';
import { defaultTheme } from './default';

// Dayglow theme
export const dayglowTheme: Theme = {
  ...defaultTheme,
  bg: '#000000', // Pure black background (blacklight environment)
  surface: '#1a1a1a', // Very dark gray surface
  surfaceDark: '#0a0a0a', // Almost black surface
  marqueeBg: '#39FF14', // Neon green marquee (fluorescent green)
  text: '#39FF14', // Neon green text (glowing green from blacklight)
  textDark: '#FFD700', // Gold yellow text for dark surfaces (better contrast on author box gradient)
  muted: '#FFD700', // Gold yellow muted text (meets 4.5:1 WCAG AA on black)
  border: 'rgba(57, 255, 20, 0.3)', // Neon green borders with transparency
  codeBg: '#1a1a1a', // Dark gray code background
  codeText: '#39FF14', // Neon green code text
  primary: '#CC3300', // Darker orange-red primary buttons (better contrast with white text, meets 4.5:1 WCAG AA)
  primaryHover: '#FF4500', // Brighter orange-red on hover
  primaryContrast: '#FFFFFF', // White text for dark backgrounds and buttons (meets 4.5:1 WCAG AA)
  link: '#39FF14', // Neon green links
  blogLink: '#39FF14', // Neon green blog links (better contrast on author box gradient)
  focus: '#00CED1', // Electric blue focus ring (fluorescent blue)
  accent: '#FF4500', // Orange-red accent (vivid orange-red)
  accentAlt: '#39FF14', // Neon green accent for footer headings (meets 4.5:1 contrast on black)
  footerBg: '#000000', // Black footer (blacklight aesthetic)
  footerTextMuted: 'rgba(57, 255, 20, 0.95)', // Neon green text at 95% opacity (meets 4.5:1 contrast on black)
  footerTextSubtle: 'rgba(57, 255, 20, 0.80)', // Neon green text at 80% opacity (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(255, 69, 0, 0.2)', // Subtle orange-red social bg
  footerBorder: 'rgba(57, 255, 20, 0.25)', // Neon green borders
  heroStart: '#000000', // Black start
  heroEnd: '#1a1a1a', // Dark gray end
  heroRadial: 'rgba(57, 255, 20, 0.15)', // Neon green glow
  campaignStart: '#1a1a1a', // Dark gray
  campaignEnd: '#000000', // Black
  authorBoxStart: 'rgba(26, 26, 26, 0.9)', // Dark gray author box
  authorBoxEnd: 'rgba(10, 10, 10, 0.9)', // Almost black
  relatedSectionStart: 'rgba(26, 26, 26, 0.6)', // Dark gray section
  relatedSectionEnd: 'rgba(0, 0, 0, 0.6)', // Black section
  shadow: 'rgba(57, 255, 20, 0.2)', // Neon green shadows
  shadowSubtle: 'rgba(255, 69, 0, 0.1)', // Subtle orange-red shadows
};
