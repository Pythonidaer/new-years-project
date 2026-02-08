import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Cyclomatic complexity enforcement
      // Target: ≤ 10 for most functions, ≤ 6 for UI components/hooks/event handlers
      // See .cursorrules section 13 for detailed complexity guidelines
      complexity: ["warn", { max: 10, variant: "classic" }],
      // File length enforcement
      // Target: ≤ 1000 lines per file (excluding blank lines and comments)
      // See .cursorrules section 13 for file length guidelines
      // Note: Test files are excluded from this rule
      "max-lines": ["warn", { max: 1000, skipBlankLines: false, skipComments: false }],
      "no-inline-comments": "error",
      // Allow underscore-prefixed parameters for unused parameters (API compatibility)
      "no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
    },
  },
  {
    files: ['**/*.js'],
    ignores: ['**/__tests__/**', '**/*.test.js', '**/*.spec.js'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      // Cyclomatic complexity enforcement
      complexity: ["warn", { max: 10, variant: "classic" }],
      // File length enforcement
      // Note: Test files are excluded from this rule
      "max-lines": ["warn", { max: 1000, skipBlankLines: false, skipComments: false }],
      "no-inline-comments": "error",
      // Allow underscore-prefixed parameters for unused parameters (API compatibility)
      "no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
    },
  },
  // Line length enforcement (scripts folder only)
  {
    files: ['scripts/**/*.js'],
    ignores: ['scripts/__tests__/**'],
    rules: {
      // Target: ≤ 88 characters per line
      "max-len": ["warn", { 
        code: 88, 
        ignoreUrls: true, 
        ignoreStrings: true, 
        ignoreTemplateLiterals: true, 
        ignoreRegExpLiterals: true 
      }],
    },
  },
  // Allow inline comments in theme files (color/value notes are useful on same line)
  {
    files: ['src/context/themes/**'],
    rules: {
      'no-inline-comments': 'off',
    },
  },
])
