import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Run ESLint and get JSON output
console.log('Running ESLint to collect complexity warnings...');
try {
  execSync('npx eslint . --format=json --output-file=complexity-report.json', {
    cwd: projectRoot,
    stdio: 'inherit',
  });
} catch (error) {
  // ESLint exits with non-zero if there are warnings/errors, which is expected
  console.log('ESLint completed (warnings/errors are expected)');
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

// Filter for complexity warnings and build report data
const complexityIssues = [];
eslintResults.forEach((file) => {
  if (file.messages) {
    file.messages.forEach((message) => {
      if (message.ruleId === 'complexity' && message.severity === 1) {
        complexityIssues.push({
          file: file.filePath.replace(projectRoot + '/', ''),
          line: message.line,
          column: message.column,
          message: message.message,
          complexity: message.message.match(/complexity of (\d+)/i)?.[1] || 'unknown',
        });
      }
    });
  }
});

// Sort by complexity (highest first)
complexityIssues.sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity));

// Calculate complexity level for color coding
const getComplexityLevel = (complexity) => {
  const num = parseInt(complexity);
  if (num >= 20) return 'low'; // Dark red
  if (num >= 15) return 'medium'; // Yellow
  return 'high'; // Green (but still over limit)
};

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
    .low,
    .cline-no {
      background: #FCE1E5;
    }
    /* Light green */
    .high,
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
    /* Light yellow */
    .medium {
      background: #fff4c2;
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
  </style>
</head>
<body>
  <div class="pad2">
    <h1>Complexity Report</h1>
    <div class="pad1y quiet">
      Functions with complexity > 10
    </div>
    <div class="pad2y">
      <div class="strong">
        ${complexityIssues.length} Complex Function${complexityIssues.length !== 1 ? 's' : ''}
        ${complexityIssues.length > 0 ? ` / Max: ${Math.max(...complexityIssues.map(i => parseInt(i.complexity)))} / Avg: ${Math.round(complexityIssues.reduce((sum, i) => sum + parseInt(i.complexity), 0) / complexityIssues.length)}` : ''}
      </div>
    </div>
    ${complexityIssues.length === 0
      ? '<div class="pad2y"><div class="strong" style="color: rgb(77,146,33);">✓ No complexity issues found! All functions are within the complexity limit.</div></div>'
      : `<table class="coverage-summary">
          <thead>
            <tr class="keyline-all">
              <th class="file">File</th>
              <th class="pct">Complexity</th>
              <th class="pic">Level</th>
              <th class="abs">Line</th>
            </tr>
          </thead>
          <tbody>
            ${complexityIssues.map(issue => {
              const level = getComplexityLevel(issue.complexity);
              const complexityNum = parseInt(issue.complexity);
              // Calculate percentage for progress bar (complexity 10 = 0%, complexity 30+ = 100%)
              const maxComplexity = Math.max(30, complexityNum);
              const percentage = Math.min(100, ((complexityNum - 10) / (maxComplexity - 10)) * 100);
              return `
                <tr class="${level}">
                  <td class="file"><a href="#">${issue.file}</a></td>
                  <td class="pct">
                    <span class="complexity-value ${level}">${complexityNum}</span>
                  </td>
                  <td class="pic">
                    <div class="chart">
                      <span class="cover-fill ${level}" style="width: ${percentage}%"></span>
                      <span class="cover-empty" style="width: ${100 - percentage}%"></span>
                    </div>
                  </td>
                  <td class="abs">${issue.line}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>`
    }
  </div>
</body>
</html>`;

// Write HTML report
const htmlPath = resolve(projectRoot, 'complexity-report.html');
writeFileSync(htmlPath, html, 'utf-8');

console.log(`\n✅ Complexity report generated: complexity-report.html`);
console.log(`   Found ${complexityIssues.length} function(s) with complexity > 10`);
if (complexityIssues.length > 0) {
  console.log(`   Highest complexity: ${Math.max(...complexityIssues.map(i => parseInt(i.complexity)))}`);
}
