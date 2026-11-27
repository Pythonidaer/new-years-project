import { formatContrastRatio } from './formatRatio';
import type {
  ContrastMode,
  ContrastPair,
  MatchingImpossible,
  MatchingSuccess,
} from './pairs';

function comparisonBoundaries(mode: ContrastMode): number[] {
  if (mode === 'high') return [7];
  return [3];
}

export function comparisonAnnouncement(mode: ContrastMode, pair: ContrastPair): string {
  const ratio = formatContrastRatio(pair.ratio, comparisonBoundaries(mode));
  const colors = `Foreground ${pair.foreground}, background ${pair.background}, contrast ${ratio}`;
  if (mode === 'high') {
    return `High contrast example. ${colors}, which meets 7:1.`;
  }
  return `Low contrast example. ${colors}, which is below 3:1.`;
}

export function highContrastAnnouncement(pair: ContrastPair): string {
  const ratio = formatContrastRatio(pair.ratio, [7]);
  return `High-contrast pair. Foreground ${pair.foreground}, background ${pair.background}, contrast ${ratio}, which meets 7:1.`;
}

export function impossiblePairingMessage(result: MatchingImpossible): string {
  const shown = formatContrastRatio(result.maximumRatio, [result.minimumRatio]);
  const target = formatContrastRatio(result.minimumRatio);
  const against = result.partner === '#000000' ? 'black' : 'white';
  return `This color cannot reach ${target} with any other color. Its highest contrast is ${shown}, against ${against} (${result.partner}). Choose a different base color or target. The base color was left unchanged.`;
}

export function pairingSuccessMessage(result: MatchingSuccess, minimumRatio: number): string {
  const shown = formatContrastRatio(result.ratio, [minimumRatio]);
  const target = formatContrastRatio(minimumRatio);
  return `Matching color generated. Foreground ${result.foreground}, background ${result.background}, contrast ${shown}, which meets ${target}. The base color ${result.baseColor} was kept.`;
}
