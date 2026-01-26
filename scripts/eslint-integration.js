import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

/**
 * Runs ESLint with a temporary config to collect complexity for ALL functions
 * @param {string} projectRoot - Root directory of the project
 * @returns {Array} ESLint results as JSON array
 */
export function runESLintComplexityCheck(projectRoot) {
  // Create temporary ESLint config with max: 0 to get complexity for ALL functions
  const tempConfigPath = resolve(projectRoot, 'eslint.config.temp.js');
  const tempConfig = `import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'complexity', '**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']),
  {
    files: ['**/*.{ts,tsx}'],
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
      // Set max to 0 to report complexity for ALL functions
      complexity: ["warn", { max: 0, variant: "classic" }],
    },
  },
  {
    files: ['**/*.js'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      // Set max to 0 to report complexity for ALL functions
      complexity: ["warn", { max: 0, variant: "classic" }],
    },
  },
])
`;

  writeFileSync(tempConfigPath, tempConfig, 'utf-8');

  // Run ESLint with temp config to get complexity for ALL functions
  console.log('Running ESLint to collect complexity for all functions...');
  try {
    execSync(`npx eslint . --config ${tempConfigPath} --format=json --output-file=complexity-report.json`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  } catch {
    // ESLint exits with non-zero if there are warnings/errors, which is expected
    console.log('ESLint completed (warnings/errors are expected)');
  } finally {
    // Clean up temp config file
    try {
      unlinkSync(tempConfigPath);
    } catch {
      // Ignore cleanup errors
    }
  }

  // Read the JSON report
  try {
    const jsonContent = readFileSync(resolve(projectRoot, 'complexity-report.json'), 'utf-8');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error reading ESLint JSON report:', error.message);
    process.exit(1);
  }
}
