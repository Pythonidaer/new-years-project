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
function extractFunctionName(filePath, lineNumber, nodeType = 'FunctionDeclaration') {
  try {
    const fullPath = resolve(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      return 'unknown';
    }
    
    const fileContent = readFileSync(fullPath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // For arrow functions, try to find what they're part of (useEffect, setTimeout, etc.)
    if (nodeType === 'ArrowFunctionExpression') {
      // Check the line itself and the line before for context
      const lineIndex = lineNumber - 1; // Convert to 0-based
      const currentLine = lines[lineIndex] || '';
      const prevLine = lines[lineIndex - 1] || '';
      const combinedContext = (prevLine + ' ' + currentLine).trim();
      
      // FIRST: Check if this is a named arrow function (const name = () =>)
      const namedArrowPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?=>/;
      const namedMatch = combinedContext.match(namedArrowPattern);
      if (namedMatch && namedMatch[1]) {
        return namedMatch[1]; // Return the actual function name (e.g., "updateVars")
      }
      
      // SECOND: Look for common patterns: useEffect(() =>, setTimeout(() =>, etc.
      const arrowFunctionPatterns = [
        /(\w+)\s*\([^)]*\)\s*=>/,  // functionCall(() =>
        /(\w+)\s*\([^)]*=>/,       // functionCall( =>
        /\.(\w+)\s*\([^)]*\)\s*=>/, // obj.method(() =>
        /\.(\w+)\s*\([^)]*=>/,     // obj.method( =>
      ];
      
      for (const pattern of arrowFunctionPatterns) {
        const match = combinedContext.match(pattern);
        if (match && match[1]) {
          const parentFunction = extractFunctionName(filePath, lineNumber - 5, 'FunctionDeclaration'); // Get parent function name
          if (parentFunction && parentFunction !== 'anonymous' && parentFunction !== 'unknown') {
            return `${parentFunction} (${match[1]} callback)`;
          }
          return `${match[1]} callback`;
        }
      }
      
      // LAST: If we can't find a specific pattern, try to get parent function name
      const parentFunction = extractFunctionName(filePath, lineNumber - 5, 'FunctionDeclaration');
      if (parentFunction && parentFunction !== 'anonymous' && parentFunction !== 'unknown') {
        return `${parentFunction} (arrow function)`;
      }
      return 'anonymous arrow function';
    }
    
    // For named functions, look backwards from the reported line to find function declaration
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
          const nodeType = message.nodeType || 'FunctionDeclaration';
          const functionName = extractFunctionName(filePath, message.line, nodeType);
          const complexity = parseInt(complexityMatch[1]);
          // Use nodeType to distinguish between named functions and arrow functions
          // For arrow functions, we need to find their specific boundaries, not the outer function's
          const key = `${filePath}:${functionName}:${message.line}`;
          
          // For arrow functions, don't deduplicate by function name alone - use line number too
          // This allows us to track nested arrow functions separately
          const existing = functionMap.get(key);
          if (!existing || complexity > existing.complexity) {
            functionMap.set(key, {
              file: filePath,
              line: message.line,
              column: message.column,
              message: message.message,
              complexity: complexityMatch[1],
              functionName: functionName,
              nodeType: nodeType, // Store nodeType to help with boundary detection
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

// Group functions by file path for file-level HTML generation
const fileMap = new Map();
allFunctions.forEach(func => {
  if (!fileMap.has(func.file)) {
    fileMap.set(func.file, []);
  }
  fileMap.get(func.file).push(func);
});

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
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0;
    }
    .header-row h1 {
      margin: 0;
    }
    .about-link {
      color: #0074D9;
      text-decoration: none;
      font-size: 14px;
      font-weight: normal;
      cursor: pointer;
      padding: 5px 10px;
      border: 1px solid #0074D9;
      border-radius: 3px;
      background: white;
      white-space: nowrap;
    }
    .about-link:hover {
      background: #f0f0f0;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="pad2">
    <div class="header-row">
      <h1>All files</h1>
      <a href="about.html" class="about-link">About Cyclomatic Complexity</a>
    </div>
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

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * REMOVED: Modal was never requested. Use direct link to about.html instead.
 * This function is kept for reference but should not be called.
 * @deprecated
 */
function generateAboutModal_DEPRECATED() {
  return `
<div id="about-modal" class="modal-overlay" onclick="if(event.target === this) this.classList.remove('active');">
  <div class="modal-content" onclick="event.stopPropagation();">
    <button class="modal-close" onclick="document.getElementById('about-modal').classList.remove('active');">&times;</button>
    <h2>About Cyclomatic Complexity</h2>
    
    <h3>What is Cyclomatic Complexity?</h3>
    <p>
      Cyclomatic complexity is a software metric that measures the number of linearly independent paths through a program's source code. 
      It quantifies how many decision points exist in a function, helping developers understand how difficult a function is to test and maintain.
    </p>
    <p>
      <strong>Formula:</strong> Complexity = 1 (base path) + number of decision points
    </p>
    <p>
      Lower complexity is generally better. Functions with high complexity are harder to understand, test, and maintain.
    </p>
    
    <h3>What Counts as a Decision Point?</h3>
    <p>Each of the following adds +1 to the complexity:</p>
    <ul>
      <li><code>if</code> statements</li>
      <li><code>else if</code> statements</li>
      <li><code>for</code> loops</li>
      <li><code>for...of</code> loops</li>
      <li><code>for...in</code> loops</li>
      <li><code>while</code> loops</li>
      <li><code>do...while</code> loops</li>
      <li><code>switch</code> statements</li>
      <li><code>case</code> statements (each case adds +1)</li>
      <li><code>catch</code> blocks</li>
      <li>Ternary operators (<code>? :</code>)</li>
      <li>Short-circuit logical operators (<code>&&</code>, <code>||</code>) in boolean expressions</li>
      <li><strong>Default parameters</strong> (some linters, like ESLint's <code>classic</code> variant, count default parameter values as decision points)</li>
    </ul>
    
    <h3>JavaScript Examples</h3>
    
    <div class="example-box">
      <h4>Example 1: Simple if statement</h4>
      <pre><code>function greet(name) {
  <span class="decision-point-example">if (name) {</span>
    return \`Hello, \${name}!\`;
  }
  return "Hello, stranger!";
}</code></pre>
      <p><strong>Complexity: 2</strong> (1 base + 1 if)</p>
    </div>
    
    <div class="example-box">
      <h4>Example 2: Multiple if statements</h4>
      <pre><code>function getGrade(score) {
  <span class="decision-point-example">if (score >= 90) {</span>
    return "A";
  }
  <span class="decision-point-example">if (score >= 80) {</span>
    return "B";
  }
  <span class="decision-point-example">if (score >= 70) {</span>
    return "C";
  }
  return "F";
}</code></pre>
      <p><strong>Complexity: 4</strong> (1 base + 3 if)</p>
    </div>
    
    <div class="example-box">
      <h4>Example 3: Logical OR in return statement</h4>
      <pre><code>function isValid(value) {
  <span class="decision-point-example">return value === "primary" || value === "secondary";</span>
}</code></pre>
      <p><strong>Complexity: 2</strong> (1 base + 1 ||)</p>
      <p>
        <strong>Why this counts:</strong> The <code>||</code> operator creates a decision point because it short-circuits. 
        If the left side is true, the right side is never evaluated. This creates two distinct execution paths.
      </p>
    </div>
    
    <div class="example-box">
      <h4>Example 4: Logical AND in conditional</h4>
      <pre><code>function processUser(user) {
  <span class="decision-point-example">if (user && user.isActive) {</span>
    return "Processing...";
  }
  return "Skipped";
}</code></pre>
      <p><strong>Complexity: 2</strong> (1 base + 1 if)</p>
      <p>
        <strong>Note:</strong> The <code>&&</code> inside the if condition adds +1 complexity because it creates a decision point 
        (if user is falsy, user.isActive is never evaluated).
      </p>
    </div>
    
    <div class="example-box">
      <h4>Example 5: For loop</h4>
      <pre><code>function sumArray(arr) {
  let sum = 0;
  <span class="decision-point-example">for (let i = 0; i < arr.length; i++) {</span>
    sum += arr[i];
  }
  return sum;
}</code></pre>
      <p><strong>Complexity: 2</strong> (1 base + 1 for)</p>
    </div>
    
    <div class="example-box">
      <h4>Example 6: Ternary operator</h4>
      <pre><code>function getStatus(isComplete) {
  <span class="decision-point-example">return isComplete ? "Done" : "Pending";</span>
}</code></pre>
      <p><strong>Complexity: 2</strong> (1 base + 1 ternary)</p>
    </div>
    
    <div class="example-box">
      <h4>Example 7: Switch statement</h4>
      <pre><code>function getAction(type) {
  <span class="decision-point-example">switch (type) {</span>
    <span class="decision-point-example">case "create":</span>
      return "Creating...";
    <span class="decision-point-example">case "update":</span>
      return "Updating...";
    <span class="decision-point-example">default:</span>
      return "Unknown";
  }
}</code></pre>
      <p><strong>Complexity: 4</strong> (1 base + 1 switch + 2 case)</p>
    </div>
    
    <h3>TypeScript Examples</h3>
    
    <div class="example-box">
      <h4>Example 8: TypeScript with type guards</h4>
      <pre><code>function processValue(value: string | number) {
  <span class="decision-point-example">if (typeof value === "string") {</span>
    return value.toUpperCase();
  }
  <span class="decision-point-example">if (typeof value === "number") {</span>
    return value * 2;
  }
  return value;
}</code></pre>
      <p><strong>Complexity: 3</strong> (1 base + 2 if)</p>
    </div>
    
    <div class="example-box">
      <h4>Example 9: Logical OR in return with TypeScript</h4>
      <pre><code>function shouldDisplayChevron(
  showChevron: boolean,
  variant: "primary" | "secondary" | "secondary-orange"
): boolean {
  <span class="decision-point-example">if (!showChevron) {</span>
    return false;
  }
  <span class="decision-point-example">return variant === "primary" || variant === "secondary-orange";</span>
}</code></pre>
      <p><strong>Complexity: 3</strong> (1 base + 1 if + 1 ||)</p>
      <p>
        <strong>Why the return line counts:</strong> The <code>||</code> operator in the return statement creates a decision point. 
        The expression short-circuits: if <code>variant === "primary"</code> is true, the second condition is never evaluated. 
        This creates two distinct execution paths, adding +1 to complexity.
      </p>
    </div>
    
    <h3>React Examples</h3>
    
    <div class="example-box">
      <h4>Example 10: React component with conditional rendering</h4>
      <pre><code>function Button({ variant, showChevron }: Props) {
  <span class="decision-point-example">if (!showChevron) {</span>
    return &lt;button&gt;Click me&lt;/button&gt;;
  }
  <span class="decision-point-example">return variant === "primary" ? (</span>
    &lt;button className="primary"&gt;Click me&lt;/button&gt;
  ) : (
    &lt;button className="secondary"&gt;Click me&lt;/button&gt;
  );
}</code></pre>
      <p><strong>Complexity: 3</strong> (1 base + 1 if + 1 ternary)</p>
    </div>
    
    <div class="example-box">
      <h4>Example 11: React component with map and conditional</h4>
      <pre><code>function ItemList({ items }: { items: Item[] }) {
  return (
    &lt;ul&gt;
      {items.map((item) => (
        <span class="decision-point-example">&lt;li key={item.id}&gt;{item.isActive ? item.name : "Inactive"}&lt;/li&gt;</span>
      ))}
    &lt;/ul&gt;
  );
}</code></pre>
      <p><strong>Complexity: 2</strong> (1 base + 1 for...of from map + 1 ternary)</p>
      <p><strong>Note:</strong> The <code>map</code> function creates a loop, and the ternary inside adds another decision point.</p>
    </div>
    
    <h3>What Does NOT Count as a Decision Point?</h3>
    <p>The following do <strong>not</strong> add to complexity:</p>
    <ul>
      <li><strong>Sequential statements:</strong> Assignments, function calls, variable declarations</li>
      <li><strong>JSX structure:</strong> Plain JSX elements without conditional logic</li>
      <li><strong>Hook calls:</strong> <code>useState</code>, <code>useEffect</code>, etc. (only branching inside their callbacks counts)</li>
      <li><strong>TypeScript types:</strong> Type annotations, interfaces, generics (compile-time only)</li>
      <li><strong>Object/array literals:</strong> Plain data structures</li>
      <li><strong>Arithmetic operations:</strong> <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code></li>
      <li><strong>String operations:</strong> Concatenation, template literals</li>
      <li><strong>Property access:</strong> <code>obj.property</code>, <code>arr[0]</code></li>
      <li><strong>Method calls:</strong> <code>arr.map()</code>, <code>str.toUpperCase()</code> (the call itself doesn't count, but logic inside does)</li>
    </ul>
    
    <div class="example-box">
      <h4>Example: What doesn't count</h4>
      <pre><code>function simpleFunction(name: string): string {
  const greeting = "Hello";           // Assignment - doesn't count
  const message = \`\${greeting}, \${name}!\`;  // Template literal - doesn't count
  return message.toUpperCase();        // Method call - doesn't count
}</code></pre>
      <p><strong>Complexity: 1</strong> (only the base path)</p>
    </div>
    
    <h3>Understanding the Highlighting</h3>
    <p>
      In this complexity report, lines with decision points are highlighted with a <span class="decision-point-example">pale red/pink background</span>. 
      This helps you quickly identify which lines contribute to the function's complexity.
    </p>
    <p>
      <strong>Tip:</strong> Hover over highlighted lines to see what type of decision point it is (e.g., "if statement", "logical OR").
    </p>
    
    <h3>Best Practices</h3>
    <ul>
      <li><strong>Target complexity:</strong> Keep functions ≤ 10 complexity for most code</li>
      <li><strong>UI components:</strong> Aim for ≤ 6 complexity</li>
      <li><strong>Refactoring:</strong> If complexity is high, consider:
        <ul>
          <li>Extracting helper functions</li>
          <li>Using early returns (guard clauses)</li>
          <li>Replacing long if/else chains with lookup maps</li>
          <li>Splitting complex functions into smaller, focused functions</li>
        </ul>
      </li>
    </ul>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
      For more information, see the project's <code>.cursorrules</code> file, section 13: "Cyclomatic Complexity Standards".
    </p>
  </div>
</div>
`;
}

/**
 * Generates the standalone "About Cyclomatic Complexity" page (complexity/about.html).
 * Barebones, Istanbul-style. Examples live on a separate page.
 * @returns {string} Full HTML document string
 */
function generateAboutPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Cyclomatic Complexity</title>
  <style>
    body { font-family: Helvetica Neue, Helvetica, Arial; font-size: 14px; color: #333; margin: 0; padding: 20px; line-height: 1.4; }
    a { color: #0074D9; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-link { display: inline-block; margin-bottom: 12px; }
    h1 { font-size: 20px; margin: 0 0 12px 0; }
    h2 { font-size: 16px; margin: 16px 0 6px 0; font-weight: bold; }
    h3 { font-size: 14px; margin: 12px 0 4px 0; font-weight: bold; }
    p { margin: 4px 0; }
    ul { margin: 4px 0; padding-left: 20px; }
    li { margin: 2px 0; }
    code { font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px; }
  </style>
</head>
<body>
  <a href="index.html" class="back-link">← Back to complexity report</a>
  <h1>About Cyclomatic Complexity</h1>
  <p>Cyclomatic complexity measures linearly independent paths through code. <strong>Formula:</strong> 1 (base) + decision points. Lower is better.</p>
  <h2>Summary: JavaScript, TypeScript, React</h2>
  <p>ESLint <code>complexity</code> rule (<code>variant: "classic"</code>) on <code>*.ts</code> / <code>*.tsx</code>.</p>
  <h3>Counted</h3>
  <ul>
    <li><code>if</code>, each <code>else if</code></li>
    <li><code>for</code>, <code>for...of</code>, <code>for...in</code>, <code>while</code>, <code>do...while</code></li>
    <li><code>switch</code>; each <code>case</code> / <code>default</code></li>
    <li><code>catch</code></li>
    <li>Ternary <code>? :</code></li>
    <li><code>&&</code> / <code>||</code> in conditions (incl. JSX)</li>
    <li><strong>Default parameters</strong> (some linters, like ESLint's <code>classic</code> variant, count default parameter values as decision points)</li>
  </ul>
  <h3>Not counted</h3>
  <ul>
    <li>Sequential statements (assignments, calls, declarations)</li>
    <li>JSX without conditionals</li>
    <li>Hook calls (only callbacks count)</li>
    <li>TypeScript types, interfaces, generics</li>
    <li>Literals, destructuring; arithmetic, strings</li>
    <li>Property access; method calls</li>
    <li>Unconditional <code>return</code></li>
  </ul>
  <h2>See also</h2>
  <ul>
    <li><a href="about-examples.html">Examples</a></li>
  </ul>
</body>
</html>`;
}

/**
 * Generates the "Examples" page (complexity/about-examples.html).
 * Barebones, Istanbul-style. Linked from About.
 * @returns {string} Full HTML document string
 */
function generateAboutExamplesPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Examples — Cyclomatic Complexity</title>
  <style>
    body { font-family: Helvetica Neue, Helvetica, Arial; font-size: 14px; color: #333; margin: 0; padding: 20px; line-height: 1.5; }
    a { color: #0074D9; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-link { display: inline-block; margin-bottom: 20px; padding: 5px 10px; border: 1px solid #0074D9; border-radius: 3px; background: white; margin-right: 10px; }
    .back-link:hover { background: #f0f0f0; }
    h1 { font-size: 24px; margin: 0 0 20px 0; }
    h2 { font-size: 18px; margin: 30px 0 15px 0; color: #555; }
    h4 { font-size: 14px; margin: 20px 0 8px 0; color: #0074D9; }
    p { margin: 10px 0; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; margin: 15px 0; border-left: 4px solid #0074D9; }
    pre code { background: transparent; padding: 0; }
    .example-box { background: #f9f9f9; border-left: 4px solid #0074D9; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .example-box h4 { margin-top: 0; }
    .decision-point-example { background: #F6C6CE; padding: 2px 4px; border-radius: 2px; }
  </style>
</head>
<body>
  <a href="index.html" class="back-link">← Back to complexity report</a>
  <a href="about.html" class="back-link">← Back to About</a>
  <h1>Examples</h1>

  <h2>JavaScript</h2>
  <div class="example-box">
    <h4>if statement</h4>
    <pre><code>function greet(name) {
  <span class="decision-point-example">if (name) {</span>
    return \`Hello, \${name}!\`;
  }
  return "Hello, stranger!";
}</code></pre>
    <p><strong>Complexity: 2</strong> (1 base + 1 if)</p>
  </div>
  <div class="example-box">
    <h4>Ternary and logical OR</h4>
    <pre><code>function getStatus(isComplete) {
  <span class="decision-point-example">return isComplete ? "Done" : "Pending";</span>
}
function isValid(v) {
  <span class="decision-point-example">return v === "a" || v === "b";</span>
}</code></pre>
    <p><strong>Complexity: 2</strong> each (1 base + 1 ternary or 1 ||)</p>
  </div>

  <h2>React / TypeScript</h2>
  <p>Conditional rendering (<code>&&</code>, ternary in JSX) and branching inside components count. Hook calls themselves do not; only branches in their callbacks do. TypeScript types and generics do not count.</p>
</body>
</html>`;
}

// Decision Point Parsing Functions

/**
 * Finds function boundaries (start and end lines) for each function
 * @param {string} sourceCode - Full source code
 * @param {Array} functions - Array of function objects with line numbers
 * @returns {Map} Map of functionLine -> { start, end }
 */
function findFunctionBoundaries(sourceCode, functions) {
  const boundaries = new Map();
  const lines = sourceCode.split('\n');
  
  functions.forEach(func => {
    const functionLine = func.line;
    let start = functionLine;
    let end = functionLine;
    const nodeType = func.nodeType || 'FunctionDeclaration';
    
    // For arrow functions, find boundaries starting from the reported line
    // For named functions, look backwards to find the declaration
    if (nodeType === 'ArrowFunctionExpression') {
      // Arrow function starts at the reported line (where => appears)
      // Look for the arrow function pattern on or before this line
      start = functionLine;
      
      // Check if the arrow function starts on this line or the line before
      // Arrow functions can be: () => { or (params) => { or on previous line: (params) =>\n {
      let foundArrow = false;
      for (let i = Math.max(0, functionLine - 1); i <= functionLine; i++) {
        const line = lines[i];
        if (line.includes('=>')) {
          start = i + 1; // Convert to 1-based
          foundArrow = true;
          break;
        }
      }
      
      if (!foundArrow) {
        // Fallback: use the reported line
        start = functionLine;
      }
    } else {
      // Named function: look backwards from the reported line to find function declaration
      // Check up to 50 lines back
      const startLine = Math.max(0, functionLine - 50);
      const context = lines.slice(startLine, functionLine).join('\n');
      
      // Try various function patterns to find the actual declaration line
      const patterns = [
        /(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
        /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
        /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
        /export\s+default\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
        /(?:export\s+default\s+|const\s+)([A-Z][a-zA-Z0-9_$]*)\s*[:=]\s*(?:\([^)]*\)\s*)?=>/,
      ];
      
      // Find the actual function declaration line
      // Match the function name to ensure we find the correct function
      const functionName = func.functionName;
      for (let i = functionLine - 1; i >= startLine; i--) {
        const line = lines[i];
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match && match[1] === functionName) {
            start = i + 1; // Convert to 1-based line number
            break;
          }
        }
        if (start !== functionLine) break;
      }
    }
    
    // Find the end of the function by tracking braces
    // For arrow functions, start tracking from the arrow function's body
    // For TypeScript functions, we need to skip type definition braces and only track function body braces
    let braceCount = 0;
    let inFunctionBody = false;
    let typeBraceCount = 0; // Track type definition braces separately
    
    // For arrow functions, we need to find where the arrow function body starts
    // Arrow functions can be: () => { or (params) => { or on multiple lines
    let arrowFunctionHandled = false;
    if (nodeType === 'ArrowFunctionExpression') {
      // Find the arrow function body start (where { appears after =>)
      for (let i = start - 1; i < lines.length; i++) {
        const line = lines[i];
        // Look for => followed by { on same or next line
        if (line.includes('=>')) {
          // Check if { is on the same line
          if (line.includes('{')) {
            inFunctionBody = true;
            const openBraces = (line.match(/{/g) || []).length;
            braceCount = openBraces;
            start = i + 1; // Update start to where body actually begins
            arrowFunctionHandled = true;
          } else {
            // { might be on next line
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('{')) {
              inFunctionBody = true;
              braceCount = 1;
              start = i + 2; // Body starts on next line
              arrowFunctionHandled = true;
            } else {
              // Arrow function without braces (single expression)
              // Find the end by looking for semicolon or comma
              let j = i + 1;
              while (j < lines.length && !lines[j].trim().match(/^[;},]/)) {
                j++;
              }
              end = j + 1;
              boundaries.set(functionLine, { start, end });
              arrowFunctionHandled = true;
              break; // Skip rest of processing for this function
            }
          }
          break;
        }
      }
    }
    
    // Now find the end of the function body
    // Skip if arrow function without braces was already handled
    if (!(arrowFunctionHandled && end !== functionLine)) {
      for (let i = start - 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (!inFunctionBody) {
        // Look for the function body opening brace
        // It's either: 1) "): ReturnType {" pattern, or 2) first "{" if no type annotation
        // Union types can contain | characters, so we need to match more broadly
        const hasFunctionBodyPattern = /\)\s*[:\w\s<>\[\]|'"]*\s*\{/.test(line);
        const hasArrowFunction = line.includes('=>') && !line.includes('{');
        
        if (hasFunctionBodyPattern) {
          // Function body starts here (e.g., "}): ContrastIssue[] {")
          inFunctionBody = true;
          // Count only the function body opening brace(s), not the closing type brace
          const allOpenBraces = (line.match(/{/g) || []).length;
          const allCloseBraces = (line.match(/}/g) || []).length;
          // The function body brace is the last opening brace after closing the type
          // When both closing and opening braces are on the same line, we only count the opening brace
          // because we're starting function body tracking (the closing brace was for the type definition)
          braceCount = allOpenBraces; // This is the function body opening brace
          // Don't process this line's braces again in the function body tracking section
          // The opening brace is already counted in braceCount
        } else if (hasArrowFunction) {
          // Arrow function without braces
          inFunctionBody = true;
          let j = i + 1;
          while (j < lines.length && !lines[j].trim().match(/^[;}]/)) {
            j++;
          }
          end = j + 1;
          break;
        } else if (line.includes('{')) {
          // This might be a type definition brace - track it separately
          // Don't set inFunctionBody yet, keep looking for the function body
          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          typeBraceCount += openBraces - closeBraces;
        }
      } else {
        // We're in the function body, track its braces
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        // Special handling for arrow function callbacks (useEffect, setTimeout, etc.)
        // These end with }, [deps] or }, delay) pattern
        // Check if this closing brace is followed by a dependency array or parameter
        if (braceCount === 0 && closeBraces > 0) {
          // Check if this line or next line has dependency array pattern: }, [deps]
          const restOfLine = line.substring(line.indexOf('}'));
          const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
          const combined = restOfLine + ' ' + nextLine;
          const hasDependencyArray = /}\s*,\s*\[/.test(combined);
          const hasCallbackParam = /}\s*,\s*\d+/.test(combined); // setTimeout(..., delay)
          
          if (hasDependencyArray) {
            // This is the end of an arrow function callback with dependency array
            // Find where the dependency array closes
            for (let k = i; k < Math.min(i + 3, lines.length); k++) {
              const checkLine = lines[k];
              if (checkLine.includes(']')) {
                end = k + 1;
                break;
              }
            }
            if (end !== functionLine) {
              break; // Found the end
            }
          } else if (hasCallbackParam) {
            // setTimeout/setInterval callback - ends at the closing paren
            for (let k = i; k < Math.min(i + 3, lines.length); k++) {
              const checkLine = lines[k];
              if (checkLine.includes(')') && (checkLine.includes(';') || k === i + 1)) {
                end = k + 1;
                break;
              }
            }
            if (end !== functionLine) {
              break; // Found the end
            }
          }
          
          // Regular function end (braces balanced)
          end = i + 1; // Convert to 1-based line number
          break;
        }
      }
    }
    }
    
    // Fallback: if we couldn't find the end, use a reasonable default
    // Also fallback if we never entered the function body (might be a type-only function or parsing issue)
    if (end === functionLine || !inFunctionBody) {
      // Try to find the end by looking for the last closing brace that matches the function
      // This is a fallback for edge cases
      let fallbackBraceCount = 0;
      let foundFunctionBody = false;
      for (let i = start - 1; i < lines.length; i++) {
        const line = lines[i];
        if (!foundFunctionBody && /\)\s*[:\w\s<>\[\]|'"]*\s*\{/.test(line)) {
          foundFunctionBody = true;
          fallbackBraceCount = (line.match(/{/g) || []).length;
        } else if (foundFunctionBody) {
          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          fallbackBraceCount += openBraces - closeBraces;
          if (fallbackBraceCount === 0 && closeBraces > 0) {
            end = i + 1; // Convert to 1-based line number
            break;
          }
        }
      }
      // If still not found, use reasonable default
      if (end === functionLine) {
        end = Math.min(start + 500, lines.length); // Increased from 100 to 500 for large functions
      }
    }
    
    boundaries.set(functionLine, { start, end });
  });
  
  return boundaries;
}

/**
 * Parses decision points from source code
 * @param {string} sourceCode - Full source code
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @returns {Array} Array of decision points: { line, type, name, functionLine }
 */
function parseDecisionPoints(sourceCode, functionBoundaries, functions = []) {
  const decisionPoints = [];
  const lines = sourceCode.split('\n');
  
  // Create a reverse map: line number -> array of function lines that contain it
  // We'll assign decision points to the innermost function
  const lineToFunctions = new Map();
  functionBoundaries.forEach((boundary, functionLine) => {
    for (let line = boundary.start; line <= boundary.end; line++) {
      if (!lineToFunctions.has(line)) {
        lineToFunctions.set(line, []);
      }
      lineToFunctions.get(line).push({ functionLine, boundary });
    }
  });
  
  // Helper function to find the innermost function for a given line
  const getInnermostFunction = (lineNum) => {
    const containingFunctions = lineToFunctions.get(lineNum) || [];
    if (containingFunctions.length === 0) return null;
    if (containingFunctions.length === 1) return containingFunctions[0].functionLine;
    
    // Find the function with the smallest boundary (innermost)
    let innermost = containingFunctions[0];
    for (let i = 1; i < containingFunctions.length; i++) {
      const current = containingFunctions[i];
      const currentSize = current.boundary.end - current.boundary.start;
      const innermostSize = innermost.boundary.end - innermost.boundary.start;
      if (currentSize < innermostSize) {
        innermost = current;
      }
    }
    return innermost.functionLine;
  };
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const containingFunctions = lineToFunctions.get(lineNum) || [];
    if (containingFunctions.length === 0) return; // Skip lines outside functions
    
    // Find the function to assign this decision point to
    // Always use the innermost function (smallest boundary) - this ensures
    // decision points in nested functions are assigned to the nested function, not the parent
    const functionLine = getInnermostFunction(lineNum);
    if (!functionLine) return; // Skip if no function found
    
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return; // Skip empty lines and comments
    }
    
    // Remove comments from line for parsing
    const lineWithoutComments = line.replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
    
    // Parse default parameters in function signatures
    // ESLint's classic variant counts default parameters as decision points
    // Default parameters only appear in function parameter lists, not as standalone assignments
    // Pattern: function foo(x = 5) or const foo = (x = 5) => or (x = 5) =>
    const boundary = functionBoundaries.get(functionLine);
    if (boundary && (lineNum - boundary.start < 3)) {
      // Only check the first few lines where function signatures appear
      // Default parameters appear in: function name(params) or (params) => or name = (params) =>
      // They're part of the parameter list, not standalone assignments
      const hasFunctionSignature = /^\s*(?:export\s+)?(?:function|const|let|var)\s+\w+\s*[=(]/.test(lineWithoutComments) ||
                                   /^\s*\([^)]*=\s*[^,)]+/.test(lineWithoutComments) ||
                                   /=>\s*\([^)]*=\s*[^,)]+/.test(lineWithoutComments);
      
      // Match default parameter pattern: identifier = value inside parentheses (function params)
      // This matches: function foo(x = 5, y = 10) or (x = 5) => or const foo = (x = 5) =>
      const defaultParamInSignature = /[=(][^=)]*\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^=,)\s{}]+/.test(lineWithoutComments);
      
      if (hasFunctionSignature && defaultParamInSignature && 
          !/^\s*(const|let|var)\s+\w+\s*=\s*[^(]/.test(lineWithoutComments) && // Not a const/let/var assignment
          !/^\s*return\s+/.test(lineWithoutComments)) { // Not a return statement
        // Count each default parameter in the signature
        const defaultParamMatches = lineWithoutComments.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^=,)\s{}]+/g);
        if (defaultParamMatches) {
          defaultParamMatches.forEach(() => {
            decisionPoints.push({ line: lineNum, type: 'default parameter', name: 'default parameter', functionLine });
          });
        }
      }
    }
    
    // Parse if statements
    const isIfStatement = /^\s*if\s*\(/.test(lineWithoutComments);
    if (isIfStatement) {
      decisionPoints.push({ line: lineNum, type: 'if', name: 'if statement', functionLine });
      // Count && and || operators anywhere in the line (they're in the condition)
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) {
        andMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine });
        });
      }
      if (orMatches) {
        orMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine });
        });
      }
    }
    
    // Parse else if statements
    const isElseIfStatement = /^\s*else\s+if\s*\(/.test(lineWithoutComments);
    if (isElseIfStatement) {
      decisionPoints.push({ line: lineNum, type: 'else if', name: 'else if statement', functionLine });
      // Count && and || operators anywhere in the line (they're in the condition)
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) {
        andMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine });
        });
      }
      if (orMatches) {
        orMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine });
        });
      }
    }
    
    // Parse for loops (regular for)
    const isForLoop = /^\s*for\s*\(/.test(lineWithoutComments) && !/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments) && !/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments);
    if (isForLoop) {
      decisionPoints.push({ line: lineNum, type: 'for', name: 'for loop', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse for...of loops
    if (/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for...of', name: 'for...of loop', functionLine });
    }
    
    // Parse for...in loops
    if (/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for...in', name: 'for...in loop', functionLine });
    }
    
    // Parse while loops
    const isWhileLoop = /^\s*while\s*\(/.test(lineWithoutComments);
    if (isWhileLoop) {
      decisionPoints.push({ line: lineNum, type: 'while', name: 'while loop', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse do...while loops
    if (/^\s*do\s*\{/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'do...while', name: 'do...while loop', functionLine });
    }
    
    // Parse switch statements
    const isSwitchStatement = /^\s*switch\s*\(/.test(lineWithoutComments);
    if (isSwitchStatement) {
      decisionPoints.push({ line: lineNum, type: 'switch', name: 'switch statement', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse case statements
    if (/^\s*case\s+/.test(lineWithoutComments) || /^\s*default\s*:/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'case', name: 'case/default', functionLine });
    }
    
    // Parse catch blocks
    // Catch can appear as "catch (" or "} catch (" (on same line as closing brace)
    const isCatchBlock = /\bcatch\s*\(/.test(lineWithoutComments);
    if (isCatchBlock) {
      decisionPoints.push({ line: lineNum, type: 'catch', name: 'catch block', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse ternary operators (?:)
    // Count each ? as a decision point, but only if it's part of a ternary (has : after it)
    // Match pattern: ? ... : (ternary operator)
    // This avoids matching ? characters inside string literals like includes('?')
    const ternaryPattern = /\?\s*[^:]*:/g;
    const ternaryMatches = lineWithoutComments.match(ternaryPattern);
    
    // Check if this line has a ? (could be part of a multi-line ternary)
    const hasQuestionMark = lineWithoutComments.includes('?');
    const hasColon = lineWithoutComments.includes(':');
    
    // Check next line for : (multi-line ternary: ? on this line, : on next)
    const nextLine = index + 1 < lines.length ? lines[index + 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim() : '';
    const nextLineHasColon = nextLine.includes(':');
    
    // Check previous line for ? (multi-line ternary: ? on prev line, this line has condition with &&)
    const prevLine = index > 0 ? lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim() : '';
    const prevLineHasQuestionMark = prevLine.includes('?');
    
    // Detect multi-line ternaries
    const isMultiLineTernaryWithQuestionOnThisLine = hasQuestionMark && nextLineHasColon;
    const isMultiLineTernaryConditionLine = !hasQuestionMark && !hasColon && prevLineHasQuestionMark && /[&|]{2}/.test(lineWithoutComments);
    
    if (ternaryMatches || isMultiLineTernaryWithQuestionOnThisLine) {
      // Count ternary operator
      const ternaryCount = ternaryMatches ? ternaryMatches.length : (hasQuestionMark ? 1 : 0);
      for (let i = 0; i < ternaryCount; i++) {
        decisionPoints.push({ line: lineNum, type: 'ternary', name: 'ternary operator', functionLine });
      }
      
      // Count && and || operators on this line (they're in the ternary expression)
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
      
      // For multi-line ternaries, also check previous line for &&/|| operators
      if (isMultiLineTernaryWithQuestionOnThisLine && index > 0) {
        const prevLineWithoutComments = prevLine;
        if (prevLineWithoutComments && /[&|]{2}/.test(prevLineWithoutComments)) {
          const prevAndMatches = prevLineWithoutComments.match(/&&/g);
          const prevOrMatches = prevLineWithoutComments.match(/\|\|/g);
          // Add decision points for previous line, but use previous line number
          const prevLineNum = lineNum - 1;
          if (prevAndMatches) prevAndMatches.forEach(() => decisionPoints.push({ line: prevLineNum, type: '&&', name: 'logical AND', functionLine }));
          if (prevOrMatches) prevOrMatches.forEach(() => decisionPoints.push({ line: prevLineNum, type: '||', name: 'logical OR', functionLine }));
        }
      }
    }
    
    // Handle case where this line is the condition line of a multi-line ternary (has &&/||, previous line has ?)
    if (isMultiLineTernaryConditionLine) {
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse short-circuit logical operators (&&, ||) in boolean expressions
    // These create decision points in:
    // 1. Return statements with boolean expressions
    // 2. Variable assignments with boolean expressions
    // 3. Function arguments with boolean expressions
    // Note: && and || inside if/while/for conditions are handled above
    const isReturnStatement = /^\s*return\s+/.test(lineWithoutComments);
    const isBooleanExpression = isReturnStatement || 
                                 /^\s*(const|let|var)\s+\w+\s*=\s*[^=]*[&|]{2}/.test(lineWithoutComments) ||
                                 /\([^)]*[&|]{2}[^)]*\)/.test(lineWithoutComments);
    
    if (isBooleanExpression && !isIfStatement && !isElseIfStatement && !isForLoop && !isWhileLoop && !isSwitchStatement && !isCatchBlock && !ternaryMatches) {
      // Count && and || operators in boolean expressions
      // Each operator creates a decision point
      // Exclude if/else if since we already handled them above
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      
      if (andMatches && andMatches.length > 0) {
        // Count all && operators (each adds complexity)
        andMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine });
        });
      }
      
      if (orMatches && orMatches.length > 0) {
        // Count all || operators (each adds complexity)
        orMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine });
        });
      }
    }
  });
  
  return decisionPoints;
}

/**
 * Calculates complexity breakdown for a specific function
 * @param {number} functionLine - Line number of the function
 * @param {Array} decisionPoints - All decision points
 * @param {number} baseComplexity - Base complexity (should be 1)
 * @returns {Object} { breakdown: {...}, calculatedTotal: number, decisionPoints: [...] }
 */
function calculateComplexityBreakdown(functionLine, decisionPoints, baseComplexity) {
  const functionDecisionPoints = decisionPoints.filter(dp => dp.functionLine === functionLine);
  
  const breakdown = {
    base: baseComplexity || 1,
    'if': 0,
    'else if': 0,
    'for': 0,
    'for...of': 0,
    'for...in': 0,
    'while': 0,
    'do...while': 0,
    'switch': 0,
    'case': 0,
    'catch': 0,
    'ternary': 0,
    '&&': 0,
    '||': 0,
    'default parameter': 0,
  };
  
  functionDecisionPoints.forEach(dp => {
    if (breakdown.hasOwnProperty(dp.type)) {
      breakdown[dp.type]++;
    }
  });
  
  const calculatedTotal = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  
  return {
    breakdown,
    calculatedTotal,
    decisionPoints: functionDecisionPoints,
  };
}

/**
 * Formats complexity breakdown as a readable string
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted breakdown string
 */
function formatComplexityBreakdown(breakdown, actualComplexity) {
  const parts = [];
  
  // Always include base
  if (breakdown.base > 0) {
    parts.push(`${breakdown.base} base`);
  }
  
  // Order decision point types consistently
  const typeOrder = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch', 'ternary', '&&', '||', 'default parameter'];
  
  typeOrder.forEach(type => {
    if (breakdown[type] > 0) {
      parts.push(`${breakdown[type]} ${type}`);
    }
  });
  
  const breakdownStr = parts.join(' + ');
  return `complexity = ${actualComplexity} (${breakdownStr})`;
}

/**
 * Formats complexity breakdown as ESLint-style breakdown (e.g., "1 base + 1 if + 1 ||")
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted breakdown string
 */
function formatComplexityBreakdownInline(breakdown, actualComplexity) {
  const parts = [];
  
  // Always include base
  if (breakdown.base > 0) {
    parts.push(`${breakdown.base} base`);
  }
  
  // Order decision point types consistently (matching ESLint's counting)
  const typeOrder = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch', 'ternary', '&&', '||', 'default parameter'];
  
  typeOrder.forEach(type => {
    const count = breakdown[type] || 0;
    if (count > 0) {
      // Use ESLint symbols: ?: for ternary, && for AND, || for OR
      const symbol = type === 'ternary' ? '?:' : type === '&&' ? '&&' : type === '||' ? '||' : type;
      parts.push(`+${count} ${symbol}`);
    }
  });
  
  return parts.join(' ');
}

/**
 * Formats complexity breakdown with styled numbers and dividers between decision paths
 * Returns HTML string with styled breakdown
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted HTML string
 */
function formatComplexityBreakdownStyled(breakdown, actualComplexity) {
  const parts = [];
  
  // Always include base with styled number
  if (breakdown.base > 0) {
    parts.push(`base <span class="complexity-number">${breakdown.base}</span>`);
  }
  
  // Order decision point types consistently (matching ESLint's counting)
  const typeOrder = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch', 'ternary', '&&', '||', 'default parameter'];
  
  typeOrder.forEach(type => {
    const count = breakdown[type] || 0;
    if (count > 0) {
      // Use ESLint symbols: ?: for ternary, && for AND, || for OR
      const symbol = type === 'ternary' ? '?:' : type === '&&' ? '&&' : type === '||' ? '||' : type;
      parts.push(`${symbol} <span class="complexity-number">${count}</span>`);
    }
  });
  
  // Join with dividers (pipes) and spacing
  return parts.join(' <span class="breakdown-divider">|</span> ');
}

/**
 * Formats complexity breakdown concisely (used by formatFunctionNode - legacy function)
 * @param {Object} breakdown - Breakdown object from calculateComplexityBreakdown
 * @param {number} actualComplexity - Actual complexity from ESLint
 * @returns {string} Formatted breakdown string
 */
function formatComplexityConcise(breakdown, actualComplexity) {
  return formatComplexityBreakdownInline(breakdown, actualComplexity);
}

/**
 * Builds a hierarchical tree structure from functions based on their boundaries
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @returns {Array} Array of top-level function nodes with children
 */
function buildFunctionHierarchy(functions, functionBoundaries) {
  // Create a map for quick lookup
  const functionMap = new Map();
  functions.forEach(func => {
    functionMap.set(func.line, {
      ...func,
      children: []
    });
  });
  
  // Find parent-child relationships
  const topLevelFunctions = [];
  
  functions.forEach(func => {
    const funcBoundary = functionBoundaries.get(func.line);
    if (!funcBoundary) return;
    
    // Find the parent function (if any) that contains this function
    let parent = null;
    let parentSize = Infinity;
    
    functions.forEach(otherFunc => {
      if (otherFunc.line === func.line) return; // Skip self
      
      const otherBoundary = functionBoundaries.get(otherFunc.line);
      if (!otherBoundary) return;
      
      // Check if otherFunc contains func
      if (otherBoundary.start < funcBoundary.start && otherBoundary.end > funcBoundary.end) {
        const size = otherBoundary.end - otherBoundary.start;
        // Choose the smallest containing function (direct parent)
        if (size < parentSize) {
          parent = otherFunc.line;
          parentSize = size;
        }
      }
    });
    
    if (parent) {
      // Add as child of parent
      const parentNode = functionMap.get(parent);
      if (parentNode) {
        parentNode.children.push(functionMap.get(func.line));
      }
    } else {
      // Top-level function
      topLevelFunctions.push(functionMap.get(func.line));
    }
  });
  
  // Sort children by line number for consistent display
  function sortChildren(node) {
    node.children.sort((a, b) => a.line - b.line);
    node.children.forEach(sortChildren);
  }
  
  topLevelFunctions.forEach(sortChildren);
  
  return topLevelFunctions;
}

/**
 * Finds the maximum complexity in a subtree
 * @param {Object} node - Function node with children
 * @returns {number} Maximum complexity in subtree
 */
function findMaxComplexityInSubtree(node) {
  let max = parseInt(node.complexity);
  node.children.forEach(child => {
    const childMax = findMaxComplexityInSubtree(child);
    if (childMax > max) max = childMax;
  });
  return max;
}

/**
 * Formats a function node for hierarchical display
 * @param {Object} node - Function node with children
 * @param {Map} functionBreakdowns - Map of functionLine -> breakdown
 * @param {number} depth - Current depth in tree
 * @param {boolean} isLast - Whether this is the last child at this level
 * @param {string} prefix - Prefix for tree drawing
 * @param {number} maxComplexityInGroup - Maximum complexity in the current group (for highlighting)
 * @returns {string} Formatted string for this node
 */
function formatFunctionNode(node, functionBreakdowns, depth = 0, isLast = true, prefix = '', maxComplexityInGroup = null) {
  const breakdown = functionBreakdowns.get(node.line);
  const actualComplexity = parseInt(node.complexity);
  const calculatedTotal = breakdown ? breakdown.calculatedTotal : actualComplexity;
  
  // Determine if we should show breakdown
  const showBreakdown = breakdown && (
    calculatedTotal === actualComplexity || 
    (Math.abs(calculatedTotal - actualComplexity) === 1 && calculatedTotal < actualComplexity)
  );
  
  // Extract function name and callback type
  const functionName = node.functionName;
  let displayName = functionName;
  let callbackType = null;
  
  // Detect callback types from function name
  if (functionName.includes('(useEffect callback)')) {
    displayName = functionName.replace(' (useEffect callback)', '');
    callbackType = 'useEffect';
  } else if (functionName.includes('(setTimeout callback)')) {
    displayName = functionName.replace(' (setTimeout callback)', '');
    callbackType = 'setTimeout';
  } else if (functionName.includes('(requestAnimationFrame callback)')) {
    displayName = functionName.replace(' (requestAnimationFrame callback)', '');
    callbackType = 'animation frame';
  } else if (functionName.includes('(return callback)')) {
    displayName = functionName.replace(' (return callback)', '');
    callbackType = 'cleanup';
  } else if (functionName.includes('(arrow function)')) {
    displayName = functionName.replace(' (arrow function)', '');
    // Try to infer callback type from context
    if (displayName.match(/^on[A-Z]/)) {
      callbackType = 'event handler';
    } else if (depth > 0) {
      // If nested and no specific type, it's likely an inline JSX callback
      callbackType = 'inline JSX callback';
    }
  }
  
  // Format complexity display
  let complexityDisplay = '';
  if (actualComplexity === 1) {
    complexityDisplay = 'base';
  } else if (showBreakdown) {
    const concise = formatComplexityConcise(breakdown.breakdown, actualComplexity);
    complexityDisplay = `CC: ${actualComplexity} (${concise})`;
  } else {
    complexityDisplay = `CC: ${actualComplexity}`;
  }
  
  // Determine if this is the highest complexity function in its group
  // maxComplexityInGroup should include this node's complexity
  const currentGroupMax = maxComplexityInGroup !== null ? Math.max(maxComplexityInGroup, actualComplexity) : actualComplexity;
  const isHighestComplexity = maxComplexityInGroup !== null && actualComplexity === currentGroupMax;
  
  // Build the line (escape HTML for text content, but allow HTML tags)
  let line = '';
  const escapedName = escapeHtml(displayName);
  const escapedComplexity = escapeHtml(complexityDisplay);
  
  if (depth === 0) {
    // Top-level function
    if (isHighestComplexity) {
      line = `<span class="function-highlight">${escapedName} — ${escapedComplexity}</span>`;
    } else {
      line = `${escapedName} — ${escapedComplexity}`;
    }
  } else {
    // Nested function
    const connector = isLast ? '└─' : '├─';
    const callbackLabel = callbackType ? ` (${callbackType})` : '';
    if (actualComplexity === 1) {
      line = `${prefix}${connector} ${escapedName}${callbackLabel} (base)`;
    } else {
      if (isHighestComplexity) {
        line = `${prefix}${connector} <span class="function-highlight">${escapedName}${callbackLabel} — ${escapedComplexity}</span>`;
      } else {
        line = `${prefix}${connector} ${escapedName}${callbackLabel} — ${escapedComplexity}`;
      }
    }
  }
  
  // Add children
  const lines = [line];
  if (node.children.length > 0) {
    const childPrefix = depth === 0 ? '' : (isLast ? prefix + '   ' : prefix + '│  ');
    // Find max complexity in this group (including current node and all children) for highlighting
    const groupMaxComplexity = Math.max(
      actualComplexity,
      ...node.children.map(c => findMaxComplexityInSubtree(c))
    );
    node.children.forEach((child, index) => {
      const isChildLast = index === node.children.length - 1;
      lines.push(formatFunctionNode(child, functionBreakdowns, depth + 1, isChildLast, childPrefix, groupMaxComplexity));
    });
  }
  
  return lines.join('\n');
}

/**
 * Extracts callback label with unique numbering and context
 * @param {Object} node - Function node
 * @param {Object} parentNode - Parent function node
 * @param {Map} siblingCallbacks - Map tracking callback counts per type
 * @param {string} fullSourceCode - Full source code for context
 * @param {number} nodeLine - Line number of the callback
 * @returns {string} Unique callback label
 */
function extractCallbackLabel(node, parentNode, siblingCallbacks, fullSourceCode = '', nodeLine = 0) {
  const functionName = node.functionName;
  
  // Get context around the function line (10 lines before and after)
  const lines = fullSourceCode.split('\n');
  const startLine = Math.max(0, nodeLine - 10);
  const endLine = Math.min(lines.length, nodeLine + 10);
  const context = lines.slice(startLine, endLine).join('\n');
  
  // Check for cleanup callbacks (return statements in useEffect)
  if (functionName.includes('(return callback)') || functionName.includes('cleanup') || context.includes('return ()')) {
    // Find which useEffect this belongs to by looking at parent
    if (parentNode) {
      const parentLabel = extractCallbackLabel(parentNode, null, siblingCallbacks, fullSourceCode, parentNode.line);
      if (parentLabel.startsWith('useEffect#')) {
        return `${parentLabel} cleanup`;
      }
    }
    return 'cleanup';
  }
  
  // Check for useEffect callbacks - need to number them sequentially
  if (functionName.includes('(useEffect callback)') || context.includes('useEffect(')) {
    const parentName = parentNode ? parentNode.functionName : '';
    const key = `${parentName}_useEffect`;
    const count = (siblingCallbacks.get(key) || 0) + 1;
    siblingCallbacks.set(key, count);
    return `useEffect#${count}`;
  }
  
  // Check for requestAnimationFrame
  if (functionName.includes('(requestAnimationFrame callback)') || context.includes('requestAnimationFrame(')) {
    return 'rAF callback';
  }
  
  // Check for setTimeout
  if (functionName.includes('(setTimeout callback)') || context.includes('setTimeout(')) {
    return 'setTimeout callback';
  }
  
  // Check for event handlers (onClick, onScroll, etc.) - check function name first
  if (functionName.match(/^on[A-Z]/)) {
    const handlerMatch = functionName.match(/on([A-Z]\w+)/);
    if (handlerMatch) {
      return `${handlerMatch[0]} handler`;
    }
  }
  
  // Check for JSX inline callbacks (onClick in JSX) - look for onClick={, onChange={, etc.
  const jsxHandlerMatch = context.match(/(on[A-Z]\w+)\s*=\s*\{/);
  if (jsxHandlerMatch) {
    return `JSX ${jsxHandlerMatch[1]}`;
  }
  
  // Check for event handlers in context (onScroll, onClick as function names)
  if (context.includes('onScroll') && !context.includes('onScroll=')) {
    return 'onScroll handler';
  }
  if (context.includes('onClick') && !context.includes('onClick=')) {
    return 'onClick handler';
  }
  
  // Default: try to extract from function name
  if (functionName.includes('(arrow function)')) {
    const parentName = parentNode ? parentNode.functionName : '';
    if (parentName && parentName !== 'unknown' && parentName !== 'anonymous') {
      // Don't repeat parent name if it's the same
      if (!functionName.includes(parentName)) {
        return `${parentName} callback`;
      }
    }
  }
  
  return 'callback';
}

/**
 * Extracts base function name (removes callback suffixes)
 * @param {string} name - Full function name
 * @returns {string} Base function name
 */
function getBaseFunctionName(name) {
  // Remove callback suffixes: (useEffect callback), (setTimeout callback), etc.
  const callbackPatterns = [
    /\s*\(useEffect callback\)/i,
    /\s*\(setTimeout callback\)/i,
    /\s*\(requestAnimationFrame callback\)/i,
    /\s*\(return callback\)/i,
    /\s*\(arrow function\)/i,
    /\s*\(map callback\)/i,
    /\s*\(filter callback\)/i,
  ];
  
  let baseName = name;
  callbackPatterns.forEach(pattern => {
    baseName = baseName.replace(pattern, '');
  });
  
  return baseName.trim();
}

/**
 * Formats all functions in scannable, unambiguous format (one line per function)
 * Shows only what ESLint counts for cyclomatic complexity
 * Groups functions by base name, showing the highest complexity version
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Map} functionBreakdowns - Map of functionLine -> breakdown
 * @param {string} sourceCode - Source code for context
 * @returns {string} Formatted HTML string
 */
function formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, sourceCode = '') {
  if (functions.length === 0) return '';
  
  // Show each function exactly as ESLint reports it, but deduplicate by line number
  // This ensures the breakdown matches the inline code annotations
  const lineToFunction = new Map();
  
  functions.forEach(func => {
    const line = func.line;
    const existing = lineToFunction.get(line);
    
    // If multiple functions on same line, keep the one with highest complexity
    // (this handles edge cases where ESLint might report multiple functions)
    if (!existing || parseInt(func.complexity) > parseInt(existing.complexity)) {
      lineToFunction.set(line, func);
    }
  });
  
  // Filter to show only main function declarations (not nested callbacks)
  // This matches what users see in the code view annotations
  // Group by base name and keep only the main function (exact name match)
  const functionGroups = new Map();
  
  Array.from(lineToFunction.values()).forEach(func => {
    const baseName = getBaseFunctionName(func.functionName);
    const key = `${func.file}:${baseName}`;
    const isExactMatch = func.functionName === baseName;
    
    const existing = functionGroups.get(key);
    if (!existing) {
      functionGroups.set(key, func);
    } else {
      const existingIsExactMatch = existing.functionName === getBaseFunctionName(existing.functionName);
      // Always prefer exact match (main function) over callback versions
      if (isExactMatch && !existingIsExactMatch) {
        functionGroups.set(key, func);
      } else if (!isExactMatch && existingIsExactMatch) {
        // Keep existing (exact match)
      } else if (isExactMatch && existingIsExactMatch) {
        // Both exact - prefer higher complexity
        if (parseInt(func.complexity) > parseInt(existing.complexity)) {
          functionGroups.set(key, func);
        }
      } else {
        // Neither exact - prefer higher complexity
        if (parseInt(func.complexity) > parseInt(existing.complexity)) {
          functionGroups.set(key, func);
        }
      }
    }
  });
  
  // Sort by line number to match code order
  const sortedFunctions = Array.from(functionGroups.values()).sort((a, b) => a.line - b.line);
  
  const lines = [];
  
  // Format each function on one line with styled breakdown
  sortedFunctions.forEach(func => {
    const complexity = parseInt(func.complexity);
    const breakdown = functionBreakdowns.get(func.line);
    const calculatedTotal = breakdown ? breakdown.calculatedTotal : complexity;
    
    // Show breakdown if we have one and it matches ESLint's complexity
    const hasBreakdown = breakdown && breakdown.breakdown;
    const hasDecisionPoints = breakdown && breakdown.decisionPoints && breakdown.decisionPoints.length > 0;
    const exactMatch = breakdown && calculatedTotal === complexity;
    const showBreakdown = hasBreakdown && exactMatch && hasDecisionPoints;
    
    let breakdownHTML = '';
    if (showBreakdown && complexity > 1) {
      // Show breakdown with styled numbers: "base [1] | if [1] | ?: [1]"
      breakdownHTML = formatComplexityBreakdownStyled(breakdown.breakdown, complexity);
    } else if (complexity === 1) {
      // Base-only functions
      breakdownHTML = `base <span class="complexity-number">1</span>`;
    } else {
      // If breakdown doesn't match or isn't available, show dash
      breakdownHTML = `<span class="quiet">—</span>`;
    }
    
    // Format as table row: Function | Complexity | Breakdown
    // Show full function name to distinguish between different versions (callbacks, etc.)
    const displayName = func.functionName || 'unknown';
    lines.push(`        <tr>`);
    lines.push(`          <td class="breakdown-function"><span class="strong">${escapeHtml(displayName)}</span></td>`);
    lines.push(`          <td class="breakdown-complexity"><span class="complexity-number">${complexity}</span></td>`);
    lines.push(`          <td class="breakdown-details">${breakdownHTML}</td>`);
    lines.push(`        </tr>`);
  });
  
  return lines.join('\n');
}

// Function to generate file HTML page
function generateFileHTML(filePath, functions) {
  const fullPath = resolve(projectRoot, filePath);
  let sourceCode = '';
  let sourceLines = [];
  
  try {
    if (existsSync(fullPath)) {
      sourceCode = readFileSync(fullPath, 'utf-8');
      sourceLines = sourceCode.split('\n');
    }
  } catch (error) {
    console.warn(`Warning: Could not read source file ${filePath}:`, error.message);
  }
  
  // Create a map of line numbers to functions for quick lookup
  const lineToFunction = new Map();
  functions.forEach(func => {
    lineToFunction.set(func.line, func);
  });
  
  // Parse decision points
  const functionBoundaries = findFunctionBoundaries(sourceCode, functions);
  const decisionPoints = parseDecisionPoints(sourceCode, functionBoundaries, functions);
  
  // Calculate complexity breakdowns for each function
  // Decision points are already assigned to the innermost function in parseDecisionPoints
  const functionBreakdowns = new Map();
  functions.forEach(func => {
    const breakdown = calculateComplexityBreakdown(
      func.line,
      decisionPoints,
      1 // base complexity
    );
    
    // Debug: Log mismatches to help identify issues
    const actualComplexity = parseInt(func.complexity);
    const calculatedTotal = breakdown.calculatedTotal;
    if (Math.abs(calculatedTotal - actualComplexity) > 1) {
      // Significant mismatch - this indicates a parsing issue
      // The breakdown might be missing decision points or counting wrong ones
      console.warn(`Complexity mismatch for ${func.functionName} at line ${func.line}: ESLint reports ${actualComplexity}, calculated ${calculatedTotal}`);
      if (breakdown.decisionPoints && breakdown.decisionPoints.length > 0) {
        console.warn(`  Decision points found:`, breakdown.decisionPoints.map(dp => `${dp.type} at line ${dp.line}`).join(', '));
      } else {
        console.warn(`  Decision points found: (none)`);
        // For TopBanner specifically, check what's happening
        if (func.functionName === 'TopBanner' && func.line === 5) {
          const boundary = functionBoundaries.get(func.line);
          console.warn(`  TopBanner boundary: start=${boundary?.start}, end=${boundary?.end}`);
          // Check if lines 49 and 54 are in any function boundary
          const line49Funcs = Array.from(functionBoundaries.entries()).filter(([fl, b]) => fl !== func.line && 49 >= b.start && 49 <= b.end);
          const line54Funcs = Array.from(functionBoundaries.entries()).filter(([fl, b]) => fl !== func.line && 54 >= b.start && 54 <= b.end);
          if (line49Funcs.length > 0) {
            console.warn(`  Line 49 is in other function boundaries:`, line49Funcs.map(([fl, b]) => `line ${fl} (${b.start}-${b.end})`).join(', '));
          }
          if (line54Funcs.length > 0) {
            console.warn(`  Line 54 is in other function boundaries:`, line54Funcs.map(([fl, b]) => `line ${fl} (${b.start}-${b.end})`).join(', '));
          }
        }
      }
    }
    
    functionBreakdowns.set(func.line, breakdown);
  });
  
  // Create decision point line map for highlighting
  const lineToDecisionPoint = new Map();
  decisionPoints.forEach(dp => {
    if (!lineToDecisionPoint.has(dp.line)) {
      lineToDecisionPoint.set(dp.line, []);
    }
    lineToDecisionPoint.get(dp.line).push(dp);
  });
  
  // Calculate file-level statistics
  const totalFunctions = functions.length;
  const withinThreshold = functions.filter(f => parseInt(f.complexity) <= 10).length;
  const maxComplexity = functions.length > 0 ? Math.max(...functions.map(f => parseInt(f.complexity))) : 0;
  const avgComplexity = functions.length > 0 ? Math.round(functions.reduce((sum, f) => sum + parseInt(f.complexity), 0) / functions.length) : 0;
  const percentage = totalFunctions > 0 ? Math.round((withinThreshold / totalFunctions) * 100) : 100;
  const level = percentage >= 80 ? 'high' : percentage >= 60 ? 'high' : percentage >= 40 ? 'medium' : 'low';
  
  // Get directory path for breadcrumb navigation
  const fileDir = getDirectory(filePath);
  const fileName = filePath.split('/').pop();
  // Folder index is in the same directory as the file HTML, so just use 'index.html'
  const folderIndexPath = 'index.html';
  const backLink = fileDir ? '../'.repeat(fileDir.split('/').length) + 'index.html' : 'index.html';
  
  // Generate hierarchical complexity breakdown display
  // Group by top-level function, nest callbacks visually under their parent
  const breakdownItems = formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, sourceCode);
  
  const breakdownSection = functions.length > 0 ? `
    <div class="complexity-breakdown">
      <table>
        <thead>
          <tr>
            <th>Function</th>
            <th>Complexity</th>
            <th>Breakdown</th>
          </tr>
        </thead>
        <tbody>
          ${breakdownItems}
        </tbody>
      </table>
    </div>
  ` : '';
  
  // Collect function boundary lines for visual separators
  const functionStartLines = new Set();
  const functionEndLines = new Set();
  const functionClosingLines = new Set(); // actual } line for yellow highlight
  functionBoundaries.forEach((boundary, functionLine) => {
    const { start, end } = boundary;
    functionStartLines.add(start);
    // Add the closing brace line for yellow highlight
    functionClosingLines.add(end);
    // Closing border goes below the }; use next row so border appears at bottom of brace
    // Only add if end is within bounds and there's a next line
    if (end < sourceLines.length) {
      functionEndLines.add(end + 1);
    } else if (end === sourceLines.length) {
      // If end is the last line, add it to functionEndLines for the border
      functionEndLines.add(end);
    }
  });
  
  // Generate line-by-line HTML
  const lineRows = sourceLines.map((line, index) => {
    const lineNum = index + 1;
    const func = lineToFunction.get(lineNum);
    const escapedLine = escapeHtml(line || '');
    const decisionPointsOnLine = lineToDecisionPoint.get(lineNum) || [];
    
    // Determine complexity annotation
    let complexityAnnotation = '<span class="cline-any cline-neutral">&nbsp;</span>';
    if (func) {
      const complexityNum = parseInt(func.complexity);
      const funcLevel = getComplexityLevel(func.complexity);
      // Use cline-yes for functions (similar to coverage showing execution count)
      complexityAnnotation = `<span class="cline-any cline-yes" title="Function '${escapeHtml(func.functionName)}' has complexity ${complexityNum}">${complexityNum}</span>`;
    }
    
    // Determine if this line is a decision point
    const isDecisionPoint = decisionPointsOnLine.length > 0;
    const decisionPointTitle = isDecisionPoint 
      ? ` title="${decisionPointsOnLine.map(dp => dp.name).join(', ')}"`
      : '';
    const decisionPointClass = isDecisionPoint ? 'decision-point' : '';
    
    // Determine if this line is a function boundary (start/end) for visual separator
    const isFunctionStart = functionStartLines.has(lineNum);
    const isFunctionEnd = functionEndLines.has(lineNum);
    const isFunctionClosing = functionClosingLines.has(lineNum);
    const boundaryParts = [];
    if (isFunctionStart && isFunctionEnd) boundaryParts.push('function-boundary-single');
    else {
      if (isFunctionStart) boundaryParts.push('function-boundary-start');
      if (isFunctionEnd) boundaryParts.push('function-boundary-end');
      if (isFunctionClosing) boundaryParts.push('function-boundary-closing');
    }
    const boundaryClass = boundaryParts.join(' ');
    const allClasses = [decisionPointClass, boundaryClass].filter(Boolean).join(' ');
    const classAttr = allClasses ? ` class="${allClasses}"` : '';
    
    // Split line into leading whitespace, content, and trailing whitespace
    // Only highlight the content part, not the whitespace
    const lineMatch = line.match(/^(\s*)(.*?)(\s*)$/);
    const leadingWhitespace = lineMatch ? escapeHtml(lineMatch[1]) : '';
    const content = lineMatch ? escapeHtml(lineMatch[2]) : escapedLine;
    const trailingWhitespace = lineMatch ? escapeHtml(lineMatch[3]) : '';
    
    // Build the code line HTML with selective highlighting
    let codeLineHTML = '';
    if (isDecisionPoint || isFunctionStart || isFunctionClosing) {
      // Apply highlighting only to content, not whitespace
      const codeLineParts = ['code-line'];
      if (isDecisionPoint) codeLineParts.push('decision-point-line');
      if (isFunctionStart || isFunctionClosing) codeLineParts.push('function-boundary-highlight');
      const codeLineClass = codeLineParts.join(' ');
      codeLineHTML = `${leadingWhitespace}<span class="${codeLineClass}">${content}</span>${trailingWhitespace}`;
    } else {
      // No highlighting needed, just wrap in code-line for consistent styling
      codeLineHTML = `<span class="code-line">${leadingWhitespace}${content}${trailingWhitespace}</span>`;
    }
    
    return `<tr${classAttr}>
<td class="line-count quiet"><a name='L${lineNum}'></a><a href='#L${lineNum}'>${lineNum}</a></td>
<td class="line-coverage quiet">${complexityAnnotation}</td>
<td class="text"${decisionPointTitle}><pre class="prettyprint lang-js">${codeLineHTML}</pre></td>
</tr>`;
  }).join('\n');
  
  // Calculate relative path to about.html
  const aboutPath = fileDir ? '../'.repeat(fileDir.split('/').length) + 'about.html' : 'about.html';
  
  return `<!doctype html>
<html lang="en">
<head>
    <title>Complexity report for ${filePath}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body, html {
        margin:0; padding: 0;
        height: 100%;
      }
      body {
        font-family: Helvetica Neue, Helvetica, Arial;
        font-size: 14px;
        color:#333;
      }
      .small { font-size: 12px; }
      *, *:after, *:before {
        -webkit-box-sizing:border-box;
        -moz-box-sizing:border-box;
        box-sizing:border-box;
      }
      h1 { font-size: 20px; margin: 0;}
      h2 { font-size: 14px; }
      pre {
        font: 12px/1.4 Consolas, "Liberation Mono", Menlo, Courier, monospace;
        margin: 0;
        padding: 0;
        -moz-tab-size: 2;
        -o-tab-size:  2;
        tab-size: 2;
      }
      a { color:#0074D9; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .strong { font-weight: bold; }
      .space-top1 { padding: 10px 0 0 0; }
      .pad2y { padding: 20px 0; }
      .pad1y { padding: 10px 0; }
      .pad2x { padding: 0 20px; }
      .pad2 { padding: 20px; }
      .pad1 { padding: 10px; }
      .space-left2 { padding-left:55px; }
      .space-right2 { padding-right:20px; }
      .center { text-align:center; }
      .clearfix { display:block; }
      .clearfix:after {
        content:'';
        display:block;
        height:0;
        clear:both;
        visibility:hidden;
      }
      .fl { float: left; }
      .quiet {
        color: #7f7f7f;
        color: rgba(0,0,0,0.5);
      }
      .quiet a { opacity: 0.7; }
      .fraction {
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 10px;
        color: #555;
        background: #E8E8E8;
        padding: 4px 5px;
        border-radius: 3px;
        vertical-align: middle;
      }
      .coverage-block {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      table.coverage {
        border-collapse: collapse;
        margin: 10px 0 0 0;
        padding: 0;
        width: 100%;
      }
      table.coverage td {
        margin: 0;
        padding: 0;
        vertical-align: top;
      }
      table.coverage td.line-count {
        text-align: right;
        padding: 0 5px 0 5px;
      }
      table.coverage td.line-coverage {
        text-align: right;
        padding-right: 10px;
        min-width:20px;
      }
      table.coverage td span.cline-any {
        display: inline-block;
        padding: 0 5px;
        width: 100%;
      }
      span.cline-neutral { background: #eaeaea; }
      span.cline-yes { background: rgb(230,245,208); }
      .status-line { height: 10px; }
      .status-line.high { background: rgb(77,146,33); }
      .status-line.medium { background: #f9cd0b; }
      .status-line.low { background: #C21F39; }
      pre.prettyprint {
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .wrapper {
        min-height: 100%;
        height: auto !important;
        height: 100%;
        margin: 0 auto -48px;
      }
      .footer, .push {
        height: 48px;
      }
      .code-line {
        display: inline-block;
        white-space: pre;
        width: max-content;
        font: inherit;
      }
      .decision-point-line {
        background: #F6C6CE;
      }
      .function-boundary-highlight {
        background: yellow !important;
      }
      tr.function-boundary-start td {
        border-top: 1px solid #0074D9;
      }
      tr.function-boundary-end td {
        border-top: 1px solid #0074D9;
      }
      tr.function-boundary-single td {
        border-top: 1px solid #0074D9;
      }
      .complexity-breakdown {
        margin: 20px 0;
        padding: 0;
        max-width: 800px;
      }
      .complexity-breakdown h2 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      .complexity-breakdown table {
        width: 100%;
        border-collapse: collapse;
        background: #f9f9f9;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        overflow: hidden;
      }
      .complexity-breakdown thead {
        background: #f0f0f0;
      }
      .complexity-breakdown th {
        padding: 10px 15px;
        text-align: left;
        font-size: 12px;
        font-weight: bold;
        color: #666;
        border-bottom: 2px solid #e0e0e0;
      }
      .complexity-breakdown th:first-child {
        width: 30%;
      }
      .complexity-breakdown th:nth-child(2) {
        width: 15%;
        text-align: center;
      }
      .complexity-breakdown th:nth-child(3) {
        width: 55%;
      }
      .complexity-breakdown td {
        padding: 10px 15px;
        border-bottom: 1px solid #e8e8e8;
        font-size: 13px;
      }
      .complexity-breakdown tr:last-child td {
        border-bottom: none;
      }
      .breakdown-function {
        font-weight: bold;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      }
      .breakdown-complexity {
        text-align: center;
      }
      .breakdown-details {
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 13px;
      }
      .breakdown-divider {
        color: #999;
        margin: 0 4px;
        font-weight: normal;
      }
      .complexity-number {
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 10px;
        color: #555;
        background: #E8E8E8;
        padding: 4px 5px;
        border-radius: 3px;
        vertical-align: middle;
        margin: 0 2px;
        display: inline-block;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .about-link {
        color: #0074D9;
        text-decoration: none;
        font-size: 14px;
        cursor: pointer;
        padding: 5px 10px;
        border: 1px solid #0074D9;
        border-radius: 3px;
        background: white;
      }
      .about-link:hover {
        background: #f0f0f0;
        text-decoration: none;
      }
    </style>
</head>
<body>
<div class='wrapper'>
    <div class='pad1'>
        <div class="header-row">
            <h1><a href="${backLink}">All files</a>${fileDir ? ` / <a href="${folderIndexPath}">${fileDir}</a>` : ''} ${fileName}</h1>
            <a href="${aboutPath}" class="about-link">About Cyclomatic Complexity</a>
        </div>
        <div class='clearfix'>
            <div class='fl pad1y space-right2'>
                <span class="strong">${totalFunctions} </span>
                <span class="quiet">Functions</span>
                <span class='fraction'>${totalFunctions}/${totalFunctions}</span>
            </div>
            <div class='fl pad1y space-right2'>
                <span class="strong">${withinThreshold} </span>
                <span class="quiet">Within Threshold</span>
                <span class='fraction'>${withinThreshold}/${totalFunctions}</span>
            </div>
            ${maxComplexity > 0 ? `
            <div class='fl pad1y space-right2'>
                <span class="strong">${maxComplexity} </span>
                <span class="quiet">Max Complexity</span>
            </div>
            <div class='fl pad1y space-right2'>
                <span class="strong">${avgComplexity} </span>
                <span class="quiet">Avg Complexity</span>
            </div>
            ` : ''}
        </div>
        ${breakdownSection}
    </div>
    <div class='status-line ${level}'></div>
    <div class="pad1 coverage-block">
<pre><table class="coverage">
${lineRows}
</table></pre>
    </div>
    <div class='push'></div>
</div>
<div class='footer quiet pad2 space-top1 center small'>
    Complexity report generated at ${new Date().toISOString()}
</div>
</body>
</html>`;
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
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0;
    }
    .header-row h1 {
      margin: 0;
    }
    .about-link {
      color: #0074D9;
      text-decoration: none;
      font-size: 14px;
      font-weight: normal;
      cursor: pointer;
      padding: 5px 10px;
      border: 1px solid #0074D9;
      border-radius: 3px;
      background: white;
      white-space: nowrap;
    }
    .about-link:hover {
      background: #f0f0f0;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="pad2">
    <div class="header-row">
      <h1>${folderPath ? `<a href="${backLink}" style="color: #0074D9; text-decoration: none; font-weight: bold;">All files</a> <span style="font-weight: bold;">${folderPath}</span>` : 'All files'}</h1>
      <a href="${folderPath ? '../'.repeat(folderPath.split('/').length) + 'about.html' : 'about.html'}" class="about-link">About Cyclomatic Complexity</a>
    </div>
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
        ${(() => {
          // Group functions by base name and file, keeping the highest complexity version
          const functionGroups = new Map();
          folder.functions.forEach(issue => {
            const baseName = getBaseFunctionName(issue.functionName || 'unknown');
            const key = `${issue.file}:${baseName}`;
            const complexityNum = parseInt(issue.complexity);
            
            const existing = functionGroups.get(key);
            if (!existing || complexityNum > parseInt(existing.complexity)) {
              functionGroups.set(key, issue);
            }
          });
          
          // Convert back to array and sort by complexity (highest first)
          return Array.from(functionGroups.values())
            .sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity))
            .map(issue => {
              const level = getComplexityLevel(issue.complexity);
              const complexityNum = parseInt(issue.complexity);
              const isOverThreshold = complexityNum > 10;
              const maxComplexityForBar = Math.max(30, complexityNum);
              const percentage = Math.min(100, (complexityNum / maxComplexityForBar) * 100);
              // Extract filename from full path for link (relative to current folder)
              const fileName = issue.file.split('/').pop();
              // File link is relative to the folder index.html, so just use filename
              const fileLinkPath = `${fileName}.html`;
              const baseFunctionName = getBaseFunctionName(issue.functionName || 'unknown');
              return `
                <tr data-over-threshold="${isOverThreshold}" data-file="${issue.file}" data-function="${baseFunctionName}" data-complexity="${complexityNum}" data-line="${issue.line}" ${!showAllInitially && !isOverThreshold ? 'style="display: none;"' : ''}>
                  <td class="file"><a href="${fileLinkPath}">${issue.file}</a></td>
                  <td class="bar ${level}">
                    <div class="chart"><div class="cover-fill ${level} ${percentage === 100 ? 'cover-full' : ''}" style="width: ${percentage}%"></div><div class="cover-empty" style="width: ${100 - percentage}%"></div></div>
                  </td>
                  <td class="file">
                    <span style="font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px;">${baseFunctionName}</span>
                  </td>
                  <td class="pct">
                    <span class="complexity-value ${level}">${complexityNum}</span>
                  </td>
                  <td class="abs">${issue.line}</td>
                </tr>
              `;
            }).join('');
        })()}
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

