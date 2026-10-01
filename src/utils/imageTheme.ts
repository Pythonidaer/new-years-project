import Color from 'color';
import type { Theme } from '@/context/themes/types';
import { checkContrastIssues } from '@/utils/contrast';
import type { ContrastIssue } from '@/utils/contrast';

export type RgbPixel = {
  r: number;
  g: number;
  b: number;
};

type Bucket = {
  r: number;
  g: number;
  b: number;
  count: number;
};

type RoleColors = {
  bg: string;
  text: string;
  primary: string;
  accent: string;
  accentAlt: string;
  light: boolean;
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_SWATCHES = 5;
const SAMPLE_MAX_EDGE = 256;
const MERGE_DISTANCE = 48;
const AA_RATIO = 4.5;

const FOREGROUND_KEYS: Record<string, keyof Theme> = {
  'Text on Background': 'text',
  'Primary Contrast on Primary': 'primaryContrast',
  'Text Dark on Background': 'textDark',
  'Primary Contrast on Surface Dark': 'primaryContrast',
  'Text on Surface': 'text',
  'Code Text on Code Background': 'codeText',
  'Link on Background': 'link',
  'Blog Link on Background': 'blogLink',
  'Primary Contrast on Footer Background': 'primaryContrast',
  'Accent Alt on Footer Background': 'accentAlt',
  'Card Link (Link) on Card Background': 'link',
  'Author Role Text (75% opacity) on Surface Background': 'text',
  'Date Text (75% opacity) on Card Background': 'text',
  'Excerpt Text (80% opacity) on Card Background': 'text',
  'Footer Text Muted on Footer Background': 'footerTextMuted',
  'Footer Text Subtle on Footer Background': 'footerTextSubtle',
  'Primary Contrast on Footer Social Background': 'primaryContrast',
  'Category Link on Blog Card Background': 'footerTextMuted',
  'Text Dark on Author Box Gradient': 'textDark',
  'Text on Author Box Gradient': 'text',
  'Blog Link on Author Box Gradient': 'blogLink',
  'Text on Related Section Gradient': 'text',
  'Accent on Hero Gradient': 'accent',
};

function quantize(value: number): number {
  return Math.min(255, Math.round(value / 16) * 16);
}

function addPixel(buckets: Map<string, Bucket>, pixel: RgbPixel): void {
  const r = quantize(pixel.r);
  const g = quantize(pixel.g);
  const b = quantize(pixel.b);
  const key = `${r},${g},${b}`;
  const existing = buckets.get(key);
  if (!existing) {
    buckets.set(key, {
      r: pixel.r,
      g: pixel.g,
      b: pixel.b,
      count: 1,
    });
    return;
  }
  existing.r += pixel.r;
  existing.g += pixel.g;
  existing.b += pixel.b;
  existing.count += 1;
}

function averageBucket(bucket: Bucket): RgbPixel {
  return {
    r: bucket.r / bucket.count,
    g: bucket.g / bucket.count,
    b: bucket.b / bucket.count,
  };
}

function colorDistance(left: RgbPixel, right: RgbPixel): number {
  const dr = left.r - right.r;
  const dg = left.g - right.g;
  const db = left.b - right.b;
  return Math.sqrt((dr * dr) + (dg * dg) + (db * db));
}

function toHex(pixel: RgbPixel): string {
  const channel = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, '0');
  return `#${channel(pixel.r)}${channel(pixel.g)}${channel(pixel.b)}`;
}

function isNearExisting(kept: Bucket[], bucket: Bucket): boolean {
  const average = averageBucket(bucket);
  return kept.some((item) => colorDistance(averageBucket(item), average) < MERGE_DISTANCE);
}

function mergeNearDuplicates(ranked: Bucket[]): string[] {
  const kept: Bucket[] = [];
  ranked.forEach((bucket) => {
    const room = kept.length < MAX_SWATCHES;
    const duplicate = isNearExisting(kept, bucket);
    if (room && !duplicate) {
      kept.push(bucket);
    }
  });
  return kept.map((bucket) => toHex(averageBucket(bucket)));
}

export function extractDominantColors(pixels: RgbPixel[]): string[] {
  if (pixels.length === 0) {
    return [];
  }
  const buckets = new Map<string, Bucket>();
  pixels.forEach((pixel) => addPixel(buckets, pixel));
  const ranked = [...buckets.values()].sort((left, right) => right.count - left.count);
  return mergeNearDuplicates(ranked);
}

function luminosity(hex: string): number {
  return Color(hex).luminosity();
}

function byLuminance(colors: string[]): string[] {
  return [...colors].sort((left, right) => luminosity(left) - luminosity(right));
}

function averageLuminance(colors: string[]): number {
  const total = colors.reduce((sum, hex) => sum + luminosity(hex), 0);
  return total / colors.length;
}

function saturationOf(hex: string): number {
  return Color(hex).saturationl();
}

function hueDistance(left: string, right: string): number {
  const diff = Math.abs(Color(left).hue() - Color(right).hue());
  return Math.min(diff, 360 - diff);
}

function isNeutral(hex: string): boolean {
  return saturationOf(hex) < 15;
}

