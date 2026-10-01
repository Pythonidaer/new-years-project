import { describe, it, expect } from 'vitest';
import Color from 'color';
import { builtInPresets } from '@/context/themes';
import { checkContrastIssues } from '@/utils/contrast';
import type { Theme } from '@/context/themes/types';

const HERO_PAIR = 'Accent on Hero Gradient';

function heroAccentIssue(theme: Theme) {
  return checkContrastIssues(theme).find((issue) => issue.pair === HERO_PAIR);
}

function passesHero(theme: Theme, accent: string): boolean {
  return heroAccentIssue({ ...theme, accent }) === undefined;
}

function nearestAccent(theme: Theme): string | null {
  const parsed = Color(theme.accent);
  const hue = parsed.hue();
  const saturation = parsed.saturationl();
  const origin = parsed.lightness();
  let best: { delta: number; hex: string } | null = null;

  for (let lightness = 0; lightness <= 100; lightness += 1) {
    const hex = Color({ h: hue, s: saturation, l: lightness }).hex();
    if (!passesHero(theme, hex)) {
      continue;
    }
    const delta = Math.abs(lightness - origin);
    if (!best || delta < best.delta) {
      best = { delta, hex };
    }
  }

  return best?.hex ?? null;
}

describe('built-in themes', () => {
  it('keeps accent at WCAG AA on both hero gradient ends', () => {
    const failures = builtInPresets.flatMap((preset) => {
      const issue = heroAccentIssue(preset.theme);
      if (!issue) {
        return [];
      }
      const suggestion = nearestAccent(preset.theme);
      return [
        `${preset.id} ${issue.ratio.toFixed(2)}:1 ${preset.theme.accent} -> ${suggestion ?? 'none'}`,
      ];
    });

    expect(failures).toEqual([]);
  });
});
