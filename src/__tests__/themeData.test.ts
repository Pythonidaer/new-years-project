import { describe, it, expect } from "vitest";
import { defaultTheme, builtInPresets } from "../context/themeData";
import type { Theme, Preset } from "../context/themeData";

describe("themeData", () => {
  describe("defaultTheme", () => {
    it("should export defaultTheme", () => {
      expect(defaultTheme).toBeDefined();
      expect(typeof defaultTheme).toBe("object");
    });

    it("should have required theme properties", () => {
      expect(defaultTheme).toHaveProperty("primary");
      expect(defaultTheme).toHaveProperty("bg");
      expect(defaultTheme).toHaveProperty("text");
      expect(defaultTheme).toHaveProperty("surface");
    });
  });

  describe("builtInPresets", () => {
    it("should export builtInPresets array", () => {
      expect(builtInPresets).toBeDefined();
      expect(Array.isArray(builtInPresets)).toBe(true);
    });

    it("should have at least one preset", () => {
      expect(builtInPresets.length).toBeGreaterThan(0);
    });

    it("should have presets with required properties", () => {
      const preset = builtInPresets[0];
      expect(preset).toHaveProperty("id");
      expect(preset).toHaveProperty("name");
      expect(preset).toHaveProperty("theme");
    });

    it("should have default preset", () => {
      const defaultPreset = builtInPresets.find((p) => p.id === "default");
      expect(defaultPreset).toBeDefined();
      expect(defaultPreset?.name).toBeDefined();
    });
  });

  describe("type exports", () => {
    it("should export Theme type", () => {
      // Type checking test - if this compiles, the type is exported
      const theme: Theme = defaultTheme;
      expect(theme).toBeDefined();
    });

    it("should export Preset type", () => {
      // Type checking test - if this compiles, the type is exported
      const preset: Preset = {
        id: "test",
        name: "Test Theme",
        theme: defaultTheme,
      };
      expect(preset).toBeDefined();
    });
  });
});
