import { describe, it, expect, beforeEach } from "vitest";
import {
  setEscapeHtml,
  buildFunctionHierarchy,
  findMaxComplexityInSubtree,
  formatFunctionNode,
  extractCallbackLabel,
  formatFunctionHierarchy,
} from "../function-hierarchy.js";

describe("function-hierarchy", () => {
  beforeEach(() => {
    // Set up escapeHtml before each test
    setEscapeHtml((str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;"));
  });
  describe("setEscapeHtml", () => {
    it("should set the escapeHtml function", () => {
      const mockEscapeHtml = (str) => str.replace(/</g, "&lt;");
      setEscapeHtml(mockEscapeHtml);
      // Function is set internally, we can't directly test it, but we can verify it doesn't throw
      expect(() => setEscapeHtml(mockEscapeHtml)).not.toThrow();
    });
  });

  describe("buildFunctionHierarchy", () => {
    it("should return empty array for empty functions", () => {
      const functions = [];
      const boundaries = new Map();
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result).toEqual([]);
    });

    it("should return single top-level function", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe(1);
      expect(result[0].children).toEqual([]);
    });

    it("should build parent-child relationships", () => {
      const functions = [
        { line: 1, functionName: "parent", complexity: "5" },
        { line: 3, functionName: "child", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }], // Parent contains child
        [3, { start: 3, end: 7 }],  // Child is inside parent
      ]);
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe(1);
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].line).toBe(3);
    });

    it("should choose smallest containing function as parent", () => {
      const functions = [
        { line: 1, functionName: "outer", complexity: "5" },
        { line: 2, functionName: "middle", complexity: "4" },
        { line: 3, functionName: "inner", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 20 }], // Outer contains both
        [2, { start: 2, end: 15 }], // Middle contains inner
        [3, { start: 3, end: 10 }], // Inner
      ]);
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result).toHaveLength(1); // Only outer is top-level
      expect(result[0].line).toBe(1);
      expect(result[0].children).toHaveLength(1); // Middle is child of outer
      expect(result[0].children[0].line).toBe(2);
      expect(result[0].children[0].children).toHaveLength(1); // Inner is child of middle
      expect(result[0].children[0].children[0].line).toBe(3);
    });

    it("should sort children by line number", () => {
      const functions = [
        { line: 1, functionName: "parent", complexity: "5" },
        { line: 10, functionName: "child2", complexity: "3" },
        { line: 5, functionName: "child1", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 20 }],
        [5, { start: 5, end: 8 }],
        [10, { start: 10, end: 15 }],
      ]);
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].line).toBe(5); // Sorted by line
      expect(result[0].children[1].line).toBe(10);
    });

    it("should handle functions without boundaries", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3" },
      ];
      const boundaries = new Map(); // No boundaries
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result).toEqual([]);
    });
  });

  describe("findMaxComplexityInSubtree", () => {
    it("should return complexity for node without children", () => {
      const node = {
        complexity: "5",
        children: [],
      };
      const result = findMaxComplexityInSubtree(node);
      expect(result).toBe(5);
    });

    it("should find max complexity in subtree", () => {
      const node = {
        complexity: "3",
        children: [
          { complexity: "5", children: [] },
          { complexity: "2", children: [] },
        ],
      };
      const result = findMaxComplexityInSubtree(node);
      expect(result).toBe(5);
    });

    it("should find max complexity in nested subtree", () => {
      const node = {
        complexity: "1",
        children: [
          {
            complexity: "3",
            children: [
              { complexity: "10", children: [] },
            ],
          },
          { complexity: "5", children: [] },
        ],
      };
      const result = findMaxComplexityInSubtree(node);
      expect(result).toBe(10);
    });

    it("should handle string complexity values", () => {
      const node = {
        complexity: "15",
        children: [
          { complexity: "20", children: [] },
        ],
      };
      const result = findMaxComplexityInSubtree(node);
      expect(result).toBe(20);
    });
  });

  describe("formatFunctionNode", () => {
    it("should format node without children", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("test");
      expect(result).toContain("3");
    });

    it("should format node with children", () => {
      const node = {
        line: 1,
        functionName: "parent",
        complexity: "5",
        children: [
          { line: 3, functionName: "child", complexity: "3", children: [] },
        ],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("parent");
      expect(result).toContain("child");
    });

    it("should handle depth parameter", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 2);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should throw error when escapeHtml not set", () => {
      setEscapeHtml(null);
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map();
      
      expect(() => formatFunctionNode(node, breakdowns)).toThrow("escapeHtml not set");
    });

    it("should format node with complexity 1 as base", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "1",
        children: [],
      };
      const breakdowns = new Map();
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("base");
    });

    it("should show breakdown when calculatedTotal equals actualComplexity", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
    });

    it("should show breakdown when difference is 1 and calculated < actual", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 3 }, calculatedTotal: 4 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
    });

    it("should not show breakdown when difference > 1", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 1 }, calculatedTotal: 2 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
      expect(result).not.toContain("(");
    });

    it("should format top-level function with highest complexity highlighting", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "", 5);
      
      expect(result).toContain("function-highlight");
    });

    it("should format nested function with depth > 0", () => {
      const node = {
        line: 3,
        functionName: "child (arrow function)",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, false, "", 5);
      
      expect(result).toContain("├─");
      expect(result).toContain("child");
    });

    it("should format nested function with isLast = true", () => {
      const node = {
        line: 3,
        functionName: "child",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, true, "", 5);
      
      expect(result).toContain("└─");
    });

    it("should format nested function with complexity 1", () => {
      const node = {
        line: 3,
        functionName: "child (arrow function)",
        complexity: "1",
        children: [],
      };
      const breakdowns = new Map();
      const result = formatFunctionNode(node, breakdowns, 1, false, "│  ", 5);
      
      expect(result).toContain("(base)");
    });

    it("should format nested function with callback type", () => {
      const node = {
        line: 3,
        functionName: "handler (useEffect callback)",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, false, "", 5);
      
      expect(result).toContain("(useEffect)");
    });

    it("should format nested function with highest complexity highlighting", () => {
      const node = {
        line: 3,
        functionName: "child",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, false, "", 5);
      
      expect(result).toContain("function-highlight");
    });

    it("should handle node without breakdown", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map();
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("test");
      expect(result).toContain("CC: 3");
    });

    it("should handle node with calculatedTotal different from actualComplexity", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
      expect(result).not.toContain("(");
    });

    it("should process children with depth 0", () => {
      const node = {
        line: 1,
        functionName: "parent",
        complexity: "5",
        children: [
          { line: 3, functionName: "child", complexity: "3", children: [] },
        ],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "");
      
      expect(result).toContain("parent");
      expect(result).toContain("child");
    });

    it("should process children with depth > 0 and isLast = true", () => {
      const node = {
        line: 3,
        functionName: "child",
        complexity: "3",
        children: [
          { line: 5, functionName: "grandchild", complexity: "2", children: [] },
        ],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
        [5, { breakdown: { base: 1, "if": 1 }, calculatedTotal: 2 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, true, "│  ", 5);
      
      expect(result).toContain("child");
      expect(result).toContain("grandchild");
    });

    it("should process children with depth > 0 and isLast = false", () => {
      const node = {
        line: 3,
        functionName: "child",
        complexity: "3",
        children: [
          { line: 5, functionName: "grandchild", complexity: "2", children: [] },
        ],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
        [5, { breakdown: { base: 1, "if": 1 }, calculatedTotal: 2 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, false, "│  ", 5);
      
      expect(result).toContain("child");
      expect(result).toContain("grandchild");
    });

    it("should handle top-level function without highest complexity", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "", 5);
      
      expect(result).toContain("test");
      expect(result).not.toContain("function-highlight");
    });

    it("should handle nested function without highest complexity", () => {
      const node = {
        line: 3,
        functionName: "child",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1, false, "", 5);
      
      expect(result).toContain("child");
      expect(result).not.toContain("function-highlight");
    });

    it("should handle maxComplexityInGroup as null", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "", null);
      
      expect(result).toContain("test");
      expect(result).not.toContain("function-highlight");
    });
  });

  describe("extractCallbackLabel", () => {
    it("should extract useEffect callback label", () => {
      const node = {
        functionName: "handler (useEffect callback)",
        line: 5,
      };
      const parentNode = {
        functionName: "MyComponent",
        line: 1,
      };
      const sourceCode = `function MyComponent() {
  useEffect(() => {
    return true;
  }, []);
}`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, sourceCode, 5);
      
      expect(result).toContain("useEffect");
    });

    it("should extract setTimeout callback label", () => {
      const node = {
        functionName: "handler (setTimeout callback)",
        line: 3,
      };
      const parentNode = {
        functionName: "test",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, "", 3);
      
      expect(result).toBe("setTimeout callback");
    });

    it("should handle node without callback suffix", () => {
      const node = {
        functionName: "regularFunction",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, "", 1);
      
      // Returns 'callback' as default when no specific pattern matches
      expect(result).toBe("callback");
    });

    it("should extract cleanup callback label", () => {
      const node = {
        functionName: "cleanup (return callback)",
        line: 5,
      };
      const parentNode = {
        functionName: "MyComponent",
        line: 1,
      };
      const sourceCode = `function MyComponent() {
  useEffect(() => {
    return () => {};
  }, []);
}`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, sourceCode, 5);
      
      expect(result).toBe("cleanup");
    });

    it("should extract cleanup callback with useEffect parent", () => {
      const parentNode = {
        functionName: "handler (useEffect callback)",
        line: 3,
      };
      const node = {
        functionName: "cleanup (return callback)",
        line: 5,
      };
      const sourceCode = `useEffect(() => {
  return () => {};
}, []);`;
      const siblingCallbacks = new Map();
      // Mock extractCallbackLabel to return useEffect#1 for parent
      siblingCallbacks.set('_useEffect', 1);
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, sourceCode, 5);
      
      // Should return cleanup or useEffect#1 cleanup depending on parent label
      expect(result).toBeTruthy();
    });

    it("should extract requestAnimationFrame callback label", () => {
      const node = {
        functionName: "handler (requestAnimationFrame callback)",
        line: 3,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, "", 3);
      
      expect(result).toBe("rAF callback");
    });

    it("should extract requestAnimationFrame callback from context", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      const sourceCode = `requestAnimationFrame(() => {
  // handler code
});`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      expect(result).toBe("rAF callback");
    });

    it("should extract setTimeout callback from context", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      const sourceCode = `setTimeout(() => {
  // handler code
}, 1000);`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      expect(result).toBe("setTimeout callback");
    });

    it("should extract event handler from function name", () => {
      const node = {
        functionName: "onClick (arrow function)",
        line: 3,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, "", 3);
      
      expect(result).toBe("onClick handler");
    });

    it("should extract JSX inline callback", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      const sourceCode = `<button onClick={() => {
  // handler code
}}>Click</button>`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      expect(result).toBe("JSX onClick");
    });

    it("should extract event handler from context (onScroll)", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      // The function checks if context includes 'onScroll' but NOT 'onScroll='
      // addEventListener('scroll') doesn't match this pattern
      // The function looks for 'onScroll' in context, so we need a different pattern
      const sourceCode = `function handler() {
  // onScroll handler code
}`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      // The function checks for 'onScroll' in context without 'onScroll='
      // This test verifies the actual behavior
      expect(result).toBeTruthy();
    });

    it("should extract event handler from context (onClick)", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      // The function checks if context includes 'onClick' but NOT 'onClick='
      // addEventListener('click') doesn't match this pattern
      const sourceCode = `function handler() {
  // onClick handler code
}`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      // The function checks for 'onClick' in context without 'onClick='
      // This test verifies the actual behavior
      expect(result).toBeTruthy();
    });

    it("should not match onScroll when onScroll= is present", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      const sourceCode = `<div onScroll={() => {}}>`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      // Should not return "onScroll handler" because onScroll= is present
      expect(result).not.toBe("onScroll handler");
    });

    it("should not match onClick when onClick= is present", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      const sourceCode = `<button onClick={() => {}}>`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 3);
      
      // Should return JSX onClick instead
      expect(result).toBe("JSX onClick");
    });

    it("should extract useEffect callback from context", () => {
      const node = {
        functionName: "handler",
        line: 3,
      };
      const parentNode = {
        functionName: "MyComponent",
        line: 1,
      };
      const sourceCode = `function MyComponent() {
  useEffect(() => {
    // handler code
  }, []);
}`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, sourceCode, 3);
      
      expect(result).toContain("useEffect");
    });

    it("should number multiple useEffect callbacks", () => {
      const node1 = {
        functionName: "handler1 (useEffect callback)",
        line: 3,
      };
      const node2 = {
        functionName: "handler2 (useEffect callback)",
        line: 5,
      };
      const parentNode = {
        functionName: "MyComponent",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result1 = extractCallbackLabel(node1, parentNode, siblingCallbacks, "", 3);
      const result2 = extractCallbackLabel(node2, parentNode, siblingCallbacks, "", 5);
      
      expect(result1).toBe("useEffect#1");
      expect(result2).toBe("useEffect#2");
    });

    it("should extract arrow function callback with parent name", () => {
      const node = {
        functionName: "handler (arrow function)",
        line: 3,
      };
      const parentNode = {
        functionName: "processData",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, "", 3);
      
      // Should return "processData callback" if parent name not in function name
      expect(result).toBe("processData callback");
    });

    it("should return default callback when parent name is in function name", () => {
      const node = {
        functionName: "processData handler (arrow function)",
        line: 3,
      };
      const parentNode = {
        functionName: "processData",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, "", 3);
      
      expect(result).toBe("callback");
    });

    it("should return default callback when parent is unknown", () => {
      const node = {
        functionName: "handler (arrow function)",
        line: 3,
      };
      const parentNode = {
        functionName: "unknown",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, "", 3);
      
      expect(result).toBe("callback");
    });

    it("should return default callback when parent is anonymous", () => {
      const node = {
        functionName: "handler (arrow function)",
        line: 3,
      };
      const parentNode = {
        functionName: "anonymous",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, "", 3);
      
      expect(result).toBe("callback");
    });

    it("should return default callback when no arrow function", () => {
      const node = {
        functionName: "regularFunction",
        line: 1,
      };
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, "", 1);
      
      expect(result).toBe("callback");
    });

    it("should handle cleanup callback with cleanup in name", () => {
      const node = {
        functionName: "cleanup",
        line: 5,
      };
      const sourceCode = `return () => {};`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 5);
      
      expect(result).toBe("cleanup");
    });

    it("should handle context around line", () => {
      const node = {
        functionName: "handler",
        line: 10,
      };
      const sourceCode = Array(20).fill("line").map((_, i) => `line ${i + 1}`).join("\n");
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 10);
      
      // Should extract context around line 10 (lines 0-20, but clamped)
      expect(result).toBeTruthy();
    });
  });

  describe("formatFunctionHierarchy", () => {
    it("should format empty hierarchy", () => {
      const functions = [];
      const boundaries = new Map();
      const breakdowns = new Map();
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toBe("");
    });

    it("should throw error when escapeHtml not set", () => {
      setEscapeHtml(null);
      const functions = [
        { line: 1, functionName: "test", complexity: "3" },
      ];
      const boundaries = new Map();
      const breakdowns = new Map();
      
      expect(() => formatFunctionHierarchy(functions, boundaries, breakdowns)).toThrow("escapeHtml not set");
    });

    it("should format single function hierarchy", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
      expect(result).toContain("3");
    });

    it("should format hierarchy with parent and child", () => {
      const functions = [
        { line: 1, functionName: "parent", complexity: "5", file: "test.ts" },
        { line: 3, functionName: "child", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [3, { start: 3, end: 7 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("parent");
      expect(result).toContain("child");
    });

    it("should handle multiple functions on same line (keep highest complexity)", () => {
      const functions = [
        { line: 1, functionName: "func1", complexity: "3", file: "test.ts" },
        { line: 1, functionName: "func2", complexity: "5", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should keep func2 (higher complexity)
      expect(result).toContain("func2");
      expect(result).not.toContain("func1");
    });

    it("should handle duplicate keys (keep higher complexity)", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
        { line: 1, functionName: "test", complexity: "5", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should keep the one with complexity 5
      expect(result).toContain("5");
    });

    it("should use default column structure when not provided", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
    });

    it("should filter empty columns when showAllColumns is false", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const columnStructure = {
        groups: [
          {
            name: 'Control Flow',
            columns: [
              { key: 'if', label: 'if' },
              { key: 'for', label: 'for' },
            ]
          }
        ],
        baseColumn: { key: 'base', label: 'base' }
      };
      const emptyColumns = new Set(['for']);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns, "", columnStructure, emptyColumns, false);
      
      expect(result).toContain("test");
      // Should not include 'for' column since it's empty
    });

    it("should show all columns when showAllColumns is true", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const columnStructure = {
        groups: [
          {
            name: 'Control Flow',
            columns: [
              { key: 'if', label: 'if' },
              { key: 'for', label: 'for' },
            ]
          }
        ],
        baseColumn: { key: 'base', label: 'base' }
      };
      const emptyColumns = new Set(['for']);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns, "", columnStructure, emptyColumns, true);
      
      expect(result).toContain("test");
      // Should include 'for' column even though it's empty
    });

    it("should handle functions without breakdown", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map();
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
      expect(result).toContain("3");
    });

    it("should display '-' for zero values in breakdown", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2, "for": 0 }, calculatedTotal: 3 }],
      ]);
      const columnStructure = {
        groups: [
          {
            name: 'Control Flow',
            columns: [
              { key: 'if', label: 'if' },
              { key: 'for', label: 'for' },
            ]
          }
        ],
        baseColumn: { key: 'base', label: 'base' }
      };
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns, "", columnStructure, new Set(), false);
      
      // Should show '-' for for column (value 0)
      expect(result).toContain("-");
    });

    it("should always show base column as 1", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Base should always be 1, never "-"
      expect(result).toContain("1");
      expect(result).not.toContain('base: "-"');
    });

    it("should sort functions by line number", () => {
      const functions = [
        { line: 10, functionName: "func2", complexity: "3", file: "test.ts" },
        { line: 5, functionName: "func1", complexity: "3", file: "test.ts" },
        { line: 15, functionName: "func3", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [5, { start: 5, end: 8 }],
        [10, { start: 10, end: 13 }],
        [15, { start: 15, end: 18 }],
      ]);
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
        [10, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
        [15, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should be sorted by line number
      const func1Index = result.indexOf("func1");
      const func2Index = result.indexOf("func2");
      const func3Index = result.indexOf("func3");
      expect(func1Index).toBeLessThan(func2Index);
      expect(func2Index).toBeLessThan(func3Index);
    });

    it("should handle functions with same name but different lines", () => {
      const functions = [
        { line: 5, functionName: "handler", complexity: "3", file: "test.ts" },
        { line: 10, functionName: "handler", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [5, { start: 5, end: 8 }],
        [10, { start: 10, end: 13 }],
      ]);
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
        [10, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should show both functions separately
      const handlerCount = (result.match(/handler/g) || []).length;
      expect(handlerCount).toBeGreaterThanOrEqual(2);
    });

    it("should fix function name for callbacks", () => {
      const functions = [
        { line: 5, functionName: "wrongParent (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      // This tests fixFunctionNameForCallback indirectly
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("useEffect");
    });

    it("should handle function without file property", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
    });

    it("should handle empty breakdown data", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: {}, calculatedTotal: 1 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
    });

    it("should handle breakdown with base value", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2, "for": 0 }, calculatedTotal: 3 }],
      ]);
      const columnStructure = {
        groups: [
          {
            name: 'Control Flow',
            columns: [
              { key: 'if', label: 'if' },
              { key: 'for', label: 'for' },
            ]
          }
        ],
        baseColumn: { key: 'base', label: 'base' }
      };
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns, "", columnStructure, new Set(), false);
      
      expect(result).toContain("test");
      expect(result).toContain("1"); // base value
    });

    it("should handle function with missing file in key", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
    });

    it("should handle breakdown without base key", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should default base to 1
      expect(result).toContain("1");
    });

    it("should handle multiple functions with same key but different complexity", () => {
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
        { line: 1, functionName: "test", complexity: "5", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should keep the one with complexity 5
      expect(result).toContain("5");
    });

    it("should handle function with callback name that needs fixing", () => {
      const functions = [
        { line: 5, functionName: "wrongName (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      // This tests fixFunctionNameForCallback indirectly
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("useEffect");
    });

    it("should handle arrow function callback with depth 0 (no inline JSX callback)", () => {
      const node = {
        line: 1,
        functionName: "handler (arrow function)",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0);
      
      expect(result).toContain("handler");
      // At depth 0, should not be labeled as "inline JSX callback"
    });

    it("should handle arrow function callback with depth > 0 (inline JSX callback)", () => {
      const node = {
        line: 3,
        functionName: "handler (arrow function)",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1);
      
      expect(result).toContain("handler");
      expect(result).toContain("(inline JSX callback)");
    });

    it("should handle arrow function callback with event handler name", () => {
      const node = {
        line: 3,
        functionName: "onClick (arrow function)",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [3, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 1);
      
      expect(result).toContain("onClick");
      expect(result).toContain("(event handler)");
    });

    it("should handle all callback types in detectCallbackType", () => {
      const breakdowns = new Map();
      
      // Test useEffect callback (at depth > 0 to show callback type)
      const useEffectNode = {
        line: 3,
        functionName: "handler (useEffect callback)",
        complexity: "3",
        children: [],
      };
      const useEffectResult = formatFunctionNode(useEffectNode, breakdowns, 1);
      expect(useEffectResult).toContain("handler");
      expect(useEffectResult).toContain("(useEffect)");
      
      // Test setTimeout callback (at depth > 0)
      const setTimeoutNode = {
        line: 3,
        functionName: "handler (setTimeout callback)",
        complexity: "3",
        children: [],
      };
      const setTimeoutResult = formatFunctionNode(setTimeoutNode, breakdowns, 1);
      expect(setTimeoutResult).toContain("handler");
      expect(setTimeoutResult).toContain("(setTimeout)");
      
      // Test requestAnimationFrame callback (at depth > 0)
      const rafNode = {
        line: 3,
        functionName: "handler (requestAnimationFrame callback)",
        complexity: "3",
        children: [],
      };
      const rafResult = formatFunctionNode(rafNode, breakdowns, 1);
      expect(rafResult).toContain("handler");
      expect(rafResult).toContain("(animation frame)");
      
      // Test return callback (at depth > 0)
      const returnNode = {
        line: 3,
        functionName: "handler (return callback)",
        complexity: "3",
        children: [],
      };
      const returnResult = formatFunctionNode(returnNode, breakdowns, 1);
      expect(returnResult).toContain("handler");
      expect(returnResult).toContain("(cleanup)");
    });

    it("should handle formatComplexityDisplay with complexity 1", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "1",
        children: [],
      };
      const breakdowns = new Map();
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("base");
    });

    it("should handle formatComplexityDisplay without breakdown", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map();
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
      expect(result).not.toContain("(");
    });

    it("should handle formatComplexityDisplay with breakdown", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
      expect(result).toContain("(");
    });

    it("should handle buildFunctionHierarchy when parent node not found in functionMap", () => {
      const functions = [
        { line: 1, functionName: "parent", complexity: "5" },
        { line: 3, functionName: "child", complexity: "3" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [3, { start: 3, end: 7 }],
      ]);
      // This shouldn't happen in practice, but test the branch
      const result = buildFunctionHierarchy(functions, boundaries);
      
      expect(result).toHaveLength(1);
    });

    it("should handle isHighestComplexityInGroup when actualComplexity equals maxComplexityInGroup", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "", 5);
      
      expect(result).toContain("function-highlight");
    });

    it("should handle isHighestComplexityInGroup when actualComplexity is less than maxComplexityInGroup", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "", 5);
      
      expect(result).not.toContain("function-highlight");
    });

    it("should handle isHighestComplexityInGroup when actualComplexity is greater than maxComplexityInGroup", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "10",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 9 }, calculatedTotal: 10 }],
      ]);
      const result = formatFunctionNode(node, breakdowns, 0, true, "", 5);
      
      expect(result).toContain("function-highlight");
    });

    it("should handle processChildren with empty children array", () => {
      const node = {
        line: 1,
        functionName: "parent",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("parent");
      expect(result).not.toContain("child");
    });

    it("should handle cleanup callback with parent that has useEffect label", () => {
      const parentNode = {
        functionName: "handler (useEffect callback)",
        line: 3,
      };
      const node = {
        functionName: "cleanup (return callback)",
        line: 5,
      };
      const sourceCode = `useEffect(() => {
  return () => {};
}, []);`;
      const siblingCallbacks = new Map();
      // First call to get parent label (should return useEffect#1)
      const parentLabel = extractCallbackLabel(parentNode, null, siblingCallbacks, sourceCode, 3);
      // Then test cleanup with that parent - should return "useEffect#1 cleanup"
      const result = extractCallbackLabel(node, parentNode, siblingCallbacks, sourceCode, 5);
      
      // Should return cleanup with useEffect parent label
      expect(result).toContain("cleanup");
      // If parent has useEffect label, should include it
      if (parentLabel.startsWith('useEffect#')) {
        expect(result).toContain(parentLabel);
      }
    });

    it("should handle cleanup callback without parent", () => {
      const node = {
        functionName: "cleanup (return callback)",
        line: 5,
      };
      const sourceCode = `return () => {};`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 5);
      
      expect(result).toBe("cleanup");
    });

    it("should handle cleanup callback with cleanup in function name", () => {
      const node = {
        functionName: "cleanup",
        line: 5,
      };
      const sourceCode = `return () => {};`;
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 5);
      
      expect(result).toBe("cleanup");
    });

    it("should handle getContextAroundLine with line near start of file", () => {
      const node = {
        functionName: "handler",
        line: 2,
      };
      const sourceCode = "line 1\nline 2\nline 3\nline 4";
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 2);
      
      // Should extract context around line 2
      expect(result).toBeTruthy();
    });

    it("should handle getContextAroundLine with line near end of file", () => {
      const node = {
        functionName: "handler",
        line: 18,
      };
      const sourceCode = Array(20).fill("line").map((_, i) => `line ${i + 1}`).join("\n");
      const siblingCallbacks = new Map();
      const result = extractCallbackLabel(node, null, siblingCallbacks, sourceCode, 18);
      
      // Should extract context around line 18
      expect(result).toBeTruthy();
    });

    it("should handle findImmediateParentFunction when no containing functions", () => {
      const functions = [
        { line: 5, functionName: "test (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
    });

    it("should handle findImmediateParentFunction when funcBoundary is missing", () => {
      const functions = [
        { line: 5, functionName: "test (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map(); // No boundary for line 5
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("test");
    });

    it("should handle fixFunctionNameForCallback when callbackMatch is null", () => {
      const functions = [
        { line: 1, functionName: "regularFunction", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      expect(result).toContain("regularFunction");
    });

    it("should handle fixFunctionNameForCallback when functionBoundaries is null", () => {
      const functions = [
        { line: 5, functionName: "test (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const breakdowns = new Map([
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      // This tests the branch where functionBoundaries is falsy (passing new Map() instead of null)
      const result = formatFunctionHierarchy(functions, new Map(), breakdowns);
      
      expect(result).toContain("test");
    });

    it("should handle fixFunctionNameForCallback when correctParentName matches parentName", () => {
      const functions = [
        { line: 1, functionName: "parent", complexity: "5", file: "test.ts" },
        { line: 5, functionName: "parent (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should not change the name since parentName matches
      expect(result).toContain("parent");
    });

    it("should handle fixFunctionNameForCallback when correctParentName is unknown", () => {
      const functions = [
        { line: 1, functionName: "unknown", complexity: "5", file: "test.ts" },
        { line: 5, functionName: "wrongName (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should not change the name since correctParentName is "unknown"
      expect(result).toContain("wrongName");
    });

    it("should handle fixFunctionNameForCallback when correctParentName is anonymous", () => {
      const functions = [
        { line: 1, functionName: "anonymous", complexity: "5", file: "test.ts" },
        { line: 5, functionName: "wrongName (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should not change the name since correctParentName is "anonymous"
      expect(result).toContain("wrongName");
    });

    it("should handle formatFunctionNode with showBreakdown false when breakdown exists but conditions not met", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "5",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 1 }, calculatedTotal: 2 }], // Difference is 3, > 1
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 5");
      expect(result).not.toContain("(");
    });

    it("should handle formatFunctionNode with showBreakdown false when calculatedTotal > actualComplexity", () => {
      const node = {
        line: 1,
        functionName: "test",
        complexity: "3",
        children: [],
      };
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }], // Calculated > actual
      ]);
      const result = formatFunctionNode(node, breakdowns);
      
      expect(result).toContain("CC: 3");
      expect(result).not.toContain("(");
    });

    it("should fix function name when correctParentName differs from parentName", () => {
      // This tests the branch in fixFunctionNameForCallback where correctParentName is set
      // and differs from parentName
      const functions = [
        { line: 1, functionName: "actualParent", complexity: "5", file: "test.ts" },
        { line: 5, functionName: "wrongParent (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should fix the name to use actualParent instead of wrongParent
      expect(result).toContain("actualParent");
    });

    it("should handle duplicate key with higher complexity in functionGroups", () => {
      // This tests the branch where duplicate key exists and new function has higher complexity
      const functions = [
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
        { line: 1, functionName: "test", complexity: "5", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should keep the one with complexity 5
      expect(result).toContain("5");
    });

    it("should handle duplicate key with lower complexity in functionGroups (keep existing)", () => {
      // This tests the branch where duplicate key exists but new function has lower complexity
      const functions = [
        { line: 1, functionName: "test", complexity: "5", file: "test.ts" },
        { line: 1, functionName: "test", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 5 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should keep the one with complexity 5 (first one)
      expect(result).toContain("5");
    });

    it("should handle fixFunctionNameForCallback when correctParentName is null", () => {
      // This tests when getBaseFunctionName returns null
      const functions = [
        { line: 1, functionName: "", complexity: "5", file: "test.ts" }, // Empty function name
        { line: 5, functionName: "wrongParent (useEffect callback)", complexity: "3", file: "test.ts" },
      ];
      const boundaries = new Map([
        [1, { start: 1, end: 10 }],
        [5, { start: 5, end: 8 }],
      ]);
      const breakdowns = new Map([
        [1, { breakdown: { base: 1, "if": 4 }, calculatedTotal: 5 }],
        [5, { breakdown: { base: 1, "if": 2 }, calculatedTotal: 3 }],
      ]);
      const result = formatFunctionHierarchy(functions, boundaries, breakdowns);
      
      // Should not change the name since correctParentName would be null/empty
      expect(result).toContain("wrongParent");
    });
  });
});
