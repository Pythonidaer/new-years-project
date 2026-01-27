import type { Theme } from './types';
import { defaultTheme } from './default';

// Querida theme
export const queridaTheme: Theme = {
  ...defaultTheme,
  bg: '#E8E8E8', // Light gray (siding base)
  surface: '#F5F5F5', // Off-white surface (window frames)
  surfaceDark: '#4A4A4A', // Medium-dark gray (patio, darker siding)
  marqueeBg: '#2D2D2D', // Dark gray (deep shadows)
  text: '#1A1A1A', // Dark gray text (high contrast on light)
  textDark: '#000000', // Black for headings
  muted: '#6B6B6B', // Medium gray (muted accent)
  border: 'rgba(76, 175, 80, 0.4)', // Lime green borders (door color)
  codeBg: '#F5F5F5', // Off-white surface for code
  codeText: '#1A1A1A', // Dark gray code text
  primary: '#1B5E20', // Very dark green for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#2E7D32', // Darker green on hover
  primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
  link: '#0D4A10', // Very dark green links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#1B5E20', // Very dark green for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#4CAF50', // Lime green focus (door color)
  accent: '#4CAF50', // Lime green accent (door color)
  accentAlt: '#81C784', // Bright lime green accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#2D2D2D', // Dark gray footer (patio color)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.70)', // Brighter subtle white text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(76, 175, 80, 0.2)', // Lime green social bg
  footerBorder: 'rgba(76, 175, 80, 0.3)', // Lime green borders
  heroStart: '#4A4A4A', // Medium-dark gray start (patio)
  heroEnd: '#2D2D2D', // Dark gray end
  heroRadial: 'rgba(76, 175, 80, 0.2)', // Lime green glow (door color)
  campaignStart: '#4CAF50', // Vibrant lime green (door)
  campaignEnd: '#2E7D32', // Darker green
  authorBoxStart: 'rgba(245, 245, 245, 0.9)', // Off-white
  authorBoxEnd: 'rgba(232, 232, 232, 0.9)', // Light gray
  relatedSectionStart: 'rgba(232, 232, 232, 0.7)', // Light gray section
  relatedSectionEnd: 'rgba(245, 245, 245, 0.7)', // Off-white section
  shadow: 'rgba(76, 175, 80, 0.3)', // Lime green shadows
  shadowSubtle: 'rgba(76, 175, 80, 0.15)', // Subtle lime green shadows
};
