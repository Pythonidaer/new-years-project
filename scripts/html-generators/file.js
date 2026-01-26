import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

/**
 * Detects which columns are completely empty across all functions
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBreakdowns - Map of functionLine -> breakdown
 * @param {Object} columnStructure - Column structure configuration
 * @returns {Set} Set of column keys that are empty
 */
function detectEmptyColumns(functions, functionBreakdowns, columnStructure) {
  const emptyColumns = new Set();
  
  // Get all column keys (excluding base, which is always 1)
  const allColumnKeys = columnStructure.groups.flatMap(group => 
    group.columns.map(col => col.key)
  );
  
  // Check each column to see if it's empty across all functions
  allColumnKeys.forEach(columnKey => {
    let hasAnyValue = false;
    
    functions.forEach(func => {
      const breakdown = functionBreakdowns.get(func.line);
      if (breakdown && breakdown.breakdown) {
        const value = breakdown.breakdown[columnKey] || 0;
        if (value > 0) {
          hasAnyValue = true;
        }
      }
    });
    
    // If no function has a value > 0 for this column, mark it as empty
    if (!hasAnyValue) {
      emptyColumns.add(columnKey);
    }
  });
  
  return emptyColumns;
}

/**
 * Defines the breakdown column structure with groupings
 * @returns {Object} Column configuration
 */
function getBreakdownColumnStructure() {
  return {
    groups: [
      {
        name: 'Control Flow',
        columns: [
          { key: 'if', label: 'if' },
          { key: 'else if', label: 'else if' },
          { key: 'for', label: 'for' },
          { key: 'for...of', label: 'for...of' },
          { key: 'for...in', label: 'for...in' },
          { key: 'while', label: 'while' },
          { key: 'do...while', label: 'do...while' },
          { key: 'switch', label: 'switch' },
          { key: 'case', label: 'case' },
          { key: 'catch', label: 'catch' },
        ]
      },
      {
        name: 'Expressions',
        columns: [
          { key: 'ternary', label: '?:' },
          { key: '&&', label: '&&' },
          { key: '||', label: '||' },
          { key: '??', label: '??' },
          { key: '?.', label: '?.' },
        ]
      },
      {
        name: 'Function Parameters',
        columns: [
          { key: 'default parameter', label: 'default parameter' },
        ]
      }
    ],
    // Base complexity column (always last)
    baseColumn: { key: 'base', label: 'base' }
  };
}

/**
 * Finds the boundary for a function, handling cases where multiple functions share the same boundary
 * @param {number} functionLine - The ESLint-reported line number for the function
 * @param {Map} functionBoundaries - Map of function lines to boundary objects
 * @returns {Object|null} The boundary object, or null if not found
 */
function findBoundaryForFunction(functionLine, functionBoundaries) {
  let boundary = functionBoundaries.get(functionLine);
  
  if (!boundary) {
    // Find boundary that contains this function's line OR starts right after it
    // (e.g., function at line 39, boundary starts at 40)
    for (const [, b] of functionBoundaries.entries()) {
      if ((functionLine >= b.start && functionLine <= b.end) || 
          (functionLine < b.start && b.start === functionLine + 1)) {
        boundary = b;
        break;
      }
    }
  }
  
  return boundary;
}

/**
 * Finds the breakdown line (where decision points are assigned) for a function
 * @param {number} functionLine - The ESLint-reported line number
 * @param {Object|null} boundary - The function boundary object
 * @param {Map} functionBoundaries - Map of function lines to boundary objects
 * @returns {number} The line number where decision points are assigned
 */
function findBreakdownLine(functionLine) {
  // Always use the function's own line, since decision points are assigned
  // to functions based on their functionLine in parseDecisionPoints.
  // The previous logic of matching boundaries was incorrect and could return
  // the wrong function line when multiple functions shared boundaries.
  return functionLine;
}

/**
 * Logs complexity mismatches for debugging
 * @param {Object} func - Function object with complexity info
 * @param {Object} breakdown - Complexity breakdown object
 * @param {Map} functionBoundaries - Map of function lines to boundary objects
 */
