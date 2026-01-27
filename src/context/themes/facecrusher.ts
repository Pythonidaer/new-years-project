import type { Theme } from './types';
import { defaultTheme } from './default';

// Facecrusher theme
export const facecrusherTheme: Theme = {
  ...defaultTheme,
  bg: '#1a1f2e', // Deep stormy grey-blue (stormy sky base)
  surface: '#252a3a', // Dark charcoal grey-blue (rocks/rubble)
  surfaceDark: '#1a1a1a', // Very dark charcoal (deep shadows)
  marqueeBg: '#0f1419', // Darkest stormy grey (deepest shadows)
  text: '#F5F5DC', // Off-white/cream text (shirt color, readable on dark)
  textDark: '#FFFFFF', // Pure white (maximum contrast)
  muted: '#B8B8A8', // Muted brownish-grey (desaturated secondary text)
  border: 'rgba(0, 191, 255, 0.3)', // Electric blue borders (lightning)
  codeBg: '#252a3a', // Dark charcoal for code blocks
  codeText: '#F5F5DC', // Off-white code text
  primary: '#0066CC', // Darker electric blue (lightning) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#0080FF', // Brighter electric blue on hover
  primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
  link: '#00BFFF', // Electric blue links (lightning) for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#5BB3F5', // Lighter electric blue for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#00BFFF', // Electric blue focus ring (lightning)
  accent: '#FF8C00', // Bright orange-yellow/amber (eye and sparks) for better contrast on dark background (meets 4.5:1 WCAG AA)
  accentAlt: '#FFA500', // Lighter orange-yellow accent (sparks) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#0f1419', // Darkest stormy grey footer (deepest shadows)
  footerTextMuted: 'rgba(245, 245, 220, 0.75)', // Muted off-white text
  footerTextSubtle: 'rgba(245, 245, 220, 0.70)', // Brighter subtle off-white text (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(0, 191, 255, 0.2)', // Subtle electric blue social bg (lightning)
  footerBorder: 'rgba(255, 140, 0, 0.3)', // Orange-yellow borders (sparks)
  heroStart: '#252a3a', // Dark charcoal grey-blue start (rocks/rubble)
  heroEnd: '#1a1f2e', // Deep stormy grey-blue end (stormy sky)
  heroRadial: 'rgba(0, 191, 255, 0.25)', // Electric blue glow (lightning)
  campaignStart: '#0080FF', // Intense electric blue (lightning)
  campaignEnd: '#DC143C', // Vivid red (suspenders, strong impact)
  authorBoxStart: 'rgba(37, 42, 58, 0.9)', // Dark charcoal grey-blue
  authorBoxEnd: 'rgba(26, 31, 46, 0.9)', // Darker stormy grey-blue
  relatedSectionStart: 'rgba(26, 31, 46, 0.7)', // Deep stormy grey-blue section
  relatedSectionEnd: 'rgba(37, 42, 58, 0.7)', // Lighter charcoal grey-blue section
  shadow: 'rgba(15, 20, 25, 0.5)', // Dark stormy grey shadows (deep shadows)
  shadowSubtle: 'rgba(0, 191, 255, 0.2)', // Subtle electric blue shadows (lightning)
};
