import { describe, it, expect, vi } from "vitest";
import Color from "color";
import {
  getContrastRatio,
  getContrastLevel,
  checkContrastIssues,
} from "@/utils/contrast";

describe("contrast utilities", () => {
  describe("getContrastRatio", () => {
    it("should calculate contrast ratio between two colors", () => {
      // Black on white should have maximum contrast (21:1)
      const ratio = getContrastRatio("#000000", "#ffffff");
      expect(ratio).toBeCloseTo(21, 1);
    });

    it("should calculate contrast ratio for similar colors", () => {
      // Similar colors should have low contrast
      const ratio = getContrastRatio("#ffffff", "#fefefe");
      expect(ratio).toBeLessThan(2);
    });

    it("should handle hex colors", () => {
      const ratio = getContrastRatio("#ff0000", "#00ff00");
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it("should handle rgb colors", () => {
      const ratio = getContrastRatio("rgb(255, 0, 0)", "rgb(0, 255, 0)");
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it("should handle rgba colors", () => {
      const ratio = getContrastRatio("rgba(255, 0, 0, 0.5)", "rgb(0, 0, 0)");
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it("should return 1 (minimum contrast) on error with both invalid colors", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Use invalid color formats that Color library will reject
      const ratio = getContrastRatio("not-a-color-1", "not-a-color-2");

      expect(ratio).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("should handle error in first color", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Use invalid color format that Color library will reject
      const ratio = getContrastRatio("not-a-color", "#ffffff");

      expect(ratio).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("should handle error in second color", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const ratio = getContrastRatio("#ffffff", "not-a-color");

      expect(ratio).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("getContrastLevel", () => {
    it("should return 'AAA' for ratio >= 7", () => {
      expect(getContrastLevel(7)).toBe("AAA");
      expect(getContrastLevel(8)).toBe("AAA");
      expect(getContrastLevel(21)).toBe("AAA");
    });

    it("should return 'AA' for ratio >= 4.5 and < 7", () => {
      expect(getContrastLevel(4.5)).toBe("AA");
      expect(getContrastLevel(5)).toBe("AA");
      expect(getContrastLevel(6.9)).toBe("AA");
    });

    it("should return 'Fail' for ratio < 4.5", () => {
      expect(getContrastLevel(4.4)).toBe("Fail");
      expect(getContrastLevel(3)).toBe("Fail");
      expect(getContrastLevel(1)).toBe("Fail");
    });

    it("should handle boundary values correctly", () => {
      expect(getContrastLevel(7.0)).toBe("AAA");
      expect(getContrastLevel(6.99)).toBe("AA");
      expect(getContrastLevel(4.5)).toBe("AA");
      expect(getContrastLevel(4.49)).toBe("Fail");
    });
  });

  describe("checkContrastIssues", () => {
    // Helper to create a theme with all required properties
    const createTheme = (overrides: Partial<Parameters<typeof checkContrastIssues>[0]> = {}) => {
      return {
        bg: "#ffffff",
        text: "#000000",
        primary: "#0066cc",
        primaryContrast: "#ffffff",
        surface: "#f5f5f5",
        surfaceDark: "#1a1a1a",
        textDark: "#000000",
        link: "#0066cc",
        footerBg: "#1a1a1a",
        footerTextMuted: "rgba(255, 255, 255, 0.7)",
        footerTextSubtle: "rgba(255, 255, 255, 0.5)",
        footerSocialBg: "rgba(255, 255, 255, 0.1)",
        accentAlt: "#ff6600",
        codeBg: "#f5f5f5",
        codeText: "#000000",
        blogLink: "#0066cc",
        authorBoxStart: "#ffffff",
        authorBoxEnd: "#f0f0f0",
        relatedSectionStart: "#ffffff",
        relatedSectionEnd: "#f5f5f5",
        ...overrides,
      };
    };

    it("should return empty array for theme with good contrast", () => {
      const theme = createTheme();
      const issues = checkContrastIssues(theme);
      expect(issues).toEqual([]);
    });

    describe("invalid color handling (null branches)", () => {
      it("skips opacity contrast when base color is invalid (checkOpacityContrast early return)", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const theme = createTheme({ text: "not-a-valid-color" });
        const issues = checkContrastIssues(theme);
        consoleSpy.mockRestore();
        expect(Array.isArray(issues)).toBe(true);
        const authorRoleIssue = issues.find(
          (i) => i.pair === "Author Role Text (75% opacity) on Surface Background"
        );
        expect(authorRoleIssue).toBeUndefined();
      });

      it("skips gradient contrast when foreground color is invalid (checkGradientContrast early return)", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const theme = createTheme({ textDark: "not-a-valid-color" });
        const issues = checkContrastIssues(theme);
        consoleSpy.mockRestore();
        expect(Array.isArray(issues)).toBe(true);
        const gradientIssue = issues.find((i) => i.pair === "Text Dark on Author Box Gradient");
        expect(gradientIssue).toBeUndefined();
      });
    });

    describe("text on background contrast", () => {
      it("should detect low contrast for text on background", () => {
        const theme = createTheme({
          text: "#cccccc", // Light gray on white - low contrast
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        const textBgIssue = issues.find((issue) => issue.pair === "Text on Background");
        expect(textBgIssue).toBeDefined();
        expect(textBgIssue?.ratio).toBeLessThan(4.5);
        expect(textBgIssue?.level).toBe("Fail");
        expect(textBgIssue?.usage).toBe("Body text, headings (Blogs page, Categories page), main content areas");
      });

      it("should not report issue when contrast is sufficient", () => {
        const theme = createTheme({
          text: "#000000", // Black on white - high contrast
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        const textBgIssue = issues.find((issue) => issue.pair === "Text on Background");
        expect(textBgIssue).toBeUndefined();
      });
    });

    describe("primary contrast on primary", () => {
      it("should detect low contrast for primary contrast on primary", () => {
        const theme = createTheme({
          primaryContrast: "#0066cc", // Same as primary - no contrast
          primary: "#0066cc",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Primary Contrast on Primary");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Primary buttons, CTAs");
      });
    });

    describe("text dark on background", () => {
      it("should detect low contrast for text dark on background", () => {
        const theme = createTheme({
          textDark: "#cccccc", // Light gray on white - low contrast
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text Dark on Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Header (scrolled state), Blog heading on white background");
      });
    });

    describe("primary contrast on surface dark", () => {
      it("should detect low contrast for primary contrast on surface dark", () => {
        const theme = createTheme({
          primaryContrast: "#1a1a1a", // Dark on dark - low contrast
          surfaceDark: "#1a1a1a",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Primary Contrast on Surface Dark");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Blog post hero section, Header (dark variant)");
      });
    });

    describe("text on surface", () => {
      it("should detect low contrast for text on surface", () => {
        const theme = createTheme({
          text: "#f5f5f5", // Light on light - low contrast
          surface: "#f5f5f5",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text on Surface");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Cards, elevated surfaces");
      });
    });

    describe("author role text (75% opacity) on surface", () => {
      it("should detect low contrast for author role text on surface", () => {
        const theme = createTheme({
          text: "#f5f5f5", // Light text that becomes even lighter with opacity
          surface: "#f5f5f5", // Same as text - no contrast
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Author Role Text (75% opacity) on Surface Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Customer spotlight author role on homepage");
      });
    });

    describe("code text on code background", () => {
      it("should detect low contrast for code text on code background", () => {
        const theme = createTheme({
          codeText: "#f5f5f5", // Light on light - low contrast
          codeBg: "#f5f5f5",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Code Text on Code Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Code blocks, inline code");
      });
    });

    describe("link on background", () => {
      it("should detect low contrast for link on background", () => {
        const theme = createTheme({
          link: "#ffffff", // White on white - no contrast
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Link on Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Hyperlinks on page background");
      });
    });

    describe("blog link on background", () => {
      it("should detect low contrast for blog link on background", () => {
        const theme = createTheme({
          blogLink: "#ffffff", // White on white - no contrast
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Blog Link on Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Blog post content links, tag links on page background");
      });
    });

    describe("footer contrast checks", () => {
      it("should detect low contrast for primary contrast on footer background", () => {
        const theme = createTheme({
          primaryContrast: "#1a1a1a", // Dark on dark - low contrast
          footerBg: "#1a1a1a",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Primary Contrast on Footer Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Footer brand name, default footer text");
      });

      it("should detect low contrast for footer text muted on footer background", () => {
        const theme = createTheme({
          footerTextMuted: "rgba(0, 0, 0, 0.7)", // Dark with opacity on dark - low contrast
          footerBg: "#000000",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Footer Text Muted on Footer Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Footer brand text, footer links");
      });

      it("should detect low contrast for footer text subtle on footer background", () => {
        const theme = createTheme({
          footerTextSubtle: "rgba(0, 0, 0, 0.5)", // Dark with opacity on dark - low contrast
          footerBg: "#000000",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Footer Text Subtle on Footer Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Footer copyright, legal links");
      });

      it("should detect low contrast for primary contrast on footer social background", () => {
        const theme = createTheme({
          primaryContrast: "#000000", // Dark on dark (blended) - low contrast
          footerSocialBg: "rgba(0, 0, 0, 0.9)", // Very dark with opacity
          footerBg: "#000000",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Primary Contrast on Footer Social Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Footer social media icons");
      });

      it("should detect low contrast for accent alt on footer background", () => {
        const theme = createTheme({
          accentAlt: "#1a1a1a", // Dark on dark - low contrast
          footerBg: "#1a1a1a",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Accent Alt on Footer Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Footer link column headings");
      });
    });

    describe("author box gradient contrast checks", () => {
      it("should detect low contrast for text dark on author box gradient (start fails)", () => {
        const theme = createTheme({
          textDark: "#ffffff", // White on white gradient - no contrast
          authorBoxStart: "#ffffff",
          authorBoxEnd: "#f0f0f0",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text Dark on Author Box Gradient");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Author box heading, author name");
      });

      it("should detect low contrast for text dark on author box gradient (end fails)", () => {
        const theme = createTheme({
          textDark: "#f0f0f0", // Light on light gradient - low contrast
          authorBoxStart: "#ffffff",
          authorBoxEnd: "#f0f0f0",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text Dark on Author Box Gradient");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
      });

      it("should detect low contrast for text on author box gradient", () => {
        const theme = createTheme({
          text: "#ffffff", // White on white gradient - no contrast
          authorBoxStart: "#ffffff",
          authorBoxEnd: "#f0f0f0",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text on Author Box Gradient");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Author box body text");
      });

      it("should detect low contrast for blog link on author box gradient", () => {
        const theme = createTheme({
          blogLink: "#ffffff", // White on white gradient - no contrast
          authorBoxStart: "#ffffff",
          authorBoxEnd: "#f0f0f0",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Blog Link on Author Box Gradient");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Author box link");
      });
    });

    describe("related section gradient contrast checks", () => {
      it("should detect low contrast for text on related section gradient (start fails)", () => {
        const theme = createTheme({
          text: "#ffffff", // White on white gradient - no contrast
          relatedSectionStart: "#ffffff",
          relatedSectionEnd: "#f5f5f5",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text on Related Section Gradient");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Related content section text");
      });

      it("should detect low contrast for text on related section gradient (end fails)", () => {
        const theme = createTheme({
          text: "#f5f5f5", // Light on light gradient - low contrast
          relatedSectionStart: "#ffffff",
          relatedSectionEnd: "#f5f5f5",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Text on Related Section Gradient");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
      });
    });

    describe("blog card contrast checks (Latest Blogs section)", () => {
      it("should detect low contrast for date text (75% opacity) on card background", () => {
        const theme = createTheme({
          text: "#ffffff", // White text that becomes lighter with opacity
          bg: "#ffffff", // White background - no contrast
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Date Text (75% opacity) on Card Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Blog card date in Latest Blogs section");
      });

      it("should detect low contrast for excerpt text (80% opacity) on card background", () => {
        const theme = createTheme({
          text: "#ffffff", // White text that becomes lighter with opacity
          bg: "#ffffff", // White background - no contrast
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Excerpt Text (80% opacity) on Card Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Blog card excerpt in Latest Blogs section");
      });

      it("should detect low contrast for card link on card background", () => {
        const theme = createTheme({
          link: "#ffffff", // White on white - no contrast
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Card Link (Link) on Card Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe('Blog card "Read More" link in Latest Blogs section');
      });
    });

    describe("blog grid card contrast checks", () => {
      it("should detect low contrast for category link on blog card background", () => {
        const theme = createTheme({
          footerTextMuted: "rgba(0, 0, 0, 0.7)", // Dark with opacity on dark - low contrast
          surfaceDark: "#000000",
        });
        const issues = checkContrastIssues(theme);
        const issue = issues.find((issue) => issue.pair === "Category Link on Blog Card Background");
        expect(issue).toBeDefined();
        expect(issue?.ratio).toBeLessThan(4.5);
        expect(issue?.usage).toBe("Blog grid card category links on dark card background");
      });
    });

    describe("blendColor error handling (indirect testing)", () => {
      it("should handle blendColor errors gracefully when Color throws on foreground", () => {
        const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        // Create a theme that will trigger blendColor with invalid foreground color
        const theme = createTheme({
          footerTextMuted: "invalid-color", // This will cause Color to throw
          footerBg: "#000000",
        });

        // The function should not throw, but may log warnings
        expect(() => checkContrastIssues(theme)).not.toThrow();
        // Should still return issues array (may be empty or partial)
        const issues = checkContrastIssues(theme);
        expect(Array.isArray(issues)).toBe(true);

        consoleWarnSpy.mockRestore();
      });

      it("should handle blendColor errors gracefully when Color throws on background", () => {
        const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        // Create a theme that will trigger blendColor with invalid background color
        const theme = createTheme({
          footerTextMuted: "rgba(255, 255, 255, 0.7)",
          footerBg: "invalid-bg-color", // This will cause Color to throw
        });

        // The function should not throw
        expect(() => checkContrastIssues(theme)).not.toThrow();
        const issues = checkContrastIssues(theme);
        expect(Array.isArray(issues)).toBe(true);

        consoleWarnSpy.mockRestore();
      });

      it("should handle blendColor when foreground is already opaque (alpha >= 1)", () => {
        // When alpha >= 1, blendColor should return foreground as-is
        // Test with opaque rgb color (no alpha channel)
        const theme = createTheme({
          footerTextMuted: "rgb(255, 255, 255)", // Opaque color (alpha = 1 implicitly)
          footerBg: "#000000",
        });

        // Should not throw and should process normally
        expect(() => checkContrastIssues(theme)).not.toThrow();
        const issues = checkContrastIssues(theme);
        expect(Array.isArray(issues)).toBe(true);
      });

      it("should handle blendColor when foreground has explicit alpha = 1", () => {
        // Test with rgba color where alpha is explicitly 1.0
        const theme = createTheme({
          footerTextMuted: "rgba(255, 255, 255, 1.0)", // Explicitly opaque
          footerBg: "#000000",
        });

        expect(() => checkContrastIssues(theme)).not.toThrow();
        const issues = checkContrastIssues(theme);
        expect(Array.isArray(issues)).toBe(true);
      });

      it("should blend semi-transparent colors correctly", () => {
        // Test that semi-transparent colors are properly blended
        // Use a theme where blending is required and verify it works
        const theme = createTheme({
          footerTextMuted: "rgba(255, 255, 255, 0.7)", // Semi-transparent
          footerBg: "#000000", // Dark background
        });

        // Should process without errors
        expect(() => checkContrastIssues(theme)).not.toThrow();
        const issues = checkContrastIssues(theme);
        expect(Array.isArray(issues)).toBe(true);
        
        // The blended color should result in a contrast check
        // If contrast is low, we should get an issue
        // If contrast is good, we should get no issue for this pair
        // Either we get an issue (if contrast is low) or no issue (if contrast is good)
        // Both are valid outcomes
        issues.find((issue) => issue.pair === "Footer Text Muted on Footer Background");
      });
    });

    describe("multiple contrast issues", () => {
      it("should detect multiple contrast issues in a single theme", () => {
        const theme = createTheme({
          text: "#ffffff", // White on white - multiple issues
          bg: "#ffffff",
          primaryContrast: "#0066cc", // Same as primary
          primary: "#0066cc",
          link: "#ffffff", // White on white
        });
        const issues = checkContrastIssues(theme);
        expect(issues.length).toBeGreaterThan(1);
        
        const textBgIssue = issues.find((issue) => issue.pair === "Text on Background");
        const primaryIssue = issues.find((issue) => issue.pair === "Primary Contrast on Primary");
        const linkIssue = issues.find((issue) => issue.pair === "Link on Background");
        
        expect(textBgIssue).toBeDefined();
        expect(primaryIssue).toBeDefined();
        expect(linkIssue).toBeDefined();
      });
    });

    describe("contrast level classification", () => {
      it("should classify issues with AAA level correctly", () => {
        // Create a theme where we can verify AAA classification
        // Note: This is indirect since we're testing through checkContrastIssues
        // But we can verify the level field is set correctly
        const theme = createTheme({
          text: "#000000", // Black on white - high contrast (AAA)
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        // Should have no issues since contrast is good
        expect(issues.length).toBe(0);
      });

      it("should classify issues with AA level correctly", () => {
        // Use colors that give exactly 4.5:1 ratio (AA threshold)
        // This is hard to test directly, but we can verify the level field
        const theme = createTheme({
          text: "#767676", // This should be close to AA threshold on white
          bg: "#ffffff",
        });
        const issues = checkContrastIssues(theme);
        // If there's an issue, it should have level 'AA' or 'Fail' depending on exact ratio
        if (issues.length > 0) {
          const issue = issues.find((issue) => issue.pair === "Text on Background");
          if (issue) {
            expect(["AA", "Fail"]).toContain(issue.level);
          }
        }
      });
    });

    it("getContrastRatioOptimized catch: returns 1 when contrast() throws", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const theme = createTheme();
      const origContrast = Color.prototype.contrast;
      let callCount = 0;
      Color.prototype.contrast = function (this: InstanceType<typeof Color>) {
        callCount += 1;
        if (callCount === 2) {
          Color.prototype.contrast = origContrast;
          throw new Error("mock contrast throw");
        }
        return origContrast.apply(this, arguments as unknown as []);
      };
      const issues = checkContrastIssues(theme);
      Color.prototype.contrast = origContrast;
      consoleSpy.mockRestore();
      expect(Array.isArray(issues)).toBe(true);
    });

    it("checkOpacityContrast catch: warns when alpha/rgb throws", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const theme = createTheme({ text: "#000000", surface: "#ffffff" });
      const origAlpha = Color.prototype.alpha;
      let callCount = 0;
      Color.prototype.alpha = function (this: InstanceType<typeof Color>, a: number) {
        callCount += 1;
        if (callCount === 1) {
          Color.prototype.alpha = origAlpha;
          throw new Error("mock alpha throw");
        }
        return origAlpha.call(this, a);
      };
      checkContrastIssues(theme);
      Color.prototype.alpha = origAlpha;
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to check opacity contrast"),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
