import type { Theme } from './types';
import { defaultTheme } from './default';

// Companion theme
export const companionTheme: Theme = {
  ...defaultTheme,
  bg: '#F5E6D3', // Warm cream/beige (highway, desert road)
  surface: '#E8D4C0', // Light tan surface (weathered road)
  surfaceDark: '#4A3A2A', // Dark brown (road shadows, asphalt)
  marqueeBg: '#3A2A1A', // Darker brown (deep road shadows)
  text: '#2A1A0A', // Dark brown text (readable on light)
  textDark: '#1A0F05', // Very dark brown (headings)
  muted: '#8B7355', // Medium brown (muted accent, aged signs)
  border: 'rgba(74, 58, 42, 0.3)', // Brown borders
  codeBg: '#E8D4C0', // Light tan for code blocks
  codeText: '#2A1A0A', // Dark brown code text
  primary: '#8B5A3C', // Warm brown (road, desert) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#A67C52', // Lighter brown on hover
  primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
  link: '#5A3A2A', // Dark brown links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#4A2A1A', // Very dark brown for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#8B5A3C', // Warm brown focus ring
  accent: '#87CEEB', // Sky blue accent (highway sky)
  accentAlt: '#FF8C42', // Bright orange accent (sunset, desert sun) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#3A2A1A', // Dark brown footer (road shadows)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#6B5A4A', // Medium brown start (road, desert)
  heroEnd: '#4A3A2A', // Dark brown end (road shadows)
  heroRadial: 'rgba(184, 92, 42, 0.15)', // Orange glow (sunset)
  campaignStart: '#8B5A3C', // Warm brown (road)
  campaignEnd: '#6B4A3A', // Darker brown
  authorBoxStart: 'rgba(232, 212, 192, 0.9)', // Light tan
  authorBoxEnd: 'rgba(245, 230, 211, 0.9)', // Warm cream
  relatedSectionStart: 'rgba(232, 212, 192, 0.6)', // Light tan section
  relatedSectionEnd: 'rgba(245, 230, 211, 0.6)', // Warm cream section
  shadow: 'rgba(74, 58, 42, 0.25)', // Brown shadows
  shadowSubtle: 'rgba(74, 58, 42, 0.12)', // Subtle brown shadows
};
