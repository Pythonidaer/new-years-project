import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Color from 'color';
import { defaultTheme } from '@/context/themes/default';
import { checkContrastIssues } from '@/utils/contrast';
import {
  extractDominantColors,
  buildThemeFromPalette,
  ensureThemeContrast,
  imageFileError,
  scaledSize,
  pixelsFromImageData,
  readImagePixels,
  themeFromPixels,
  applyThemePreview,
} from '@/utils/imageTheme';
import type { Theme } from '@/context/themes/types';

const COLOR_PATTERN = /^(#|rgba?\()/;

function fill(count: number, r: number, g: number, b: number) {
  return Array.from({ length: count }, () => ({ r, g, b }));
}

describe('extractDominantColors', () => {
  it('returns the dominant colors and drops near-duplicates', () => {
    const pixels = [
      ...fill(50, 255, 0, 0),
      ...fill(30, 250, 5, 5),
      ...fill(40, 0, 0, 255),
      ...fill(10, 0, 180, 0),
    ];

    const colors = extractDominantColors(pixels);

    expect(colors).toHaveLength(3);
    expect(Color(colors[0]).red()).toBeGreaterThan(200);
    expect(Color(colors[0]).green()).toBeLessThan(40);
    expect(Color(colors[1]).blue()).toBeGreaterThan(200);
    expect(colors.filter((hex) => Color(hex).red() > 200 && Color(hex).blue() < 40)).toHaveLength(1);
  });

  it('returns an empty list when there are no pixels', () => {
    expect(extractDominantColors([])).toEqual([]);
  });

  it('keeps the five most common colors', () => {
    const pixels = [
      ...fill(60, 255, 0, 0),
      ...fill(50, 0, 0, 255),
      ...fill(40, 0, 255, 0),
      ...fill(30, 255, 255, 0),
      ...fill(20, 0, 255, 255),
      ...fill(10, 255, 0, 255),
    ];

    const colors = extractDominantColors(pixels);

    expect(colors).toHaveLength(5);
    expect(Color(colors[0]).red()).toBeGreaterThan(200);
    expect(Color(colors[0]).blue()).toBeLessThan(40);
    const keptMagenta = colors.some((hex) => (
      Color(hex).red() > 200 && Color(hex).blue() > 200 && Color(hex).green() < 40
    ));
    expect(keptMagenta).toBe(false);
  });
});

describe('buildThemeFromPalette', () => {
  const themeKeys = Object.keys(defaultTheme) as (keyof Theme)[];

  it('maps a light palette to a light background, dark text, and the saturated accent', () => {
    const theme = buildThemeFromPalette(['#F7F3EA', '#E8DCC8', '#C4A882', '#E07A3D']);

    expect(Color(theme.bg).hex().toLowerCase()).toBe('#f7f3ea');
    expect(Color(theme.text).luminosity()).toBeLessThan(0.25);
    expect(Color(theme.text).contrast(Color(theme.bg))).toBeGreaterThanOrEqual(4.5);
    expect(Math.abs(Color(theme.primary).hue() - Color('#E07A3D').hue())).toBeLessThan(12);
    themeKeys.forEach((key) => {
      expect(theme[key]).toMatch(COLOR_PATTERN);
    });
  });

  it('maps a dark palette to a dark background, light text, and the saturated accent', () => {
    const theme = buildThemeFromPalette(['#0A0E1A', '#1A2332', '#2D6BB8', '#E8ECF0']);

    expect(Color(theme.bg).hex().toLowerCase()).toBe('#0a0e1a');
    expect(Color(theme.text).luminosity()).toBeGreaterThan(0.7);
    expect(Math.abs(Color(theme.primary).hue() - Color('#2D6BB8').hue())).toBeLessThan(12);
    themeKeys.forEach((key) => {
      expect(theme[key]).toMatch(COLOR_PATTERN);
    });
  });
});

describe('ensureThemeContrast', () => {
  it('darkens text until text on background is no longer a failure', () => {
    const failing: Theme = {
      ...defaultTheme,
      bg: '#ffffff',
      surface: '#fafafa',
      text: '#f2f2f2',
      textDark: '#eeeeee',
    };

    const fixed = ensureThemeContrast(failing);
    const issues = checkContrastIssues(fixed);

    expect(issues.some((issue) => issue.pair === 'Text on Background')).toBe(false);
    expect(Color(fixed.text).hue()).toBe(Color(failing.text).hue());
  });

  it('adjusts the hero accent until it contrasts with the hero gradient', () => {
    const failing: Theme = {
      ...defaultTheme,
      accent: '#8a6aaa',
      heroStart: '#7b5c96',
      heroEnd: '#6d5088',
    };

    const fixed = ensureThemeContrast(failing);
    const issues = checkContrastIssues(fixed);

    expect(issues.some((issue) => issue.pair === 'Accent on Hero Gradient')).toBe(false);
    const hueShift = Math.abs(Color(fixed.accent).hue() - Color(failing.accent).hue());
    expect(hueShift).toBeLessThan(8);
  });
});

describe('image file sampling helpers', () => {
  it('rejects non-images and files over 20 MB', () => {
    const notes = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const photo = new File(['img'], 'photo.png', { type: 'image/png' });
    const atLimit = new File(['img'], 'limit.png', { type: 'image/png' });
    Object.defineProperty(photo, 'size', { value: (20 * 1024 * 1024) + 1 });
    Object.defineProperty(atLimit, 'size', { value: 20 * 1024 * 1024 });

    expect(imageFileError(notes)).toMatch(/image/i);
    expect(imageFileError(photo)).toMatch(/20 MB/i);
    expect(imageFileError(atLimit)).toBeNull();
    expect(imageFileError(new File(['img'], 'ok.png', { type: 'image/png' }))).toBeNull();
  });

  it('downscales the long edge to 256px and does not upscale', () => {
    expect(scaledSize(800, 400, 256)).toEqual({ width: 256, height: 128 });
    expect(scaledSize(40, 20, 256)).toEqual({ width: 40, height: 20 });
    expect(scaledSize(0, 0, 256)).toEqual({ width: 1, height: 1 });
  });

  it('ignores fully transparent pixels and keeps partial transparency', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 0,
      1, 2, 3, 1,
      4, 5, 6, 127,
      0, 0, 255, 200,
    ]);

    expect(pixelsFromImageData(data)).toEqual([
      { r: 255, g: 0, b: 0 },
      { r: 1, g: 2, b: 3 },
      { r: 4, g: 5, b: 6 },
      { r: 0, g: 0, b: 255 },
    ]);
  });

  it('builds a theme from sampled pixels', () => {
    const result = themeFromPixels([
      ...fill(20, 10, 14, 26),
      ...fill(10, 45, 107, 184),
      ...fill(8, 232, 236, 240),
    ]);

    expect(result.swatches.length).toBeGreaterThan(0);
    expect(result.theme.bg).toMatch(COLOR_PATTERN);
    expect(result.theme.primary).toMatch(COLOR_PATTERN);
    const issues = checkContrastIssues(result.theme);
    expect(issues.some((issue) => issue.pair === 'Accent on Hero Gradient')).toBe(false);
  });

  it('previews theme tokens on #root and the page background', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    applyThemePreview({ ...defaultTheme, bg: '#123456', primary: '#abcdef' });

    expect(root.style.getPropertyValue('--color-bg')).toBe('#123456');
    expect(root.style.getPropertyValue('--color-primary')).toBe('#abcdef');
    expect(document.documentElement.style.getPropertyValue('--color-bg')).toBe('#123456');
    root.remove();
  });
});

