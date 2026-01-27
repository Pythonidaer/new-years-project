import type { Theme } from './types';
import { defaultTheme } from './default';

// Noir theme
export const noirTheme: Theme = {
  ...defaultTheme,
  bg: '#F5F5F5', // Light gray (bright sunlight areas)
  surface: '#E8E8E8', // Medium light gray (shaded areas)
  surfaceDark: '#1A1A1A', // Near black (deep shadows)
  marqueeBg: '#0F0F0F', // Pure black (deepest shadows)
  text: '#2D2D2D', // Dark gray (readable on light)
  textDark: '#0A0A0A', // Very dark gray (almost black)
  muted: '#6B6B6B', // Medium gray (muted accent)
  border: 'rgba(45, 45, 45, 0.3)', // Dark gray borders
  codeBg: '#E8E8E8', // Light gray for code blocks
  codeText: '#2D2D2D', // Dark gray code text
  primary: '#4A4A4A', // Dark gray for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#5A5A5A', // Slightly lighter gray on hover
  primaryContrast: '#FFFFFF', // White text on dark gray buttons (meets 4.5:1 WCAG AA)
  link: '#2D2D2D', // Dark gray links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#1A1A1A', // Very dark gray for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#4A4A4A', // Dark gray focus ring
  accent: '#6B6B6B', // Medium gray accent
  accentAlt: '#8B8B8B', // Light gray accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#1A1A1A', // Dark gray footer (deep shadows)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#4A4A4A', // Dark gray start
  heroEnd: '#1A1A1A', // Near black end
  heroRadial: 'rgba(255, 255, 255, 0.1)', // Subtle white glow
  campaignStart: '#4A4A4A', // Dark gray
  campaignEnd: '#2D2D2D', // Darker gray
  authorBoxStart: 'rgba(232, 232, 232, 0.9)', // Light gray
  authorBoxEnd: 'rgba(245, 245, 245, 0.9)', // Lighter gray
  relatedSectionStart: 'rgba(232, 232, 232, 0.6)', // Light gray section
  relatedSectionEnd: 'rgba(245, 245, 245, 0.6)', // Lighter gray section
  shadow: 'rgba(26, 26, 26, 0.25)', // Dark gray shadows
  shadowSubtle: 'rgba(26, 26, 26, 0.12)', // Subtle dark gray shadows
};
