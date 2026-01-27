import type { Theme } from './types';
import { defaultTheme } from './default';

// Hatsune theme
export const hatsuneTheme: Theme = {
  ...defaultTheme,
  bg: '#E0F4FF', // Bright light blue (background gradient top)
  surface: '#D4E8FF', // Lighter blue (elevated surfaces)
  surfaceDark: '#1A1A1A', // Black (outfit accents, dark surfaces)
  marqueeBg: '#0F0F0F', // Near black (deepest shadows)
  text: '#1A1A1A', // Black text (readable on light blue)
  textDark: '#0A0A0A', // Very dark (almost black)
  muted: '#6B8FA8', // Medium blue-gray (muted accent)
  border: 'rgba(57, 197, 187, 0.3)', // Teal borders
  codeBg: '#D4E8FF', // Light blue for code blocks
  codeText: '#1A1A1A', // Black code text
  primary: '#1A7A73', // Darker teal for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#2A9D94', // Slightly lighter teal on hover
  primaryContrast: '#FFFFFF', // White text on teal buttons (meets 4.5:1 WCAG AA)
  link: '#1A5F5A', // Dark teal links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#0A2A27', // Very dark teal for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#1A7A73', // Darker teal focus ring
  accent: '#FF69B4', // Bright pink (hair ties)
  accentAlt: '#9B7BB8', // Soft purple (background gradient bottom)
  footerBg: '#1A1A1A', // Black footer (outfit accents)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(57, 197, 187, 0.2)', // Teal social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#87CEEB', // Light blue start (background gradient top)
  heroEnd: '#9B7BB8', // Soft purple end (background gradient bottom)
  heroRadial: 'rgba(26, 122, 115, 0.2)', // Darker teal glow
  campaignStart: '#1A7A73', // Darker teal
  campaignEnd: '#FF69B4', // Bright pink (hair ties)
  authorBoxStart: 'rgba(212, 232, 255, 0.9)', // Light blue
  authorBoxEnd: 'rgba(155, 123, 184, 0.9)', // Soft purple
  relatedSectionStart: 'rgba(155, 123, 184, 0.6)', // Soft purple section
  relatedSectionEnd: 'rgba(224, 244, 255, 0.6)', // Light blue section
  shadow: 'rgba(57, 197, 187, 0.25)', // Teal shadows
  shadowSubtle: 'rgba(57, 197, 187, 0.12)', // Subtle teal shadows
};
