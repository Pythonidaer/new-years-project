import type { Theme } from './types';
import { defaultTheme } from './default';

// Gothic theme
export const gothicTheme: Theme = {
  ...defaultTheme,
  bg: '#1a1a1a',
  surface: '#2d2d2d',
  surfaceDark: '#0f0f0f',
  marqueeBg: '#0a0a0a',
  text: '#e8e8e8',
  textDark: '#ffffff',
  muted: '#a8a8a8',
  border: 'rgba(232, 232, 232, 0.2)',
  codeBg: '#2d2d2d',
  codeText: '#e8e8e8',
  primary: '#8b1a8b',
  primaryHover: '#a82da8',
  primaryContrast: '#ffffff',
  link: '#d85dd8', // Lighter purple for contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#e88de8', // Even lighter for better contrast on dark author box
  focus: '#a82da8',
  accent: '#c84dc8',
  accentAlt: '#d85dd8',
  footerBg: '#0a0a0a',
  footerTextMuted: 'rgba(232, 232, 232, 0.75)',
  footerTextSubtle: 'rgba(232, 232, 232, 0.65)',
  footerSocialBg: 'rgba(139, 26, 139, 0.12)',
  footerBorder: 'rgba(139, 26, 139, 0.12)',
  heroStart: '#0f0f0f',
  heroEnd: '#0a0a0a',
  heroRadial: 'rgba(139, 26, 139, 0.2)',
  campaignStart: '#8b1a8b',
  campaignEnd: '#6b146b',
  authorBoxStart: 'rgba(45, 45, 45, 0.9)',
  authorBoxEnd: 'rgba(26, 26, 26, 0.9)',
  relatedSectionStart: 'rgba(26, 26, 26, 0.6)',
  relatedSectionEnd: 'rgba(45, 45, 45, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowSubtle: 'rgba(0, 0, 0, 0.3)',
};
