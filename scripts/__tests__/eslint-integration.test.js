import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock functions using vi.hoisted to ensure they're available when modules are imported
// These must be actual functions, not just vi.fn() references
const mockWriteFileSync = vi.hoisted(() => {
  const fn = vi.fn(() => {});
  return fn;
});
const mockReadFileSync = vi.hoisted(() => {
  const fn = vi.fn(() => "[]");
  return fn;
});
const mockUnlinkSync = vi.hoisted(() => {
  const fn = vi.fn(() => {});
  return fn;
});
const mockExecSync = vi.hoisted(() => {
  const fn = vi.fn(() => Buffer.from(""));
  return fn;
});

// Mock modules BEFORE importing the module under test
vi.mock("child_process", () => {
  return {
    default: {
      execSync: mockExecSync,
    },
    execSync: mockExecSync,
  };
});

vi.mock("fs", () => {
  return {
    default: {
      writeFileSync: mockWriteFileSync,
      readFileSync: mockReadFileSync,
      unlinkSync: mockUnlinkSync,
    },
    writeFileSync: mockWriteFileSync,
    readFileSync: mockReadFileSync,
    unlinkSync: mockUnlinkSync,
    promises: {
      writeFile: vi.fn(),
      readFile: vi.fn(),
      unlink: vi.fn(),
    },
  };
});

// Don't mock path - use real resolve function
// vi.mock("path");

// Import AFTER mocks are set up
import { runESLintComplexityCheck } from "../eslint-integration.js";

describe("eslint-integration", () => {
  const mockProjectRoot = "/project";

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockWriteFileSync.mockClear();
    mockReadFileSync.mockClear();
    mockUnlinkSync.mockClear();
    mockExecSync.mockClear();
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Mock process.exit to prevent test from exiting
    vi.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("runESLintComplexityCheck", () => {
    it("should create temp config file", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("[]");

      runESLintComplexityCheck(mockProjectRoot);

      expect(mockWriteFileSync).toHaveBeenCalled();
      const writeCall = mockWriteFileSync.mock.calls[0];
      // resolve will create actual path, so just check it ends with the filename
      expect(writeCall[0]).toContain("eslint.config.temp.js");
      expect(writeCall[1]).toContain("complexity");
      expect(writeCall[1]).toContain("max: 0");
    });

    it("should run ESLint with temp config", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("[]");

      runESLintComplexityCheck(mockProjectRoot);

      expect(mockExecSync).toHaveBeenCalled();
      const execCall = mockExecSync.mock.calls[0][0];
      expect(execCall).toContain("eslint");
      expect(execCall).toContain("--config");
      expect(execCall).toContain("eslint.config.temp.js");
      expect(execCall).toContain("--format=json");
      expect(execCall).toContain("--output-file=complexity-report.json");
    });

    it("should read and parse JSON report", () => {
      const mockResults = [
        {
          filePath: "/project/src/test.ts",
          messages: [
            {
              ruleId: "complexity",
              severity: 1,
              line: 10,
              message: "Function has a complexity of 5",
            },
          ],
        },
      ];
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue(JSON.stringify(mockResults));

      const result = runESLintComplexityCheck(mockProjectRoot);

      expect(mockReadFileSync).toHaveBeenCalled();
      const readCall = mockReadFileSync.mock.calls.find(call => call[0].includes("complexity-report.json"));
      expect(readCall).toBeDefined();
      expect(readCall[1]).toBe("utf-8");
      expect(result).toEqual(mockResults);
    });

    it("should handle ESLint errors gracefully", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("ESLint error");
      });
      mockReadFileSync.mockReturnValue("[]");

      // Should not throw, should log and continue
      expect(() => runESLintComplexityCheck(mockProjectRoot)).not.toThrow();
      expect(console.log).toHaveBeenCalledWith(
        "ESLint completed (warnings/errors are expected)"
      );
    });

    it("should clean up temp config file", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("[]");

      runESLintComplexityCheck(mockProjectRoot);

      expect(mockUnlinkSync).toHaveBeenCalled();
      const unlinkCall = mockUnlinkSync.mock.calls.find(call => call[0].includes("eslint.config.temp.js"));
      expect(unlinkCall).toBeDefined();
    });

    it("should handle cleanup errors gracefully", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("[]");
      mockUnlinkSync.mockImplementation(() => {
        throw new Error("Cleanup error");
      });

      // Should not throw on cleanup error
      expect(() => runESLintComplexityCheck(mockProjectRoot)).not.toThrow();
    });

    it("should handle JSON parse errors", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("invalid json");

      runESLintComplexityCheck(mockProjectRoot);

      expect(console.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should handle file read errors", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      runESLintComplexityCheck(mockProjectRoot);

      expect(console.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should use correct working directory", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("[]");

      runESLintComplexityCheck(mockProjectRoot);

      const execCall = mockExecSync.mock.calls[0];
      expect(execCall[1]).toHaveProperty("cwd", mockProjectRoot);
    });

    it("should create config with correct structure", () => {
      mockExecSync.mockImplementation(() => Buffer.from(""));
      mockReadFileSync.mockReturnValue("[]");

      runESLintComplexityCheck(mockProjectRoot);

      const writeCall = mockWriteFileSync.mock.calls[0];
      const configContent = writeCall[1];
      expect(configContent).toContain("@eslint/js");
      expect(configContent).toContain("globals");
      expect(configContent).toContain("react-hooks");
      expect(configContent).toContain("typescript-eslint");
      expect(configContent).toContain('complexity: ["warn", { max: 0');
      expect(configContent).toContain("globalIgnores");
    });
  });
});
