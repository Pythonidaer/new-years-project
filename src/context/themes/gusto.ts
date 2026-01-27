import type { Theme } from './types';
import { defaultTheme } from './default';

// Gusto theme
export const gustoTheme: Theme = {
  ...defaultTheme,
  bg: '#1A0A1A', // Deep dark magenta-black (bold artistic background)
  surface: '#2A1A2A', // Dark magenta surface (abstract background base)
  surfaceDark: '#0F050F', // Very dark magenta-black (deep shadows)
  marqueeBg: '#0A050A', // Deepest dark (artistic depth)
  text: '#FFE8F0', // Light pink-white text (readable on dark, matches white hair)
  textDark: '#FFFFFF', // Pure white (hair, highlights)
  muted: '#C8A0B8', // Muted magenta (grayscale face tones)
  border: 'rgba(255, 140, 0, 0.4)', // Bright orange borders (background orange)
  codeBg: '#2A1A2A', // Dark magenta for code blocks
  codeText: '#FFE8F0', // Light pink-white code text
  primary: '#8B008B', // Deep magenta/fuchsia (background left) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#A020A0', // Brighter magenta on hover
  primaryContrast: '#FFFFFF', // White text on magenta buttons (meets 4.5:1 WCAG AA)
  link: '#FF8C00', // Bright orange links (background orange) for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#FFA500', // Lighter orange for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#FF8C00', // Bright orange focus ring
  accent: '#32CD32', // Vibrant green accent (leaf shape) for better contrast on dark background (meets 4.5:1 WCAG AA)
  accentAlt: '#FFD700', // Bright yellow/orange accent (yellow streaks) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0A050A', // Deepest dark magenta-black footer
  footerTextMuted: 'rgba(255, 232, 240, 0.75)', // Muted light pink text
  footerTextSubtle: 'rgba(255, 232, 240, 0.70)', // Brighter subtle light pink text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(255, 140, 0, 0.2)', // Subtle orange social bg
  footerBorder: 'rgba(255, 140, 0, 0.3)', // Orange borders
  heroStart: '#8B008B', // Deep magenta start (background left)
  heroEnd: '#4B0082', // Deep purple end (top background hints)
  heroRadial: 'rgba(255, 140, 0, 0.25)', // Orange glow (bright orange area)
  campaignStart: '#FF8C00', // Bright orange (background orange)
  campaignEnd: '#8B008B', // Deep magenta (background left)
  authorBoxStart: 'rgba(42, 26, 42, 0.9)', // Dark magenta
  authorBoxEnd: 'rgba(26, 10, 26, 0.9)', // Darker magenta-black
  relatedSectionStart: 'rgba(26, 10, 26, 0.7)', // Dark magenta-black section
  relatedSectionEnd: 'rgba(42, 26, 42, 0.7)', // Lighter dark magenta section
  shadow: 'rgba(139, 0, 139, 0.4)', // Deep magenta shadows
  shadowSubtle: 'rgba(255, 140, 0, 0.2)', // Subtle orange shadows
};
