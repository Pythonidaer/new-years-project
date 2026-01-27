import type { Theme } from './types';
import { defaultTheme } from './default';

// Yolandi theme
export const yolandiTheme: Theme = {
  ...defaultTheme,
  bg: '#5C1D26', // Deep muted burgundy (raw, edgy background)
  surface: '#6B2A35', // Slightly lighter burgundy surface
  surfaceDark: '#3A1016', // Darker burgundy (depth and shadows)
  marqueeBg: '#2D0A0F', // Deepest burgundy (intense depth)
  text: '#F5F5F0', // Platinum blonde/off-white (hair color, high contrast on dark)
  textDark: '#FFFFFF', // Pure white (maximum contrast, platinum blonde highlights)
  muted: '#D0D0C0', // Light ash blonde (hair mid-tones, platinum blonde variations)
  border: 'rgba(245, 245, 240, 0.3)', // Platinum blonde borders
  codeBg: '#6B2A35', // Dark burgundy for code blocks
  codeText: '#F5F5F0', // Platinum blonde code text (readable on dark)
  primary: '#6B6B5A', // Dark grey-platinum blonde (hair color with depth) - dark enough for white text (meets 4.5:1 WCAG AA)
  primaryHover: '#7B7B6A', // Slightly lighter on hover
  primaryContrast: '#FFFFFF', // White text on dark grey-platinum blonde buttons (meets 4.5:1 WCAG AA - contrast ratio ~5.1:1, also works on dark backgrounds)
  link: '#F5F5F0', // Platinum blonde links (hair highlights) for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#FFFFFF', // Pure white for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#F5F5F0', // Platinum blonde focus ring (hair color)
  accent: '#DCDCDC', // Ashy platinum blonde accent (hair tones, more visible)
  accentAlt: '#F5F5F0', // Platinum blonde (hair color) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#1A1A1A', // Very dark charcoal footer (dark clothing)
  footerTextMuted: 'rgba(245, 245, 240, 0.85)', // Muted platinum blonde text (meets 4.5:1 WCAG AA)
  footerTextSubtle: 'rgba(245, 245, 240, 0.75)', // Brighter subtle platinum blonde text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(245, 245, 240, 0.15)', // Subtle platinum blonde social bg
  footerBorder: 'rgba(245, 245, 240, 0.2)', // Platinum blonde borders
  heroStart: '#5C1D26', // Deep burgundy start (background)
  heroEnd: '#3A1016', // Darker burgundy end (depth)
  heroRadial: 'rgba(245, 245, 240, 0.12)', // Subtle platinum blonde glow (hair highlights)
  campaignStart: '#6B6B5A', // Dark grey-platinum blonde (hair color, matches primary button)
  campaignEnd: '#D0D0C0', // Light ash blonde (hair shadow tones, platinum variations)
  authorBoxStart: 'rgba(107, 42, 53, 0.9)', // Dark burgundy
  authorBoxEnd: 'rgba(92, 29, 38, 0.9)', // Deeper burgundy
  relatedSectionStart: 'rgba(92, 29, 38, 0.7)', // Deep burgundy section
  relatedSectionEnd: 'rgba(107, 42, 53, 0.7)', // Lighter burgundy section
  shadow: 'rgba(10, 10, 10, 0.4)', // Near black shadows (dark clothing, depth)
  shadowSubtle: 'rgba(10, 10, 10, 0.2)', // Subtle black shadows
};
