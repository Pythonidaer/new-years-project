import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Create temporary ESLint config with max: 0 to get complexity for ALL functions
const tempConfigPath = resolve(projectRoot, 'eslint.config.temp.js');
const tempConfig = `import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']),
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
} catch (error) {
  // ESLint exits with non-zero if there are warnings/errors, which is expected
  console.log('ESLint completed (warnings/errors are expected)');
} finally {
  // Clean up temp config file
  try {
    unlinkSync(tempConfigPath);
  } catch (e) {
    // Ignore cleanup errors
  }
}

// Read the JSON report
let eslintResults;
try {
  const jsonContent = readFileSync(resolve(projectRoot, 'complexity-report.json'), 'utf-8');
  eslintResults = JSON.parse(jsonContent);
} catch (error) {
  console.error('Error reading ESLint JSON report:', error.message);
  process.exit(1);
}

// Helper function to extract function name from source file
function extractFunctionName(filePath, lineNumber) {
  try {
    const fullPath = resolve(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      return 'unknown';
    }
    
    const fileContent = readFileSync(fullPath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Look backwards from the reported line to find function declaration
    // Check up to 50 lines back (should be enough for most cases)
    const startLine = Math.max(0, lineNumber - 50);
    const context = lines.slice(startLine, lineNumber).join('\n');
    
    // Try various function patterns
    const patterns = [
      // function functionName() or export function functionName()
      /(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
      // const functionName = () => or const functionName = function()
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
      // export const functionName = () =>
      /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
      // React component: export default function ComponentName()
      /export\s+default\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
      // Arrow function component: export default () => or const Component = () =>
      /(?:export\s+default\s+|const\s+)([A-Z][a-zA-Z0-9_$]*)\s*[:=]\s*(?:\([^)]*\)\s*)?=>/,
    ];
    
    // Find the last match (most recent function declaration)
    let lastMatch = null;
    let lastIndex = -1;
    
    for (const pattern of patterns) {
      const matches = [...context.matchAll(new RegExp(pattern.source, 'g'))];
      if (matches.length > 0) {
        const match = matches[matches.length - 1];
        const matchIndex = context.lastIndexOf(match[0]);
        if (matchIndex > lastIndex) {
          lastMatch = match[1];
          lastIndex = matchIndex;
        }
      }
    }
    
    return lastMatch || 'anonymous';
  } catch (error) {
    return 'unknown';
  }
}

// Extract complexity for ALL functions (not just those over threshold)
const allFunctions = [];
const functionMap = new Map(); // Use Map to deduplicate: key = file + functionName

eslintResults.forEach((file) => {
  if (file.messages) {
    file.messages.forEach((message) => {
      if (message.ruleId === 'complexity' && message.severity === 1) {
        const complexityMatch = message.message.match(/complexity of (\d+)/i);
        if (complexityMatch) {
          const filePath = file.filePath.replace(projectRoot + '/', '');
          const functionName = extractFunctionName(filePath, message.line);
          const complexity = parseInt(complexityMatch[1]);
          const key = `${filePath}:${functionName}`;
          
          // Deduplicate: keep the entry with the highest complexity for the same function
          const existing = functionMap.get(key);
          if (!existing || complexity > existing.complexity) {
            functionMap.set(key, {
              file: filePath,
              line: message.line,
              column: message.column,
              message: message.message,
              complexity: complexityMatch[1],
              functionName: functionName,
            });
          }
        }
      }
    });
  }
});

// Convert Map to array
allFunctions.push(...functionMap.values());

// Sort by complexity (highest first)
allFunctions.sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity));

// Calculate complexity level for color coding
const getComplexityLevel = (complexity) => {
  const num = parseInt(complexity);
  if (num >= 20) return 'low'; // Dark red
  if (num >= 15) return 'medium'; // Yellow
  if (num > 10) return 'high'; // Green (but still over limit)
  if (num > 6) return 'acceptable'; // Light green (acceptable for UI components)
  return 'good'; // Very light green (good complexity)
};

// Separate functions by threshold
const overThreshold = allFunctions.filter(f => parseInt(f.complexity) > 10);
const allFunctionsCount = allFunctions.length;
const maxComplexity = allFunctions.length > 0 ? Math.max(...allFunctions.map(i => parseInt(i.complexity))) : 0;
const avgComplexity = allFunctions.length > 0 ? Math.round(allFunctions.reduce((sum, i) => sum + parseInt(i.complexity), 0) / allFunctions.length) : 0;

// Group functions by directory (folder)
function getDirectory(filePath) {
  const parts = filePath.split('/');
  if (parts.length <= 1) return filePath;
  // Remove filename, keep directory path
  return parts.slice(0, -1).join('/');
}

const folderMap = new Map();
allFunctions.forEach(func => {
  const dir = getDirectory(func.file);
  if (!folderMap.has(dir)) {
    folderMap.set(dir, []);
  }
  folderMap.get(dir).push(func);
});

// Calculate folder-level metrics
const folders = Array.from(folderMap.entries()).map(([dir, functions]) => {
  const totalFunctions = functions.length;
  const withinThreshold = functions.filter(f => parseInt(f.complexity) <= 10).length;
  const percentage = totalFunctions > 0 ? Math.round((withinThreshold / totalFunctions) * 100) : 100;
  
  return {
    directory: dir,
    totalFunctions,
    withinThreshold,
    percentage,
    functions: functions.sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity)),
  };
}).sort((a, b) => a.directory.localeCompare(b.directory));

// Get initial display state from command line argument (default: false = show only over threshold)
const showAllInitially = process.argv.includes('--show-all') || process.argv.includes('--all');

// Generate HTML report
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complexity Report</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    body {
      font-family: Helvetica Neue, Helvetica, Arial;
      font-size: 14px;
      color: #333;
    }
    *, *:after, *:before {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }
    h1 {
      font-size: 20px;
      margin: 0;
    }
    h2 {
      font-size: 14px;
    }
    a {
      color: #0074D9;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .strong {
      font-weight: bold;
    }
    .pad2 {
      padding: 20px;
    }
    .pad2x {
      padding: 0 20px;
    }
    .pad2y {
      padding: 20px 0;
    }
    .pad1 {
      padding: 10px;
    }
    .pad1y {
      padding: 10px 0;
    }
    .quiet {
      color: #7f7f7f;
      color: rgba(0,0,0,0.5);
    }
    .quiet a {
      opacity: 0.7;
    }
    .fraction {
      font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 10px;
      color: #555;
      background: #E8E8E8;
      padding: 4px 5px;
      border-radius: 3px;
      vertical-align: middle;
    }
    .coverage-summary {
      border-collapse: collapse;
      width: 100%;
    }
    .coverage-summary tr {
      border-bottom: 1px solid #bbb;
    }
    .keyline-all {
      border: 1px solid #ddd;
    }
    .coverage-summary td,
    .coverage-summary th {
      padding: 10px;
    }
    .coverage-summary tbody tr {
      background-color: rgb(230, 245, 208);
    }
    .coverage-summary tbody {
      border: 1px solid #bbb;
    }
    .coverage-summary td {
      border-right: 1px solid #bbb;
    }
    .coverage-summary td:last-child {
      border-right: none;
    }
    .coverage-summary th {
      text-align: left;
      font-weight: normal;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      border: none !important;
    }
    .coverage-summary th:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    .coverage-summary th.file {
      border-right: none !important;
    }
    .coverage-summary th.pct {
    }
    .coverage-summary th.pic,
    .coverage-summary th.abs,
    .coverage-summary td.pct,
    .coverage-summary td.abs {
      text-align: right;
    }
    .coverage-summary td.file {
      white-space: nowrap;
    }
    .coverage-summary td.pic {
      min-width: 120px !important;
      text-align: right;
    }
    .sort-icon {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-left: 5px;
      color: #999;
      opacity: 0.5;
    }
    .sort-icon.active {
      color: #000;
      opacity: 1;
    }
    .coverage-summary td.bar {
      padding: 10px;
      min-width: 120px !important;
    }
    /* Color scheme matching coverage report */
    /* Dark red */
    .red.solid,
    .status-line.low,
    .low .cover-fill {
      background: #C21F39;
    }
    .low .chart {
      border: 1px solid #C21F39;
    }
    /* Medium red */
    .cstat-no,
    .fstat-no,
    .cbranch-no {
      background: #F6C6CE;
    }
    /* Light red */
    .cline-no {
      background: #FCE1E5;
    }
    /* Light green */
    .cline-yes {
      background: rgb(230,245,208);
    }
    /* Medium green */
    .cstat-yes {
      background: rgb(161,215,106);
    }
    /* Dark green */
    .status-line.high,
    .high .cover-fill {
      background: rgb(77,146,33);
    }
    .high .chart {
      border: 1px solid rgb(77,146,33);
    }
    /* Dark yellow (gold) */
    .status-line.medium,
    .medium .cover-fill {
      background: #f9cd0b;
    }
    .medium .chart {
      border: 1px solid #f9cd0b;
    }
    .cover-fill,
    .cover-empty {
      display: inline-block;
      height: 12px;
      vertical-align: top;
    }
    .chart {
      line-height: 0;
      font-size: 0;
      white-space: nowrap;
    }
    .cover-empty {
      background: white;
    }
    .cover-full {
      border-right: none !important;
    }
    .status-line {
      height: 10px;
    }
    .complexity-value {
      font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .complexity-value.low {
      color: #C21F39;
    }
    .complexity-value.medium {
      color: #f9cd0b;
    }
    .complexity-value.high {
      color: rgb(77,146,33);
    }
    .complexity-value.acceptable {
      color: rgb(100,150,50);
    }
    .complexity-value.good {
      color: rgb(120,160,70);
    }
    .acceptable {
      background: rgb(240,250,230);
    }
    .good {
      background: rgb(245,252,240);
    }
    .acceptable .cover-fill {
      background: rgb(100,150,50);
    }
    .good .cover-fill {
      background: rgb(120,160,70);
    }
    .acceptable .chart {
      border: 1px solid rgb(100,150,50);
    }
    .good .chart {
      border: 1px solid rgb(120,160,70);
    }
    .controls {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .controls label {
      margin-right: 15px;
      font-weight: normal;
    }
    .controls select,
    .controls input {
      margin-left: 5px;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="pad2">
    <h1>All files</h1>
    <div class="pad1y quiet">
      All Functions (${allFunctionsCount} total)
      ${overThreshold.length > 0 ? ` / ${overThreshold.length} with complexity > 10` : ''}
    </div>
    <div class="pad2y">
      <div class="strong">
        ${allFunctionsCount} Function${allFunctionsCount !== 1 ? 's' : ''}
        ${allFunctionsCount > 0 ? ` / Max: ${maxComplexity} / Avg: ${avgComplexity}` : ''}
      </div>
    </div>
    ${allFunctions.length === 0
      ? '<div class="pad2y"><div class="strong" style="color: rgb(77,146,33);">✓ No functions found.</div></div>'
      : `        <div class="folder-view" id="folderView">
          <table class="coverage-summary">
            <thead>
              <tr class="keyline-all">
                <th class="file" data-sort="file">File <span class="sort-icon">↕</span></th>
                <th class="bar" data-sort="percentage" style="text-align: right;"><span class="sort-icon">↕</span></th>
                <th class="pic" data-sort="percentage" style="text-align: left;">Functions <span class="sort-icon">↕</span></th>
                <th class="pct" data-sort="functions" style="text-align: right;"><span class="sort-icon">↕</span></th>
              </tr>
            </thead>
            <tbody>
              ${folders.map(folder => {
                const percentage = folder.percentage;
                // Use 'high' for good coverage (>= 80%) to get rgb(77,146,33) color
                const level = percentage >= 80 ? 'high' : percentage >= 60 ? 'high' : percentage >= 40 ? 'medium' : 'low';
                return `
                  <tr data-file="${folder.directory || '.'}" data-functions="${folder.withinThreshold}/${folder.totalFunctions}" data-percentage="${percentage}">
                    <td class="file">
                      <a href="${folder.directory ? folder.directory + '/index.html' : 'index.html'}">${folder.directory || '.'}</a>
                    </td>
                    <td class="bar ${level}">
                      <div class="chart"><div class="cover-fill ${level} ${percentage === 100 ? 'cover-full' : ''}" style="width: ${percentage}%"></div><div class="cover-empty" style="width: ${100 - percentage}%"></div></div>
                    </td>
                    <td class="pic">${percentage}%</td>
                    <td class="pct">${folder.withinThreshold}/${folder.totalFunctions}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>`
    }
  </div>
  <script>
    (function() {
      // Sorting functionality
      const headers = document.querySelectorAll('.coverage-summary th[data-sort]');
      let currentSort = { column: null, direction: 'asc' };
      
      headers.forEach(header => {
        header.addEventListener('click', function() {
          const column = this.getAttribute('data-sort');
          const tbody = this.closest('table').querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          
          // Set sort column and direction
          if (currentSort.column === column) {
            // Same column clicked - toggle direction
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            // Different column or first click - set column and default direction
            currentSort.column = column;
            // Default to descending for 'functions' and 'percentage' (most to least) in main index
            currentSort.direction = (column === 'functions' || column === 'percentage') ? 'desc' : 'asc';
          }
          
          // Update sort icons
          headers.forEach(h => {
            const icon = h.querySelector('.sort-icon');
            if (h === this) {
              icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
              icon.classList.add('active');
            } else {
              icon.textContent = '↕';
              icon.classList.remove('active');
            }
          });
          
          // Sort rows (always sort, even on first click)
          rows.sort((a, b) => {
            let aVal, bVal;
            if (column === 'file') {
              aVal = a.getAttribute('data-file') || '';
              bVal = b.getAttribute('data-file') || '';
              const comparison = aVal.localeCompare(bVal);
              return currentSort.direction === 'asc' ? comparison : -comparison;
            } else if (column === 'functions') {
              // Special handling for functions column - sort by total functions (denominator)
              const aParts = (a.getAttribute('data-functions') || '0/0').split('/');
              const bParts = (b.getAttribute('data-functions') || '0/0').split('/');
              const aDen = parseInt(aParts[1] || 1);
              const bDen = parseInt(bParts[1] || 1);
              
              // Sort by denominator (total functions count)
              // When descending (most to least): higher denominators first (18/19, 8/8, 6/7, 6/6)
              // When ascending (least to most): lower denominators first (6/6, 6/7, 8/8, 18/19)
              if (currentSort.direction === 'desc') {
                return bDen > aDen ? 1 : bDen < aDen ? -1 : 0;
              } else {
                return aDen > bDen ? 1 : aDen < bDen ? -1 : 0;
              }
            } else if (column === 'percentage') {
              aVal = parseFloat(a.getAttribute('data-percentage') || 0);
              bVal = parseFloat(b.getAttribute('data-percentage') || 0);
            }
            
            if (currentSort.direction === 'asc') {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
          });
          
          // Re-append sorted rows (clear first to ensure proper reordering)
          tbody.innerHTML = '';
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    })();
  </script>
</body>
</html>`;

// Create complexity directory if it doesn't exist
const complexityDir = resolve(projectRoot, 'complexity');
try {
  mkdirSync(complexityDir, { recursive: true });
} catch (e) {
  // Directory might already exist, ignore
}

// Function to generate folder HTML page
function generateFolderHTML(folder, allFolders) {
  const folderPath = folder.directory;
  const backLink = folderPath ? '../'.repeat(folderPath.split('/').length) + 'index.html' : 'index.html';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complexity Report - ${folderPath || 'Root'}</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    body {
      font-family: Helvetica Neue, Helvetica, Arial;
      font-size: 14px;
      color: #333;
    }
    *, *:after, *:before {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }
    h1 {
      font-size: 20px;
      margin: 0;
    }
    h2 {
      font-size: 14px;
    }
    a {
      color: #0074D9;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .strong {
      font-weight: bold;
    }
    .pad2 {
      padding: 20px;
    }
    .pad1y {
      padding: 10px 0;
    }
    .quiet {
      color: #7f7f7f;
      color: rgba(0,0,0,0.5);
    }
    .coverage-summary {
      border-collapse: collapse;
      width: 100%;
    }
    .coverage-summary tr {
      border-bottom: 1px solid #bbb;
    }
    .keyline-all {
      border: 1px solid #ddd;
    }
    .coverage-summary td,
    .coverage-summary th {
      padding: 10px;
    }
    .coverage-summary tbody tr {
      background-color: rgb(230, 245, 208);
    }
    .coverage-summary tbody {
      border: 1px solid #bbb;
    }
    .coverage-summary td {
      border-right: 1px solid #bbb;
    }
    .coverage-summary td:last-child {
      border-right: none;
    }
    .coverage-summary th {
      text-align: left;
      font-weight: normal;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      border: none !important;
    }
    .coverage-summary th:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    .coverage-summary th.file {
      border-right: none !important;
    }
    .coverage-summary th.pct,
    .coverage-summary th.abs {
      text-align: right;
    }
    .coverage-summary td.pct,
    .coverage-summary td.abs {
      text-align: right;
    }
    .coverage-summary td.file {
      white-space: nowrap;
    }
    .coverage-summary td.pic {
      min-width: 120px !important;
      text-align: right;
    }
    .sort-icon {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-left: 5px;
      color: #999;
      opacity: 0.5;
    }
    .sort-icon.active {
      color: #000;
      opacity: 1;
    }
    .coverage-summary td.bar {
      padding: 10px;
      min-width: 120px !important;
    }
    .low .cover-fill { background: #C21F39; }
    .low .chart { border: 1px solid #C21F39; }
    .high .cover-fill { background: rgb(77,146,33); }
    .high .chart { border: 1px solid rgb(77,146,33); }
    .medium .cover-fill { background: #f9cd0b; }
    .medium .chart { border: 1px solid #f9cd0b; }
    .acceptable .cover-fill { background: rgb(100,150,50); }
    .acceptable .chart { border: 1px solid rgb(100,150,50); }
    .good .cover-fill { background: rgb(120,160,70); }
    .good .chart { border: 1px solid rgb(120,160,70); }
    .cover-fill,
    .cover-empty {
      display: inline-block;
      height: 12px;
      vertical-align: top;
    }
    .chart {
      line-height: 0;
      font-size: 0;
      white-space: nowrap;
    }
    .cover-empty {
      background: white;
    }
    .cover-full {
      border-right: none !important;
    }
    .complexity-value {
      font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .complexity-value.low { color: #C21F39; }
    .complexity-value.medium { color: #f9cd0b; }
    .complexity-value.high { color: rgb(77,146,33); }
    .complexity-value.acceptable { color: rgb(100,150,50); }
    .complexity-value.good { color: rgb(120,160,70); }
    .controls {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .controls label {
      margin-right: 15px;
      font-weight: normal;
    }
    .controls input {
      margin-left: 5px;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="pad2">
    <h1>${folderPath ? `<a href="${backLink}" style="color: #0074D9; text-decoration: none; font-weight: bold;">All files</a> <span style="font-weight: bold;">${folderPath}</span>` : 'All files'}</h1>
    <div class="pad1y quiet">
      ${folder.totalFunctions} Function${folder.totalFunctions !== 1 ? 's' : ''} / ${folder.withinThreshold} within threshold (${folder.percentage}%)
    </div>
    <div class="controls">
      <label>
        <input type="checkbox" id="showAllFunctions" ${showAllInitially ? 'checked' : ''}>
        Display all functions (${folder.totalFunctions} total)
      </label>
      <span class="quiet" style="margin-left: 15px;">
        Uncheck to show only functions with complexity > 10
      </span>
    </div>
    <table class="coverage-summary">
      <thead>
        <tr class="keyline-all">
          <th class="file" data-sort="file">File <span class="sort-icon">↕</span></th>
          <th class="bar" data-sort="complexity" style="text-align: right;"><span class="sort-icon">↕</span></th>
          <th class="file" data-sort="function">Function <span class="sort-icon">↕</span></th>
          <th class="pct" data-sort="complexity">Complexity <span class="sort-icon">↕</span></th>
          <th class="abs" data-sort="line">Line <span class="sort-icon">↕</span></th>
        </tr>
      </thead>
      <tbody>
        ${folder.functions.map(issue => {
          const level = getComplexityLevel(issue.complexity);
          const complexityNum = parseInt(issue.complexity);
          const isOverThreshold = complexityNum > 10;
          const maxComplexityForBar = Math.max(30, complexityNum);
          const percentage = Math.min(100, (complexityNum / maxComplexityForBar) * 100);
          return `
            <tr data-over-threshold="${isOverThreshold}" data-file="${issue.file}" data-function="${issue.functionName || 'unknown'}" data-complexity="${complexityNum}" data-line="${issue.line}" ${!showAllInitially && !isOverThreshold ? 'style="display: none;"' : ''}>
              <td class="file">${issue.file}</td>
              <td class="bar ${level}">
                <div class="chart"><div class="cover-fill ${level} ${percentage === 100 ? 'cover-full' : ''}" style="width: ${percentage}%"></div><div class="cover-empty" style="width: ${100 - percentage}%"></div></div>
              </td>
              <td class="file">
                <span style="font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px;">${issue.functionName || 'unknown'}</span>
              </td>
              <td class="pct">
                <span class="complexity-value ${level}">${complexityNum}</span>
              </td>
              <td class="abs">${issue.line}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  <script>
    (function() {
      // Checkbox filter
      const checkbox = document.getElementById('showAllFunctions');
      if (checkbox) {
        const rows = document.querySelectorAll('tbody tr[data-over-threshold]');
        checkbox.addEventListener('change', function() {
          const showAll = this.checked;
          rows.forEach(function(row) {
            const isOverThreshold = row.getAttribute('data-over-threshold') === 'true';
            if (showAll || isOverThreshold) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        });
      }
      
      // Sorting functionality
      const headers = document.querySelectorAll('.coverage-summary th[data-sort]');
      let currentSort = { column: null, direction: 'asc' };
      
      headers.forEach(header => {
        header.addEventListener('click', function() {
          const column = this.getAttribute('data-sort');
          const tbody = this.closest('table').querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          
          // Set sort column and direction
          if (currentSort.column === column) {
            // Same column clicked - toggle direction
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            // Different column or first click - set column and default direction
            currentSort.column = column;
            // Default to descending for functions (most to least)
            currentSort.direction = column === 'functions' ? 'desc' : 'asc';
          }
          
          // Update sort icons
          headers.forEach(h => {
            const icon = h.querySelector('.sort-icon');
            if (h === this) {
              icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
              icon.classList.add('active');
            } else {
              icon.textContent = '↕';
              icon.classList.remove('active');
            }
          });
          
          // Sort rows (always sort, even on first click)
          rows.sort((a, b) => {
            let aVal, bVal;
            if (column === 'file') {
              aVal = a.getAttribute('data-file') || '';
              bVal = b.getAttribute('data-file') || '';
              const comparison = aVal.localeCompare(bVal);
              return currentSort.direction === 'asc' ? comparison : -comparison;
            } else if (column === 'function') {
              aVal = (a.getAttribute('data-function') || '').toLowerCase();
              bVal = (b.getAttribute('data-function') || '').toLowerCase();
            } else if (column === 'functions') {
              // Special handling for functions column - sort by total functions (denominator)
              const aParts = (a.getAttribute('data-functions') || '0/0').split('/');
              const bParts = (b.getAttribute('data-functions') || '0/0').split('/');
              const aDen = parseInt(aParts[1] || 1);
              const bDen = parseInt(bParts[1] || 1);
              
              // Sort by denominator (total functions count)
              // When descending (most to least): higher denominators first (18/19, 8/8, 6/7, 6/6)
              // When ascending (least to most): lower denominators first (6/6, 6/7, 8/8, 18/19)
              if (currentSort.direction === 'desc') {
                return bDen > aDen ? 1 : bDen < aDen ? -1 : 0;
              } else {
                return aDen > bDen ? 1 : aDen < bDen ? -1 : 0;
              }
            } else if (column === 'complexity') {
              aVal = parseFloat(a.getAttribute('data-complexity') || 0);
              bVal = parseFloat(b.getAttribute('data-complexity') || 0);
            } else if (column === 'line') {
              aVal = parseFloat(a.getAttribute('data-line') || 0);
              bVal = parseFloat(b.getAttribute('data-line') || 0);
            }
            
            if (typeof aVal === 'string') {
              return currentSort.direction === 'asc' 
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            } else {
              if (currentSort.direction === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
              } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
              }
            }
          });
          
          // Re-append sorted rows (clear first to ensure proper reordering)
          tbody.innerHTML = '';
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    })();
  </script>
</body>
</html>`;
}

// Write main index.html
const htmlPath = resolve(complexityDir, 'index.html');
writeFileSync(htmlPath, html, 'utf-8');

// Generate separate HTML files for each folder
let foldersGenerated = 0;
folders.forEach(folder => {
  if (!folder.directory) return; // Skip root level
  
  const folderPath = folder.directory;
  const folderParts = folderPath.split('/');
  const folderDir = resolve(complexityDir, ...folderParts);
  
  try {
    mkdirSync(folderDir, { recursive: true });
    const folderHTML = generateFolderHTML(folder, folders);
    const folderHTMLPath = resolve(folderDir, 'index.html');
    writeFileSync(folderHTMLPath, folderHTML, 'utf-8');
    foldersGenerated++;
  } catch (e) {
    console.error(`Error generating folder HTML for ${folderPath}:`, e.message);
  }
});

console.log(`\n✅ Complexity report generated: complexity/index.html`);
console.log(`   Generated ${foldersGenerated} folder HTML file(s)`);
console.log(`   Found ${allFunctionsCount} total function(s)`);
if (overThreshold.length > 0) {
  console.log(`   ${overThreshold.length} function(s) with complexity > 10`);
}
if (allFunctionsCount > 0) {
  console.log(`   Highest complexity: ${maxComplexity} / Average: ${avgComplexity}`);
}
