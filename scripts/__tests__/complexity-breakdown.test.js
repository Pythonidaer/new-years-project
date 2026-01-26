import { describe, it, expect } from "vitest";
import {
  calculateComplexityBreakdown,
  formatComplexityBreakdown,
  formatComplexityBreakdownInline,
  formatComplexityBreakdownStyled,
  formatComplexityConcise,
} from "../complexity-breakdown.js";

describe("complexity-breakdown", () => {
  describe("calculateComplexityBreakdown", () => {
    it("should return base complexity of 1 when no decision points", () => {
      const result = calculateComplexityBreakdown(10, [], 1);
      
      expect(result.breakdown.base).toBe(1);
      expect(result.calculatedTotal).toBe(1);
      expect(result.decisionPoints).toEqual([]);
    });

    it("should use provided base complexity", () => {
      const result = calculateComplexityBreakdown(10, [], 2);
      
      expect(result.breakdown.base).toBe(2);
      expect(result.calculatedTotal).toBe(2);
    });

    it("should default to base complexity of 1 when not provided", () => {
      const result = calculateComplexityBreakdown(10, []);
      
      expect(result.breakdown.base).toBe(1);
      expect(result.calculatedTotal).toBe(1);
    });

    it("should filter decision points by function line", () => {
      const decisionPoints = [
        { functionLine: 10, type: "if", line: 12 },
        { functionLine: 10, type: "&&", line: 13 },
        { functionLine: 20, type: "if", line: 22 }, // Different function
      ];

      const result = calculateComplexityBreakdown(10, decisionPoints, 1);
      
      expect(result.decisionPoints).toHaveLength(2);
      expect(result.decisionPoints[0].type).toBe("if");
      expect(result.decisionPoints[1].type).toBe("&&");
      expect(result.calculatedTotal).toBe(3); // base + if + &&
    });

    it("should count all decision point types correctly", () => {
      const decisionPoints = [
        { functionLine: 10, type: "if", line: 12 },
        { functionLine: 10, type: "else if", line: 14 },
        { functionLine: 10, type: "for", line: 16 },
        { functionLine: 10, type: "for...of", line: 18 },
        { functionLine: 10, type: "for...in", line: 20 },
        { functionLine: 10, type: "while", line: 22 },
        { functionLine: 10, type: "do...while", line: 24 },
        { functionLine: 10, type: "switch", line: 26 },
        { functionLine: 10, type: "case", line: 28 },
        { functionLine: 10, type: "catch", line: 30 },
        { functionLine: 10, type: "ternary", line: 32 },
        { functionLine: 10, type: "&&", line: 34 },
        { functionLine: 10, type: "||", line: 36 },
        { functionLine: 10, type: "??", line: 38 },
        { functionLine: 10, type: "?.", line: 40 },
        { functionLine: 10, type: "default parameter", line: 42 },
      ];

      const result = calculateComplexityBreakdown(10, decisionPoints, 1);
      
      expect(result.breakdown.base).toBe(1);
      expect(result.breakdown["if"]).toBe(1);
      expect(result.breakdown["else if"]).toBe(1);
      expect(result.breakdown["for"]).toBe(1);
      expect(result.breakdown["for...of"]).toBe(1);
      expect(result.breakdown["for...in"]).toBe(1);
      expect(result.breakdown["while"]).toBe(1);
      expect(result.breakdown["do...while"]).toBe(1);
      expect(result.breakdown["switch"]).toBe(1);
      expect(result.breakdown["case"]).toBe(1);
      expect(result.breakdown["catch"]).toBe(1);
      expect(result.breakdown["ternary"]).toBe(1);
      expect(result.breakdown["&&"]).toBe(1);
      expect(result.breakdown["||"]).toBe(1);
      expect(result.breakdown["??"]).toBe(1);
      expect(result.breakdown["?."]).toBe(1);
      expect(result.breakdown["default parameter"]).toBe(1);
      expect(result.calculatedTotal).toBe(17); // base + 16 decision points
    });

    it("should count multiple instances of the same decision point type", () => {
      const decisionPoints = [
        { functionLine: 10, type: "if", line: 12 },
        { functionLine: 10, type: "if", line: 15 },
        { functionLine: 10, type: "&&", line: 18 },
        { functionLine: 10, type: "&&", line: 19 },
        { functionLine: 10, type: "&&", line: 20 },
      ];

      const result = calculateComplexityBreakdown(10, decisionPoints, 1);
      
      expect(result.breakdown["if"]).toBe(2);
      expect(result.breakdown["&&"]).toBe(3);
      expect(result.calculatedTotal).toBe(6); // base + 2 if + 3 &&
    });

    it("should ignore unknown decision point types", () => {
      const decisionPoints = [
        { functionLine: 10, type: "if", line: 12 },
        { functionLine: 10, type: "unknown-type", line: 13 }, // Unknown type
        { functionLine: 10, type: "&&", line: 14 },
      ];

      const result = calculateComplexityBreakdown(10, decisionPoints, 1);
      
      expect(result.breakdown["if"]).toBe(1);
      expect(result.breakdown["&&"]).toBe(1);
      expect(result.breakdown["unknown-type"]).toBeUndefined();
      expect(result.calculatedTotal).toBe(3); // base + if + &&
    });
  });

  describe("formatComplexityBreakdown", () => {
    it("should format breakdown with base only", () => {
      const breakdown = { base: 1 };
      const result = formatComplexityBreakdown(breakdown, 1);
      
      expect(result).toBe("complexity = 1 (1 base)");
    });

    it("should format breakdown with multiple decision points", () => {
      const breakdown = {
        base: 1,
        "if": 2,
        "&&": 3,
        "ternary": 1,
      };
      const result = formatComplexityBreakdown(breakdown, 7);
      
      expect(result).toBe("complexity = 7 (1 base + 2 if + 1 ternary + 3 &&)");
    });

    it("should maintain consistent type order", () => {
      const breakdown = {
        base: 1,
        "||": 2,
        "if": 1,
        "ternary": 1,
        "&&": 1,
      };
      const result = formatComplexityBreakdown(breakdown, 6);
      
      // Should be in type order: base, if, ternary, &&, ||
      expect(result).toContain("1 base");
      expect(result).toContain("1 if");
      expect(result).toContain("1 ternary");
      expect(result).toContain("1 &&");
      expect(result).toContain("2 ||");
    });

    it("should handle zero counts correctly", () => {
      const breakdown = {
        base: 1,
        "if": 0,
        "&&": 2,
      };
      const result = formatComplexityBreakdown(breakdown, 3);
      
      expect(result).not.toContain("0 if");
      expect(result).toContain("2 &&");
    });
  });

  describe("formatComplexityBreakdownInline", () => {
    it("should format breakdown in ESLint-style format", () => {
      const breakdown = { base: 1 };
      const result = formatComplexityBreakdownInline(breakdown, 1);
      
      expect(result).toBe("1 base");
    });

    it("should use ESLint symbols for operators", () => {
      const breakdown = {
        base: 1,
        "ternary": 1,
        "&&": 2,
        "||": 1,
        "??": 1,
        "?.": 1,
      };
      const result = formatComplexityBreakdownInline(breakdown, 7);
      
      expect(result).toContain("+1 ?:");
      expect(result).toContain("+2 &&");
      expect(result).toContain("+1 ||");
      expect(result).toContain("+1 ??");
      expect(result).toContain("+1 ?.");
    });

    it("should format with plus signs for decision points", () => {
      const breakdown = {
        base: 1,
        "if": 2,
        "&&": 3,
      };
      const result = formatComplexityBreakdownInline(breakdown, 6);
      
      expect(result).toBe("1 base +2 if +3 &&");
    });

    it("should maintain consistent type order", () => {
      const breakdown = {
        base: 1,
        "||": 1,
        "if": 1,
        "ternary": 1,
      };
      const result = formatComplexityBreakdownInline(breakdown, 4);
      
      // Should be in type order
      const parts = result.split(" ");
      const baseIndex = parts.indexOf("base");
      const ifIndex = parts.indexOf("+1");
      const ternaryIndex = result.indexOf("?:");
      const orIndex = result.indexOf("||");
      
      expect(baseIndex).toBeLessThan(ifIndex);
      expect(ternaryIndex).toBeLessThan(orIndex);
    });
  });

  describe("formatComplexityBreakdownStyled", () => {
    it("should format breakdown with HTML spans", () => {
      const breakdown = { base: 1 };
      const result = formatComplexityBreakdownStyled(breakdown, 1);
      
      expect(result).toContain('<span class="complexity-number">1</span>');
      expect(result).toContain("base");
    });

    it("should use ESLint symbols for operators", () => {
      const breakdown = {
        base: 1,
        "ternary": 1,
        "&&": 2,
      };
      const result = formatComplexityBreakdownStyled(breakdown, 4);
      
      expect(result).toContain("?:");
      expect(result).toContain("&&");
      expect(result).toContain('<span class="complexity-number">1</span>');
      expect(result).toContain('<span class="complexity-number">2</span>');
    });

    it("should include breakdown dividers", () => {
      const breakdown = {
        base: 1,
        "if": 1,
        "&&": 1,
      };
      const result = formatComplexityBreakdownStyled(breakdown, 3);
      
      expect(result).toContain('<span class="breakdown-divider">|</span>');
    });

    it("should format multiple decision points with dividers", () => {
      const breakdown = {
        base: 1,
        "if": 2,
        "&&": 3,
        "ternary": 1,
      };
      const result = formatComplexityBreakdownStyled(breakdown, 7);
      
      // Should have dividers between each part
      const dividerCount = (result.match(/breakdown-divider/g) || []).length;
      expect(dividerCount).toBe(3); // Between base|if|&&|ternary
    });
  });

  describe("formatComplexityConcise", () => {
    it("should delegate to formatComplexityBreakdownInline", () => {
      const breakdown = {
        base: 1,
        "if": 2,
      };
      const result = formatComplexityConcise(breakdown, 3);
      
      expect(result).toBe(formatComplexityBreakdownInline(breakdown, 3));
    });
  });
});