// Write about page (complexity/about.html) and examples page (complexity/about-examples.html)
const aboutPath = resolve(complexityDir, 'about.html');
writeFileSync(aboutPath, generateAboutPageHTML(), 'utf-8');
const aboutExamplesPath = resolve(complexityDir, 'about-examples.html');
writeFileSync(aboutExamplesPath, generateAboutExamplesPageHTML(), 'utf-8');

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

// Generate file-level HTML pages
let filesGenerated = 0;
fileMap.forEach((functions, filePath) => {
  try {
    const fileDir = getDirectory(filePath);
    const fileName = filePath.split('/').pop();
    
    // Create directory structure for file
    if (fileDir) {
      const fileDirPath = resolve(complexityDir, ...fileDir.split('/'));
      mkdirSync(fileDirPath, { recursive: true });
    }
    
    // Generate file HTML
    const fileHTML = generateFileHTML(filePath, functions);
    const fileHTMLPath = fileDir 
      ? resolve(complexityDir, ...fileDir.split('/'), `${fileName}.html`)
      : resolve(complexityDir, `${fileName}.html`);
    
    writeFileSync(fileHTMLPath, fileHTML, 'utf-8');
    filesGenerated++;
  } catch (e) {
    console.error(`Error generating file HTML for ${filePath}:`, e.message);
  }
});

console.log(`\n✅ Complexity report generated: complexity/index.html`);
console.log(`   About: complexity/about.html | Examples: complexity/about-examples.html`);
console.log(`   Generated ${foldersGenerated} folder HTML file(s)`);
console.log(`   Generated ${filesGenerated} file HTML page(s)`);
console.log(`   Found ${allFunctionsCount} total function(s)`);
if (overThreshold.length > 0) {
  console.log(`   ${overThreshold.length} function(s) with complexity > 10`);
}
if (allFunctionsCount > 0) {
  console.log(`   Highest complexity: ${maxComplexity} / Average: ${avgComplexity}`);
}
