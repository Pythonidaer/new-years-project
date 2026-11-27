import { describe, expect, it } from "vitest";
import { getContrastRatio } from "@/utils/contrast";
import { formatContrastRatio } from "@/components/blog-tools/color-contrast/formatRatio";
import { hexValidationMessage, normalizeHexColor, randomHexColor } from "@/components/blog-tools/color-contrast/hexColor";
import {
  generateContrastPair,
  generateMatchingPair,
  HIGH_CONTRAST_BOUNDS,
  HIGH_CONTRAST_FALLBACK,
  LOW_CONTRAST_BOUNDS,
  LOW_CONTRAST_FALLBACK,
  maximumAchievableContrast,
} from "@/components/blog-tools/color-contrast/pairs";
import type { RandomSource } from "@/components/blog-tools/color-contrast/hexColor";

function scriptedRandom(values: number[]): RandomSource {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("hex colors", () => {
  it("normalizes shorthand and full hex", () => {
    expect(normalizeHexColor("#abc")).toBe("#AABBCC");
    expect(normalizeHexColor("#ABC")).toBe("#AABBCC");
    expect(normalizeHexColor("#aabbcc")).toBe("#AABBCC");
    expect(normalizeHexColor("112233")).toBe("#112233");
  });

  it("rejects invalid input", () => {
    expect(normalizeHexColor("red")).toBeNull();
    expect(normalizeHexColor("#12")).toBeNull();
    expect(normalizeHexColor("#1234")).toBeNull();
    expect(normalizeHexColor("#11223344")).toBeNull();
    expect(hexValidationMessage("")).toMatch(/Enter a hex color/);
    expect(hexValidationMessage("zzzz")).toMatch(/#RGB or #RRGGBB/);
    expect(hexValidationMessage("#abc")).toBeNull();
  });
});

const WHITE_SAMPLE = 0xffffff / 0x1000000;

describe("contrast pair generation", () => {
  it("maps the ends of the random range to black and white", () => {
    expect(randomHexColor(() => 0)).toBe("#000000");
    expect(randomHexColor(() => WHITE_SAMPLE)).toBe("#FFFFFF");
  });

  it("returns a known high-contrast pair from a scripted random source", () => {
    const pair = generateContrastPair(HIGH_CONTRAST_BOUNDS, scriptedRandom([0, WHITE_SAMPLE]), 5);
    expect(pair.foreground).toBe("#000000");
    expect(pair.background).toBe("#FFFFFF");
    expect(pair.ratio).toBeGreaterThanOrEqual(7);
    expect(pair.ratio).toBeCloseTo(getContrastRatio(pair.foreground, pair.background), 10);
  });

  it("uses the low-contrast fallback when random pairs stay at or above 3:1", () => {
    const random = scriptedRandom([0, WHITE_SAMPLE]);
    const pair = generateContrastPair(LOW_CONTRAST_BOUNDS, random, 2);
    expect(pair).toEqual(LOW_CONTRAST_FALLBACK);
    expect(pair.ratio).toBeLessThan(3);
  });

  it("uses the high-contrast fallback when the search limit is reached", () => {
    let calls = 0;
    const random: RandomSource = () => {
      calls += 1;
      return 0.5;
    };
    const pair = generateContrastPair(HIGH_CONTRAST_BOUNDS, random, 3);
    expect(calls).toBe(6);
    expect(pair).toEqual(HIGH_CONTRAST_FALLBACK);
    expect(pair.ratio).toBeGreaterThanOrEqual(7);
  });

  it("keeps a chosen foreground or background and meets the selected threshold", () => {
    const foreground = generateMatchingPair({
      baseColor: "#112244",
      role: "foreground",
      minimumRatio: 7,
      random: () => 0,
      maxAttempts: 3,
    });
    expect(foreground.ok).toBe(true);
    if (!foreground.ok) return;
    expect(foreground.foreground).toBe("#112244");
    expect(foreground.baseColor).toBe("#112244");
    expect(foreground.ratio).toBeGreaterThanOrEqual(7);

    const background = generateMatchingPair({
      baseColor: "#abc",
      role: "background",
      minimumRatio: 4.5,
      random: () => 0,
      maxAttempts: 1,
    });
    expect(background.ok).toBe(true);
    if (!background.ok) return;
    expect(background.background).toBe("#AABBCC");
    expect(background.baseColor).toBe("#AABBCC");
    expect(background.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("returns an impossible AAA result without searching", () => {
    let calls = 0;
    const started = Date.now();
    const result = generateMatchingPair({
      baseColor: "#777777",
      role: "foreground",
      minimumRatio: 7,
      maxAttempts: 1000000,
      random: () => {
        calls += 1;
        return 0;
      },
    });
    expect(Date.now() - started).toBeLessThan(1000);
    expect(calls).toBe(0);
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== "impossible") return;
    expect(result.baseColor).toBe("#777777");
    expect(result.maximumRatio).toBeLessThan(7);
    expect(result.maximumRatio).toBeCloseTo(
      maximumAchievableContrast("#777777").ratio,
      10,
    );
    expect(result.minimumRatio).toBe(7);
  });

  it("does not treat a rounded display as the comparison value", () => {
    expect(formatContrastRatio(6.996, [7])).toBe("6.9960:1");
    expect(formatContrastRatio(21, [7])).toBe("21.00:1");
    expect(formatContrastRatio(2.996, [3])).toBe("2.9960:1");
  });
});
