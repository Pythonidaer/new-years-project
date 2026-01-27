import type { Theme } from './types';
import { defaultTheme } from './default';

// Fallout theme
export const falloutTheme: Theme = {
  ...defaultTheme,
  bg: '#F0F4FA', // Light blue-tinted white (Vault-Tec aesthetic)
  surface: '#E8F0F8', // Light blue surface (vault interior)
  surfaceDark: '#0A1A2D', // Dark blue (Vault-Tec background)
  marqueeBg: '#0A1525', // Very dark blue background
  text: '#1A1A1A', // Dark text (readable on light)
  textDark: '#000000', // Black (headings)
  muted: '#4A5A6B', // Medium blue-grey (muted accent)
  border: 'rgba(0, 102, 204, 0.25)', // Vault-Tec blue borders
  codeBg: '#E8F0F8', // Light blue for code blocks
  codeText: '#1A1A1A', // Dark code text
  primary: '#0066CC', // Vault-Tec blue for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#0077DD', // Lighter blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
  link: '#0052A3', // Darker blue links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#004080', // Very dark blue for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#0066CC', // Vault-Tec blue focus ring
  accent: '#FFD700', // Gold (Vault-Tec zipper/gold accents)
  accentAlt: '#FFE44D', // Lighter gold accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0A1525', // Dark blue background (Vault-Tec dark background)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 215, 0, 0.25)', // Gold-tinted social bg
  footerBorder: 'rgba(255, 215, 0, 0.3)', // Gold borders
  heroStart: '#0A1A2D', // Dark blue start
  heroEnd: '#0A1525', // Very dark blue end
  heroRadial: 'rgba(67, 79, 173, 0.15)', // Purple-blue glow (#434fad)
  campaignStart: '#0066CC', // Vault-Tec blue
  campaignEnd: '#004080', // Darker blue
  authorBoxStart: 'rgba(255, 248, 240, 0.95)', // Light gold-tinted (blog page sides)
  authorBoxEnd: 'rgba(255, 240, 200, 0.95)', // Gold-tinted (blog page sides)
  relatedSectionStart: 'rgba(255, 240, 200, 0.7)', // Gold-tinted section
  relatedSectionEnd: 'rgba(255, 248, 240, 0.7)', // Light gold-tinted section
  shadow: 'rgba(255, 215, 0, 0.2)', // Gold shadows
  shadowSubtle: 'rgba(255, 215, 0, 0.1)', // Subtle gold shadows
};
