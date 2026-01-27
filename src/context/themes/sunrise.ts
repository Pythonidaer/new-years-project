import type { Theme } from './types';
import { defaultTheme } from './default';

// Sunrise theme
export const sunriseTheme: Theme = {
  ...defaultTheme,
  bg: '#F0F4F8', // Soft light blue (sky at top)
  surface: '#E6D9F0', // Light purple/lavender (sky mid-section)
  surfaceDark: '#2D5F7A', // Deep teal (ocean)
  marqueeBg: '#1A4A5C', // Darker teal (deep ocean)
  text: '#1A3A4A', // Dark blue-teal (deep ocean, like water)
  textDark: '#0F2530', // Very dark teal (deepest ocean)
  muted: '#6B8FA8', // Medium teal-blue (muted accent)
  border: 'rgba(45, 95, 122, 0.3)', // Teal borders
  codeBg: '#E6D9F0', // Light purple for code blocks
  codeText: '#1A3A4A', // Dark teal code text
  primary: '#B85C2A', // Darker orange (sunset) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#C4622A', // Slightly lighter orange on hover
  primaryContrast: '#FFFFFF', // White text on orange buttons (meets 4.5:1 WCAG AA)
  link: '#A84F1F', // Dark orange links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#8B4513', // Very dark orange for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#B85C2A', // Orange focus ring
  accent: '#7FB8D4', // Teal accent (ocean teal, similar to accentAlt)
  accentAlt: '#8FC8E4', // Lighter teal accent (ocean teal) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#1A4A5C', // Dark teal footer (deep ocean)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#7FB8D4', // Teal start (ocean teal)
  heroEnd: '#B85C2A', // Darker orange end (sunset)
  heroRadial: 'rgba(184, 92, 42, 0.15)', // Orange glow (sunset)
  campaignStart: '#B85C2A', // Darker orange (sunset)
  campaignEnd: '#7FB8D4', // Teal (ocean)
  authorBoxStart: 'rgba(230, 217, 240, 0.9)', // Light purple
  authorBoxEnd: 'rgba(255, 220, 200, 0.9)', // Light peach
  relatedSectionStart: 'rgba(255, 220, 200, 0.6)', // Light peach section
  relatedSectionEnd: 'rgba(240, 244, 248, 0.6)', // Soft blue section
  shadow: 'rgba(45, 95, 122, 0.25)', // Teal shadows
  shadowSubtle: 'rgba(45, 95, 122, 0.12)', // Subtle teal shadows
};
