const SHORTHAND_HEX = /^#([0-9a-fA-F]{3})$/;
const FULL_HEX = /^#([0-9a-fA-F]{6})$/;
const HEX_SPACE = 0x1000000;

export type RandomSource = () => number;

export function normalizeHexColor(input: string): string | null {
  const trimmed = input.trim();
  const hashed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const shortMatch = SHORTHAND_HEX.exec(hashed);
  if (shortMatch) {
    return expandShortHex(shortMatch[1]);
  }
  const fullMatch = FULL_HEX.exec(hashed);
  if (fullMatch) {
    return `#${fullMatch[1].toUpperCase()}`;
  }
  return null;
}

function expandShortHex(digits: string): string {
  const [red, green, blue] = digits.toUpperCase().split('');
  return `#${red}${red}${green}${green}${blue}${blue}`;
}

export function hexValidationMessage(input: string): string | null {
  if (normalizeHexColor(input)) return null;
  if (input.trim() === '') {
    return 'Enter a hex color such as #112244 or #124.';
  }
  return 'Use #RGB or #RRGGBB. For example, #112244 or #124.';
}

export function randomHexColor(random: RandomSource): string {
  const scaled = Math.floor(random() * HEX_SPACE);
  const bounded = Math.min(scaled, HEX_SPACE - 1);
  return `#${bounded.toString(16).padStart(6, '0').toUpperCase()}`;
}

export function colorInputValue(hex: string): string {
  return hex.toLowerCase();
}
