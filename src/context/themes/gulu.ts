import type { Theme } from './types';
import { defaultTheme } from './default';

// Gulu theme
export const guluTheme: Theme = {
  ...defaultTheme,
  bg: '#F5F1E8', // Warm cream (white parts of Beagle)
  surface: '#E8DFD0', // Light tan (soft Beagle fur)
  surfaceDark: '#6B4423', // Rich brown (couch, brown patches)
  marqueeBg: '#5A3518', // Darker brown (couch shadow)
  text: '#2D1B0E', // Dark brown (almost black, like Beagle's eyes/nose)
  textDark: '#1A0F07', // Very dark brown (black patches)
  muted: '#8B7355', // Medium brown (muted accent)
  border: 'rgba(107, 68, 35, 0.3)', // Brown borders
  codeBg: '#E8DFD0', // Light tan for code blocks
  codeText: '#2D1B0E', // Dark brown code text
  primary: '#8B5A3C', // Warm brown (brown patches) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#A67C52', // Lighter brown on hover
  primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
  link: '#5A3518', // Dark brown links for better contrast on cream background (meets 4.5:1 WCAG AA)
  blogLink: '#3D2514', // Very dark brown for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#A67C52', // Light brown focus ring
  accent: '#B8865B', // Tan accent (lighter brown patches)
  accentAlt: '#D4A574', // Light tan accent (highlights)
  footerBg: '#3D2514', // Very dark brown (footer, like dark couch areas)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#6B4423', // Rich brown start (couch color)
  heroEnd: '#5A3518', // Darker brown end
  heroRadial: 'rgba(255, 255, 255, 0.1)', // Soft white glow
  campaignStart: '#8B5A3C', // Warm brown (brown patches)
  campaignEnd: '#6B4423', // Rich brown (couch)
  authorBoxStart: 'rgba(232, 223, 208, 0.9)', // Light tan
  authorBoxEnd: 'rgba(212, 165, 116, 0.9)', // Light tan accent
  relatedSectionStart: 'rgba(212, 165, 116, 0.5)', // Light tan section
  relatedSectionEnd: 'rgba(245, 241, 232, 0.5)', // Cream section
  shadow: 'rgba(107, 68, 35, 0.25)', // Brown shadows
  shadowSubtle: 'rgba(107, 68, 35, 0.12)', // Subtle brown shadows
};
