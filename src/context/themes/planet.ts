import type { Theme } from './types';
import { defaultTheme } from './default';

// Planet theme
export const planetTheme: Theme = {
  ...defaultTheme,
  bg: '#000B1A', // Deep space blue-black (cosmic void)
  surface: '#001C3D', // Slightly lighter space blue (atmospheric depth)
  surfaceDark: '#001428', // Dark space blue (deep shadows)
  marqueeBg: '#000710', // Deepest space (starry void)
  text: '#E0FFFF', // Light cyan text (atmospheric haze, readable on dark)
  textDark: '#FFFFFF', // Pure white (sun glare, maximum contrast)
  muted: '#90E0FF', // Muted light blue (stars, distant light)
  border: 'rgba(0, 159, 227, 0.3)', // Ocean blue borders (ocean visibility)
  codeBg: '#001C3D', // Dark space blue for code blocks
  codeText: '#90E0FF', // Light blue code text (readable on dark)
  primary: '#367C2F', // Forest green (continents) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#5C8D40', // Lighter green on hover
  primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
  link: '#009FE3', // Bright turquoise links (ocean color) for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#5ED4FF', // Lighter turquoise for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#009FE3', // Bright turquoise focus ring (ocean)
  accent: '#009FE3', // Bright turquoise accent (ocean highlights)
  accentAlt: '#D4AE6A', // Light tan accent (continents in sunlight) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#000710', // Deepest space footer (cosmic void)
  footerTextMuted: 'rgba(224, 255, 255, 0.75)', // Muted light cyan text
  footerTextSubtle: 'rgba(224, 255, 255, 0.70)', // Brighter subtle light cyan text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(0, 159, 227, 0.2)', // Subtle ocean blue social bg
  footerBorder: 'rgba(0, 159, 227, 0.25)', // Ocean blue borders
  heroStart: '#001C3D', // Space blue start (atmospheric depth)
  heroEnd: '#000B1A', // Deep space blue-black end (cosmic void)
  heroRadial: 'rgba(94, 212, 255, 0.15)', // Light turquoise glow (sun glare on atmosphere)
  campaignStart: '#367C2F', // Forest green (continents)
  campaignEnd: '#009FE3', // Bright turquoise (ocean)
  authorBoxStart: 'rgba(0, 28, 61, 0.9)', // Dark space blue
  authorBoxEnd: 'rgba(0, 11, 26, 0.9)', // Darker space blue-black
  relatedSectionStart: 'rgba(0, 11, 26, 0.7)', // Deep space blue-black section
  relatedSectionEnd: 'rgba(0, 28, 61, 0.7)', // Lighter space blue section
  shadow: 'rgba(0, 159, 227, 0.3)', // Ocean blue shadows (atmospheric glow)
  shadowSubtle: 'rgba(94, 212, 255, 0.15)', // Subtle light turquoise shadows (sun rays)
};
