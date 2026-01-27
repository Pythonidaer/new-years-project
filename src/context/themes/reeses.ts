import type { Theme } from './types';
import { defaultTheme } from './default';

// Reeses theme
export const reesesTheme: Theme = {
  ...defaultTheme,
  bg: '#FFF8F0', // Light orange-tinted white (Reese's Pieces box background)
  surface: '#FFE8D0', // Light orange surface (candy box orange)
  surfaceDark: '#1A0A00', // Dark brown-black (chocolate/peanut butter)
  marqueeBg: '#0A0500', // Very dark background
  text: '#2A1A0A', // Dark brown text (readable on light)
  textDark: '#1A0A00', // Very dark brown (headings)
  muted: '#8B6B3A', // Medium brown-orange (muted accent)
  border: 'rgba(255, 153, 0, 0.3)', // Orange borders
  codeBg: '#FFE8D0', // Light orange for code blocks
  codeText: '#2A1A0A', // Dark brown code text
  primary: '#B34D00', // Dark orange for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#CC5200', // Slightly lighter orange on hover
  primaryContrast: '#FFFFFF', // White text on orange buttons (meets 4.5:1 WCAG AA)
  link: '#993D00', // Very dark orange links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#803300', // Darkest orange for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#B34D00', // Orange focus ring
  accent: '#FFC107', // Yellow (Reese's Pieces logo yellow)
  accentAlt: '#FFD54F', // Lighter yellow accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#1A0A00', // Dark brown-black footer (chocolate/peanut butter)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 153, 0, 0.2)', // Subtle orange social bg
  footerBorder: 'rgba(255, 153, 0, 0.25)', // Orange borders
  heroStart: '#1A0A00', // Dark brown-black start
  heroEnd: '#0A0500', // Very dark brown-black end
  heroRadial: 'rgba(255, 153, 0, 0.15)', // Orange glow
  campaignStart: '#B34D00', // Dark orange
  campaignEnd: '#CC5200', // Darker orange
  authorBoxStart: 'rgba(255, 248, 240, 0.95)', // Light orange-tinted
  authorBoxEnd: 'rgba(255, 232, 208, 0.95)', // Slightly darker orange-tinted
  relatedSectionStart: 'rgba(255, 232, 208, 0.7)', // Orange-tinted section
  relatedSectionEnd: 'rgba(255, 248, 240, 0.7)', // Light orange-tinted section
  shadow: 'rgba(255, 102, 0, 0.2)', // Orange shadows
  shadowSubtle: 'rgba(255, 102, 0, 0.1)', // Subtle orange shadows
};
