import type { Theme } from './types';
import { defaultTheme } from './default';

// Cedar Oak theme
export const cedar_oakTheme: Theme = {
  ...defaultTheme,
  bg: '#faf8f5',
  surface: '#f0ede8',
  surfaceDark: '#3d4a3a',
  marqueeBg: '#2d3a2a',
  text: '#2d3a2a',
  textDark: '#1a2418',
  muted: '#6b7a6b',
  border: 'rgba(61, 74, 58, 0.2)',
  codeBg: '#f0ede8',
  codeText: '#2d3a2a',
  primary: '#8b6f47',
  primaryHover: '#a6896b',
  primaryContrast: '#ffffff',
  link: '#1a3a1a', // Darker green for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#2d4a2d', // Darker green for better contrast on light author box (meets 4.5:1 WCAG AA)
  focus: '#a6896b',
  accent: '#b89d7a',
  accentAlt: '#c4a882',
  footerBg: '#1a2418',
  footerTextMuted: 'rgba(255, 255, 255, 0.75)',
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
  footerSocialBg: 'rgba(255, 255, 255, 0.12)',
  footerBorder: 'rgba(255, 255, 255, 0.12)',
  heroStart: '#3d4a3a',
  heroEnd: '#2d3a2a',
  heroRadial: 'rgba(255, 255, 255, 0.1)',
  campaignStart: '#6b8e5a',
  campaignEnd: '#8b6f47',
  authorBoxStart: 'rgba(240, 237, 232, 0.8)',
  authorBoxEnd: 'rgba(200, 190, 175, 0.8)',
  relatedSectionStart: 'rgba(200, 190, 175, 0.5)',
  relatedSectionEnd: 'rgba(250, 248, 245, 0.5)',
  shadow: 'rgba(45, 58, 42, 0.15)',
  shadowSubtle: 'rgba(45, 58, 42, 0.08)',
};
