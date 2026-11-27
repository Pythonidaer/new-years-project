import { getContrastRatio } from '@/utils/contrast';
import { normalizeHexColor, randomHexColor, type RandomSource } from './hexColor';

export type ContrastPair = {
  foreground: string;
  background: string;
  ratio: number;
};

export type PairBounds = {
  minimum: number;
  maximum: number;
  fallback: ContrastPair;
};

export type ContrastMode = 'low' | 'high';
export type ColorRole = 'foreground' | 'background';

const BLACK = '#000000';
const WHITE = '#FFFFFF';

function createPair(foreground: string, background: string): ContrastPair {
  return {
    foreground,
    background,
    ratio: getContrastRatio(foreground, background),
  };
}

export const LOW_CONTRAST_FALLBACK = createPair('#D0D0D0', '#D6D6D6');
export const HIGH_CONTRAST_FALLBACK = createPair(BLACK, WHITE);

export const LOW_CONTRAST_BOUNDS: PairBounds = {
  minimum: 1,
  maximum: 3,
  fallback: LOW_CONTRAST_FALLBACK,
};

export const HIGH_CONTRAST_BOUNDS: PairBounds = {
  minimum: 7,
  maximum: Number.POSITIVE_INFINITY,
  fallback: HIGH_CONTRAST_FALLBACK,
};

export const DEFAULT_SEARCH_ATTEMPTS = 200;

export function boundsForMode(mode: ContrastMode): PairBounds {
  if (mode === 'high') return HIGH_CONTRAST_BOUNDS;
  return LOW_CONTRAST_BOUNDS;
}

function pairWithin(pair: ContrastPair, bounds: PairBounds): boolean {
  return pair.ratio >= bounds.minimum && pair.ratio < bounds.maximum;
}

function findRandomPair(
  bounds: PairBounds,
  random: RandomSource,
  maxAttempts: number,
): ContrastPair | null {
  let remaining = maxAttempts;
  while (remaining > 0) {
    remaining -= 1;
    const foreground = randomHexColor(random);
    const background = randomHexColor(random);
    const ratio = getContrastRatio(foreground, background);
    if (pairWithin({ foreground, background, ratio }, bounds)) {
      return { foreground, background, ratio };
    }
  }
  return null;
}

export function generateContrastPair(
  bounds: PairBounds,
  random: RandomSource,
  maxAttempts: number,
): ContrastPair {
  const found = findRandomPair(bounds, random, maxAttempts);
  if (found) return found;
  return bounds.fallback;
}

export function generateComparisonPair(
  mode: ContrastMode,
  random: RandomSource = Math.random,
): ContrastPair {
  return generateContrastPair(boundsForMode(mode), random, DEFAULT_SEARCH_ATTEMPTS);
}

export function generateHighContrastPair(
  random: RandomSource = Math.random,
): ContrastPair {
  return generateContrastPair(HIGH_CONTRAST_BOUNDS, random, DEFAULT_SEARCH_ATTEMPTS);
}

export type ContrastExtreme = {
  ratio: number;
  partner: typeof BLACK | typeof WHITE;
};

export function maximumAchievableContrast(color: string): ContrastExtreme {
  const againstBlack = getContrastRatio(color, BLACK);
  const againstWhite = getContrastRatio(color, WHITE);
  if (againstBlack >= againstWhite) {
    return { ratio: againstBlack, partner: BLACK };
  }
  return { ratio: againstWhite, partner: WHITE };
}

export type MatchingInput = {
  baseColor: string;
  role: ColorRole;
  minimumRatio: number;
  random?: RandomSource;
  maxAttempts?: number;
};

export type MatchingSuccess = {
  ok: true;
  baseColor: string;
  foreground: string;
  background: string;
  ratio: number;
};

export type MatchingImpossible = {
  ok: false;
  reason: 'impossible';
  baseColor: string;
  minimumRatio: number;
  maximumRatio: number;
  partner: typeof BLACK | typeof WHITE;
};

export type MatchingInvalid = {
  ok: false;
  reason: 'invalid';
};

export type MatchingResult = MatchingSuccess | MatchingImpossible | MatchingInvalid;

function sourceFrom(input: MatchingInput): RandomSource {
  if (input.random) return input.random;
  return Math.random;
}

function attemptsFrom(input: MatchingInput): number {
  if (input.maxAttempts === undefined) return DEFAULT_SEARCH_ATTEMPTS;
  return input.maxAttempts;
}

function assignRoles(
  base: string,
  partner: string,
  role: ColorRole,
): Pick<ContrastPair, 'foreground' | 'background'> {
  if (role === 'background') {
    return { foreground: partner, background: base };
  }
  return { foreground: base, background: partner };
}

function findPartner(
  base: string,
  minimumRatio: number,
  random: RandomSource,
  maxAttempts: number,
): string | null {
  let remaining = maxAttempts;
  while (remaining > 0) {
    remaining -= 1;
    const partner = randomHexColor(random);
    if (getContrastRatio(base, partner) >= minimumRatio) return partner;
  }
  return null;
}

function impossibleResult(
  baseColor: string,
  minimumRatio: number,
  best: ContrastExtreme,
): MatchingImpossible {
  return {
    ok: false,
    reason: 'impossible',
    baseColor,
    minimumRatio,
    maximumRatio: best.ratio,
    partner: best.partner,
  };
}

export function generateMatchingPair(input: MatchingInput): MatchingResult {
  const baseColor = normalizeHexColor(input.baseColor);
  if (!baseColor) return { ok: false, reason: 'invalid' };

  const best = maximumAchievableContrast(baseColor);
  if (best.ratio < input.minimumRatio) {
    return impossibleResult(baseColor, input.minimumRatio, best);
  }

  const found = findPartner(
    baseColor,
    input.minimumRatio,
    sourceFrom(input),
    attemptsFrom(input),
  );
  const partner = found ?? best.partner;
  const colors = assignRoles(baseColor, partner, input.role);
  const ratio = getContrastRatio(colors.foreground, colors.background);
  if (ratio < input.minimumRatio) {
    return impossibleResult(baseColor, input.minimumRatio, best);
  }

  return {
    ok: true,
    baseColor,
    foreground: colors.foreground,
    background: colors.background,
    ratio,
  };
}
