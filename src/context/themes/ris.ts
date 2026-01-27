import type { Theme } from './types';
import { defaultTheme } from './default';

// Ris theme
export const risTheme: Theme = {
  ...defaultTheme,
  bg: '#FFD700', // Bright yellow (background)
  surface: '#87CEEB', // Light blue (character color)
  surfaceDark: '#8B4513', // Brown (stripes)
  marqueeBg: '#DAA520', // Darker yellow/gold
  text: '#000000', // Black text (high contrast on yellow)
  textDark: '#000000', // Black for headings
  muted: '#6B6B6B', // Medium gray (muted accent)
  border: 'rgba(128, 0, 128, 0.4)', // Purple borders (tag color)
  codeBg: '#87CEEB', // Light blue surface for code
  codeText: '#000000', // Black code text
  primary: '#DC143C', // Bright red (inner tube) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#FF1744', // Brighter red on hover
  primaryContrast: '#FFFFFF', // White text on red buttons (meets 4.5:1 WCAG AA)
  link: '#8B0000', // Dark red links for better contrast on yellow background (meets 4.5:1 WCAG AA)
  blogLink: '#800080', // Purple for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#DC143C', // Red focus (inner tube color)
  accent: '#800080', // Purple accent (tag color)
  accentAlt: '#FFD4E5', // Very light pink accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#8B4513', // Brown footer (stripes)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.80)', // Brighter subtle white text for better contrast (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(220, 20, 60, 0.2)', // Red social bg
  footerBorder: 'rgba(128, 0, 128, 0.3)', // Purple borders
  heroStart: '#87CEEB', // Light blue start (character color)
  heroEnd: '#FFD700', // Bright yellow end (background)
  heroRadial: 'rgba(220, 20, 60, 0.2)', // Red glow (inner tube)
  campaignStart: '#DC143C', // Bright red (inner tube)
  campaignEnd: '#800080', // Purple (tag)
  authorBoxStart: 'rgba(135, 206, 235, 0.9)', // Light blue
  authorBoxEnd: 'rgba(255, 215, 0, 0.9)', // Bright yellow
  relatedSectionStart: 'rgba(255, 215, 0, 0.7)', // Bright yellow section
  relatedSectionEnd: 'rgba(135, 206, 235, 0.7)', // Light blue section
  shadow: 'rgba(128, 0, 128, 0.4)', // Purple shadows
  shadowSubtle: 'rgba(128, 0, 128, 0.2)', // Subtle purple shadows
};
