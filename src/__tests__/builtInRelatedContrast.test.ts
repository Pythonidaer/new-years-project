import { describe, it, expect } from 'vitest';
import { builtInPresets } from '@/context/themes';
import { checkContrastIssues } from '@/utils/contrast';

const RELATED_PAIR = 'Text on Related Section Gradient';
const PRIMARY_PAIR = 'Primary Contrast on Primary';

function failingPairs(pair: string): string[] {
  return builtInPresets.flatMap((preset) => {
    const issue = checkContrastIssues(preset.theme).find((item) => item.pair === pair);
    if (!issue) {
      return [];
    }
    return [`${preset.name} ${issue.ratio.toFixed(2)}:1`];
  });
}

describe('built-in themes', () => {
  it('keeps body text at WCAG AA on both related-section gradient ends', () => {
    expect(failingPairs(RELATED_PAIR)).toEqual([]);
  });

  it('keeps primary button text at WCAG AA', () => {
    expect(failingPairs(PRIMARY_PAIR)).toEqual([]);
  });
});
