import type { Theme } from './types';
import { defaultTheme } from './default';

// Royboy theme
export const royboyTheme: Theme = {
  ...defaultTheme,
  bg: '#1a0f0f', // Dark brown-black with reddish undertones (background)
  surface: '#2d1a1a', // Dark reddish-brown surface
  surfaceDark: '#0f0a0a', // Deepest dark brown-black
  marqueeBg: '#0a0505', // Deepest dark
  text: '#F5E6D3', // Warm cream/blonde text (hair color)
  textDark: '#FFF8F0', // Pale blonde/cream for headings
  muted: '#C4A082', // Muted sepia brown
  border: 'rgba(139, 90, 90, 0.4)', // Muted reddish-brown borders (hoodie color)
  codeBg: '#2d1a1a', // Dark reddish-brown surface for code
  codeText: '#F5E6D3', // Warm cream code text
  primary: '#8B5A5A', // Muted reddish-brown (hoodie color) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#A06B6B', // Brighter reddish-brown on hover
  primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
  link: '#D4A5A5', // Dusty rose links for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#E8C4B4', // Warm rose for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#D4A5A5', // Dusty rose focus
  accent: '#D4A5A5', // Dusty rose accent (hoodie highlights)
  accentAlt: '#F0C8C8', // Bright dusty rose accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0a0505', // Deepest dark brown-black footer
  footerTextMuted: 'rgba(245, 230, 211, 0.75)', // Muted warm cream text
  footerTextSubtle: 'rgba(245, 230, 211, 0.70)', // Brighter subtle warm cream text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(139, 90, 90, 0.2)', // Muted reddish-brown social bg
  footerBorder: 'rgba(139, 90, 90, 0.3)', // Muted reddish-brown borders
  heroStart: '#2d1a1a', // Dark reddish-brown start
  heroEnd: '#1a0f0f', // Darker brown-black end
  heroRadial: 'rgba(139, 90, 90, 0.25)', // Warm sepia glow
  campaignStart: '#8B5A5A', // Muted reddish-brown (hoodie)
  campaignEnd: '#6B3A3A', // Darker sepia brown
  authorBoxStart: 'rgba(45, 26, 26, 0.9)', // Dark reddish-brown
  authorBoxEnd: 'rgba(26, 15, 15, 0.9)', // Darker brown-black
  relatedSectionStart: 'rgba(26, 15, 15, 0.7)', // Dark brown-black section
  relatedSectionEnd: 'rgba(45, 26, 26, 0.7)', // Lighter reddish-brown section
  shadow: 'rgba(139, 90, 90, 0.4)', // Muted reddish-brown shadows
  shadowSubtle: 'rgba(139, 90, 90, 0.2)', // Subtle sepia shadows
};
