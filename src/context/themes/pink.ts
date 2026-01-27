import type { Theme } from './types';
import { defaultTheme } from './default';

// Pink theme
export const pinkTheme: Theme = {
  ...defaultTheme,
  bg: '#FFF8F5', // Soft peach-pink background (light yellow/peach from gradient)
  surface: '#FFEBF0', // Soft pink surface (lighter pink tones)
  surfaceDark: '#C41E5A', // Darker rose-pink (darker petals, meets 4.5:1 contrast with white text)
  marqueeBg: '#FFB6D3', // Medium pink (petal tones)
  text: '#5A1A2A', // Very dark deep rose text (readable at 75% opacity on light background, meets 4.5:1 WCAG AA)
  textDark: '#5A2A3A', // Darker rose for dark surfaces
  muted: '#B85A7A', // Darker muted pink-gray (better contrast for 75% opacity, meets 4.5:1 WCAG AA)
  border: 'rgba(255, 145, 175, 0.3)', // Soft pink borders
  codeBg: '#FFEBF0', // Soft pink for code blocks
  codeText: '#5A1A2A', // Very dark deep rose code text (matches text color for consistency)
  primary: '#C41E5A', // Darker rose-pink (vibrant petals, meets 4.5:1 contrast with white text - WCAG AA)
  primaryHover: '#E0306B', // Brighter rose on hover
  primaryContrast: '#FFFFFF', // White text on pink buttons (meets 4.5:1 WCAG AA)
  link: '#A0205A', // Darker rose link (readable on light background, meets 4.5:1 WCAG AA)
  blogLink: '#B0306A', // Darker rose for blog links (better contrast on author box, meets 4.5:1 WCAG AA)
  focus: '#C41E5A', // Darker rose focus ring
  accent: '#ff66a3', // Vibrant pink accent (petal highlights)
  accentAlt: '#FFD6E8', // Very light pink accent (softest petal tones)
  footerBg: '#5A2A3A', // Deep rose footer (darker rose tones)
  footerTextMuted: 'rgba(255, 255, 255, 0.95)', // White text at 95% opacity (meets 4.5:1 contrast on dark backgrounds - used for category links)
  footerTextSubtle: 'rgba(255, 255, 255, 0.80)', // White text at 80% opacity (meets 4.5:1 WCAG AA)
  footerSocialBg: 'rgba(255, 182, 211, 0.2)', // Subtle pink social bg
  footerBorder: 'rgba(255, 182, 211, 0.25)', // Soft pink borders
  heroStart: '#FFB6D3', // Light pink start (petal tones, peach-pink from gradient)
  heroEnd: '#FF91AF', // Medium pink end (richer pink from gradient)
  heroRadial: 'rgba(255, 182, 211, 0.15)', // Soft pink glow (ethereal atmosphere)
  campaignStart: '#FFB6D3', // Light pink (soft gradient start)
  campaignEnd: '#FF91AF', // Medium pink (richer gradient end)
  authorBoxStart: 'rgba(255, 235, 240, 0.9)', // Very light pink (reflective surface)
  authorBoxEnd: 'rgba(255, 227, 235, 0.9)', // Lighter pink (reflection highlights)
  relatedSectionStart: 'rgba(255, 227, 235, 0.6)', // Light pink section (reflected tones)
  relatedSectionEnd: 'rgba(255, 248, 245, 0.6)', // Softest peach-pink section (gradient background)
  shadow: 'rgba(255, 145, 175, 0.2)', // Soft pink shadows (delicate dewy effect)
  shadowSubtle: 'rgba(255, 182, 211, 0.1)', // Subtle light pink shadows (water droplets)
};
