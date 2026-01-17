import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContextInstance';

export type Theme = {
  bg: string;
  surface: string;
  surfaceDark: string;
  marqueeBg: string;
  text: string;
  textDark: string;
  muted: string;
  border: string;
  codeBg: string;
  codeText: string;
  primary: string;
  primaryHover: string;
  primaryContrast: string;
  blogLink: string;
  link: string;
  focus: string;
  accent: string;
  accentAlt: string;
  footerBg: string;
  footerTextMuted: string;
  footerTextSubtle: string;
  footerSocialBg: string;
  footerBorder: string;
  heroStart: string;
  heroEnd: string;
  heroRadial: string;
  campaignStart: string;
  campaignEnd: string;
  authorBoxStart: string;
  authorBoxEnd: string;
  relatedSectionStart: string;
  relatedSectionEnd: string;
  shadow: string;
  shadowSubtle: string;
};

// Original Mark43-inspired theme (preserved as Mark43 preset)
// Commented out - Mark43 theme hidden from ThemePicker menu
// const mark43Theme: Theme = {
//   bg: '#ffffff',
//   surface: '#f6f7f9',
//   surfaceDark: 'rgb(36, 54, 78)',
//   marqueeBg: '#0f2036',
//   text: '#24364e',
//   textDark: '#0b1f33',
//   muted: '#555555',
//   border: 'rgba(36, 54, 78, 0.25)',
//   codeBg: '#f6f7f9',
//   codeText: '#24364e',
//   primary: '#d34120',
//   primaryHover: '#e07962',
//   primaryContrast: '#ffffff',
//   blogLink: '#134dd1',
//   link: '#d34120',
//   focus: '#93c5fd',
//   accent: '#f5b027',
//   accentAlt: '#ffac12',
//   footerBg: '#0a1a2a',
//   footerTextMuted: 'rgba(255, 255, 255, 0.7)',
//   footerTextSubtle: 'rgba(255, 255, 255, 0.6)',
//   footerSocialBg: 'rgba(255, 255, 255, 0.1)',
//   footerBorder: 'rgba(255, 255, 255, 0.1)',
//   heroStart: '#152a44',
//   heroEnd: '#0f2036',
//   heroRadial: 'rgba(255, 255, 255, 0.08)',
//   campaignStart: '#134dd1',
//   campaignEnd: '#2962ff',
//   authorBoxStart: 'rgba(242, 242, 242, 0.57)',
//   authorBoxEnd: 'rgba(180, 199, 207, 0.57)',
//   relatedSectionStart: 'rgba(180, 199, 207, 0.4)',
//   relatedSectionEnd: 'rgba(255, 255, 255, 0.4)',
//   shadow: 'rgba(0, 0, 0, 0.16)',
//   shadowSubtle: 'rgba(0, 0, 0, 0.08)',
// };

// Default theme (Midnight Blue)
const defaultTheme: Theme = {
  bg: '#0a0e1a',
  surface: '#141b2d',
  surfaceDark: '#1a2332',
  marqueeBg: '#0f1625',
  text: '#e8ecf0',
  textDark: '#ffffff',
  muted: '#a8b5c8',
  border: 'rgba(232, 236, 240, 0.2)',
  codeBg: '#1a2332',
  codeText: '#e8ecf0',
  primary: '#2d6bb8', // Darker blue for better contrast with white text (meets 4.5:1 WCAG AA)
  primaryHover: '#4a90e2',
  primaryContrast: '#ffffff',
  link: '#6ba8e8', // Lighter blue for better contrast on dark background (meets 4.5:1 WCAG AA)
  blogLink: '#5bb3f5',
  focus: '#6ba8e8',
  accent: '#7bb3f0',
  accentAlt: '#8bc5ff',
  footerBg: '#050810',
  footerTextMuted: 'rgba(232, 236, 240, 0.75)',
  footerTextSubtle: 'rgba(232, 236, 240, 0.65)',
  footerSocialBg: 'rgba(232, 236, 240, 0.12)',
  footerBorder: 'rgba(232, 236, 240, 0.12)',
  heroStart: '#1a2332',
  heroEnd: '#0f1625',
  heroRadial: 'rgba(74, 144, 226, 0.15)',
  campaignStart: '#4a90e2',
  campaignEnd: '#2d5aa0',
  authorBoxStart: 'rgba(20, 27, 45, 0.9)',
  authorBoxEnd: 'rgba(26, 35, 50, 0.9)',
  relatedSectionStart: 'rgba(26, 35, 50, 0.6)',
  relatedSectionEnd: 'rgba(20, 27, 45, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowSubtle: 'rgba(0, 0, 0, 0.2)',
};

export type Preset = {
  id: string;
  name: string;
  theme: Theme;
};

export type { ThemeContextType } from './ThemeContextInstance';

const STORAGE_KEY = 'user-theme';
const PRESETS_STORAGE_KEY = 'theme-presets';