function logComplexityMismatch(func, breakdown, functionBoundaries) {
  const actualComplexity = parseInt(func.complexity);
  const calculatedTotal = breakdown.calculatedTotal;
  
  if (Math.abs(calculatedTotal - actualComplexity) > 1) {
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
}

/**
 * Calculates complexity breakdowns for all functions
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBoundaries - Map of function lines to boundary objects
 * @param {Array} decisionPoints - Array of decision point objects
 * @param {Function} calculateComplexityBreakdown - Function to calculate breakdown
 * @returns {Map} Map of function lines to breakdown objects
 */
function calculateFunctionBreakdowns(functions, functionBoundaries, decisionPoints, calculateComplexityBreakdown) {
  const functionBreakdowns = new Map();
  
  functions.forEach(func => {
    findBoundaryForFunction(func.line, functionBoundaries);
    const breakdownLine = findBreakdownLine(func.line);
    
    const breakdown = calculateComplexityBreakdown(
      breakdownLine,
      decisionPoints,
      1 // base complexity
    );
    
    logComplexityMismatch(func, breakdown, functionBoundaries);
    functionBreakdowns.set(func.line, breakdown);
  });
  
  return functionBreakdowns;
}

/**
 * Calculates file-level statistics
 * @param {Array} functions - Array of function objects
 * @returns {Object} Statistics object with totalFunctions, withinThreshold, maxComplexity, avgComplexity, percentage, level
 */
function calculateFileStatistics(functions) {
  const totalFunctions = functions.length;
  const withinThreshold = functions.filter(f => parseInt(f.complexity) <= 10).length;
  const maxComplexity = functions.length > 0 ? Math.max(...functions.map(f => parseInt(f.complexity))) : 0;
  const avgComplexity = functions.length > 0 ? Math.round(functions.reduce((sum, f) => sum + parseInt(f.complexity), 0) / functions.length) : 0;
  const percentage = totalFunctions > 0 ? Math.round((withinThreshold / totalFunctions) * 100) : 100;
  const level = percentage >= 80 ? 'high' : percentage >= 60 ? 'high' : percentage >= 40 ? 'medium' : 'low';
  
  return { totalFunctions, withinThreshold, maxComplexity, avgComplexity, percentage, level };
}

/**
 * Builds sets of function boundary lines for visual separators
 * @param {Map} functionBoundaries - Map of function lines to boundary objects
 * @param {number} sourceLinesLength - Total number of source lines
 * @returns {Object} Object with functionStartLines, functionEndLines, functionClosingLines Sets
 */
function buildBoundaryLineSets(functionBoundaries, sourceLinesLength) {
  const functionStartLines = new Set();
  const functionEndLines = new Set();
  const functionClosingLines = new Set();
  
  functionBoundaries.forEach((boundary) => {
    const { start, end } = boundary;
    functionStartLines.add(start);
    functionClosingLines.add(end);
    
    if (end < sourceLinesLength) {
      functionEndLines.add(end + 1);
    } else if (end === sourceLinesLength) {
      functionEndLines.add(end);
    }
  });
  
  return { functionStartLines, functionEndLines, functionClosingLines };
}

/**
 * Builds a map from each line number to the innermost function span containing it.
 * Used for hover vertical line: which [start, end] to span and indent when hovering a line.
 * @param {Map} functionBoundaries - Map of function lines to boundary objects
 * @param {number} sourceLinesLength - Total number of source lines
 * @param {string[]} sourceLines - Source lines (1-based index: sourceLines[0] = line 1)
 * @returns {Object} Plain object: line number -> { start, end, indent }
 */
function buildLineToSpan(functionBoundaries, sourceLinesLength, sourceLines) {
  const lineToSpan = {};
  const boundaries = [...functionBoundaries.values()].map((b) => ({ start: b.start, end: b.end }));
  for (let L = 1; L <= sourceLinesLength; L++) {
    const containing = boundaries.filter(({ start, end }) => start <= L && L <= end);
    if (containing.length === 0) continue;
    const innermost = containing.reduce((best, cur) =>
      (cur.end - cur.start) < (best.end - best.start) ? cur : best
    );
    const startLine = sourceLines[innermost.start - 1];
    const indent = typeof startLine === 'string' ? getIndentChars(startLine) : 0;
    lineToSpan[L] = { start: innermost.start, end: innermost.end, indent };
  }
  return lineToSpan;
}

/**
 * Generates complexity annotation HTML for a function
 * @param {Object|null} func - Function object or null
 * @param {Function} getComplexityLevel - Function to get complexity level
 * @param {Function} escapeHtml - Function to escape HTML
 * @returns {string} HTML string for complexity annotation
 */
function generateComplexityAnnotation(func, getComplexityLevel, escapeHtml) {
  if (!func) {
    return '<span class="cline-any cline-neutral">&nbsp;</span>';
  }
  
  const complexityNum = parseInt(func.complexity);
  getComplexityLevel(func.complexity); // Called but result not used (for consistency)
  return `<span class="cline-any cline-yes" title="Function '${escapeHtml(func.functionName)}' has complexity ${complexityNum}">${complexityNum}</span>`;
}

/**
 * Returns indent length in character units (tabs expanded to 2 spaces).
 * Used to align function-boundary borders with nested code.
 * @param {string} line - Source line
 * @returns {number} Indent in characters
 */
function getIndentChars(line) {
  const m = line && line.match(/^(\s*)/);
  if (!m) return 0;
  return m[1].replace(/\t/g, '  ').length;
}

/**
 * Determines CSS classes for a line based on decision points and boundaries
 * @param {Array} decisionPointsOnLine - Array of decision points on this line
 * @param {number} lineNum - Line number
 * @param {Set} functionStartLines - Set of function start line numbers
 * @param {Set} functionEndLines - Set of function end line numbers
 * @param {Set} functionClosingLines - Set of function closing line numbers
 * @returns {Object} Object with classAttr and decisionPointTitle
 */
function determineLineClasses(decisionPointsOnLine, lineNum, functionStartLines, functionEndLines, functionClosingLines) {
  const isDecisionPoint = decisionPointsOnLine.length > 0;
  const decisionPointTitle = isDecisionPoint 
    ? ` title="${decisionPointsOnLine.map(dp => dp.name).join(', ')}"`
    : '';
  const decisionPointClass = isDecisionPoint ? 'decision-point' : '';
  
  const isFunctionStart = functionStartLines.has(lineNum);
  const isFunctionEnd = functionEndLines.has(lineNum);
  const isFunctionClosing = functionClosingLines.has(lineNum);
  
  const boundaryParts = [];
  if (isFunctionStart && isFunctionEnd) {
    boundaryParts.push('function-boundary-single');
  } else {
    if (isFunctionStart) boundaryParts.push('function-boundary-start');
    if (isFunctionEnd) boundaryParts.push('function-boundary-end');
    if (isFunctionClosing) boundaryParts.push('function-boundary-closing');
  }
  
  const boundaryClass = boundaryParts.join(' ');
  const allClasses = [decisionPointClass, boundaryClass].filter(Boolean).join(' ');
  const classAttr = allClasses ? ` class="${allClasses}"` : '';
  const hasBoundaryBorder = isFunctionStart || isFunctionEnd;

  return { classAttr, decisionPointTitle, isDecisionPoint, isFunctionStart, isFunctionEnd, isFunctionClosing, hasBoundaryBorder };
}

/**
 * Builds HTML for a code line with selective highlighting
 * @param {string} line - The source line
 * @param {Function} escapeHtml - Function to escape HTML
 * @param {boolean} isDecisionPoint - Whether this line is a decision point
 * @param {boolean} isFunctionStart - Whether this line is a function start
 * @param {boolean} isFunctionClosing - Whether this line is a function closing
 * @returns {string} HTML string for the code line
 */
function buildCodeLineHTML(line, escapeHtml, isDecisionPoint, isFunctionStart, isFunctionClosing) {
  const lineMatch = line.match(/^(\s*)(.*?)(\s*)$/);
  const leadingWhitespace = lineMatch ? escapeHtml(lineMatch[1]) : '';
  const content = lineMatch ? escapeHtml(lineMatch[2]) : escapeHtml(line);
  const trailingWhitespace = lineMatch ? escapeHtml(lineMatch[3]) : '';
  
  if (isDecisionPoint || isFunctionStart || isFunctionClosing) {
    const codeLineParts = ['code-line'];
    if (isDecisionPoint) {
      codeLineParts.push('decision-point-line');
    } else if (isFunctionStart || isFunctionClosing) {
      codeLineParts.push('function-boundary-highlight');
    }
    const codeLineClass = codeLineParts.join(' ');
    return `${leadingWhitespace}<span class="${codeLineClass}">${content}</span>${trailingWhitespace}`;
  }
  
  return `<span class="code-line">${leadingWhitespace}${content}${trailingWhitespace}</span>`;
}

/**
 * Generates HTML for a single line row
 * @param {string} line - The source line
 * @param {number} index - Zero-based index of the line
 * @param {Map} lineToFunction - Map of line numbers to function objects
 * @param {Map} lineToDecisionPoint - Map of line numbers to decision point arrays
 * @param {Set} functionStartLines - Set of function start line numbers
 * @param {Set} functionEndLines - Set of function end line numbers
 * @param {Set} functionClosingLines - Set of function closing line numbers
 * @param {Function} getComplexityLevel - Function to get complexity level
 * @param {Function} escapeHtml - Function to escape HTML
 * @returns {string} HTML string for the line row
 */
function generateLineRowHTML(
  line,
  index,
  lineToFunction,
  lineToDecisionPoint,
  functionStartLines,
  functionEndLines,
  functionClosingLines,
  getComplexityLevel,
  escapeHtml
) {
  const lineNum = index + 1;
  const func = lineToFunction.get(lineNum);
  const decisionPointsOnLine = lineToDecisionPoint.get(lineNum) || [];
  
  const complexityAnnotation = generateComplexityAnnotation(func, getComplexityLevel, escapeHtml);
  const { classAttr, decisionPointTitle, isDecisionPoint, isFunctionStart, isFunctionClosing, hasBoundaryBorder } =
    determineLineClasses(decisionPointsOnLine, lineNum, functionStartLines, functionEndLines, functionClosingLines);
  const codeLineHTML = buildCodeLineHTML(line, escapeHtml, isDecisionPoint, isFunctionStart, isFunctionClosing);

  const indent = hasBoundaryBorder ? getIndentChars(line) : 0;
  const styleAttr = hasBoundaryBorder ? ` style="--indent-ch: ${indent}"` : '';
  const topLevelAttr = hasBoundaryBorder && indent === 0 ? ' data-boundary-top-level="true"' : '';

  return `<tr${classAttr}${styleAttr}${topLevelAttr} data-line="${lineNum}">
<td class="line-count quiet"><a name='L${lineNum}'></a><a href='#L${lineNum}'>${lineNum}</a></td>
<td class="line-coverage quiet">${complexityAnnotation}</td>
<td class="text"${decisionPointTitle}><pre class="prettyprint lang-js">${codeLineHTML}</pre></td>
</tr>`;
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
export async function generateFileHTML(
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
  
  // Parse decision points using AST parser (always async)
  const functionBoundaries = findFunctionBoundaries(sourceCode, functions);
  const decisionPoints = await parseDecisionPoints(sourceCode, functionBoundaries, functions, filePath, projectRoot);
  
  // Calculate complexity breakdowns for each function
  const functionBreakdowns = calculateFunctionBreakdowns(
    functions,
    functionBoundaries,
    decisionPoints,
    calculateComplexityBreakdown
  );
  
  // Create decision point line map for highlighting
  const lineToDecisionPoint = new Map();
  decisionPoints.forEach(dp => {
    if (!lineToDecisionPoint.has(dp.line)) {
      lineToDecisionPoint.set(dp.line, []);
    }
    lineToDecisionPoint.get(dp.line).push(dp);
  });
  
  // Calculate file-level statistics
  const { totalFunctions, withinThreshold, maxComplexity, avgComplexity, level } = 
    calculateFileStatistics(functions);
  
  // Get directory path for breadcrumb navigation
  const fileDir = getDirectory(filePath);
  const fileName = filePath.split('/').pop();
  const folderIndexPath = 'index.html';
  const backLink = fileDir ? '../'.repeat(fileDir.split('/').length) + 'index.html' : 'index.html';
  
  // Generate hierarchical complexity breakdown display
  const columnStructure = getBreakdownColumnStructure();
  
  // Detect which columns are completely empty across all functions
  const emptyColumns = detectEmptyColumns(functions, functionBreakdowns, columnStructure);
  
  // Build visible column structure (single source of truth)
  const buildVisibleColumns = (showAll) => {
    const visibleGroups = columnStructure.groups.map(group => {
      const visibleColumns = showAll 
        ? group.columns 
        : group.columns.filter(col => !emptyColumns.has(col.key));
      
      return {
        name: group.name,
        columns: visibleColumns,
        totalColumns: group.columns.length,
        visibleColumns: visibleColumns.length
      };
    });
    
    // Calculate total visible breakdown columns
    const totalBreakdownCols = visibleGroups.reduce((sum, group) => sum + group.columns.length, 0) + 1; // +1 for base
    
    return { visibleGroups, totalBreakdownCols };
  };
  
  // Initial state: collapsed (show only non-empty columns)
  const initialColumns = buildVisibleColumns(false);
  
  const breakdownItems = formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, sourceCode, columnStructure, emptyColumns, false);
  
  const breakdownSection = functions.length > 0 ? `
    <div class="complexity-breakdown">
      <div class="breakdown-controls">
        <div class="breakdown-controls-row">
          <div class="breakdown-search-container">
            <label for="breakdown-search" class="breakdown-search-label">Filter Functions:</label>
            <input type="text" id="breakdown-search" class="breakdown-search-input" placeholder="Search function names..." oninput="filterFunctions(this.value)">
          </div>
          <button type="button" class="breakdown-toggle-btn" onclick="toggleEmptyColumns()" id="breakdown-toggle">
            Show All Columns
          </button>
          <span class="breakdown-toggle-info" id="breakdown-toggle-info" style="visibility: ${emptyColumns.size > 0 ? 'visible' : 'hidden'};">(${emptyColumns.size} empty column${emptyColumns.size !== 1 ? 's' : ''} hidden)</span>
          <button type="button" class="breakdown-toggle-btn breakdown-hide-table-btn" onclick="toggleTableVisibility()" id="breakdown-hide-table-toggle">
            Hide Table
          </button>
        </div>
      </div>
      <table class="complexity-breakdown-table" id="complexity-breakdown-table" style="display: table;">
        <thead id="complexity-breakdown-thead">
          <!-- Full-spanning header row -->
          <tr>
            <th colspan="${2 + initialColumns.totalBreakdownCols}" class="breakdown-header" id="breakdown-header-span">Function Complexity Breakdown</th>
          </tr>
          <!-- Column header row with group headers -->
          <tr id="breakdown-group-headers-row">
            <th rowspan="2" class="breakdown-function-header sortable" onclick="sortTable('function')" id="sort-function-header">
              Function <span class="sort-indicator" id="sort-function-indicator"></span>
            </th>
            <th rowspan="2" class="breakdown-complexity-header sortable" onclick="sortTable('complexity')" id="sort-complexity-header">
              Complexity <span class="sort-indicator" id="sort-complexity-indicator"></span>
            </th>
            ${initialColumns.visibleGroups.map(group => {
              if (group.columns.length === 0) return '';
              return `<th colspan="${group.columns.length}" class="breakdown-group-header" data-group="${group.name}" data-total-cols="${group.totalColumns}">${group.name}</th>`;
            }).filter(Boolean).join('')}
            <th class="breakdown-group-header" colspan="1">${columnStructure.baseColumn.label}</th>
          </tr>
          <!-- Individual column headers -->
          <tr id="breakdown-col-headers-row">
            ${initialColumns.visibleGroups.map(group => 
              group.columns.map(col => {
                return `<th class="breakdown-col-header" data-column-key="${col.key}">${col.label}</th>`;
              }).join('')
            ).join('')}
            <th class="breakdown-col-header">${columnStructure.baseColumn.label}</th>
          </tr>
        </thead>
        <tbody id="complexity-breakdown-tbody">
          ${breakdownItems}
          <tr id="no-matches-row" style="display: none;">
            <td colspan="${2 + initialColumns.totalBreakdownCols}" class="no-matches-message">
              No functions match the current filter.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : '';
  
  // Build boundary line sets for visual separators
  const { functionStartLines, functionEndLines, functionClosingLines } =
    buildBoundaryLineSets(functionBoundaries, sourceLines.length);

  // Line -> innermost function span for hover vertical line (includes indent for nested)
  const lineToSpan = buildLineToSpan(functionBoundaries, sourceLines.length, sourceLines);
  
  // Generate line-by-line HTML
  const lineRows = sourceLines.map((line, index) => 
    generateLineRowHTML(
      line,
      index,
      lineToFunction,
      lineToDecisionPoint,
      functionStartLines,
      functionEndLines,
      functionClosingLines,
      getComplexityLevel,
      escapeHtml
    )
  ).join('\n');
  
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
      /* Top-level (indent 0): full-width border across all columns. */
      tr.function-boundary-start[data-boundary-top-level="true"] td,
      tr.function-boundary-end[data-boundary-top-level="true"] td,
      tr.function-boundary-single[data-boundary-top-level="true"] td {
        border-top: 1px solid #0074D9;
      }
      tr[data-boundary-top-level="true"] td.text::before {
        display: none;
      }
      /* Nested: indented border in code column only, extend to right. Hierarchy via indent. */
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.text,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.text,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.text {
        position: relative;
        border-top: none;
      }
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.text::before,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.text::before,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.text::before {
        content: '';
        position: absolute;
        top: 0;
        left: calc(var(--indent-ch, 0) * 1ch);
        right: 0;
        height: 1px;
        background: #0074D9;
      }
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.line-count,
      tr.function-boundary-start:not([data-boundary-top-level="true"]) td.line-coverage,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.line-count,
      tr.function-boundary-end:not([data-boundary-top-level="true"]) td.line-coverage,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.line-count,
      tr.function-boundary-single:not([data-boundary-top-level="true"]) td.line-coverage {
        border-top: none;
      }
      .complexity-breakdown {
        margin: 20px 0;
        padding: 0;
        max-width: 100%;
        overflow-x: auto;
        display: block;
        width: auto;
      }
      .complexity-breakdown h2 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      .complexity-breakdown-table {
        width: auto;
        max-width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 13px;
      }
      .complexity-breakdown-table th {
        padding: 8px 4px;
        text-align: center;
        border: 1px solid #ddd;
        background-color: #f5f5f5;
        font-weight: bold;
        vertical-align: middle;
      }
      .complexity-breakdown-table td {
        padding: 10px;
        text-align: center;
        border: 1px solid #ddd;
        vertical-align: middle;
      }
      .complexity-breakdown-table td.function-name {
        text-align: left;
      }
      .breakdown-header {
        text-align: center;
        font-size: 16px;
        background-color: #e8e8e8;
        font-weight: bold;
        padding: 10px;
      }
      .breakdown-group-header {
        background-color: #f0f0f0;
        font-weight: 600;
        font-size: 13px;
      }
      .breakdown-col-header {
        font-weight: normal;
        font-size: 11px;
        background-color: #fafafa;
        white-space: nowrap;
      }
      .breakdown-value {
        text-align: center;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 12px;
        color: #333;
      }
      .breakdown-value-empty {
        background: #fff4c2;
      }
      .breakdown-col-empty {
        display: none;
      }
      .breakdown-group-empty {
        display: none;
      }
      .breakdown-controls {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        width: auto;
        max-width: 950px;
        box-sizing: border-box;
      }
      .breakdown-controls-row {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        align-items: center;
        gap: 20px;
      }
      .breakdown-search-container {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
      }
      .breakdown-search-label {
        font-size: 13px;
        font-weight: 500;
        color: #333;
        white-space: nowrap;
      }
      .breakdown-search-input {
        flex: 1;
        padding: 8px 12px;
        font-size: 13px;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-family: Helvetica Neue, Helvetica, Arial;
        min-width: 200px;
        max-width: 400px;
      }
      .breakdown-search-input:focus {
        outline: none;
        border-color: #0074D9;
        box-shadow: 0 0 0 2px rgba(0, 116, 217, 0.1);
      }
      .breakdown-toggle-btn {
        padding: 6px 12px;
        font-size: 12px;
        background-color: #0074D9;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-family: Helvetica Neue, Helvetica, Arial;
        white-space: nowrap;
        min-width: 140px;
        text-align: center;
      }
      .breakdown-toggle-btn:hover {
        background-color: #0056b3;
      }
      .breakdown-toggle-info {
        font-size: 12px;
        color: #666;
        font-style: italic;
        min-width: 180px;
        text-align: left;
      }
      .no-matches-message {
        text-align: center;
        padding: 30px 20px;
        color: #666;
        font-style: italic;
        background-color: #f9f9f9;
      }
      .breakdown-toggle-info {
        font-size: 12px;
        color: #666;
        font-style: italic;
      }
      .function-name {
        text-align: left;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 12px;
        padding-left: 10px;
        padding-right: 10px;
        white-space: nowrap;
      }
      .breakdown-function-header {
        text-align: left;
        vertical-align: middle;
        font-weight: bold;
      }
      .breakdown-complexity-header {
        text-align: center;
        vertical-align: middle;
        font-weight: bold;
      }
      .sortable {
        cursor: pointer;
        user-select: none;
        position: relative;
      }
      .sortable:hover {
        background-color: #e8e8e8;
      }
      .sort-indicator {
        display: inline-block;
        margin-left: 5px;
        font-size: 10px;
        color: #666;
      }
      .sort-indicator.sort-asc::after {
        content: '▲';
      }
      .sort-indicator.sort-desc::after {
        content: '▼';
      }
      .complexity-value {
        text-align: center;
        font-weight: bold;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 13px;
      }
      .complexity-breakdown-table tbody tr {
        background-color: rgb(230, 245, 208);
      }
      .complexity-breakdown-table tbody tr:hover {
        background-color: rgb(220, 235, 198);
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
      }
      .about-link:hover {
        text-decoration: underline;
      }
      .coverage-table-wrapper {
        position: relative;
      }
      #hover-vertical-line {
        position: absolute;
        left: 0;
        width: 0;
        border-left: 1px solid #0074D9;
        pointer-events: none;
        visibility: hidden;
        z-index: 1;
      }
      #hover-vertical-line.visible {
        visibility: visible;
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
    <div class="coverage-table-wrapper">
    <div id="hover-vertical-line" aria-hidden="true"></div>
<pre><table class="coverage" id="coverage-table">
${lineRows}
</table></pre>
    </div>
    </div>
    <div class='push'></div>
</div>
<div class='footer quiet pad2 space-top1 center small'>
    Complexity report generated at ${new Date().toISOString()}
</div>
<script>
  let showAllColumns = false;
  let sortColumn = null;
  let sortDirection = 'asc'; // 'asc' or 'desc'
  const columnConfig = ${JSON.stringify({
    groups: columnStructure.groups.map(group => ({
      name: group.name,
      columns: group.columns,
      totalColumns: group.columns.length
    })),
    emptyColumns: Array.from(emptyColumns),
    baseColumn: columnStructure.baseColumn
  })};
  const COVERAGE_LINE_TO_SPAN = ${JSON.stringify(lineToSpan)};

  (function initHoverVerticalLine() {
    return; /* feature disabled for now */
    const table = document.getElementById('coverage-table');
    const wrapper = table && table.closest('.coverage-table-wrapper');
    const lineEl = document.getElementById('hover-vertical-line');
    if (!table || !wrapper || !lineEl) return;
    const pre = table.querySelector('pre.prettyprint');
    let chWidth = 0;
    if (pre) {
      const s = document.createElement('span');
      s.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:' + getComputedStyle(pre).font + ';';
      s.textContent = '0';
      document.body.appendChild(s);
      chWidth = s.offsetWidth;
      document.body.removeChild(s);
    }
    function onEnter(ev) {
      const td = ev.target.closest('td');
      if (!td || (!td.classList.contains('line-count') && !td.classList.contains('line-coverage'))) return;
      const tr = td.closest('tr');
      const line = tr && tr.getAttribute('data-line');
      if (!line) return;
      const span = COVERAGE_LINE_TO_SPAN[line];
      if (!span) return;
      const first = table.querySelector(\`tr[data-line="\${span.start}"]\`);
      const last = table.querySelector(\`tr[data-line="\${span.end}"]\`);
      if (!first || !last) return;
      const codeCell = first.querySelector('td.text');
      if (!codeCell) return;
      const wr = wrapper.getBoundingClientRect();
      const fr = first.getBoundingClientRect();
      const lr = last.getBoundingClientRect();
      const cr = codeCell.getBoundingClientRect();
      const top = fr.top - wr.top;
      const height = lr.bottom - fr.top;
      const indent = (span.indent != null ? span.indent : 0) * chWidth;
      const left = (cr.left - wr.left) + indent;
      lineEl.style.top = top + 'px';
      lineEl.style.height = height + 'px';
      lineEl.style.left = left + 'px';
      lineEl.classList.add('visible');
    }
    function onLeave(ev) {
      const td = ev.target.closest('td');
      if (!td || (!td.classList.contains('line-count') && !td.classList.contains('line-coverage'))) return;
      const next = ev.relatedTarget;
      if (next && table.contains(next)) {
        const nextTd = next.closest && next.closest('td');
        if (nextTd && (nextTd.classList.contains('line-count') || nextTd.classList.contains('line-coverage'))) return;
      }
      lineEl.classList.remove('visible');
      lineEl.style.left = '';
      lineEl.style.top = '';
      lineEl.style.height = '';
    }
    table.addEventListener('mouseover', onEnter);
    table.addEventListener('mouseout', onLeave);
  })();

  function updateSortIndicators() {
    const functionIndicator = document.getElementById('sort-function-indicator');
    const complexityIndicator = document.getElementById('sort-complexity-indicator');
    
    // Reset all indicators
    functionIndicator.className = 'sort-indicator';
    complexityIndicator.className = 'sort-indicator';
    
    // Set active indicator
    if (sortColumn === 'function') {
      functionIndicator.className = \`sort-indicator sort-\${sortDirection}\`;
    } else if (sortColumn === 'complexity') {
      complexityIndicator.className = \`sort-indicator sort-\${sortDirection}\`;
    }
  }
  
  function sortTable(column) {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Toggle sort direction if clicking the same column
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    
    // Sort rows
    rows.sort((a, b) => {
      let aValue, bValue;
      
      if (column === 'function') {
        const aCell = a.querySelector('.function-name');
        const bCell = b.querySelector('.function-name');
        aValue = aCell ? aCell.textContent.trim().toLowerCase() : '';
        bValue = bCell ? bCell.textContent.trim().toLowerCase() : '';
      } else if (column === 'complexity') {
        const aCell = a.querySelector('.complexity-value');
        const bCell = b.querySelector('.complexity-value');
        aValue = aCell ? parseInt(aCell.textContent.trim()) || 0 : 0;
        bValue = bCell ? parseInt(bCell.textContent.trim()) || 0 : 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
    
    // Update sort indicators
    updateSortIndicators();
  }
  
  function rebuildTableHeaders(showAll) {
    const headerSpan = document.getElementById('breakdown-header-span');
    const groupHeadersRow = document.getElementById('breakdown-group-headers-row');
    const colHeadersRow = document.getElementById('breakdown-col-headers-row');
    
    // Build visible groups
    const visibleGroups = columnConfig.groups.map(group => {
      const visibleColumns = showAll 
        ? group.columns 
        : group.columns.filter(col => !columnConfig.emptyColumns.includes(col.key));
      return {
        name: group.name,
        columns: visibleColumns,
        totalColumns: group.columns.length
      };
    });
    
    // Calculate total visible breakdown columns
    const totalBreakdownCols = visibleGroups.reduce((sum, group) => sum + group.columns.length, 0) + 1; // +1 for base
    
    // Update main header colspan to span entire table (Function + Complexity + breakdown columns)
    headerSpan.setAttribute('colspan', 2 + totalBreakdownCols);
    
    // Rebuild group headers row (Function and Complexity have rowspan="2")
    const groupHeadersHTML = visibleGroups.map(group => {
      if (group.columns.length === 0) return '';
      return \`<th colspan="\${group.columns.length}" class="breakdown-group-header" data-group="\${group.name}">\${group.name}</th>\`;
    }).filter(Boolean).join('');
    groupHeadersRow.innerHTML = \`<th rowspan="2" class="breakdown-function-header sortable" onclick="sortTable('function')" id="sort-function-header">Function <span class="sort-indicator" id="sort-function-indicator"></span></th><th rowspan="2" class="breakdown-complexity-header sortable" onclick="sortTable('complexity')" id="sort-complexity-header">Complexity <span class="sort-indicator" id="sort-complexity-indicator"></span></th>\${groupHeadersHTML}<th class="breakdown-group-header" colspan="1">\${columnConfig.baseColumn.label}</th>\`;
    
    // Restore sort indicators after rebuild
    updateSortIndicators();
    
    // Rebuild column headers row (Function and Complexity are already in row above, so don't include them)
    const colHeadersHTML = visibleGroups.map(group => 
      group.columns.map(col => \`<th class="breakdown-col-header" data-column-key="\${col.key}">\${col.label}</th>\`).join('')
    ).join('');
    colHeadersRow.innerHTML = \`\${colHeadersHTML}<th class="breakdown-col-header">\${columnConfig.baseColumn.label}</th>\`;
  }
  
  function rebuildTableBody(showAll) {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Build visible columns list
    const visibleColumns = columnConfig.groups.flatMap(group => {
      if (showAll) {
        return group.columns;
      }
      return group.columns.filter(col => !columnConfig.emptyColumns.includes(col.key));
    });
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const functionCell = cells[0];
      const complexityCell = cells[1];
      
      // Get breakdown data from existing cells
      const breakdownData = {};
      const existingBreakdownCells = Array.from(cells).slice(2, -1); // Skip function, complexity, and base
      existingBreakdownCells.forEach(cell => {
        const key = cell.getAttribute('data-column-key');
        if (key) {
          const text = cell.textContent.trim();
          breakdownData[key] = text === '-' ? 0 : parseInt(text) || 0;
        }
      });
      const baseValue = parseInt(cells[cells.length - 1].textContent.trim()) || 1;
      breakdownData.base = baseValue;
      
      // Rebuild row with only visible columns
      const breakdownCells = visibleColumns.map(col => {
        const value = breakdownData[col.key] || 0;
        const displayValue = value === 0 ? '-' : value;
        const emptyClass = value === 0 ? ' breakdown-value-empty' : '';
        return \`<td class="breakdown-value\${emptyClass}" data-column-key="\${col.key}">\${displayValue}</td>\`;
      });
      breakdownCells.push(\`<td class="breakdown-value">\${baseValue}</td>\`);
      
      row.innerHTML = \`\${functionCell.outerHTML}\${complexityCell.outerHTML}\${breakdownCells.join('')}\`;
    });
  }
  
  function toggleEmptyColumns() {
    showAllColumns = !showAllColumns;
    const button = document.getElementById('breakdown-toggle');
    const infoSpan = document.getElementById('breakdown-toggle-info');
    
    if (showAllColumns) {
      button.textContent = 'Hide Empty Columns';
      // Hide info when all columns are shown (use visibility to maintain layout)
      if (infoSpan) infoSpan.style.visibility = 'hidden';
    } else {
      button.textContent = 'Show All Columns';
      // Show info when columns are hidden
      if (infoSpan) infoSpan.style.visibility = 'visible';
    }
    
    // Rebuild both headers and body to ensure colspan matches
    rebuildTableHeaders(showAllColumns);
    rebuildTableBody(showAllColumns);
    
    // Re-apply sorting if active
    if (sortColumn) {
      sortTable(sortColumn);
    }
    
    // Re-apply filter if active (to update no-matches colspan)
    const searchInput = document.getElementById('breakdown-search');
    if (searchInput && searchInput.value) {
      filterFunctions(searchInput.value);
    }
  }
  
  function filterFunctions(searchTerm) {
    const tbody = document.getElementById('complexity-breakdown-tbody');
    const rows = tbody.querySelectorAll('tr:not(#no-matches-row)');
    const noMatchesRow = document.getElementById('no-matches-row');
    const searchLower = searchTerm.toLowerCase().trim();
    let visibleCount = 0;
    
    rows.forEach(row => {
      const functionCell = row.querySelector('.function-name');
      if (functionCell) {
        const functionName = functionCell.textContent.trim().toLowerCase();
        const matches = searchLower === '' || functionName.includes(searchLower);
        row.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      }
    });
    
    // Show/hide "no matches" message
    if (noMatchesRow) {
      if (searchLower !== '' && visibleCount === 0) {
        noMatchesRow.style.display = '';
        // Update colspan to match current table width (Function + Complexity + breakdown columns)
        const headerSpan = document.getElementById('breakdown-header-span');
        const currentColspan = headerSpan ? parseInt(headerSpan.getAttribute('colspan')) || 0 : 0;
        const noMatchesCell = noMatchesRow.querySelector('.no-matches-message');
        if (noMatchesCell) {
          noMatchesCell.setAttribute('colspan', 2 + currentColspan);
        }
      } else {
        noMatchesRow.style.display = 'none';
      }
    }
  }
  
  let tableVisible = true;
  
  function toggleTableVisibility() {
    tableVisible = !tableVisible;
    const table = document.getElementById('complexity-breakdown-table');
    const button = document.getElementById('breakdown-hide-table-toggle');
    
    if (table && button) {
      if (tableVisible) {
        table.style.display = 'table';
        button.textContent = 'Hide Table';
      } else {
        table.style.display = 'none';
        button.textContent = 'Show Table';
      }
    }
  }
  
  // Initialize sort indicators on page load
  updateSortIndicators();
</script>
</body>
</html>`;
}
