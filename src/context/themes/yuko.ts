import type { Theme } from './types';
import { defaultTheme } from './default';

// Yuko theme
export const yukoTheme: Theme = {
  ...defaultTheme,
  bg: '#1a0a1a', // Dark base with pink undertone
  surface: '#2d1a2d', // Dark purple-pink surface
  surfaceDark: '#0f0a0f', // Very dark for contrast
  marqueeBg: '#0a050a', // Deepest dark
  text: '#ffd0f0', // Light pink text
  textDark: '#ffffff', // Pure white for headings
  muted: '#ff8cc8', // Muted pink
  border: 'rgba(255, 20, 147, 0.3)', // Hot pink borders
  codeBg: '#2d1a2d', // Dark surface for code
  codeText: '#00d4ff', // Light blue code text (atomic breath color)
  primary: '#dc143c', // Crimson red (Godzilla eyes, Tokyo Tower)
  primaryHover: '#ff1744', // Brighter red on hover
  primaryContrast: '#ffffff', // White text on red buttons
  link: '#00d4ff', // Light blue links (atomic breath)
  blogLink: '#00d4ff', // Light blue for blog links
  focus: '#ffd700', // Neon yellow focus (dorsal fins)
  accent: '#ffd700', // Neon yellow accent (dorsal fins, flames)
  accentAlt: '#ff8c00', // Orange accent (flame outlines)
  footerBg: '#0a050a', // Deepest dark footer
  footerTextMuted: 'rgba(255, 208, 240, 0.75)', // Muted pink text
  footerTextSubtle: 'rgba(255, 208, 240, 0.65)', // Subtle pink text
  footerSocialBg: 'rgba(255, 20, 147, 0.15)', // Hot pink social bg
  footerBorder: 'rgba(255, 20, 147, 0.2)', // Hot pink borders
  heroStart: '#B70063', // Darker hot pink so the yellow accent clears 4.5:1
  heroEnd: '#8b008b', // Deep magenta end
  heroRadial: 'rgba(255, 215, 0, 0.2)', // Neon yellow glow
  campaignStart: '#dc143c', // Crimson red
  campaignEnd: '#ff1493', // Hot pink
  authorBoxStart: 'rgba(45, 26, 45, 0.9)', // Dark purple-pink
  authorBoxEnd: 'rgba(26, 10, 26, 0.9)', // Darker purple-pink
  relatedSectionStart: 'rgba(26, 10, 26, 0.7)', // Dark section
  relatedSectionEnd: 'rgba(42, 24, 42, 0.7)', // Darker purple so related text clears 4.5:1
  shadow: 'rgba(255, 20, 147, 0.4)', // Hot pink shadows
  shadowSubtle: 'rgba(255, 20, 147, 0.2)', // Subtle pink shadows
};