function pickPrimary(colors: string[], reserved: string[]): string {
  const vivid = colors.filter((hex) => !reserved.includes(hex) && !isNeutral(hex));
  const unused = colors.filter((hex) => !reserved.includes(hex));
  const pool = vivid.length > 0 ? vivid : unused;
  const source = pool.length > 0 ? pool : colors;
  return [...source].sort((left, right) => saturationOf(right) - saturationOf(left))[0];
}

function rotateHue(hex: string, degrees: number): string {
  return Color(hex).rotate(degrees).hex();
}

function pickAccent(colors: string[], used: string[], fallback: string): string {
  const anchor = used[used.length - 1] ?? fallback;
  const candidate = colors.find((hex) => (
    !used.includes(hex) && hueDistance(hex, anchor) > 28 && !isNeutral(hex)
  ));
  return candidate ?? rotateHue(fallback, 36);
}

function shiftUntil(
  hex: string,
  stillNeedsShift: (_current: ReturnType<typeof Color>) => boolean,
  lighten: boolean,
): string {
  const lockedHue = Color(hex).hue();
  let next = Color(hex);
  let steps = 0;
  while (stillNeedsShift(next) && steps < 18) {
    const shifted = lighten ? next.lighten(0.06) : next.darken(0.06);
    next = shifted.hue(lockedHue);
    steps += 1;
  }
  return next.hex();
}

function readableText(candidate: string, bg: string, lightBackground: boolean): string {
  const background = Color(bg);
  return shiftUntil(
    candidate,
    (current) => current.contrast(background) < AA_RATIO,
    !lightBackground,
  );
}

function darkEnoughForWhite(hex: string): string {
  return shiftUntil(hex, (current) => Color('#ffffff').contrast(current) < AA_RATIO, false);
}

function lightEnoughOn(hex: string, bg: string): string {
  const background = Color(bg);
  return shiftUntil(hex, (current) => current.contrast(background) < AA_RATIO, true);
}

function contrastInk(bg: string): string {
  const whiteRatio = Color('#ffffff').contrast(Color(bg));
  const inkRatio = Color('#111111').contrast(Color(bg));
  return whiteRatio >= inkRatio ? '#ffffff' : '#111111';
}

function assignRoles(colors: string[]): RoleColors {
  const sorted = byLuminance(colors);
  const lightest = sorted[sorted.length - 1];
  const darkest = sorted[0];
  const light = averageLuminance(colors) >= 0.45;
  const bg = light ? lightest : darkest;
  const textSource = light ? darkest : lightest;
  const text = readableText(textSource, bg, light);
  const primarySource = pickPrimary(colors, [bg]);
  const primary = darkEnoughForWhite(primarySource);
  const accent = pickAccent(colors, [bg, primarySource], primarySource);
  const accentAlt = pickAccent(colors, [bg, primarySource, accent], accent);
  return {
    bg,
    text,
    primary,
    accent,
    accentAlt,
    light,
  };
}

function mix(base: string, other: string, weight: number): string {
  return Color(base).mix(Color(other), weight).hex();
}

function fade(hex: string, alpha: number): string {
  return Color(hex).alpha(alpha).rgb().string();
}

function shade(hex: string, lightBackground: boolean, amount: number): string {
  const parsed = Color(hex);
  return (lightBackground ? parsed.darken(amount) : parsed.lighten(amount)).hex();
}

function footerBackground(text: string, bg: string, light: boolean): string {
  const source = light ? Color(text).darken(0.2) : Color(bg).darken(0.25);
  return darkEnoughForWhite(source.hex());
}

function themeFromRoles(roles: RoleColors): Theme {
  const { bg, text, primary, accent, light } = roles;
  const surface = shade(bg, light, 0.05);
  const footerBg = footerBackground(text, bg, light);
  const footerInk = contrastInk(footerBg);
  const link = readableText(primary, bg, light);

  return {
    bg,
    surface,
    surfaceDark: darkEnoughForWhite(shade(bg, true, 0.45)),
    marqueeBg: mix(bg, primary, 0.12),
    text,
    textDark: shade(text, light, 0.12),
    muted: mix(text, bg, 0.35),
    border: fade(text, 0.2),
    codeBg: mix(bg, text, 0.08),
    codeText: text,
    primary,
    primaryHover: Color(primary).lighten(0.08).hex(),
    primaryContrast: '#ffffff',
    blogLink: link,
    link,
    focus: link,
    accent,
    accentAlt: lightEnoughOn(roles.accentAlt, footerBg),
    footerBg,
    footerTextMuted: fade(footerInk, 0.85),
    footerTextSubtle: fade(footerInk, 0.75),
    footerSocialBg: fade(footerInk, 0.12),
    footerBorder: fade(footerInk, 0.12),
    heroStart: mix(bg, primary, 0.35),
    heroEnd: mix(bg, accent, 0.2),
    heroRadial: fade(primary, 0.18),
    campaignStart: primary,
    campaignEnd: Color(primary).darken(0.12).hex(),
    authorBoxStart: fade(surface, 0.94),
    authorBoxEnd: fade(mix(surface, bg, 0.4), 0.94),
    relatedSectionStart: fade(surface, 0.85),
    relatedSectionEnd: fade(bg, 0.85),
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowSubtle: 'rgba(0, 0, 0, 0.2)',
  };
}

