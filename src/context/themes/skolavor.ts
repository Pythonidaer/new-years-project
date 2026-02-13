import type { Theme } from './types';
import { defaultTheme } from './default';

/**
 * Skolavor – inspired by the overcast Reykjavík street (Skólavörðustígur):
 * cream/off-white from the SKÓLAVÖR building, charcoal accents, grey paving,
 * rainbow pathway and green/red facades as accent, warm lamp glow.
 */
export const skolavorTheme: Theme = {
  ...defaultTheme,
  bg: '#F2EFE8', // Off-white/cream (SKÓLAVÖR building)
  surface: '#E8E4DC', // Light cream (elevated surfaces)
  surfaceDark: '#2D3238', // Charcoal (building accents, dark facades)
  marqueeBg: '#3D4248', // Dark grey (overcast sky tone)
  text: '#1A1D21', // Near black (signage, readable on cream)
  textDark: '#0D0F11', // Dark text for hero/contrast
  muted: '#5C6268', // Medium grey (paving, planters)
  border: 'rgba(45, 50, 56, 0.28)',
  codeBg: '#E8E4DC',
  codeText: '#1A1D21',
  primary: '#B84A3A', // Brick-red (red building, vibrant but readable)
  primaryHover: '#C45C4E',
  primaryContrast: '#FFFFFF',
  link: '#8B5A3C', // Warm brown (wood, earth)
  blogLink: '#6B4423', // Dark brown for contrast on author box
  focus: '#E8A030', // Lamp yellow-orange
  accent: '#3D8B5C', // Green building
  accentAlt: '#E8A030', // Lamp glow (footer/accents)
  footerBg: '#1A1D21', // Dark base (building base, street)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)',
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
  footerSocialBg: 'rgba(255, 255, 255, 0.12)',
  footerBorder: 'rgba(255, 255, 255, 0.15)',
  heroStart: '#3D4248', // Dark grey (overcast)
  heroEnd: '#2D3238', // Charcoal
  heroRadial: 'rgba(232, 160, 48, 0.12)', // Warm lamp hint
  campaignStart: '#B84A3A', // Brick-red
  campaignEnd: '#3D8B5C', // Green (rainbow pathway accent)
  authorBoxStart: 'rgba(232, 228, 220, 0.92)',
  authorBoxEnd: 'rgba(242, 239, 232, 0.92)',
  relatedSectionStart: 'rgba(232, 228, 220, 0.6)',
  relatedSectionEnd: 'rgba(242, 239, 232, 0.6)',
  shadow: 'rgba(45, 50, 56, 0.22)',
  shadowSubtle: 'rgba(45, 50, 56, 0.1)',
};
