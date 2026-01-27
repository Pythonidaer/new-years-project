import type { Theme } from './types';
import { defaultTheme } from './default';

// PBR theme
export const pbrTheme: Theme = {
  ...defaultTheme,
  bg: '#F0F4FA', // Light blue-tinted white (PBR label with blue influence)
  surface: '#E8F0F8', // Light blue-tinted surface (metallic can with blue tint)
  surfaceDark: '#0A1A2D', // Dark blue background (dark blue instead of black)
  marqueeBg: '#0A1525', // Very dark blue background
  text: '#1A1A1A', // Dark text (readable on light)
  textDark: '#000000', // Black (headings)
  muted: '#4A5A6B', // Medium blue-grey (muted accent)
  border: 'rgba(0, 61, 165, 0.25)', // PBR blue borders
  codeBg: '#E8F0F8', // Light blue-tinted for code blocks
  codeText: '#1A1A1A', // Dark code text
  primary: '#003DA5', // PBR Blue (classic Pabst Blue Ribbon blue) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#0040C0', // Lighter blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
  link: '#003DA5', // PBR blue links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#002D7A', // Darker blue for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#003DA5', // PBR blue focus ring
  accent: '#C41E1E', // Red (diagonal stripes on label)
  accentAlt: '#FF4D4D', // Brighter red accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0A1525', // Dark blue background (dark blue instead of black)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(0, 61, 165, 0.2)', // Subtle blue social bg
  footerBorder: 'rgba(0, 61, 165, 0.25)', // Blue borders
  heroStart: '#0A1A2D', // Dark blue start
  heroEnd: '#0A1525', // Very dark blue end
  heroRadial: 'rgba(0, 61, 165, 0.2)', // PBR blue glow
  campaignStart: '#003DA5', // PBR blue
  campaignEnd: '#002D7A', // Darker blue
  authorBoxStart: 'rgba(240, 248, 255, 0.95)', // Light blue-tinted
  authorBoxEnd: 'rgba(232, 240, 248, 0.95)', // Slightly darker blue-tinted
  relatedSectionStart: 'rgba(232, 240, 248, 0.7)', // Blue-tinted section
  relatedSectionEnd: 'rgba(240, 248, 255, 0.7)', // Light blue-tinted section
  shadow: 'rgba(0, 61, 165, 0.2)', // PBR blue shadows
  shadowSubtle: 'rgba(0, 61, 165, 0.1)', // Subtle blue shadows
};