type FakeImage = {
  naturalWidth: number;
  naturalHeight: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
};

describe('readImagePixels', () => {
  let imageSize = { width: 800, height: 400 };
  let failDecode = false;
  let contextMissing = false;
  const createdImages: FakeImage[] = [];
  const canvases: HTMLCanvasElement[] = [];
  const drawImage = vi.fn();
  const getImageData = vi.fn(() => ({
    data: new Uint8ClampedArray([
      10, 20, 30, 10,
      1, 2, 3, 0,
    ]),
  }));

  beforeEach(() => {
    imageSize = { width: 800, height: 400 };
    failDecode = false;
    contextMissing = false;
    createdImages.length = 0;
    canvases.length = 0;
    drawImage.mockClear();
    getImageData.mockClear();

    class FakeImageSource {
      naturalWidth: number;

      naturalHeight: number;

      onload: (() => void) | null = null;

      onerror: (() => void) | null = null;

      private srcValue = '';

      constructor() {
        this.naturalWidth = imageSize.width;
        this.naturalHeight = imageSize.height;
        createdImages.push(this);
      }

      get src(): string {
        return this.srcValue;
      }

      set src(value: string) {
        this.srcValue = value;
        if (value === '') {
          return;
        }
        if (failDecode) {
          this.onerror?.();
          return;
        }
        this.onload?.();
      }
    }

    vi.stubGlobal('Image', FakeImageSource);
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = () => 'blob:sampled';
    }
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:sampled');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function mockContext(
      this: HTMLCanvasElement,
    ) {
      canvases.push(this);
      if (contextMissing) {
        return null;
      }
      return { drawImage, getImageData } as unknown as CanvasRenderingContext2D;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('samples a 256px canvas, skips clear pixels, and leaves the file alone', async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'wide.jpg', { type: 'image/jpeg' });

    const pixels = await readImagePixels(file);

    expect(pixels).toEqual([{ r: 10, g: 20, b: 30 }]);
    expect(canvases[0].width).toBe(256);
    expect(canvases[0].height).toBe(128);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 256, 128);
    expect(getImageData).toHaveBeenCalledWith(0, 0, 256, 128);
    expect(file.name).toBe('wide.jpg');
    expect(file.size).toBe(4);
    expect(file.type).toBe('image/jpeg');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:sampled');
    expect(createdImages[0].src).toBe('');
    expect(createdImages[0].onload).toBeNull();
  });

  it('does not upscale a small image', async () => {
    imageSize = { width: 40, height: 20 };

    await readImagePixels(new File(['x'], 'tiny.png', { type: 'image/png' }));

    expect(canvases[0].width).toBe(40);
    expect(canvases[0].height).toBe(20);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 40, 20);
  });

  it('revokes the object URL when the image cannot be decoded', async () => {
    failDecode = true;
    const file = new File(['x'], 'broken.jpg', { type: 'image/jpeg' });

    await expect(readImagePixels(file)).rejects.toThrow(/could not read image/i);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:sampled');
    expect(file.size).toBe(1);
  });

  it('revokes the object URL when the canvas has no context', async () => {
    contextMissing = true;

    await expect(readImagePixels(new File(['x'], 'photo.png', { type: 'image/png' }))).rejects.toThrow(
      /could not read image/i,
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:sampled');
  });
});
