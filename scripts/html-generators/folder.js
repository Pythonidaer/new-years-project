/**
 * Groups functions by base name and file, keeping the highest complexity version
 * @param {Array} functions - Array of function objects
 * @param {Function} getBaseFunctionName - Function to get base function name
 * @returns {Array} Array of function objects with highest complexity per group
 */
function groupFunctionsByBaseName(functions, getBaseFunctionName) {
  const functionGroups = new Map();
  functions.forEach(issue => {
    const baseName = getBaseFunctionName(issue.functionName || 'unknown');
    const key = `${issue.file}:${baseName}`;
    const complexityNum = parseInt(issue.complexity);
    
    const existing = functionGroups.get(key);
    if (!existing || complexityNum > parseInt(existing.complexity)) {
      functionGroups.set(key, issue);
    }
  });
  
  return Array.from(functionGroups.values())
    .sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity));
}

/**
 * Generates HTML row for a function
 * @param {Object} issue - Function object
 * @param {Function} getComplexityLevel - Function to get complexity level
 * @param {Function} getBaseFunctionName - Function to get base function name
 * @param {boolean} showAllInitially - Whether to show all functions initially
 * @returns {string} HTML row string
 */
function generateFunctionRow(issue, getComplexityLevel, getBaseFunctionName, showAllInitially) {
  const level = getComplexityLevel(issue.complexity);
  const complexityNum = parseInt(issue.complexity);
  const isOverThreshold = complexityNum > 10;
  const maxComplexityForBar = Math.max(30, complexityNum);
  const percentage = Math.min(100, (complexityNum / maxComplexityForBar) * 100);
  const fileName = issue.file.split('/').pop();
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
}

/**
 * Generates the JavaScript code for folder page functionality
 * @returns {string} JavaScript code as string
 */
function generateFolderPageScript() {
  return `(function() {
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
      
      function getSortValue(row, column) {
        if (column === 'file') {
          return row.getAttribute('data-file') || '';
        }
        if (column === 'function') {
          return (row.getAttribute('data-function') || '').toLowerCase();
        }
        if (column === 'functions') {
          const parts = (row.getAttribute('data-functions') || '0/0').split('/');
          return parseInt(parts[1] || 1);
        }
        if (column === 'complexity') {
          return parseFloat(row.getAttribute('data-complexity') || 0);
        }
        if (column === 'line') {
          return parseFloat(row.getAttribute('data-line') || 0);
        }
        return 0;
      }
      
      function compareSortValues(aVal, bVal, direction, column) {
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
          
          // Set sort column and direction
          if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            currentSort.column = column;
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
          
          // Sort rows
          rows.sort((a, b) => {
            const aVal = getSortValue(a, column);
            const bVal = getSortValue(b, column);
            return compareSortValues(aVal, bVal, currentSort.direction, column);
          });
          
          // Re-append sorted rows
          tbody.innerHTML = '';
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    })();`;
}

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
    }
    .about-link:hover {
      text-decoration: underline;
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
        ${groupFunctionsByBaseName(folder.functions, getBaseFunctionName)
          .map(issue => generateFunctionRow(issue, getComplexityLevel, getBaseFunctionName, showAllInitially))
          .join('')}
      </tbody>
    </table>
  </div>
  <script>
    ${generateFolderPageScript()}
  </script>
</body>
</html>`;
}
