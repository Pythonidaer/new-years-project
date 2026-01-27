import type { Theme } from './types';
import { defaultTheme } from './default';

// Sage Green theme
export const sage_greenTheme: Theme = {
  ...defaultTheme,
  bg: '#f7f9f6',
  surface: '#eef2eb',
  surfaceDark: '#4a5d4a',
  marqueeBg: '#3a4d3a',
  text: '#2d3a2d',
  textDark: '#1a241a',
  muted: '#6b7a6b',
  border: 'rgba(74, 93, 74, 0.2)',
  codeBg: '#eef2eb',
  codeText: '#2d3a2d',
  primary: '#3d6a3d', // Darker green for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#5a8a5a',
  primaryContrast: '#ffffff',
  link: '#1a4a1a', // Darker green for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#2d5a2d', // Darker green for better contrast on light author box
  focus: '#6ba06b',
  accent: '#7ba07b',
  accentAlt: '#8bb08b',
  footerBg: '#1a241a',
  footerTextMuted: 'rgba(255, 255, 255, 0.75)',
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
  footerSocialBg: 'rgba(255, 255, 255, 0.12)',
  footerBorder: 'rgba(255, 255, 255, 0.12)',
  heroStart: '#4a5d4a',
  heroEnd: '#3a4d3a',
  heroRadial: 'rgba(255, 255, 255, 0.1)',
  campaignStart: '#5a8a5a',
  campaignEnd: '#4a7a4a',
  authorBoxStart: 'rgba(238, 242, 235, 0.8)',
  authorBoxEnd: 'rgba(200, 210, 195, 0.8)',
  relatedSectionStart: 'rgba(200, 210, 195, 0.5)',
  relatedSectionEnd: 'rgba(247, 249, 246, 0.5)',
  shadow: 'rgba(58, 77, 58, 0.15)',
  shadowSubtle: 'rgba(58, 77, 58, 0.08)',
};
