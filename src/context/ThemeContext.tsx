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
const mark43Theme: Theme = {
  bg: '#ffffff',
  surface: '#f6f7f9',
  surfaceDark: 'rgb(36, 54, 78)',
  marqueeBg: '#0f2036',
  text: '#24364e',
  textDark: '#0b1f33',
  muted: '#555555',
  border: 'rgba(36, 54, 78, 0.25)',
  codeBg: '#f6f7f9',
  codeText: '#24364e',
  primary: '#d34120',
  primaryHover: '#e07962',
  primaryContrast: '#ffffff',
  blogLink: '#134dd1',
  link: '#d34120',
  focus: '#93c5fd',
  accent: '#f5b027',
  accentAlt: '#ffac12',
  footerBg: '#0a1a2a',
  footerTextMuted: 'rgba(255, 255, 255, 0.7)',
  footerTextSubtle: 'rgba(255, 255, 255, 0.6)',
  footerSocialBg: 'rgba(255, 255, 255, 0.1)',
  footerBorder: 'rgba(255, 255, 255, 0.1)',
  heroStart: '#152a44',
  heroEnd: '#0f2036',
  heroRadial: 'rgba(255, 255, 255, 0.08)',
  campaignStart: '#134dd1',
  campaignEnd: '#2962ff',
  authorBoxStart: 'rgba(242, 242, 242, 0.57)',
  authorBoxEnd: 'rgba(180, 199, 207, 0.57)',
  relatedSectionStart: 'rgba(180, 199, 207, 0.4)',
  relatedSectionEnd: 'rgba(255, 255, 255, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.16)',
  shadowSubtle: 'rgba(0, 0, 0, 0.08)',
};

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
  {
    id: 'mark43',
    name: 'Mark43',
    theme: mark43Theme,
  },
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
      footerTextMuted: 'rgba(255, 255, 255, 0.75)',
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
      bg: '#ffffff',
      surface: '#f8f8f8',
      surfaceDark: '#4f46e5', // Darker indigo for better contrast (meets 4.5:1 WCAG AA)
      marqueeBg: '#4338ca',
      text: '#1a1a1a',
      textDark: '#0a0a0a',
      muted: '#6b7280',
      border: 'rgba(26, 26, 26, 0.15)',
      codeBg: '#f8f8f8',
      codeText: '#1a1a1a',
      primary: '#4f46e5', // Darker indigo for better contrast with white text (meets 4.5:1 WCAG AA)
      primaryHover: '#6366f1',
      primaryContrast: '#ffffff',
      link: '#4f46e5', // Darker indigo for contrast
      blogLink: '#4f46e5',
      focus: '#818cf8',
      accent: '#f59e0b', // Orange (rainbow)
      accentAlt: '#ec4899', // Pink (rainbow)
      footerBg: '#1e1b4b', // Deep indigo
      footerTextMuted: 'rgba(255, 255, 255, 0.75)',
      footerTextSubtle: 'rgba(255, 255, 255, 0.65)',
      footerSocialBg: 'rgba(255, 255, 255, 0.12)',
      footerBorder: 'rgba(255, 255, 255, 0.12)',
      heroStart: '#ef4444', // Red (rainbow)
      heroEnd: '#f59e0b', // Orange (rainbow)
      heroRadial: 'rgba(236, 72, 153, 0.15)', // Pink glow
      campaignStart: '#10b981', // Green (rainbow)
      campaignEnd: '#3b82f6', // Blue (rainbow)
      authorBoxStart: 'rgba(248, 248, 248, 0.8)',
      authorBoxEnd: 'rgba(236, 72, 153, 0.15)', // Subtle pink tint (rainbow)
      relatedSectionStart: 'rgba(255, 255, 255, 1)', // Pure white for maximum contrast
      relatedSectionEnd: 'rgba(255, 255, 255, 1)', // Pure white for maximum contrast
      shadow: 'rgba(99, 102, 241, 0.15)',
      shadowSubtle: 'rgba(99, 102, 241, 0.08)',
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


