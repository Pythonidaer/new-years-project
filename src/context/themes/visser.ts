import type { Theme } from './types';
import { defaultTheme } from './default';

// Visser theme
export const visserTheme: Theme = {
  ...defaultTheme,
  bg: '#F7F7F7', // Subtle off-white (pristine white hooded jacket, pale skin/hair)
  surface: '#FFFFFF', // Pure white (brightest highlights on white clothing)
  surfaceDark: '#1A1A1A', // Very dark charcoal (black eyes, black rectangular patch)
  marqueeBg: '#E0E0E0', // Clean neutral light grey (mid-grey studio background)
  text: '#1A1A1A', // Very dark charcoal (black eyes, dark lips, black patch - high contrast)
  textDark: '#000000', // Pure black (maximum emphasis)
  muted: '#888888', // Mid-grey (softer dark greys, subtle shadows)
  border: '#D0D0D0', // Light neutral grey (subtle distinctions, soft shadows)
  codeBg: '#FFFFFF', // Pure white for code blocks (crispness)
  codeText: '#1A1A1A', // Very dark charcoal code text (high contrast)
  primary: '#000000', // Pure black (most impactful dark elements) for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#333333', // Slightly lighter black on hover (interactivity)
  primaryContrast: '#FFFFFF', // Pure white text on black buttons (meets 4.5:1 WCAG AA)
  link: '#1A1A1A', // Very dark charcoal links for better contrast on light background (meets 4.5:1 WCAG AA)
  blogLink: '#000000', // Pure black for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
  focus: '#000000', // Pure black focus ring (maximum emphasis)
  accent: '#FFFFFF', // Pure white accent (striking white spiky eyelashes, ultimate contrast)
  accentAlt: '#CCCCCC', // Light grey accent (secondary text color) for better contrast on dark footer (meets 4.5:1 WCAG AA)
  footerBg: '#1A1A1A', // Very dark charcoal footer (black eyes, black patch)
  footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
  footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
  footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
  footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
  heroStart: '#E0E0E0', // Clean neutral light grey start (mid-grey studio background)
  heroEnd: '#F7F7F7', // Subtle off-white end (pristine white)
  heroRadial: 'rgba(0, 0, 0, 0.05)', // Subtle black glow (minimal depth)
  campaignStart: '#000000', // Pure black (black eyes, black patch)
  campaignEnd: '#1A1A1A', // Very dark charcoal
  authorBoxStart: 'rgba(255, 255, 255, 0.9)', // Pure white
  authorBoxEnd: 'rgba(247, 247, 247, 0.9)', // Subtle off-white
  relatedSectionStart: 'rgba(247, 247, 247, 0.7)', // Subtle off-white section
  relatedSectionEnd: 'rgba(255, 255, 255, 0.7)', // Pure white section
  shadow: 'rgba(0, 0, 0, 0.15)', // Subtle black shadows (modern depth, not heavy)
  shadowSubtle: 'rgba(0, 0, 0, 0.08)', // Subtle black shadows (flat, clean)
};
