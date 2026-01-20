import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      // Use V8 engine for coverage (faster and more modern than Istanbul)
      provider: "v8",
      // Generate multiple report formats:
      // - text: terminal output (shows summary in console)
      // - json: machine-readable results (for CI/CD integration)
      // - html: browsable report (opens in browser, shows line-by-line coverage)
      reporter: ["text", "json", "html"],
      // Only include source files from src directory (TypeScript/TSX files)
      include: ["src/**/*.{ts,tsx}"],
      // Exclude files that shouldn't be counted in coverage:
      // - Entry points (main.tsx)
      // - Type definitions (vite-env.d.ts, types.ts files)
      // - Test files themselves (they're not production code)
      // - Pure constant/data files (categories.ts - just data, no logic)
      // - Context instance files (ThemeContextInstance.ts - just type exports)
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "src/setupTests.ts",
        "src/**/types.ts", // Type definition files (don't execute, 0% coverage expected)
        "src/data/blog/categories.ts", // Pure constant data file (no logic to test)
        "src/context/ThemeContextInstance.ts", // Type exports and createContext only
      ],
    },
  },
});
