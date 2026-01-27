import type { Theme } from './types';
import { defaultTheme } from './default';

// King theme
export const kingTheme: Theme = {
  ...defaultTheme,
  bg: '#302820', // Dark brown-black base (suit shadows, dignified foundation)
  surface: '#463A32', // Dark muted brown surface (suit lighter areas)
  surfaceDark: '#1E1810', // Very dark brown-black (deep shadows, hair)
  marqueeBg: '#181410', // Deepest dark (almost black hair/mustache)
  text: '#F5E6D3', // Warm cream text (skin highlights, readable on dark)
  textDark: '#FFFFFF', // Pure white (shirt collar, maximum contrast)
  muted: '#B89D7A', // Muted golden-brown (skin base tones)
  border: 'rgba(148, 107, 76, 0.3)', // Warm golden-brown borders (skin highlights)
  codeBg: '#463A32', // Dark muted brown for code blocks
  codeText: '#F5E6D3', // Warm cream code text
  primary: '#946B4C', // Warm golden-brown (skin highlights) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#A67C52', // Lighter golden-brown on hover
  primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
  link: '#D4A574', // Light tan links (skin highlights) for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#E8C4A0', // Lighter tan for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#946B4C', // Warm golden-brown focus ring
  accent: '#506E46', // Muted green accent (background grass, natural element)
  accentAlt: '#6B8E5A', // Lighter muted green accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#181410', // Deepest dark brown-black footer (almost black hair/mustache)
  footerTextMuted: 'rgba(245, 230, 211, 0.75)', // Muted warm cream text
  footerTextSubtle: 'rgba(245, 230, 211, 0.70)', // Brighter subtle warm cream text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(148, 107, 76, 0.2)', // Subtle golden-brown social bg
  footerBorder: 'rgba(148, 107, 76, 0.25)', // Golden-brown borders
  heroStart: '#463A32', // Dark muted brown start (suit lighter areas)
  heroEnd: '#302820', // Dark brown-black end (suit shadows)
  heroRadial: 'rgba(148, 107, 76, 0.15)', // Warm golden-brown glow (skin highlights)
  campaignStart: '#946B4C', // Warm golden-brown (skin highlights)
  campaignEnd: '#5F7D55', // Muted green (background grass)
  authorBoxStart: 'rgba(70, 58, 50, 0.9)', // Dark muted brown
  authorBoxEnd: 'rgba(48, 40, 32, 0.9)', // Darker brown-black
  relatedSectionStart: 'rgba(48, 40, 32, 0.7)', // Dark brown-black section
  relatedSectionEnd: 'rgba(70, 58, 50, 0.7)', // Lighter muted brown section
  shadow: 'rgba(30, 25, 20, 0.4)', // Dark brown-black shadows (hair/mustache)
  shadowSubtle: 'rgba(148, 107, 76, 0.2)', // Subtle golden-brown shadows (skin highlights)
};