export function buildThemeFromPalette(colors: string[]): Theme {
  const source = colors.length > 0 ? colors : ['#888888'];
  return themeFromRoles(assignRoles(source));
}

function issueBackgrounds(background: string): string[] {
  const match = background.match(/^gradient\((.+) → (.+)\)$/);
  if (!match) {
    return [background];
  }
  return [match[1], match[2]];
}

function safeContrast(color: string, background: string): number {
  try {
    return Color(color).contrast(Color(background));
  } catch (error) {
    console.warn('Failed to compare colors while adjusting contrast:', error);
    return 1;
  }
}

function worstContrast(color: string, backgrounds: string[]): number {
  return backgrounds.reduce((minRatio, background) => (
    Math.min(minRatio, safeContrast(color, background))
  ), 21);
}

function withSameAlpha(source: string, shifted: ReturnType<typeof Color>): string {
  const alpha = Color(source).alpha();
  if (alpha < 1) {
    return shifted.alpha(alpha).rgb().string();
  }
  return shifted.hex();
}

function shiftLightness(color: string, lighten: boolean): string {
  const parsed = Color(color);
  const shifted = lighten ? parsed.lighten(0.08) : parsed.darken(0.08);
  return withSameAlpha(color, shifted.hue(parsed.hue()));
}

function nudgeForeground(color: string, backgrounds: string[]): string {
  const away = luminosity(color) >= luminosity(backgrounds[0]);
  const preferred = shiftLightness(color, away);
  if (worstContrast(preferred, backgrounds) > worstContrast(color, backgrounds) + 0.05) {
    return preferred;
  }
  const opposite = shiftLightness(color, !away);
  if (worstContrast(opposite, backgrounds) > worstContrast(color, backgrounds) + 0.05) {
    return opposite;
  }
  return color;
}

function applyIssueNudges(theme: Theme, issues: ContrastIssue[]): Theme {
  return issues.reduce((next, issue) => {
    const key = FOREGROUND_KEYS[issue.pair];
    if (!key) {
      return next;
    }
    const updated = nudgeForeground(next[key], issueBackgrounds(issue.background));
    return { ...next, [key]: updated };
  }, theme);
}

function sameTheme(left: Theme, right: Theme): boolean {
  return (Object.keys(left) as (keyof Theme)[]).every((key) => left[key] === right[key]);
}

export function ensureThemeContrast(theme: Theme): Theme {
  let current = theme;
  for (let pass = 0; pass < 12; pass += 1) {
    const issues = checkContrastIssues(current).filter((issue) => issue.level === 'Fail');
    if (issues.length === 0) {
      return current;
    }
    const nudged = applyIssueNudges(current, issues);
    if (sameTheme(nudged, current)) {
      return current;
    }
    current = nudged;
  }
  return current;
}

export function imageFileError(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Choose an image file.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 20 MB or smaller.';
  }
  return null;
}

export function scaledSize(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest === 0) {
    return { width: Math.max(width, 1), height: Math.max(height, 1) };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function pixelsFromImageData(data: Uint8ClampedArray): RgbPixel[] {
  const pixels: RgbPixel[] = [];
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) {
      continue;
    }
    pixels.push({
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    });
  }
  return pixels;
}

function loadImage(image: HTMLImageElement, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Could not read image.'));
    image.src = url;
  });
}

function releaseImage(image: HTMLImageElement): void {
  image.onload = null;
  image.onerror = null;
  image.src = '';
}

function drawPixels(image: HTMLImageElement): RgbPixel[] {
  const size = scaledSize(image.naturalWidth, image.naturalHeight, SAMPLE_MAX_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not read image.');
  }
  context.drawImage(image, 0, 0, size.width, size.height);
  const { data } = context.getImageData(0, 0, size.width, size.height);
  return pixelsFromImageData(data);
}

export async function readImagePixels(file: File): Promise<RgbPixel[]> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    await loadImage(image, url);
    return drawPixels(image);
  } finally {
    releaseImage(image);
    URL.revokeObjectURL(url);
  }
}

export function themeFromPixels(pixels: RgbPixel[]): { theme: Theme; swatches: string[] } {
  const swatches = extractDominantColors(pixels);
  const source = swatches.length > 0 ? swatches : ['#888888'];
  return {
    theme: ensureThemeContrast(buildThemeFromPalette(source)),
    swatches: source,
  };
}

export function themeCssVar(key: string): string {
  return `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

export function applyThemePreview(theme: Theme): void {
  const root = document.getElementById('root');
  if (!root) {
    return;
  }
  (Object.keys(theme) as (keyof Theme)[]).forEach((key) => {
    root.style.setProperty(themeCssVar(key), theme[key]);
  });
  // Body reads --color-bg from the document element, which sits outside #root.
  document.documentElement.style.setProperty('--color-bg', theme.bg);
}
