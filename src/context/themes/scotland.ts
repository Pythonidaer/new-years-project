import type { Theme } from './types';
import { defaultTheme } from './default';

// Scotland theme
export const scotlandTheme: Theme = {
  ...defaultTheme,
  bg: '#D4D8DC', // Pale grey-blue (overcast sky)
  surface: '#E8EAED', // Light grey-blue (elevated surfaces)
  surfaceDark: '#4A5568', // Dark blue-grey (river, mountains)
  marqueeBg: '#2D3748', // Darker blue-grey (deep shadows)
  text: '#2C2416', // Dark brown (readable on light)
  textDark: '#1A1309', // Very dark brown (almost black)
  muted: '#6B5D4F', // Medium brown-grey (muted accent)
  border: 'rgba(74, 85, 104, 0.3)', // Blue-grey borders
  codeBg: '#E8EAED', // Light grey-blue for code blocks
  codeText: '#2C2416', // Dark brown code text
  primary: '#8B5A3C', // Golden brown (heather/vegetation) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#A67C52', // Lighter brown on hover
  primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
  link: '#6B4423', // Dark brown links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#4A2E1A', // Very dark brown for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#8B5A3C', // Golden brown focus ring
  accent: '#5A7C4A', // Muted green (grass patches)
  accentAlt: '#D4A574', // Lighter golden tan (heather tones) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#2D3748', // Dark blue-grey footer (mountains/river)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#4A5568', // Dark blue-grey start (mountains)
  heroEnd: '#2D3748', // Darker blue-grey end (deep shadows)
  heroRadial: 'rgba(139, 90, 60, 0.15)', // Golden brown glow
  campaignStart: '#8B5A3C', // Golden brown (heather)
  campaignEnd: '#5A7C4A', // Muted green (grass)
  authorBoxStart: 'rgba(232, 234, 237, 0.9)', // Light grey-blue
  authorBoxEnd: 'rgba(212, 216, 220, 0.9)', // Pale grey
  relatedSectionStart: 'rgba(212, 216, 220, 0.6)', // Pale grey section
  relatedSectionEnd: 'rgba(232, 234, 237, 0.6)', // Light grey-blue section
  shadow: 'rgba(74, 85, 104, 0.25)', // Blue-grey shadows
  shadowSubtle: 'rgba(74, 85, 104, 0.12)', // Subtle blue-grey shadows
};
