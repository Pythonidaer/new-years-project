import type { Theme } from './types';
import { defaultTheme } from './default';

// Horror theme
export const horrorTheme: Theme = {
  ...defaultTheme,
  bg: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceDark: '#0f0f0f',
  marqueeBg: '#050505',
  text: '#f0f0f0', // Lighter gray for better contrast on dark background (meets 4.5:1 WCAG AA)
  textDark: '#ffffff',
  muted: '#a8a8a8',
  border: 'rgba(232, 232, 232, 0.2)',
  codeBg: '#1a1a1a',
  codeText: '#e8e8e8',
  primary: '#8b1a1a', // Dark red
  primaryHover: '#a82d2d',
  primaryContrast: '#ffffff',
  link: '#d85d5d', // Lighter red for contrast on dark background
  blogLink: '#ff6b6b', // Lighter red for better contrast on dark author box (meets 4.5:1 WCAG AA)
  focus: '#a82d2d',
  accent: '#ff4d4d',
  accentAlt: '#ff6b6b',
  footerBg: '#050505',
  footerTextMuted: 'rgba(232, 232, 232, 0.75)',
  footerTextSubtle: 'rgba(232, 232, 232, 0.65)',
  footerSocialBg: 'rgba(139, 26, 26, 0.12)',
  footerBorder: 'rgba(139, 26, 26, 0.12)',
  heroStart: '#0f0f0f',
  heroEnd: '#050505',
  heroRadial: 'rgba(139, 26, 26, 0.2)',
  campaignStart: '#8b1a1a',
  campaignEnd: '#6b1414',
  authorBoxStart: 'rgba(26, 26, 26, 0.9)',
  authorBoxEnd: 'rgba(15, 15, 15, 0.9)',
  relatedSectionStart: 'rgba(15, 15, 15, 0.6)',
  relatedSectionEnd: 'rgba(26, 26, 26, 0.6)',
  shadow: 'rgba(139, 26, 26, 0.4)',
  shadowSubtle: 'rgba(139, 26, 26, 0.2)',
};
