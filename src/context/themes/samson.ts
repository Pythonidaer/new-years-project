import type { Theme } from './types';
import { defaultTheme } from './default';

// Samson theme
export const samsonTheme: Theme = {
  ...defaultTheme,
  bg: '#2A1A0A', // Dark brown-orange (ancient desert background)
  surface: '#3D2815', // Darker brown-orange surface (weathered tones)
  surfaceDark: '#1A0F05', // Very dark brown-black (deep shadows)
  marqueeBg: '#0F0A05', // Deepest dark (ancient black)
  text: '#F5D4A0', // Warm cream/ochre text (desert sand, readable on dark)
  textDark: '#FFE8C8', // Lighter cream for headings (ancient parchment)
  muted: '#B89D7A', // Muted brown-orange (aged metal, chains)
  border: 'rgba(184, 92, 42, 0.3)', // Dark orange borders (rust, aged)
  codeBg: '#3D2815', // Dark brown-orange for code blocks
  codeText: '#F5D4A0', // Warm cream code text
  primary: '#B85C2A', // Dark orange (fire, desert sun) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#C4622A', // Slightly lighter orange on hover
  primaryContrast: '#FFFFFF', // White text on orange buttons (meets 4.5:1 WCAG AA)
  link: '#D4A574', // Light tan links for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#E8C4A0', // Lighter tan for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#B85C2A', // Dark orange focus ring
  accent: '#FF8C42', // Bright orange accent (flame, sunset)
  accentAlt: '#FFA55C', // Lighter orange accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0F0A05', // Deepest dark brown-black footer (ancient black)
  footerTextMuted: 'rgba(245, 212, 160, 0.75)', // Muted warm cream text
  footerTextSubtle: 'rgba(245, 212, 160, 0.70)', // Brighter subtle warm cream text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(184, 92, 42, 0.2)', // Subtle dark orange social bg
  footerBorder: 'rgba(184, 92, 42, 0.25)', // Dark orange borders
  heroStart: '#3D2815', // Dark brown-orange start (ancient desert)
  heroEnd: '#1A0F05', // Very dark brown-black end (deep shadows)
  heroRadial: 'rgba(184, 92, 42, 0.2)', // Dark orange glow (fire, sunset)
  campaignStart: '#B85C2A', // Dark orange (desert sun)
  campaignEnd: '#8B4513', // Saddle brown (earth, skulls)
  authorBoxStart: 'rgba(61, 40, 21, 0.9)', // Dark brown-orange
  authorBoxEnd: 'rgba(42, 26, 10, 0.9)', // Darker brown-orange
  relatedSectionStart: 'rgba(42, 26, 10, 0.7)', // Dark brown-orange section
  relatedSectionEnd: 'rgba(61, 40, 21, 0.7)', // Lighter brown-orange section
  shadow: 'rgba(184, 92, 42, 0.4)', // Dark orange shadows (fire glow)
  shadowSubtle: 'rgba(184, 92, 42, 0.2)', // Subtle orange shadows
};
