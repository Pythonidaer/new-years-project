import type { Theme } from './types';
import { defaultTheme } from './default';

// Hokusai theme
export const hokusaiTheme: Theme = {
  ...defaultTheme,
  bg: '#1a2838', // Deep dark blue-teal (background)
  surface: '#2a3a4a', // Slightly lighter blue-teal surface
  surfaceDark: '#0f1a25', // Darkest blue-teal
  marqueeBg: '#0a1419', // Deepest dark
  text: '#ffd4a0', // Pale yellow/light orange (skull color)
  textDark: '#ffe8c8', // Lighter pale yellow for headings
  muted: '#d4a070', // Muted orange-yellow
  border: 'rgba(255, 140, 0, 0.3)', // Burnt orange borders (framing element)
  codeBg: '#2a3a4a', // Dark surface for code
  codeText: '#87ceeb', // Light blue code text (accent color)
  primary: '#c45500', // Burnt orange with good contrast (meets 4.5:1 WCAG AA)
  primaryHover: '#b84500', // Brighter burnt orange on hover
  primaryContrast: '#ffffff', // White text on orange buttons
  link: '#87ceeb', // Light blue links (accent color)
  blogLink: '#87ceeb', // Light blue for blog links
  focus: '#ffa500', // Orange focus (warm accent)
  accent: '#ffa500', // Orange accent (warm highlights)
  accentAlt: '#ff8c00', // Darker orange accent
  footerBg: '#0a1419', // Deepest dark footer
  footerTextMuted: 'rgba(255, 212, 160, 0.75)', // Muted pale yellow text
  footerTextSubtle: 'rgba(255, 212, 160, 0.65)', // Subtle pale yellow text
  footerSocialBg: 'rgba(204, 85, 0, 0.15)', // Burnt orange social bg
  footerBorder: 'rgba(255, 140, 0, 0.2)', // Burnt orange borders
  heroStart: '#1a2838', // Deep blue-teal start
  heroEnd: '#0f1a25', // Darker blue-teal end
  heroRadial: 'rgba(255, 165, 0, 0.15)', // Orange glow
  campaignStart: '#cc5500', // Burnt orange
  campaignEnd: '#8b4513', // Saddle brown (darker orange-brown)
  authorBoxStart: 'rgba(42, 58, 74, 0.9)', // Dark blue-teal
  authorBoxEnd: 'rgba(26, 40, 56, 0.9)', // Darker blue-teal
  relatedSectionStart: 'rgba(26, 40, 56, 0.7)', // Dark section
  relatedSectionEnd: 'rgba(42, 58, 74, 0.7)', // Lighter dark section
  shadow: 'rgba(0, 0, 0, 0.5)', // Deep black shadows (woodblock style)
  shadowSubtle: 'rgba(0, 0, 0, 0.3)', // Subtle black shadows
};
