import type { Theme } from './types';

// Default theme (Midnight Blue)
export const defaultTheme: Theme = {
  bg: '#0a0e1a',
  surface: '#141b2d',
  surfaceDark: '#1a2332',
  marqueeBg: '#0f1625',
  text: '#e8ecf0',
  textDark: '#ffffff',
  muted: '#a8b5c8',
  border: 'rgba(232, 236, 240, 0.2)',
  codeBg: '#1a2332',
  codeText: '#e8ecf0',
  primary: '#2d6bb8', // Darker blue for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#4a90e2',
  primaryContrast: '#ffffff',
  link: '#6ba8e8', // Lighter blue for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#5bb3f5',
  focus: '#6ba8e8',
  accent: '#7bb3f0',
  accentAlt: '#8bc5ff',
  footerBg: '#050810',
  footerTextMuted: 'rgba(232, 236, 240, 0.75)',
  footerTextSubtle: 'rgba(232, 236, 240, 0.65)',
  footerSocialBg: 'rgba(232, 236, 240, 0.12)',
  footerBorder: 'rgba(232, 236, 240, 0.12)',
  heroStart: '#1a2332',
  heroEnd: '#0f1625',
  heroRadial: 'rgba(74, 144, 226, 0.15)',
  campaignStart: '#4a90e2',
  campaignEnd: '#2d5aa0',
  authorBoxStart: 'rgba(20, 27, 45, 0.9)',
  authorBoxEnd: 'rgba(26, 35, 50, 0.9)',
  relatedSectionStart: 'rgba(26, 35, 50, 0.6)',
  relatedSectionEnd: 'rgba(20, 27, 45, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowSubtle: 'rgba(0, 0, 0, 0.2)',
};