// Helper to map theme keys to CSS variable names
function themeKeyToCssVar(key: keyof Theme): string {
  const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--color-${kebabCase}`;
}

// Apply theme to DOM
function applyThemeToDom(theme: Theme) {
  const root = document.getElementById('root');
  if (!root) return;

  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = themeKeyToCssVar(key as keyof Theme);
    root.style.setProperty(cssVar, value);
  });

  // Also apply --color-bg to html/body so body element can use it
  // (body is a parent of #root, so it can't access variables defined on #root)
  const html = document.documentElement;
  html.style.setProperty('--color-bg', theme.bg);
}

// Built-in preset themes
const builtInPresets: Preset[] = [
  {
    id: 'default',
    name: 'Default',
    theme: defaultTheme,
  },
  {
    id: 'cedar-oak',
    name: 'Cedar Oak',
    theme: {
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
    },
  },
  // {
  //   id: 'mark43',
  //   name: 'Mark43',
  //   theme: mark43Theme,
  // },
  {
    id: 'sage-green',
    name: 'Sage Green',
    theme: {
      ...defaultTheme,
      bg: '#f7f9f6',
      surface: '#eef2eb',
      surfaceDark: '#4a5d4a',
      marqueeBg: '#3a4d3a',
      text: '#2d3a2d',
      textDark: '#1a241a',
      muted: '#6b7a6b',
      border: 'rgba(74, 93, 74, 0.2)',
      codeBg: '#eef2eb',
      codeText: '#2d3a2d',
      primary: '#3d6a3d', // Darker green for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#5a8a5a',
      primaryContrast: '#ffffff',
      link: '#1a4a1a', // Darker green for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#2d5a2d', // Darker green for better contrast on light author box
      focus: '#6ba06b',
      accent: '#7ba07b',
      accentAlt: '#8bb08b',
      footerBg: '#1a241a',
      footerTextMuted: 'rgba(255, 255, 255, 0.75)',
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
      footerSocialBg: 'rgba(255, 255, 255, 0.12)',
      footerBorder: 'rgba(255, 255, 255, 0.12)',
      heroStart: '#4a5d4a',
      heroEnd: '#3a4d3a',
      heroRadial: 'rgba(255, 255, 255, 0.1)',
      campaignStart: '#5a8a5a',
      campaignEnd: '#4a7a4a',
      authorBoxStart: 'rgba(238, 242, 235, 0.8)',
      authorBoxEnd: 'rgba(200, 210, 195, 0.8)',
      relatedSectionStart: 'rgba(200, 210, 195, 0.5)',
      relatedSectionEnd: 'rgba(247, 249, 246, 0.5)',
      shadow: 'rgba(58, 77, 58, 0.15)',
      shadowSubtle: 'rgba(58, 77, 58, 0.08)',
    },
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    theme: {
      ...defaultTheme,
      bg: '#fff5f5',
      surface: '#ffe8e8',
      surfaceDark: '#8b1a1a',
      marqueeBg: '#6b1414',
      text: '#2d1a1a',
      textDark: '#1a0f0f',
      muted: '#6b4a4a',
      border: 'rgba(139, 26, 26, 0.2)',
      codeBg: '#ffe8e8',
      codeText: '#2d1a1a',
      primary: '#c41e1e',
      primaryHover: '#d34120',
      primaryContrast: '#ffffff',
      link: '#8b1a1a', // Dark red for contrast on light background
      blogLink: '#8b1a1a',
      focus: '#d34120',
      accent: '#ff4d4d',
      accentAlt: '#ff6b6b',
      footerBg: '#1a0f0f',
      footerTextMuted: 'rgba(255, 255, 255, 0.75)',
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
      footerSocialBg: 'rgba(255, 255, 255, 0.12)',
      footerBorder: 'rgba(255, 255, 255, 0.12)',
      heroStart: '#8b1a1a',
      heroEnd: '#6b1414',
      heroRadial: 'rgba(255, 77, 77, 0.15)',
      campaignStart: '#c41e1e',
      campaignEnd: '#8b1a1a',
      authorBoxStart: 'rgba(255, 232, 232, 0.8)',
      authorBoxEnd: 'rgba(255, 200, 200, 0.8)',
      relatedSectionStart: 'rgba(255, 200, 200, 0.5)',
      relatedSectionEnd: 'rgba(255, 245, 245, 0.5)',
      shadow: 'rgba(139, 26, 26, 0.15)',
      shadowSubtle: 'rgba(139, 26, 26, 0.08)',
    },
  },
  {
    id: 'vapor-wave',
    name: 'Vapor Wave',
    theme: {
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
    },
  },
  {
    id: 'gothic',
    name: 'Gothic',
    theme: {
      ...defaultTheme,
      bg: '#1a1a1a',
      surface: '#2d2d2d',
      surfaceDark: '#0f0f0f',
      marqueeBg: '#0a0a0a',
      text: '#e8e8e8',
      textDark: '#ffffff',
      muted: '#a8a8a8',
      border: 'rgba(232, 232, 232, 0.2)',
      codeBg: '#2d2d2d',
      codeText: '#e8e8e8',
      primary: '#8b1a8b',
      primaryHover: '#a82da8',
      primaryContrast: '#ffffff',
      link: '#d85dd8', // Lighter purple for contrast on dark background (meets 4.5:1 WCAG AA)
      blogLink: '#e88de8', // Even lighter for better contrast on dark author box
      focus: '#a82da8',
      accent: '#c84dc8',
      accentAlt: '#d85dd8',
      footerBg: '#0a0a0a',
      footerTextMuted: 'rgba(232, 232, 232, 0.75)',
      footerTextSubtle: 'rgba(232, 232, 232, 0.65)',
      footerSocialBg: 'rgba(139, 26, 139, 0.12)',
      footerBorder: 'rgba(139, 26, 139, 0.12)',
      heroStart: '#0f0f0f',
      heroEnd: '#0a0a0a',
      heroRadial: 'rgba(139, 26, 139, 0.2)',
      campaignStart: '#8b1a8b',
      campaignEnd: '#6b146b',
      authorBoxStart: 'rgba(45, 45, 45, 0.9)',
      authorBoxEnd: 'rgba(26, 26, 26, 0.9)',
      relatedSectionStart: 'rgba(26, 26, 26, 0.6)',
      relatedSectionEnd: 'rgba(45, 45, 45, 0.6)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      shadowSubtle: 'rgba(0, 0, 0, 0.3)',
    },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    theme: {
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
    },
  },
  {
    id: 'horror',
    name: 'Horror',
    theme: {
      ...defaultTheme,
      bg: '#0a0a0a',
      surface: '#1a1a1a',
      surfaceDark: '#0f0f0f',
      marqueeBg: '#050505',
      text: '#f0f0f0', // Lighter gray for better contrast on dark background (meets 4.5:1 WCAG AA)
      textDark: '#ffffff',
      muted: '#a8a8a8',
      border: 'rgba(232, 232, 232, 0.2)',
      codeBg: '#1a1a1a',
      codeText: '#e8e8e8',
      primary: '#8b1a1a', // Dark red
      primaryHover: '#a82d2d',
      primaryContrast: '#ffffff',
      link: '#d85d5d', // Lighter red for contrast on dark background
      blogLink: '#ff6b6b', // Lighter red for better contrast on dark author box (meets 4.5:1 WCAG AA)
      focus: '#a82d2d',
      accent: '#ff4d4d',
      accentAlt: '#ff6b6b',
      footerBg: '#050505',
      footerTextMuted: 'rgba(232, 232, 232, 0.75)',
      footerTextSubtle: 'rgba(232, 232, 232, 0.65)',
      footerSocialBg: 'rgba(139, 26, 26, 0.12)',
      footerBorder: 'rgba(139, 26, 26, 0.12)',
      heroStart: '#0f0f0f',
      heroEnd: '#050505',
      heroRadial: 'rgba(139, 26, 26, 0.2)',
      campaignStart: '#8b1a1a',
      campaignEnd: '#6b1414',
      authorBoxStart: 'rgba(26, 26, 26, 0.9)',
      authorBoxEnd: 'rgba(15, 15, 15, 0.9)',
      relatedSectionStart: 'rgba(15, 15, 15, 0.6)',
      relatedSectionEnd: 'rgba(26, 26, 26, 0.6)',
      shadow: 'rgba(139, 26, 26, 0.4)',
      shadowSubtle: 'rgba(139, 26, 26, 0.2)',
    },
  },
  {
    id: 'pride',
    name: 'Pride',
    theme: {
      ...defaultTheme,
      bg: '#FFF9E6', // Light yellow (rainbow)
      surface: '#E6F3FF', // Light blue (rainbow)
      surfaceDark: '#750787', // Purple (rainbow) for better contrast
      marqueeBg: '#004DFF', // Blue (rainbow)
      text: '#1a1a1a', // Dark text (high contrast on light)
      textDark: '#000000', // Black for headings
      muted: '#8B4513', // Brown (chevron)
      border: 'rgba(255, 140, 0, 0.4)', // Orange borders (rainbow)
      codeBg: '#E6F3FF', // Light blue surface for code
      codeText: '#004DFF', // Blue code text (rainbow)
      primary: '#C41E3A', // Darker red (rainbow) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#DC143C', // Brighter red on hover
      primaryContrast: '#ffffff', // White text on red buttons (meets 4.5:1 WCAG AA)
      link: '#750787', // Purple (rainbow) for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#006400', // Darker green (rainbow) for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#FFED00', // Yellow (rainbow) focus
      accent: '#FF8C00', // Orange (rainbow)
      accentAlt: '#FFAFC8', // Pink (chevron/trans flag) for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#750787', // Purple (rainbow)
      footerTextMuted: 'rgba(255, 255, 255, 0.85)', // Bright white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.80)', // Brighter subtle white text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(255, 175, 200, 0.3)', // Pink social bg (chevron)
      footerBorder: 'rgba(255, 237, 0, 0.3)', // Yellow borders (rainbow)
      heroStart: '#008026', // Green (rainbow)
      heroEnd: '#750787', // Purple (rainbow)
      heroRadial: 'rgba(117, 7, 135, 0.4)', // Purple glow (rainbow)
      campaignStart: '#008026', // Green (rainbow)
      campaignEnd: '#004DFF', // Blue (rainbow)
      authorBoxStart: 'rgba(255, 175, 200, 0.8)', // Pink (chevron/trans flag)
      authorBoxEnd: 'rgba(165, 217, 255, 0.8)', // Light blue (chevron/trans flag)
      relatedSectionStart: 'rgba(255, 237, 0, 0.6)', // Yellow section (rainbow)
      relatedSectionEnd: 'rgba(255, 140, 0, 0.6)', // Orange section (rainbow)
      shadow: 'rgba(117, 7, 135, 0.4)', // Purple shadows (rainbow)
      shadowSubtle: 'rgba(255, 140, 0, 0.3)', // Orange shadows (rainbow)
    },
  },
  {
    id: 'yuko',
    name: 'Yuko',
    theme: {
      ...defaultTheme,
      bg: '#1a0a1a', // Dark base with pink undertone
      surface: '#2d1a2d', // Dark purple-pink surface
      surfaceDark: '#0f0a0f', // Very dark for contrast
      marqueeBg: '#0a050a', // Deepest dark
      text: '#ffd0f0', // Light pink text
      textDark: '#ffffff', // Pure white for headings
      muted: '#ff8cc8', // Muted pink
      border: 'rgba(255, 20, 147, 0.3)', // Hot pink borders
      codeBg: '#2d1a2d', // Dark surface for code
      codeText: '#00d4ff', // Light blue code text (atomic breath color)
      primary: '#dc143c', // Crimson red (Godzilla eyes, Tokyo Tower)
      primaryHover: '#ff1744', // Brighter red on hover
      primaryContrast: '#ffffff', // White text on red buttons
      link: '#00d4ff', // Light blue links (atomic breath)
      blogLink: '#00d4ff', // Light blue for blog links
      focus: '#ffd700', // Neon yellow focus (dorsal fins)
      accent: '#ffd700', // Neon yellow accent (dorsal fins, flames)
      accentAlt: '#ff8c00', // Orange accent (flame outlines)
      footerBg: '#0a050a', // Deepest dark footer
      footerTextMuted: 'rgba(255, 208, 240, 0.75)', // Muted pink text
      footerTextSubtle: 'rgba(255, 208, 240, 0.65)', // Subtle pink text
      footerSocialBg: 'rgba(255, 20, 147, 0.15)', // Hot pink social bg
      footerBorder: 'rgba(255, 20, 147, 0.2)', // Hot pink borders
      heroStart: '#ff1493', // Hot pink start (background color)
      heroEnd: '#8b008b', // Deep magenta end
      heroRadial: 'rgba(255, 215, 0, 0.2)', // Neon yellow glow
      campaignStart: '#dc143c', // Crimson red
      campaignEnd: '#ff1493', // Hot pink
      authorBoxStart: 'rgba(45, 26, 45, 0.9)', // Dark purple-pink
      authorBoxEnd: 'rgba(26, 10, 26, 0.9)', // Darker purple-pink
      relatedSectionStart: 'rgba(26, 10, 26, 0.7)', // Dark section
      relatedSectionEnd: 'rgba(45, 26, 45, 0.7)', // Lighter dark section
      shadow: 'rgba(255, 20, 147, 0.4)', // Hot pink shadows
      shadowSubtle: 'rgba(255, 20, 147, 0.2)', // Subtle pink shadows
    },
  },
  {
    id: 'hokusai',
    name: 'Hokusai',
    theme: {
      ...defaultTheme,
      bg: '#1a2838', // Deep dark blue-teal (background)
      surface: '#2a3a4a', // Slightly lighter blue-teal surface
      surfaceDark: '#0f1a25', // Darkest blue-teal
      marqueeBg: '#0a1419', // Deepest dark
      text: '#ffd4a0', // Pale yellow/light orange (skull color)
      textDark: '#ffe8c8', // Lighter pale yellow for headings
      muted: '#d4a070', // Muted orange-yellow
      border: 'rgba(255, 140, 0, 0.3)', // Burnt orange borders (framing element)
      codeBg: '#2a3a4a', // Dark surface for code
      codeText: '#87ceeb', // Light blue code text (accent color)
      primary: '#c45500', // Burnt orange with good contrast (meets 4.5:1 WCAG AA)
      primaryHover: '#b84500', // Brighter burnt orange on hover
      primaryContrast: '#ffffff', // White text on orange buttons
      link: '#87ceeb', // Light blue links (accent color)
      blogLink: '#87ceeb', // Light blue for blog links
      focus: '#ffa500', // Orange focus (warm accent)
      accent: '#ffa500', // Orange accent (warm highlights)
      accentAlt: '#ff8c00', // Darker orange accent
      footerBg: '#0a1419', // Deepest dark footer
      footerTextMuted: 'rgba(255, 212, 160, 0.75)', // Muted pale yellow text
      footerTextSubtle: 'rgba(255, 212, 160, 0.65)', // Subtle pale yellow text
      footerSocialBg: 'rgba(204, 85, 0, 0.15)', // Burnt orange social bg
      footerBorder: 'rgba(255, 140, 0, 0.2)', // Burnt orange borders
      heroStart: '#1a2838', // Deep blue-teal start
      heroEnd: '#0f1a25', // Darker blue-teal end
      heroRadial: 'rgba(255, 165, 0, 0.15)', // Orange glow
      campaignStart: '#cc5500', // Burnt orange
      campaignEnd: '#8b4513', // Saddle brown (darker orange-brown)
      authorBoxStart: 'rgba(42, 58, 74, 0.9)', // Dark blue-teal
      authorBoxEnd: 'rgba(26, 40, 56, 0.9)', // Darker blue-teal
      relatedSectionStart: 'rgba(26, 40, 56, 0.7)', // Dark section
      relatedSectionEnd: 'rgba(42, 58, 74, 0.7)', // Lighter dark section
      shadow: 'rgba(0, 0, 0, 0.5)', // Deep black shadows (woodblock style)
      shadowSubtle: 'rgba(0, 0, 0, 0.3)', // Subtle black shadows
    },
  },
  {
    id: 'noname',
    name: 'Noname',
    theme: {
      ...defaultTheme,
      bg: '#E0C0E8', // Light purple/lavender background
      surface: '#F0E0F8', // Lighter purple surface
      surfaceDark: '#6F4A3A', // Dark brown (skin tone)
      marqueeBg: '#D8B8E0', // Slightly darker purple
      text: '#1A1A1A', // Dark black (hair color)
      textDark: '#000000', // Pure black for headings
      muted: '#8B5E4A', // Muted brown
      border: 'rgba(111, 74, 58, 0.3)', // Dark brown borders
      codeBg: '#F0E0F8', // Light purple for code
      codeText: '#1A4A8B', // Dark blue code text for better contrast on light purple
      primary: '#2E6BB8', // Darker blue for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#4A90E2', // Brighter blue on hover
      primaryContrast: '#FFFFFF', // White text on blue buttons
      link: '#1B5E20', // Darker green for better contrast on light purple background (meets 4.5:1 WCAG AA)
      blogLink: '#1B5E20', // Darker green for better contrast on author box gradient
      focus: '#8BC34A', // Bright green focus (eye color)
      accent: '#FFD700', // Bright yellow (floral accents)
      accentAlt: '#F44336', // Brighter red for better contrast on dark footer
      footerBg: '#1A1A1A', // Dark black (hair color)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(74, 144, 226, 0.15)', // Blue social bg
      footerBorder: 'rgba(255, 255, 255, 0.2)', // White borders
      heroStart: '#D8B8E0', // Light purple start
      heroEnd: '#E0C0E8', // Lighter purple end
      heroRadial: 'rgba(255, 215, 0, 0.15)', // Yellow glow
      campaignStart: '#4A90E2', // Bright blue
      campaignEnd: '#4CAF50', // Green
      authorBoxStart: 'rgba(240, 224, 248, 0.9)', // Light purple
      authorBoxEnd: 'rgba(224, 192, 232, 0.9)', // Slightly darker purple
      relatedSectionStart: 'rgba(224, 192, 232, 0.7)', // Light purple section
      relatedSectionEnd: 'rgba(240, 224, 248, 0.7)', // Lighter purple section
      shadow: 'rgba(111, 74, 58, 0.2)', // Brown shadows
      shadowSubtle: 'rgba(111, 74, 58, 0.1)', // Subtle brown shadows
    },
  },
  {
    id: 'sadikovic',
    name: 'Sadikovic',
    theme: {
      ...defaultTheme,
      bg: '#0a0a1a', // Very dark blue-black (arena atmosphere)
      surface: '#1a1a2e', // Dark blue-gray surface
      surfaceDark: '#000080', // Deep blue (dark base)
      marqueeBg: '#000000', // Pure black
      text: '#00BFFF', // Electric blue text (stage lights)
      textDark: '#FFFFFF', // White for headings
      muted: '#8A2BE2', // Muted purple
      border: 'rgba(0, 191, 255, 0.3)', // Electric blue borders
      codeBg: '#1a1a2e', // Dark surface for code
      codeText: '#00FFFF', // Cyan code text (bright stage lights)
      primary: '#007ea8', // Darker electric blue for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#00BFFF', // Brighter electric blue on hover
      primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
      link: '#00FFFF', // Cyan links (bright stage lights)
      blogLink: '#00FFFF', // Cyan for blog links
      focus: '#FFD700', // Gold focus (patch color)
      accent: '#FFD700', // Gold accent (patch color)
      accentAlt: '#E53935', // Brighter red accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#000000', // Pure black footer
      footerTextMuted: 'rgba(0, 191, 255, 0.75)', // Muted electric blue text
      footerTextSubtle: 'rgba(0, 191, 255, 0.70)', // Brighter subtle electric blue text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(0, 191, 255, 0.15)', // Electric blue social bg
      footerBorder: 'rgba(0, 191, 255, 0.2)', // Electric blue borders
      heroStart: '#4B0082', // Dark purple start (ambient lighting)
      heroEnd: '#000080', // Deep blue end
      heroRadial: 'rgba(0, 191, 255, 0.2)', // Electric blue glow
      campaignStart: '#00BFFF', // Electric blue
      campaignEnd: '#8A2BE2', // Purple
      authorBoxStart: 'rgba(26, 26, 46, 0.9)', // Dark blue-gray
      authorBoxEnd: 'rgba(10, 10, 26, 0.9)', // Darker blue-black
      relatedSectionStart: 'rgba(10, 10, 26, 0.7)', // Dark section
      relatedSectionEnd: 'rgba(26, 26, 46, 0.7)', // Lighter dark section
      shadow: 'rgba(0, 191, 255, 0.4)', // Electric blue shadows
      shadowSubtle: 'rgba(0, 191, 255, 0.2)', // Subtle electric blue shadows
    },
  },
  {
    id: 'afb',
    name: 'AFB',
    theme: {
      ...defaultTheme,
      bg: '#0a1526', // Very dark royal blue (boxing gym atmosphere)
      surface: '#1a2540', // Dark royal blue surface
      surfaceDark: '#0d1a33', // Deep royal blue (dark base)
      marqueeBg: '#050a14', // Deepest dark
      text: '#E8F4FF', // Light blue-white text (glove highlights)
      textDark: '#FFFFFF', // Pure white for headings
      muted: '#9BB5D4', // Muted royal blue
      border: 'rgba(147, 112, 219, 0.3)', // Metallic purple borders
      codeBg: '#1a2540', // Dark surface for code
      codeText: '#FFD700', // Gold code text (glove accents)
      primary: '#4169E1', // Royal blue for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#5B7FD8', // Brighter royal blue on hover
      primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
      link: '#9370DB', // Metallic purple links (glove color)
      blogLink: '#FFD700', // Gold for blog links (glove accents)
      focus: '#FFD700', // Gold focus (glove accents)
      accent: '#FFD700', // Gold accent (glove accents)
      accentAlt: '#FF4D4D', // Brighter red accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#050a14', // Deepest dark footer
      footerTextMuted: 'rgba(232, 244, 255, 0.75)', // Muted light blue text
      footerTextSubtle: 'rgba(232, 244, 255, 0.70)', // Brighter subtle light blue text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(147, 112, 219, 0.15)', // Metallic purple social bg
      footerBorder: 'rgba(147, 112, 219, 0.2)', // Metallic purple borders
      heroStart: '#1a2540', // Dark royal blue start
      heroEnd: '#0d1a33', // Deeper royal blue end
      heroRadial: 'rgba(147, 112, 219, 0.2)', // Metallic purple glow
      campaignStart: '#4169E1', // Royal blue
      campaignEnd: '#9370DB', // Metallic purple
      authorBoxStart: 'rgba(26, 37, 64, 0.9)', // Dark royal blue
      authorBoxEnd: 'rgba(13, 26, 51, 0.9)', // Darker royal blue
      relatedSectionStart: 'rgba(13, 26, 51, 0.7)', // Dark section
      relatedSectionEnd: 'rgba(26, 37, 64, 0.7)', // Lighter dark section
      shadow: 'rgba(147, 112, 219, 0.4)', // Metallic purple shadows
      shadowSubtle: 'rgba(147, 112, 219, 0.2)', // Subtle metallic purple shadows
    },
  },
  {
    id: 'tuf',
    name: 'TUF',
    theme: {
      ...defaultTheme,
      bg: '#0f1a33', // Dark navy blue (base with blue tint)
      surface: '#1a2d4d', // Medium blue surface (tank top color influence)
      surfaceDark: '#0a1526', // Deep navy blue (dark base)
      marqueeBg: '#050a14', // Deepest dark navy
      text: '#E8F0FF', // Light blue-white text (high contrast)
      textDark: '#FFFFFF', // Pure white for headings
      muted: '#C0C0C0', // Silver/metallic gray (muted accent)
      border: 'rgba(64, 224, 208, 0.4)', // Turquoise borders
      codeBg: '#1a2d4d', // Medium blue surface for code
      codeText: '#C0C0C0', // Silver/metallic gray code text
      primary: '#4169E1', // Vibrant royal blue (tank top color) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#5B7FD8', // Brighter royal blue on hover
      primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
      link: '#40E0D0', // Turquoise links for better contrast on dark background (meets 4.5:1 WCAG AA)
      blogLink: '#48D1CC', // Medium turquoise for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#40E0D0', // Turquoise focus
      accent: '#40E0D0', // Turquoise accent
      accentAlt: '#7FFFD4', // Bright turquoise accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#050a14', // Deepest dark navy footer
      footerTextMuted: 'rgba(192, 192, 192, 0.75)', // Muted silver text
      footerTextSubtle: 'rgba(192, 192, 192, 0.70)', // Brighter subtle silver text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(64, 224, 208, 0.2)', // Turquoise social bg
      footerBorder: 'rgba(64, 224, 208, 0.3)', // Turquoise borders
      heroStart: '#1a2d4d', // Medium blue start (tank top color)
      heroEnd: '#0f1a33', // Dark navy blue end
      heroRadial: 'rgba(64, 224, 208, 0.25)', // Turquoise glow
      campaignStart: '#40E0D0', // Turquoise (vibrant accent)
      campaignEnd: '#4169E1', // Vibrant royal blue (tank top)
      authorBoxStart: 'rgba(26, 45, 77, 0.9)', // Medium blue
      authorBoxEnd: 'rgba(15, 26, 51, 0.9)', // Darker navy blue
      relatedSectionStart: 'rgba(15, 26, 51, 0.7)', // Dark navy section
      relatedSectionEnd: 'rgba(26, 45, 77, 0.7)', // Lighter blue section
      shadow: 'rgba(64, 224, 208, 0.4)', // Turquoise shadows
      shadowSubtle: 'rgba(64, 224, 208, 0.2)', // Subtle turquoise shadows
    },
  },
  {
    id: 'royboy',
    name: 'Royboy',
    theme: {
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
    },
  },
  {
    id: 'dalmatian',
    name: 'Dalmatian',
    theme: {
      ...defaultTheme,
      bg: '#FFFFFF', // Pure white (background)
      surface: '#F5F5F5', // Off-white surface (subtle contrast)
      surfaceDark: '#000000', // Pure black (black side of hoodie)
      marqueeBg: '#0a0a0a', // Deep black
      text: '#000000', // Pure black text (glasses frames)
      textDark: '#000000', // Black for headings
      muted: '#666666', // Medium gray (muted accent)
      border: 'rgba(0, 0, 0, 0.3)', // Black borders
      codeBg: '#F5F5F5', // Off-white surface for code
      codeText: '#000000', // Black code text
      primary: '#000000', // Pure black (black side of hoodie) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#333333', // Dark gray on hover
      primaryContrast: '#FFFFFF', // White text on black buttons (meets 4.5:1 WCAG AA)
      link: '#8B6914', // Darker gold/bronze links for better contrast on white background (meets 4.5:1 WCAG AA)
      blogLink: '#6B4E0A', // Darker gold/bronze for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#D4AF37', // Warm blonde focus (hair color)
      accent: '#D4AF37', // Warm blonde accent (hair color)
      accentAlt: '#B8941F', // Darker blonde accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#000000', // Pure black footer (black side of hoodie)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.70)', // Brighter subtle white text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(255, 255, 255, 0.15)', // White social bg
      footerBorder: 'rgba(255, 255, 255, 0.2)', // White borders
      heroStart: '#000000', // Pure black start (black side of hoodie)
      heroEnd: '#1a1a1a', // Dark gray end
      heroRadial: 'rgba(212, 175, 55, 0.15)', // Warm blonde glow (hair color)
      campaignStart: '#000000', // Pure black (black side of hoodie)
      campaignEnd: '#FFFFFF', // Pure white (white side of hoodie)
      authorBoxStart: 'rgba(245, 245, 245, 0.9)', // Off-white
      authorBoxEnd: 'rgba(255, 255, 255, 0.9)', // Pure white
      relatedSectionStart: 'rgba(255, 255, 255, 0.7)', // White section
      relatedSectionEnd: 'rgba(245, 245, 245, 0.7)', // Off-white section
      shadow: 'rgba(0, 0, 0, 0.2)', // Black shadows
      shadowSubtle: 'rgba(0, 0, 0, 0.1)', // Subtle black shadows
    },
  },
  {
    id: 'querida',
    name: 'Querida',
    theme: {
      ...defaultTheme,
      bg: '#E8E8E8', // Light gray (siding base)
      surface: '#F5F5F5', // Off-white surface (window frames)
      surfaceDark: '#4A4A4A', // Medium-dark gray (patio, darker siding)
      marqueeBg: '#2D2D2D', // Dark gray (deep shadows)
      text: '#1A1A1A', // Dark gray text (high contrast on light)
      textDark: '#000000', // Black for headings
      muted: '#6B6B6B', // Medium gray (muted accent)
      border: 'rgba(76, 175, 80, 0.4)', // Lime green borders (door color)
      codeBg: '#F5F5F5', // Off-white surface for code
      codeText: '#1A1A1A', // Dark gray code text
      primary: '#1B5E20', // Very dark green for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#2E7D32', // Darker green on hover
      primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
      link: '#0D4A10', // Very dark green links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#1B5E20', // Very dark green for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#4CAF50', // Lime green focus (door color)
      accent: '#4CAF50', // Lime green accent (door color)
      accentAlt: '#81C784', // Bright lime green accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#2D2D2D', // Dark gray footer (patio color)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.70)', // Brighter subtle white text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(76, 175, 80, 0.2)', // Lime green social bg
      footerBorder: 'rgba(76, 175, 80, 0.3)', // Lime green borders
      heroStart: '#4A4A4A', // Medium-dark gray start (patio)
      heroEnd: '#2D2D2D', // Dark gray end
      heroRadial: 'rgba(76, 175, 80, 0.2)', // Lime green glow (door color)
      campaignStart: '#4CAF50', // Vibrant lime green (door)
      campaignEnd: '#2E7D32', // Darker green
      authorBoxStart: 'rgba(245, 245, 245, 0.9)', // Off-white
      authorBoxEnd: 'rgba(232, 232, 232, 0.9)', // Light gray
      relatedSectionStart: 'rgba(232, 232, 232, 0.7)', // Light gray section
      relatedSectionEnd: 'rgba(245, 245, 245, 0.7)', // Off-white section
      shadow: 'rgba(76, 175, 80, 0.3)', // Lime green shadows
      shadowSubtle: 'rgba(76, 175, 80, 0.15)', // Subtle lime green shadows
    },
  },
  {
    id: 'ris',
    name: 'Ris',
    theme: {
      ...defaultTheme,
      bg: '#FFD700', // Bright yellow (background)
      surface: '#87CEEB', // Light blue (character color)
      surfaceDark: '#8B4513', // Brown (stripes)
      marqueeBg: '#DAA520', // Darker yellow/gold
      text: '#000000', // Black text (high contrast on yellow)
      textDark: '#000000', // Black for headings
      muted: '#6B6B6B', // Medium gray (muted accent)
      border: 'rgba(128, 0, 128, 0.4)', // Purple borders (tag color)
      codeBg: '#87CEEB', // Light blue surface for code
      codeText: '#000000', // Black code text
      primary: '#DC143C', // Bright red (inner tube) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#FF1744', // Brighter red on hover
      primaryContrast: '#FFFFFF', // White text on red buttons (meets 4.5:1 WCAG AA)
      link: '#8B0000', // Dark red links for better contrast on yellow background (meets 4.5:1 WCAG AA)
      blogLink: '#800080', // Purple for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#DC143C', // Red focus (inner tube color)
      accent: '#800080', // Purple accent (tag color)
      accentAlt: '#FFD4E5', // Very light pink accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#8B4513', // Brown footer (stripes)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.80)', // Brighter subtle white text for better contrast (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(220, 20, 60, 0.2)', // Red social bg
      footerBorder: 'rgba(128, 0, 128, 0.3)', // Purple borders
      heroStart: '#87CEEB', // Light blue start (character color)
      heroEnd: '#FFD700', // Bright yellow end (background)
      heroRadial: 'rgba(220, 20, 60, 0.2)', // Red glow (inner tube)
      campaignStart: '#DC143C', // Bright red (inner tube)
      campaignEnd: '#800080', // Purple (tag)
      authorBoxStart: 'rgba(135, 206, 235, 0.9)', // Light blue
      authorBoxEnd: 'rgba(255, 215, 0, 0.9)', // Bright yellow
      relatedSectionStart: 'rgba(255, 215, 0, 0.7)', // Bright yellow section
      relatedSectionEnd: 'rgba(135, 206, 235, 0.7)', // Light blue section
      shadow: 'rgba(128, 0, 128, 0.4)', // Purple shadows
      shadowSubtle: 'rgba(128, 0, 128, 0.2)', // Subtle purple shadows
    },
  },
  {
    id: 'gulu',
    name: 'Gulu',
    theme: {
      ...defaultTheme,
      bg: '#F5F1E8', // Warm cream (white parts of Beagle)
      surface: '#E8DFD0', // Light tan (soft Beagle fur)
      surfaceDark: '#6B4423', // Rich brown (couch, brown patches)
      marqueeBg: '#5A3518', // Darker brown (couch shadow)
      text: '#2D1B0E', // Dark brown (almost black, like Beagle's eyes/nose)
      textDark: '#1A0F07', // Very dark brown (black patches)
      muted: '#8B7355', // Medium brown (muted accent)
      border: 'rgba(107, 68, 35, 0.3)', // Brown borders
      codeBg: '#E8DFD0', // Light tan for code blocks
      codeText: '#2D1B0E', // Dark brown code text
      primary: '#8B5A3C', // Warm brown (brown patches) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#A67C52', // Lighter brown on hover
      primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
      link: '#5A3518', // Dark brown links for better contrast on cream background (meets 4.5:1 WCAG AA)
      blogLink: '#3D2514', // Very dark brown for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#A67C52', // Light brown focus ring
      accent: '#B8865B', // Tan accent (lighter brown patches)
      accentAlt: '#D4A574', // Light tan accent (highlights)
      footerBg: '#3D2514', // Very dark brown (footer, like dark couch areas)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
      footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
      heroStart: '#6B4423', // Rich brown start (couch color)
      heroEnd: '#5A3518', // Darker brown end
      heroRadial: 'rgba(255, 255, 255, 0.1)', // Soft white glow
      campaignStart: '#8B5A3C', // Warm brown (brown patches)
      campaignEnd: '#6B4423', // Rich brown (couch)
      authorBoxStart: 'rgba(232, 223, 208, 0.9)', // Light tan
      authorBoxEnd: 'rgba(212, 165, 116, 0.9)', // Light tan accent
      relatedSectionStart: 'rgba(212, 165, 116, 0.5)', // Light tan section
      relatedSectionEnd: 'rgba(245, 241, 232, 0.5)', // Cream section
      shadow: 'rgba(107, 68, 35, 0.25)', // Brown shadows
      shadowSubtle: 'rgba(107, 68, 35, 0.12)', // Subtle brown shadows
    },
  },
  {
    id: 'maxine',
    name: 'Maxine',
    theme: {
      ...defaultTheme,
      bg: '#FFF8F0', // Platinum blonde inspired (light cream)
      surface: '#FFE8F5', // Light pink (from camo pattern)
      surfaceDark: '#6B2D8B', // Deep purple (dramatic eyeshadow)
      marqueeBg: '#4A1A6B', // Darker purple (shadow depth)
      text: '#1A0A2E', // Very dark purple-black (dramatic contrast)
      textDark: '#0A0514', // Almost black (black accents, nails)
      muted: '#8B6FA8', // Medium purple (muted tones)
      border: 'rgba(107, 45, 139, 0.3)', // Purple borders
      codeBg: '#FFE8F5', // Light pink for code blocks
      codeText: '#1A0A2E', // Dark purple code text
      primary: '#DC143C', // Bold red (lipstick) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#FF1744', // Brighter red on hover
      primaryContrast: '#FFFFFF', // White text on red buttons (meets 4.5:1 WCAG AA)
      link: '#8B2D8B', // Deep purple links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#6B1A6B', // Darker purple for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#FF6B9D', // Bright pink focus ring
      accent: '#FF8C42', // Vibrant orange (balloons)
      accentAlt: '#FFD700', // Bright yellow (balloons, platinum highlights)
      footerBg: '#2D1A3A', // Dark purple (dramatic footer)
      footerTextMuted: 'rgba(255, 255, 255, 0.85)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.75)', // Subtle white text
      footerSocialBg: 'rgba(255, 255, 255, 0.15)', // Subtle white social bg
      footerBorder: 'rgba(255, 255, 255, 0.2)', // White borders
      heroStart: '#8B4AAB', // Vibrant purple start (camo pattern)
      heroEnd: '#6B2D8B', // Deep purple end (eyes)
      heroRadial: 'rgba(255, 140, 66, 0.2)', // Orange glow (balloons)
      campaignStart: '#DC143C', // Bold red (lipstick)
      campaignEnd: '#FF8C42', // Vibrant orange (balloons)
      authorBoxStart: 'rgba(255, 232, 245, 0.9)', // Light pink
      authorBoxEnd: 'rgba(255, 214, 229, 0.9)', // Lighter pink
      relatedSectionStart: 'rgba(255, 214, 229, 0.6)', // Light pink section
      relatedSectionEnd: 'rgba(255, 248, 240, 0.6)', // Cream section
      shadow: 'rgba(107, 45, 139, 0.3)', // Purple shadows
      shadowSubtle: 'rgba(107, 45, 139, 0.15)', // Subtle purple shadows
    },
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    theme: {
      ...defaultTheme,
      bg: '#F0F4F8', // Soft light blue (sky at top)
      surface: '#E6D9F0', // Light purple/lavender (sky mid-section)
      surfaceDark: '#2D5F7A', // Deep teal (ocean)
      marqueeBg: '#1A4A5C', // Darker teal (deep ocean)
      text: '#1A3A4A', // Dark blue-teal (deep ocean, like water)
      textDark: '#0F2530', // Very dark teal (deepest ocean)
      muted: '#6B8FA8', // Medium teal-blue (muted accent)
      border: 'rgba(45, 95, 122, 0.3)', // Teal borders
      codeBg: '#E6D9F0', // Light purple for code blocks
      codeText: '#1A3A4A', // Dark teal code text
      primary: '#B85C2A', // Darker orange (sunset) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#C4622A', // Slightly lighter orange on hover
      primaryContrast: '#FFFFFF', // White text on orange buttons (meets 4.5:1 WCAG AA)
      link: '#A84F1F', // Dark orange links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#8B4513', // Very dark orange for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#B85C2A', // Orange focus ring
      accent: '#7FB8D4', // Teal accent (ocean teal, similar to accentAlt)
      accentAlt: '#8FC8E4', // Lighter teal accent (ocean teal) for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#1A4A5C', // Dark teal footer (deep ocean)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
      footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
      heroStart: '#7FB8D4', // Teal start (ocean teal)
      heroEnd: '#B85C2A', // Darker orange end (sunset)
      heroRadial: 'rgba(184, 92, 42, 0.15)', // Orange glow (sunset)
      campaignStart: '#B85C2A', // Darker orange (sunset)
      campaignEnd: '#7FB8D4', // Teal (ocean)
      authorBoxStart: 'rgba(230, 217, 240, 0.9)', // Light purple
      authorBoxEnd: 'rgba(255, 220, 200, 0.9)', // Light peach
      relatedSectionStart: 'rgba(255, 220, 200, 0.6)', // Light peach section
      relatedSectionEnd: 'rgba(240, 244, 248, 0.6)', // Soft blue section
      shadow: 'rgba(45, 95, 122, 0.25)', // Teal shadows
      shadowSubtle: 'rgba(45, 95, 122, 0.12)', // Subtle teal shadows
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    theme: {
      ...defaultTheme,
      bg: '#F5F5F5', // Light gray (bright sunlight areas)
      surface: '#E8E8E8', // Medium light gray (shaded areas)
      surfaceDark: '#1A1A1A', // Near black (deep shadows)
      marqueeBg: '#0F0F0F', // Pure black (deepest shadows)
      text: '#2D2D2D', // Dark gray (readable on light)
      textDark: '#0A0A0A', // Very dark gray (almost black)
      muted: '#6B6B6B', // Medium gray (muted accent)
      border: 'rgba(45, 45, 45, 0.3)', // Dark gray borders
      codeBg: '#E8E8E8', // Light gray for code blocks
      codeText: '#2D2D2D', // Dark gray code text
      primary: '#4A4A4A', // Dark gray for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#5A5A5A', // Slightly lighter gray on hover
      primaryContrast: '#FFFFFF', // White text on dark gray buttons (meets 4.5:1 WCAG AA)
      link: '#2D2D2D', // Dark gray links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#1A1A1A', // Very dark gray for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#4A4A4A', // Dark gray focus ring
      accent: '#6B6B6B', // Medium gray accent
      accentAlt: '#8B8B8B', // Light gray accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#1A1A1A', // Dark gray footer (deep shadows)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
      footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
      heroStart: '#4A4A4A', // Dark gray start
      heroEnd: '#1A1A1A', // Near black end
      heroRadial: 'rgba(255, 255, 255, 0.1)', // Subtle white glow
      campaignStart: '#4A4A4A', // Dark gray
      campaignEnd: '#2D2D2D', // Darker gray
      authorBoxStart: 'rgba(232, 232, 232, 0.9)', // Light gray
      authorBoxEnd: 'rgba(245, 245, 245, 0.9)', // Lighter gray
      relatedSectionStart: 'rgba(232, 232, 232, 0.6)', // Light gray section
      relatedSectionEnd: 'rgba(245, 245, 245, 0.6)', // Lighter gray section
      shadow: 'rgba(26, 26, 26, 0.25)', // Dark gray shadows
      shadowSubtle: 'rgba(26, 26, 26, 0.12)', // Subtle dark gray shadows
    },
  },
  {
    id: 'hatsune',
    name: 'Hatsune',
    theme: {
      ...defaultTheme,
      bg: '#E0F4FF', // Bright light blue (background gradient top)
      surface: '#D4E8FF', // Lighter blue (elevated surfaces)
      surfaceDark: '#1A1A1A', // Black (outfit accents, dark surfaces)
      marqueeBg: '#0F0F0F', // Near black (deepest shadows)
      text: '#1A1A1A', // Black text (readable on light blue)
      textDark: '#0A0A0A', // Very dark (almost black)
      muted: '#6B8FA8', // Medium blue-gray (muted accent)
      border: 'rgba(57, 197, 187, 0.3)', // Teal borders
      codeBg: '#D4E8FF', // Light blue for code blocks
      codeText: '#1A1A1A', // Black code text
      primary: '#1A7A73', // Darker teal for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#2A9D94', // Slightly lighter teal on hover
      primaryContrast: '#FFFFFF', // White text on teal buttons (meets 4.5:1 WCAG AA)
      link: '#1A5F5A', // Dark teal links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#0A2A27', // Very dark teal for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#1A7A73', // Darker teal focus ring
      accent: '#FF69B4', // Bright pink (hair ties)
      accentAlt: '#9B7BB8', // Soft purple (background gradient bottom)
      footerBg: '#1A1A1A', // Black footer (outfit accents)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(57, 197, 187, 0.2)', // Teal social bg
      footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
      heroStart: '#87CEEB', // Light blue start (background gradient top)
      heroEnd: '#9B7BB8', // Soft purple end (background gradient bottom)
      heroRadial: 'rgba(26, 122, 115, 0.2)', // Darker teal glow
      campaignStart: '#1A7A73', // Darker teal
      campaignEnd: '#FF69B4', // Bright pink (hair ties)
      authorBoxStart: 'rgba(212, 232, 255, 0.9)', // Light blue
      authorBoxEnd: 'rgba(155, 123, 184, 0.9)', // Soft purple
      relatedSectionStart: 'rgba(155, 123, 184, 0.6)', // Soft purple section
      relatedSectionEnd: 'rgba(224, 244, 255, 0.6)', // Light blue section
      shadow: 'rgba(57, 197, 187, 0.25)', // Teal shadows
      shadowSubtle: 'rgba(57, 197, 187, 0.12)', // Subtle teal shadows
    },
  },
  {
    id: 'trippie',
    name: 'Trippie',
    theme: {
      ...defaultTheme,
      bg: '#F0F5ED', // Light green-tinted white (green leaves, white background)
      surface: '#E8F0E0', // Light green surface (leaves)
      surfaceDark: '#1A1A1A', // Black (frame and dress)
      marqueeBg: '#0A0A0A', // Deep black (frame/dress)
      text: '#1A2416', // Very dark green-black (body text)
      textDark: '#000000', // Pure black (frame/dress, headings)
      muted: '#4A5D4A', // Medium green-grey (muted accent)
      border: 'rgba(34, 68, 34, 0.3)', // Dark green borders (leaves)
      codeBg: '#E8F0E0', // Light green for code blocks
      codeText: '#1A2416', // Dark green-black code text
      primary: '#2D5A2D', // Dark green (leaves) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#3D7A3D', // Brighter green on hover
      primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
      link: '#1A4A1A', // Very dark green links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#0A3A0A', // Darkest green for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#3D7A3D', // Green focus ring (leaves)
      accent: '#4A8A4A', // Medium green accent (leaves)
      accentAlt: '#5AAA5A', // Brighter green accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#000000', // Pure black (frame and dress)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(45, 90, 45, 0.15)', // Dark green social bg (leaves)
      footerBorder: 'rgba(45, 90, 45, 0.2)', // Dark green borders (leaves)
      heroStart: '#1A1A1A', // Black start (frame/dress)
      heroEnd: '#0A0A0A', // Deep black end
      heroRadial: 'rgba(45, 90, 45, 0.2)', // Green glow (leaves)
      campaignStart: '#2D5A2D', // Dark green (leaves)
      campaignEnd: '#1A4A1A', // Darker green
      authorBoxStart: 'rgba(232, 240, 224, 0.9)', // Light green
      authorBoxEnd: 'rgba(224, 232, 216, 0.9)', // Slightly darker green
      relatedSectionStart: 'rgba(224, 232, 216, 0.6)', // Green section
      relatedSectionEnd: 'rgba(240, 245, 237, 0.6)', // Light green section
      shadow: 'rgba(26, 52, 26, 0.25)', // Dark green shadows (leaves)
      shadowSubtle: 'rgba(26, 52, 26, 0.12)', // Subtle green shadows
    },
  },
  {
    id: 'scotland',
    name: 'Scotland',
    theme: {
      ...defaultTheme,
      bg: '#D4D8DC', // Pale grey-blue (overcast sky)
      surface: '#E8EAED', // Light grey-blue (elevated surfaces)
      surfaceDark: '#4A5568', // Dark blue-grey (river, mountains)
      marqueeBg: '#2D3748', // Darker blue-grey (deep shadows)
      text: '#2C2416', // Dark brown (readable on light)
      textDark: '#1A1309', // Very dark brown (almost black)
      muted: '#6B5D4F', // Medium brown-grey (muted accent)
      border: 'rgba(74, 85, 104, 0.3)', // Blue-grey borders
      codeBg: '#E8EAED', // Light grey-blue for code blocks
      codeText: '#2C2416', // Dark brown code text
      primary: '#8B5A3C', // Golden brown (heather/vegetation) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#A67C52', // Lighter brown on hover
      primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
      link: '#6B4423', // Dark brown links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#4A2E1A', // Very dark brown for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#8B5A3C', // Golden brown focus ring
      accent: '#5A7C4A', // Muted green (grass patches)
      accentAlt: '#D4A574', // Lighter golden tan (heather tones) for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#2D3748', // Dark blue-grey footer (mountains/river)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
      footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
      heroStart: '#4A5568', // Dark blue-grey start (mountains)
      heroEnd: '#2D3748', // Darker blue-grey end (deep shadows)
      heroRadial: 'rgba(139, 90, 60, 0.15)', // Golden brown glow
      campaignStart: '#8B5A3C', // Golden brown (heather)
      campaignEnd: '#5A7C4A', // Muted green (grass)
      authorBoxStart: 'rgba(232, 234, 237, 0.9)', // Light grey-blue
      authorBoxEnd: 'rgba(212, 216, 220, 0.9)', // Pale grey
      relatedSectionStart: 'rgba(212, 216, 220, 0.6)', // Pale grey section
      relatedSectionEnd: 'rgba(232, 234, 237, 0.6)', // Light grey-blue section
      shadow: 'rgba(74, 85, 104, 0.25)', // Blue-grey shadows
      shadowSubtle: 'rgba(74, 85, 104, 0.12)', // Subtle blue-grey shadows
    },
  },
  {
    id: 'pbr',
    name: 'PBR',
    theme: {
      ...defaultTheme,
      bg: '#F0F4FA', // Light blue-tinted white (PBR label with blue influence)
      surface: '#E8F0F8', // Light blue-tinted surface (metallic can with blue tint)
      surfaceDark: '#0A1A2D', // Dark blue background (dark blue instead of black)
      marqueeBg: '#0A1525', // Very dark blue background
      text: '#1A1A1A', // Dark text (readable on light)
      textDark: '#000000', // Black (headings)
      muted: '#4A5A6B', // Medium blue-grey (muted accent)
      border: 'rgba(0, 61, 165, 0.25)', // PBR blue borders
      codeBg: '#E8F0F8', // Light blue-tinted for code blocks
      codeText: '#1A1A1A', // Dark code text
      primary: '#003DA5', // PBR Blue (classic Pabst Blue Ribbon blue) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#0040C0', // Lighter blue on hover
      primaryContrast: '#FFFFFF', // White text on blue buttons (meets 4.5:1 WCAG AA)
      link: '#003DA5', // PBR blue links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#002D7A', // Darker blue for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#003DA5', // PBR blue focus ring
      accent: '#C41E1E', // Red (diagonal stripes on label)
      accentAlt: '#FF4D4D', // Brighter red accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#0A1525', // Dark blue background (dark blue instead of black)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(0, 61, 165, 0.2)', // Subtle blue social bg
      footerBorder: 'rgba(0, 61, 165, 0.25)', // Blue borders
      heroStart: '#0A1A2D', // Dark blue start
      heroEnd: '#0A1525', // Very dark blue end
      heroRadial: 'rgba(0, 61, 165, 0.2)', // PBR blue glow
      campaignStart: '#003DA5', // PBR blue
      campaignEnd: '#002D7A', // Darker blue
      authorBoxStart: 'rgba(240, 248, 255, 0.95)', // Light blue-tinted
      authorBoxEnd: 'rgba(232, 240, 248, 0.95)', // Slightly darker blue-tinted
      relatedSectionStart: 'rgba(232, 240, 248, 0.7)', // Blue-tinted section
      relatedSectionEnd: 'rgba(240, 248, 255, 0.7)', // Light blue-tinted section
      shadow: 'rgba(0, 61, 165, 0.2)', // PBR blue shadows
      shadowSubtle: 'rgba(0, 61, 165, 0.1)', // Subtle blue shadows
    },
  },
  {
    id: 'reeses',
    name: 'Reeses',
    theme: {
      ...defaultTheme,
      bg: '#FFF8F0', // Light orange-tinted white (Reese's Pieces box background)
      surface: '#FFE8D0', // Light orange surface (candy box orange)
      surfaceDark: '#1A0A00', // Dark brown-black (chocolate/peanut butter)
      marqueeBg: '#0A0500', // Very dark background
      text: '#2A1A0A', // Dark brown text (readable on light)
      textDark: '#1A0A00', // Very dark brown (headings)
      muted: '#8B6B3A', // Medium brown-orange (muted accent)
      border: 'rgba(255, 153, 0, 0.3)', // Orange borders
      codeBg: '#FFE8D0', // Light orange for code blocks
      codeText: '#2A1A0A', // Dark brown code text
      primary: '#B34D00', // Dark orange for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#CC5200', // Slightly lighter orange on hover
      primaryContrast: '#FFFFFF', // White text on orange buttons (meets 4.5:1 WCAG AA)
      link: '#993D00', // Very dark orange links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#803300', // Darkest orange for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#B34D00', // Orange focus ring
      accent: '#FFC107', // Yellow (Reese's Pieces logo yellow)
      accentAlt: '#FFD54F', // Lighter yellow accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#1A0A00', // Dark brown-black footer (chocolate/peanut butter)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 153, 0, 0.2)', // Subtle orange social bg
      footerBorder: 'rgba(255, 153, 0, 0.25)', // Orange borders
      heroStart: '#1A0A00', // Dark brown-black start
      heroEnd: '#0A0500', // Very dark brown-black end
      heroRadial: 'rgba(255, 153, 0, 0.15)', // Orange glow
      campaignStart: '#B34D00', // Dark orange
      campaignEnd: '#CC5200', // Darker orange
      authorBoxStart: 'rgba(255, 248, 240, 0.95)', // Light orange-tinted
      authorBoxEnd: 'rgba(255, 232, 208, 0.95)', // Slightly darker orange-tinted
      relatedSectionStart: 'rgba(255, 232, 208, 0.7)', // Orange-tinted section
      relatedSectionEnd: 'rgba(255, 248, 240, 0.7)', // Light orange-tinted section
      shadow: 'rgba(255, 102, 0, 0.2)', // Orange shadows
      shadowSubtle: 'rgba(255, 102, 0, 0.1)', // Subtle orange shadows
    },
  },
  {
    id: 'fallout',
    name: 'Fallout',
    theme: {
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
    },
  },
  {
    id: 'berge',
    name: 'Bergé',
    theme: {
      ...defaultTheme,
      bg: '#F0FFF0', // Light green-tinted white (bright green background)
      surface: '#E8FFE8', // Light green surface
      surfaceDark: '#0A2A0A', // Dark green (deep green background)
      marqueeBg: '#0A1A0A', // Very dark green background
      text: '#1A2A1A', // Dark green-black text (readable on light)
      textDark: '#000000', // Black (headings)
      muted: '#4A6B4A', // Medium green-grey (muted accent)
      border: 'rgba(0, 128, 0, 0.25)', // Green borders
      codeBg: '#E8FFE8', // Light green for code blocks
      codeText: '#1A2A1A', // Dark green-black code text
      primary: '#1F7A1F', // Darker forest green for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#228B22', // Lighter green on hover
      primaryContrast: '#FFFFFF', // White text on green buttons (meets 4.5:1 WCAG AA)
      link: '#1A7A1A', // Darker green links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#0A5A0A', // Very dark green for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#1F7A1F', // Darker forest green focus ring
      accent: '#FF1493', // Hot pink (accent color - top/dress)
      accentAlt: '#FF6B9D', // Lighter pink accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#0A2A0A', // Dark green footer
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 20, 147, 0.2)', // Subtle hot pink social bg (accent)
      footerBorder: 'rgba(255, 20, 147, 0.25)', // Hot pink borders (accent)
      heroStart: '#0A2A0A', // Dark green start
      heroEnd: '#0A1A0A', // Very dark green end
      heroRadial: 'rgba(31, 122, 31, 0.15)', // Green glow
      campaignStart: '#1F7A1F', // Darker forest green
      campaignEnd: '#1A7A1A', // Darker green
      authorBoxStart: 'rgba(240, 255, 240, 0.95)', // Light green-tinted
      authorBoxEnd: 'rgba(232, 255, 232, 0.95)', // Slightly darker green-tinted
      relatedSectionStart: 'rgba(232, 255, 232, 0.7)', // Green-tinted section
      relatedSectionEnd: 'rgba(240, 255, 240, 0.7)', // Light green-tinted section
      shadow: 'rgba(34, 139, 34, 0.2)', // Green shadows
      shadowSubtle: 'rgba(34, 139, 34, 0.1)', // Subtle green shadows
    },
  },
  {
    id: 'samson',
    name: 'Samson',
    theme: {
      ...defaultTheme,
      bg: '#2A1A0A', // Dark brown-orange (ancient desert background)
      surface: '#3D2815', // Darker brown-orange surface (weathered tones)
      surfaceDark: '#1A0F05', // Very dark brown-black (deep shadows)
      marqueeBg: '#0F0A05', // Deepest dark (ancient black)
      text: '#F5D4A0', // Warm cream/ochre text (desert sand, readable on dark)
      textDark: '#FFE8C8', // Lighter cream for headings (ancient parchment)
      muted: '#B89D7A', // Muted brown-orange (aged metal, chains)
      border: 'rgba(184, 92, 42, 0.3)', // Dark orange borders (rust, aged)
      codeBg: '#3D2815', // Dark brown-orange for code blocks
      codeText: '#F5D4A0', // Warm cream code text
      primary: '#B85C2A', // Dark orange (fire, desert sun) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#C4622A', // Slightly lighter orange on hover
      primaryContrast: '#FFFFFF', // White text on orange buttons (meets 4.5:1 WCAG AA)
      link: '#D4A574', // Light tan links for better contrast on dark background (meets 4.5:1 WCAG AA)
      blogLink: '#E8C4A0', // Lighter tan for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#B85C2A', // Dark orange focus ring
      accent: '#FF8C42', // Bright orange accent (flame, sunset)
      accentAlt: '#FFA55C', // Lighter orange accent for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#0F0A05', // Deepest dark brown-black footer (ancient black)
      footerTextMuted: 'rgba(245, 212, 160, 0.75)', // Muted warm cream text
      footerTextSubtle: 'rgba(245, 212, 160, 0.70)', // Brighter subtle warm cream text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(184, 92, 42, 0.2)', // Subtle dark orange social bg
      footerBorder: 'rgba(184, 92, 42, 0.25)', // Dark orange borders
      heroStart: '#3D2815', // Dark brown-orange start (ancient desert)
      heroEnd: '#1A0F05', // Very dark brown-black end (deep shadows)
      heroRadial: 'rgba(184, 92, 42, 0.2)', // Dark orange glow (fire, sunset)
      campaignStart: '#B85C2A', // Dark orange (desert sun)
      campaignEnd: '#8B4513', // Saddle brown (earth, skulls)
      authorBoxStart: 'rgba(61, 40, 21, 0.9)', // Dark brown-orange
      authorBoxEnd: 'rgba(42, 26, 10, 0.9)', // Darker brown-orange
      relatedSectionStart: 'rgba(42, 26, 10, 0.7)', // Dark brown-orange section
      relatedSectionEnd: 'rgba(61, 40, 21, 0.7)', // Lighter brown-orange section
      shadow: 'rgba(184, 92, 42, 0.4)', // Dark orange shadows (fire glow)
      shadowSubtle: 'rgba(184, 92, 42, 0.2)', // Subtle orange shadows
    },
  },
  {
    id: 'companion',
    name: 'Companion',
    theme: {
      ...defaultTheme,
      bg: '#F5E6D3', // Warm cream/beige (highway, desert road)
      surface: '#E8D4C0', // Light tan surface (weathered road)
      surfaceDark: '#4A3A2A', // Dark brown (road shadows, asphalt)
      marqueeBg: '#3A2A1A', // Darker brown (deep road shadows)
      text: '#2A1A0A', // Dark brown text (readable on light)
      textDark: '#1A0F05', // Very dark brown (headings)
      muted: '#8B7355', // Medium brown (muted accent, aged signs)
      border: 'rgba(74, 58, 42, 0.3)', // Brown borders
      codeBg: '#E8D4C0', // Light tan for code blocks
      codeText: '#2A1A0A', // Dark brown code text
      primary: '#8B5A3C', // Warm brown (road, desert) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#A67C52', // Lighter brown on hover
      primaryContrast: '#FFFFFF', // White text on brown buttons (meets 4.5:1 WCAG AA)
      link: '#5A3A2A', // Dark brown links for better contrast on light background (meets 4.5:1 WCAG AA)
      blogLink: '#4A2A1A', // Very dark brown for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#8B5A3C', // Warm brown focus ring
      accent: '#87CEEB', // Sky blue accent (highway sky)
      accentAlt: '#FF8C42', // Bright orange accent (sunset, desert sun) for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#3A2A1A', // Dark brown footer (road shadows)
      footerTextMuted: 'rgba(255, 255, 255, 0.75)', // Muted white text
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)', // Subtle white text
      footerSocialBg: 'rgba(255, 255, 255, 0.12)', // Subtle white social bg
      footerBorder: 'rgba(255, 255, 255, 0.15)', // White borders
      heroStart: '#6B5A4A', // Medium brown start (road, desert)
      heroEnd: '#4A3A2A', // Dark brown end (road shadows)
      heroRadial: 'rgba(184, 92, 42, 0.15)', // Orange glow (sunset)
      campaignStart: '#8B5A3C', // Warm brown (road)
      campaignEnd: '#6B4A3A', // Darker brown
      authorBoxStart: 'rgba(232, 212, 192, 0.9)', // Light tan
      authorBoxEnd: 'rgba(245, 230, 211, 0.9)', // Warm cream
      relatedSectionStart: 'rgba(232, 212, 192, 0.6)', // Light tan section
      relatedSectionEnd: 'rgba(245, 230, 211, 0.6)', // Warm cream section
      shadow: 'rgba(74, 58, 42, 0.25)', // Brown shadows
      shadowSubtle: 'rgba(74, 58, 42, 0.12)', // Subtle brown shadows
    },
  },
  {
    id: 'gusto',
    name: 'Gusto',
    theme: {
      ...defaultTheme,
      bg: '#1A0A1A', // Deep dark magenta-black (bold artistic background)
      surface: '#2A1A2A', // Dark magenta surface (abstract background base)
      surfaceDark: '#0F050F', // Very dark magenta-black (deep shadows)
      marqueeBg: '#0A050A', // Deepest dark (artistic depth)
      text: '#FFE8F0', // Light pink-white text (readable on dark, matches white hair)
      textDark: '#FFFFFF', // Pure white (hair, highlights)
      muted: '#C8A0B8', // Muted magenta (grayscale face tones)
      border: 'rgba(255, 140, 0, 0.4)', // Bright orange borders (background orange)
      codeBg: '#2A1A2A', // Dark magenta for code blocks
      codeText: '#FFE8F0', // Light pink-white code text
      primary: '#8B008B', // Deep magenta/fuchsia (background left) for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#A020A0', // Brighter magenta on hover
      primaryContrast: '#FFFFFF', // White text on magenta buttons (meets 4.5:1 WCAG AA)
      link: '#FF8C00', // Bright orange links (background orange) for better contrast on dark background (meets 4.5:1 WCAG AA)
      blogLink: '#FFA500', // Lighter orange for blog links to meet contrast on author box gradient (meets 4.5:1 WCAG AA)
      focus: '#FF8C00', // Bright orange focus ring
      accent: '#32CD32', // Vibrant green accent (leaf shape) for better contrast on dark background (meets 4.5:1 WCAG AA)
      accentAlt: '#FFD700', // Bright yellow/orange accent (yellow streaks) for better contrast on dark footer (meets 4.5:1 WCAG AA)
      footerBg: '#0A050A', // Deepest dark magenta-black footer
      footerTextMuted: 'rgba(255, 232, 240, 0.75)', // Muted light pink text
      footerTextSubtle: 'rgba(255, 232, 240, 0.70)', // Brighter subtle light pink text (meets 4.5:1 WCAG AA)
      footerSocialBg: 'rgba(255, 140, 0, 0.2)', // Subtle orange social bg
      footerBorder: 'rgba(255, 140, 0, 0.3)', // Orange borders
      heroStart: '#8B008B', // Deep magenta start (background left)
      heroEnd: '#4B0082', // Deep purple end (top background hints)
      heroRadial: 'rgba(255, 140, 0, 0.25)', // Orange glow (bright orange area)
      campaignStart: '#FF8C00', // Bright orange (background orange)
      campaignEnd: '#8B008B', // Deep magenta (background left)
      authorBoxStart: 'rgba(42, 26, 42, 0.9)', // Dark magenta
      authorBoxEnd: 'rgba(26, 10, 26, 0.9)', // Darker magenta-black
      relatedSectionStart: 'rgba(26, 10, 26, 0.7)', // Dark magenta-black section
      relatedSectionEnd: 'rgba(42, 26, 42, 0.7)', // Lighter dark magenta section
      shadow: 'rgba(139, 0, 139, 0.4)', // Deep magenta shadows
      shadowSubtle: 'rgba(255, 140, 0, 0.2)', // Subtle orange shadows
    },
  },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage on mount (prevents flicker)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...defaultTheme, ...parsed };
        } catch {
          return defaultTheme;
        }
      }
    }
    return defaultTheme;
  });

  const [presets, setPresets] = useState<Preset[]>(() => {
    // Load custom presets from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return [...builtInPresets, ...parsed];
        } catch {
          return builtInPresets;
        }
      }
    }
    return builtInPresets;
  });

  const [currentPresetId, setCurrentPresetId] = useState<string | null>(() => {
    // Try to determine current preset ID from saved theme
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Find matching preset
          const allPresets = [...builtInPresets];
          const savedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
          if (savedPresets) {
            try {
              allPresets.push(...JSON.parse(savedPresets));
            } catch {}
          }
          const matchingPreset = allPresets.find((p) => {
            return Object.keys(p.theme).every((key) => {
              return p.theme[key as keyof Theme] === parsed[key as keyof Theme];
            });
          });
          return matchingPreset?.id || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...updates };
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    setCurrentPresetId(null);
    localStorage.removeItem(STORAGE_KEY);
    // Reapply default theme to DOM
    applyThemeToDom(defaultTheme);
  };

  const exportTheme = () => {
    return JSON.stringify(theme, null, 2);
  };

  const importTheme = (themeJson: string) => {
    try {
      const parsed = JSON.parse(themeJson);
      const updated = { ...defaultTheme, ...parsed };
      setTheme(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      applyThemeToDom(updated);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };

  const savePreset = (name: string, themeToSave?: Theme) => {
    const themeForPreset = themeToSave || theme;
    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name,
      theme: { ...themeForPreset },
    };
    const customPresets = presets.filter((p) => !builtInPresets.find((bp) => bp.id === p.id));
    const updated = [...builtInPresets, ...customPresets, newPreset];
    setPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customPresets.concat(newPreset)));
  };

  const loadPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setTheme(preset.theme);
      setCurrentPresetId(presetId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset.theme));
      applyThemeToDom(preset.theme);
    }
  };

  const deletePreset = (presetId: string) => {
    // Don't allow deleting built-in presets
    if (builtInPresets.find((p) => p.id === presetId)) {
      return;
    }
    const customPresets = presets.filter((p) => p.id !== presetId && !builtInPresets.find((bp) => bp.id === p.id));
    const updated = [...builtInPresets, ...customPresets];
    setPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customPresets));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        exportTheme,
        importTheme,
        presets,
        savePreset,
        loadPreset,
        deletePreset,
        currentPresetId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


