import type { Theme } from './types';
import { defaultTheme } from './default';

// Pastel theme
export const pastelTheme: Theme = {
  ...defaultTheme,
  bg: '#fff8f8',
  surface: '#fff0f0',
  surfaceDark: '#8b5a5a', // Darker for better contrast with white text
  marqueeBg: '#6b4a4a',
  text: '#4a3a3a',
  textDark: '#2d1a1a',
  muted: '#8b7a7a',
  border: 'rgba(212, 165, 165, 0.3)',
  codeBg: '#fff0f0',
  codeText: '#4a3a3a',
  primary: '#8b5a5a', // Darker for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#a56a6a',
  primaryContrast: '#ffffff',
  link: '#6b4a4a', // Darker pastel for contrast on light background
  blogLink: '#6b4a4a', // Darker for better contrast on light author box
  focus: '#c49595',
  accent: '#e8b8b8',
  accentAlt: '#f0c8c8',
  footerBg: '#2d1a1a',
  footerTextMuted: 'rgba(255, 255, 255, 0.85)',
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
  footerSocialBg: 'rgba(255, 255, 255, 0.12)',
  footerBorder: 'rgba(255, 255, 255, 0.12)',
  heroStart: '#8b5a5a',
  heroEnd: '#6b4a4a',
  heroRadial: 'rgba(255, 255, 255, 0.2)',
  campaignStart: '#8b5a5a',
  campaignEnd: '#6b4a4a',
  authorBoxStart: 'rgba(255, 240, 240, 0.8)',
  authorBoxEnd: 'rgba(255, 224, 224, 0.8)',
  relatedSectionStart: 'rgba(255, 224, 224, 0.5)',
  relatedSectionEnd: 'rgba(255, 248, 248, 0.5)',
  shadow: 'rgba(212, 165, 165, 0.2)',
  shadowSubtle: 'rgba(212, 165, 165, 0.1)',
};
