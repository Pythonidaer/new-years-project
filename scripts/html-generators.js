import { resolve, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
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
 * Generates the standalone "About Cyclomatic Complexity" page (complexity/about.html).
 * Barebones, Istanbul-style. Examples live on a separate page.
 * @returns {string} Full HTML document string
 */
export function generateAboutPageHTML() {
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
export function generateAboutExamplesPageHTML() {
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

/**
 * Generates the main index HTML page
 * @param {Array} folders - Array of folder objects with directory, totalFunctions, withinThreshold, percentage, functions
 * @param {number} allFunctionsCount - Total number of functions
 * @param {Array} overThreshold - Array of functions with complexity > 10
 * @param {number} maxComplexity - Maximum complexity value
 * @param {number} avgComplexity - Average complexity value
 * @param {boolean} showAllInitially - Whether to show all functions initially (default: false)
 * @returns {string} Full HTML document string
 */
export function generateMainIndexHTML(folders, allFunctionsCount, overThreshold, maxComplexity, avgComplexity, showAllInitially) {
  return `<!DOCTYPE html>
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
    ${folders.length === 0
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
}

/**
 * Generates folder HTML page
 * @param {Object} folder - Folder object with directory, totalFunctions, withinThreshold, percentage, functions
 * @param {Array} allFolders - All folders array (for navigation)
 * @param {boolean} showAllInitially - Whether to show all functions initially
 * @param {Function} getComplexityLevel - Function to get complexity level
 * @param {Function} getBaseFunctionName - Function to get base function name
 * @returns {string} Full HTML document string
 */
export function generateFolderHTML(folder, allFolders, showAllInitially, getComplexityLevel, getBaseFunctionName) {
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

/**
 * Generates file HTML page with line-by-line complexity annotations
 * @param {string} filePath - Relative file path
 * @param {Array} functions - Array of function objects
 * @param {string} projectRoot - Project root directory
 * @param {Function} findFunctionBoundaries - Function to find function boundaries
 * @param {Function} parseDecisionPoints - Function to parse decision points
 * @param {Function} calculateComplexityBreakdown - Function to calculate complexity breakdown
 * @param {Function} formatFunctionHierarchy - Function to format function hierarchy
 * @param {Function} getComplexityLevel - Function to get complexity level
 * @param {Function} getDirectory - Function to get directory from file path
 * @param {Function} escapeHtml - Function to escape HTML
 * @returns {string} Full HTML document string
 */
export function generateFileHTML(
  filePath,
  functions,
  projectRoot,
  findFunctionBoundaries,
  parseDecisionPoints,
  calculateComplexityBreakdown,
  formatFunctionHierarchy,
  getComplexityLevel,
  getDirectory,
  escapeHtml
) {
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
