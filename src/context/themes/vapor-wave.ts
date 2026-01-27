import type { Theme } from './types';
import { defaultTheme } from './default';

// Vapor Wave theme
export const vapor_waveTheme: Theme = {
  ...defaultTheme,
  bg: '#0a0a1a',
  surface: '#14142d',
  surfaceDark: '#1a1a3a',
  marqueeBg: '#0f0f25',
  text: '#e8e8f0',
  textDark: '#ffffff',
  muted: '#a8a8c8',
  border: 'rgba(232, 232, 240, 0.2)',
  codeBg: '#1a1a3a',
  codeText: '#e8e8f0',
  primary: '#cc00cc', // Darker magenta for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#ff00ff',
  primaryContrast: '#ffffff',
  link: '#00ffff', // Cyan for contrast on dark background
  blogLink: '#00ffff',
  focus: '#ff33ff',
  accent: '#ff00ff',
  accentAlt: '#ff33ff',
  footerBg: '#050510',
  footerTextMuted: 'rgba(232, 232, 240, 0.75)',
  footerTextSubtle: 'rgba(232, 232, 240, 0.65)',
  footerSocialBg: 'rgba(255, 0, 255, 0.12)',
  footerBorder: 'rgba(255, 0, 255, 0.12)',
  heroStart: '#1a1a3a',
  heroEnd: '#0f0f25',
  heroRadial: 'rgba(255, 0, 255, 0.2)',
  campaignStart: '#cc00cc',
  campaignEnd: '#00ffff',
  authorBoxStart: 'rgba(26, 26, 58, 0.9)',
  authorBoxEnd: 'rgba(20, 20, 45, 0.9)',
  relatedSectionStart: 'rgba(20, 20, 45, 0.6)',
  relatedSectionEnd: 'rgba(26, 26, 58, 0.6)',
  shadow: 'rgba(255, 0, 255, 0.3)',
  shadowSubtle: 'rgba(255, 0, 255, 0.15)',
};
