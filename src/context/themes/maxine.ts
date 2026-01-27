import type { Theme } from './types';
import { defaultTheme } from './default';

// Maxine theme
export const maxineTheme: Theme = {
  ...defaultTheme,
  bg: '#FFF8F0', // Platinum blonde inspired (light cream)
  surface: '#FFE8F5', // Light pink (from camo pattern)
  surfaceDark: '#6B2D8B', // Deep purple (dramatic eyeshadow)
  marqueeBg: '#4A1A6B', // Darker purple (shadow depth)
  text: '#1A0A2E', // Very dark purple-black (dramatic contrast)
  textDark: '#0A0514', // Almost black (black accents, nails)
  muted: '#8B6FA8', // Medium purple (muted tones)
  border: 'rgba(107, 45, 139, 0.3)', // Purple borders
  codeBg: '#FFE8F5', // Light pink for code blocks
  codeText: '#1A0A2E', // Dark purple code text
  primary: '#DC143C', // Bold red (lipstick) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#FF1744', // Brighter red on hover
  primaryContrast: '#FFFFFF', // White text on red buttons (meets 4.5:1 WCAG AA)
  link: '#8B2D8B', // Deep purple links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#6B1A6B', // Darker purple for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#FF6B9D', // Bright pink focus ring
  accent: '#FF8C42', // Vibrant orange (balloons)
  accentAlt: '#FFD700', // Bright yellow (balloons, platinum highlights)
  footerBg: '#2D1A3A', // Dark purple (dramatic footer)
  footerTextMuted: 'rgba(255, 255, 255, 0.85)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.75)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.15)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.2)', // White borders
  heroStart: '#8B4AAB', // Vibrant purple start (camo pattern)
  heroEnd: '#6B2D8B', // Deep purple end (eyes)
  heroRadial: 'rgba(255, 140, 66, 0.2)', // Orange glow (balloons)
  campaignStart: '#DC143C', // Bold red (lipstick)
  campaignEnd: '#FF8C42', // Vibrant orange (balloons)
  authorBoxStart: 'rgba(255, 232, 245, 0.9)', // Light pink
  authorBoxEnd: 'rgba(255, 214, 229, 0.9)', // Lighter pink
  relatedSectionStart: 'rgba(255, 214, 229, 0.6)', // Light pink section
  relatedSectionEnd: 'rgba(255, 248, 240, 0.6)', // Cream section
  shadow: 'rgba(107, 45, 139, 0.3)', // Purple shadows
  shadowSubtle: 'rgba(107, 45, 139, 0.15)', // Subtle purple shadows
};
