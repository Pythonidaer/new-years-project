import type { Theme } from './types';
import { defaultTheme } from './default';

// Pride theme
export const prideTheme: Theme = {
  ...defaultTheme,
  bg: '#FFF9E6', // Light yellow (rainbow)
  surface: '#E6F3FF', // Light blue (rainbow)
  surfaceDark: '#750787', // Purple (rainbow) for better contrast
  marqueeBg: '#004DFF', // Blue (rainbow)
  text: '#1a1a1a', // Dark text (high contrast on light)
  textDark: '#000000', // Black for headings
  muted: '#8B4513', // Brown (chevron)
  border: 'rgba(255, 140, 0, 0.4)', // Orange borders (rainbow)
  codeBg: '#E6F3FF', // Light blue surface for code
  codeText: '#004DFF', // Blue code text (rainbow)
  primary: '#C41E3A', // Darker red (rainbow) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#DC143C', // Brighter red on hover
  primaryContrast: '#ffffff', // White text on red buttons (meets 4.5:1 WCAG AA)
  link: '#750787', // Purple (rainbow) for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#006400', // Darker green (rainbow) for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#FFED00', // Yellow (rainbow) focus
  accent: '#FF8C00', // Orange (rainbow)
  accentAlt: '#FFAFC8', // Pink (chevron/trans flag) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#750787', // Purple (rainbow)
  footerTextMuted: 'rgba(255, 255, 255, 0.85)', // Bright white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.80)', // Brighter subtle white text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(255, 175, 200, 0.3)', // Pink social bg (chevron)
  footerBorder: 'rgba(255, 237, 0, 0.3)', // Yellow borders (rainbow)
  heroStart: '#008026', // Green (rainbow)
  heroEnd: '#750787', // Purple (rainbow)
  heroRadial: 'rgba(117, 7, 135, 0.4)', // Purple glow (rainbow)
  campaignStart: '#008026', // Green (rainbow)
  campaignEnd: '#004DFF', // Blue (rainbow)
  authorBoxStart: 'rgba(255, 175, 200, 0.8)', // Pink (chevron/trans flag)
  authorBoxEnd: 'rgba(165, 217, 255, 0.8)', // Light blue (chevron/trans flag)
  relatedSectionStart: 'rgba(255, 237, 0, 0.6)', // Yellow section (rainbow)
  relatedSectionEnd: 'rgba(255, 140, 0, 0.6)', // Orange section (rainbow)
  shadow: 'rgba(117, 7, 135, 0.4)', // Purple shadows (rainbow)
  shadowSubtle: 'rgba(255, 140, 0, 0.3)', // Orange shadows (rainbow)
};
