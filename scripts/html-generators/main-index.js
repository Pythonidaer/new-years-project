/**
 * Generates HTML row for a folder
 * @param {Object} folder - Folder object
 * @returns {string} HTML row string
 */
function generateFolderRow(folder) {
  const percentage = folder.percentage;
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
}

/**
 * Generates JavaScript code for main index page
 * @returns {string} JavaScript code as string
 */
function generateMainIndexScript() {
  return `(function() {
      const headers = document.querySelectorAll('.coverage-summary th[data-sort]');
      let currentSort = { column: null, direction: 'asc' };
      
      function getSortValue(row, column) {
        if (column === 'file') {
          return row.getAttribute('data-file') || '';
        }
        if (column === 'functions') {
          const parts = (row.getAttribute('data-functions') || '0/0').split('/');
          return parseInt(parts[1] || 1);
        }
        if (column === 'percentage') {
          return parseFloat(row.getAttribute('data-percentage') || 0);
        }
        return 0;
      }
      
      function compareValues(aVal, bVal, direction, column) {
        if (column === 'functions') {
          if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
          }
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        
        if (typeof aVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return direction === 'asc' ? comparison : -comparison;
        }
        
        if (direction === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
      
      headers.forEach(header => {
        header.addEventListener('click', function() {
          const column = this.getAttribute('data-sort');
          const tbody = this.closest('table').querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          
          if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            currentSort.column = column;
            currentSort.direction = (column === 'functions' || column === 'percentage') ? 'desc' : 'asc';
          }
          
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
          
          rows.sort((a, b) => {
            const aVal = getSortValue(a, column);
            const bVal = getSortValue(b, column);
            return compareValues(aVal, bVal, currentSort.direction, column);
          });
          
          tbody.innerHTML = '';
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    })();`;
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
export function generateMainIndexHTML(folders, allFunctionsCount, overThreshold, maxComplexity, avgComplexity, _showAllInitially) {
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
    }
    .about-link:hover {
      text-decoration: underline;
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
              ${folders.map(folder => generateFolderRow(folder)).join('')}
            </tbody>
          </table>
        </div>`
    }
  </div>
  <script>
    ${generateMainIndexScript()}
  </script>
</body>
</html>`;
}
