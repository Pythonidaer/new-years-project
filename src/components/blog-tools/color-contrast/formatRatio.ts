function roundedDisagrees(ratio: number, boundary: number): boolean {
  const rounded = Number(ratio.toFixed(2));
  const roundedIsBelow = rounded < boundary;
  const actualIsBelow = ratio < boundary;
  return roundedIsBelow !== actualIsBelow;
}

export function formatContrastRatio(ratio: number, boundaries: number[] = []): string {
  const needsMorePrecision = boundaries.some((boundary) => roundedDisagrees(ratio, boundary));
  const places = needsMorePrecision ? 4 : 2;
  return `${ratio.toFixed(places)}:1`;
}
