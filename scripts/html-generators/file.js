import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { generateFilePageCSS } from './file-css.js';
import { generateJavaScriptCode } from './file-javascript.js';

/**
 * Detects language from file extension for syntax highlighting
 * @param {string} filePath - File path
 * @returns {string} Language class for prettify (e.g., 'lang-js', 'lang-ts')
 */
function detectLanguage(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap = {
    'js': 'lang-js',
    'jsx': 'lang-js',
    'ts': 'lang-ts',
    'tsx': 'lang-ts',
    'css': 'lang-css',
    'html': 'lang-html',
    'json': 'lang-json',
    'md': 'lang-md',
    'py': 'lang-py',
    'java': 'lang-java',
    'c': 'lang-c',
    'cpp': 'lang-cpp',
    'cs': 'lang-cs',
    'rb': 'lang-rb',
    'php': 'lang-php',
    'go': 'lang-go',
    'rs': 'lang-rs',
    'sh': 'lang-sh',
    'sql': 'lang-sql',
  };
  return langMap[ext] || 'lang-js'; // Default to JavaScript
}

/**
 * Calculates relative path to prettify files based on directory depth
 * @param {string} filePath - Relative file path (e.g., 'src/components/Button.tsx')
 * @returns {string} Relative path to prettify files (e.g., '../../prettify.css')
 */
function getPrettifyRelativePath(filePath) {
  const fileDir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
  if (!fileDir) {
    return ''; // Root level, no relative path needed
  }
  const depth = fileDir.split('/').length;
  return '../'.repeat(depth);
}

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
 * Calculates decision point totals from function breakdowns
 * @param {Map} functionBreakdowns - Map of function lines to breakdown objects
 * @returns {Object} Object with controlFlow, expressions, functionParameters totals
 */
function calculateDecisionPointTotalsFromBreakdowns(functionBreakdowns) {
  // Control Flow decision points
  const controlFlowTypes = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch'];
  // Expression decision points
  const expressionTypes = ['ternary', '&&', '||', '??', '?.'];
  // Function Parameter decision points
  const functionParameterTypes = ['default parameter'];
  
  let controlFlowTotal = 0;
  let expressionsTotal = 0;
  let functionParametersTotal = 0;
  
  functionBreakdowns.forEach(breakdown => {
    const breakdownObj = breakdown.breakdown || {};
    
    controlFlowTypes.forEach(type => {
      controlFlowTotal += breakdownObj[type] || 0;
    });
    
    expressionTypes.forEach(type => {
      expressionsTotal += breakdownObj[type] || 0;
    });
    
    functionParameterTypes.forEach(type => {
      functionParametersTotal += breakdownObj[type] || 0;
    });
  });
  
  return {
    controlFlow: controlFlowTotal,
    expressions: expressionsTotal,
    functionParameters: functionParametersTotal,
  };
}

/**
 * Generates summary section HTML (similar to main index)
 * @param {Object} decisionPointTotals - Object with controlFlow, expressions, functionParameters totals
 * @param {number} totalFunctions - Total number of functions
 * @param {number} withinThreshold - Number of functions within threshold
 * @param {number} withinThresholdPercentage - Percentage of functions within threshold
 * @returns {string} Summary section HTML
 */
function generateSummarySection(decisionPointTotals, totalFunctions, withinThreshold, _withinThresholdPercentage) {
  const { controlFlow, expressions, functionParameters } = decisionPointTotals;
  
  // Helper function to format percentage (2 decimal places if needed, whole number otherwise)
  const formatPercentage = (numerator, denominator) => {
    if (denominator === 0) return '0%';
    const percentage = (numerator / denominator) * 100;
    // If it's a whole number, show without decimals; otherwise show 2 decimal places
    return percentage % 1 === 0 ? `${percentage}%` : `${percentage.toFixed(2)}%`;
  };
  
  // Calculate Functions percentage using formatPercentage (not the pre-rounded value)
  const functionsPercentage = formatPercentage(withinThreshold, totalFunctions);
  const controlFlowPercentage = formatPercentage(controlFlow, controlFlow);
  const expressionsPercentage = formatPercentage(expressions, expressions);
  const defaultParamsPercentage = formatPercentage(functionParameters, functionParameters);
  
  return `
    <div class="clearfix">
      <div class='fl pad1y space-right2'>
        <span class="strong">${functionsPercentage}</span>
        <span class="quiet">Functions</span>
        <span class='fraction'>${withinThreshold}/${totalFunctions}</span>
      </div>
      <div class='fl pad1y space-right2'>
        <span class="strong">${controlFlowPercentage}</span>
        <span class="quiet">Control Flow</span>
        <span class='fraction'>${controlFlow}/${controlFlow}</span>
      </div>
      <div class='fl pad1y space-right2'>
        <span class="strong">${expressionsPercentage}</span>
        <span class="quiet">Expressions</span>
        <span class='fraction'>${expressions}/${expressions}</span>
      </div>
      <div class='fl pad1y space-right2'>
        <span class="strong">${defaultParamsPercentage}</span>
        <span class="quiet">Default Parameters</span>
        <span class='fraction'>${functionParameters}/${functionParameters}</span>
      </div>
    </div>`;
}

/**
 * Calculates file-level statistics
 * @param {Array} functions - Array of function objects
 * @returns {Object} Statistics object with totalFunctions, withinThreshold, maxComplexity, avgComplexity, percentage, level
 */
function calculateFileStatistics(functions, complexityThreshold = 10) {
  const totalFunctions = functions.length;
  const withinThreshold = functions.filter(f => parseInt(f.complexity) <= complexityThreshold).length;
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
  escapeHtml,
  languageClass = 'lang-js'
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
<td class="text"${decisionPointTitle}><pre class="prettyprint ${languageClass}">${codeLineHTML}</pre></td>
</tr>`;
}

/**
 * Reads source file and returns content and lines
 * @param {string} fullPath - Full file path
 * @param {string} filePath - Relative file path for error messages
 * @returns {Object} Object with sourceCode and sourceLines
 */
function readSourceFile(fullPath, filePath) {
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
  
  return { sourceCode, sourceLines };
}

/**
 * Generates breakdown section HTML
 * @param {Array} functions - Array of function objects
 * @param {Object} initialColumns - Initial column configuration
 * @param {string} breakdownItems - Formatted breakdown items HTML
 * @param {Object} columnStructure - Column structure configuration
 * @param {boolean} initialShowAllColumns - Whether to show all columns initially
 * @param {boolean} hideTableInitially - Whether to hide table initially
 * @returns {string} Breakdown section HTML
 */
function generateBreakdownSectionHTML(functions, initialColumns, breakdownItems, columnStructure, initialShowAllColumns, hideTableInitially) {
  if (functions.length === 0) {
    return '';
  }
  
  const groupHeadersHTML = initialColumns.visibleGroups.map(group => {
    if (group.columns.length === 0) return '';
    return `<th colspan="${group.columns.length}" class="breakdown-group-header" data-group="${group.name}" data-total-cols="${group.totalColumns}">${group.name}</th>`;
  }).filter(Boolean).join('');
  
  const colHeadersHTML = initialColumns.visibleGroups.map(group => 
    group.columns.map(col => {
      return `<th class="breakdown-col-header sortable" data-column-key="${col.key}" onclick="sortTable('${col.key}')" id="sort-${col.key}-header">${col.label} <span class="sort-indicator" id="sort-${col.key}-indicator"></span></th>`;
    }).join('')
  ).join('');
  
  return `
    <div class="complexity-breakdown">
      <div class="quiet" style="display: flex; align-items: center; gap: 15px; margin-top: 14px;">
        <div>
          Filter:
          <input type="search" id="breakdown-search" oninput="filterFunctions(this.value)">
        </div>
        <label style="margin: 0; font-weight: normal;">
          <input type="checkbox" id="breakdown-show-all-columns" onchange="toggleEmptyColumns()" ${initialShowAllColumns ? 'checked' : ''}>
          Show All Columns
        </label>
        <label style="margin: 0; font-weight: normal;">
          <input type="checkbox" id="breakdown-show-table" onchange="toggleTableVisibility()" ${hideTableInitially ? '' : 'checked'}>
          Show Table
        </label>
      </div>
      <table class="complexity-breakdown-table" id="complexity-breakdown-table" style="display: ${hideTableInitially ? 'none' : 'table'};">
        <thead id="complexity-breakdown-thead">
          <tr>
            <th colspan="${2 + initialColumns.totalBreakdownCols}" class="breakdown-header" id="breakdown-header-span">Function Complexity Breakdown</th>
          </tr>
          <tr id="breakdown-group-headers-row">
            <th rowspan="2" class="breakdown-function-header sortable" onclick="sortTable('function')" id="sort-function-header">
              Function <span class="sort-indicator" id="sort-function-indicator"></span>
            </th>
            <th rowspan="2" class="breakdown-complexity-header sortable" onclick="sortTable('complexity')" id="sort-complexity-header">
              Complexity <span class="sort-indicator" id="sort-complexity-indicator"></span>
            </th>
            ${groupHeadersHTML}
            <th class="breakdown-group-header" colspan="1">${columnStructure.baseColumn.label}</th>
          </tr>
          <tr id="breakdown-col-headers-row">
            ${colHeadersHTML}
            <th class="breakdown-col-header sortable" data-column-key="${columnStructure.baseColumn.key}" onclick="sortTable('${columnStructure.baseColumn.key}')" id="sort-${columnStructure.baseColumn.key}-header">${columnStructure.baseColumn.label} <span class="sort-indicator" id="sort-${columnStructure.baseColumn.key}-indicator"></span></th>
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
  `;
}

/**
 * Generates statistics HTML section
 * @param {number} totalFunctions - Total number of functions
 * @param {number} withinThreshold - Number of functions within threshold
 * @param {number} maxComplexity - Maximum complexity
 * @param {number} avgComplexity - Average complexity
 * @returns {string} Statistics HTML
 */
function generateStatisticsHTML(totalFunctions, withinThreshold, maxComplexity, avgComplexity) {
  const maxComplexityHTML = maxComplexity > 0 ? `
            <div class='fl pad1y space-right2'>
                <span class="strong">${maxComplexity} </span>
                <span class="quiet">Max Complexity</span>
            </div>
            <div class='fl pad1y space-right2'>
                <span class="strong">${avgComplexity} </span>
                <span class="quiet">Avg Complexity</span>
            </div>
            ` : '';
  
  return `
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
            ${maxComplexityHTML}
        `;
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
  escapeHtml,
  showAllColumnsInitially = false,
  hideTableInitially = false,
  complexityThreshold = 10
) {
  const fullPath = resolve(projectRoot, filePath);
  const { sourceCode, sourceLines } = readSourceFile(fullPath, filePath);
  
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
    calculateFileStatistics(functions, complexityThreshold);
  
  // Calculate decision point totals for this file
  const decisionPointTotals = calculateDecisionPointTotalsFromBreakdowns(functionBreakdowns);
  const withinThresholdPercentage = totalFunctions > 0 
    ? Math.round((withinThreshold / totalFunctions) * 100) 
    : 100;
  
  // Generate summary section
  const summarySection = generateSummarySection(decisionPointTotals, totalFunctions, withinThreshold, withinThresholdPercentage);
  
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
  
  // Initial state: use flags or default to collapsed (show only non-empty columns)
  const initialShowAllColumns = showAllColumnsInitially;
  const initialColumns = buildVisibleColumns(initialShowAllColumns);
  
  const breakdownItems = formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, sourceCode, columnStructure, emptyColumns, initialShowAllColumns);
  
  const breakdownSection = generateBreakdownSectionHTML(
    functions,
    initialColumns,
    breakdownItems,
    columnStructure,
    initialShowAllColumns,
    hideTableInitially
  );
  
  // Build boundary line sets for visual separators
  const { functionStartLines, functionEndLines, functionClosingLines } =
    buildBoundaryLineSets(functionBoundaries, sourceLines.length);

  // Line -> innermost function span for hover vertical line (includes indent for nested)
  const lineToSpan = buildLineToSpan(functionBoundaries, sourceLines.length, sourceLines);
  
  // Detect language for syntax highlighting
  const languageClass = detectLanguage(filePath);
  
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
      escapeHtml,
      languageClass
    )
  ).join('\n');
  
  // Calculate relative path to about.html
  const aboutPath = fileDir ? '../'.repeat(fileDir.split('/').length) + 'about.html' : 'about.html';
  
  // Calculate relative path to prettify files
  const prettifyPath = getPrettifyRelativePath(filePath);
  const prettifyCssPath = prettifyPath ? `${prettifyPath}prettify.css` : 'prettify.css';
  const prettifyJsPath = prettifyPath ? `${prettifyPath}prettify.js` : 'prettify.js';
  
  // Calculate relative path to shared.css (same depth as prettify files)
  const sharedCssPath = prettifyPath ? `${prettifyPath}shared.css` : 'shared.css';
  
  const javascriptCode = generateJavaScriptCode(initialShowAllColumns, columnStructure, emptyColumns, lineToSpan);
  const cssStyles = generateFilePageCSS();
  
  return `<!doctype html>
<html lang="en">
<head>
    <title>Complexity report for ${filePath}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="${sharedCssPath}" />
    <link rel="stylesheet" href="${prettifyCssPath}" />
    <style>${cssStyles}</style>
</head>
<body>
<div class='wrapper'>
    <div class='pad1'>
        <div class="header-row">
            <h1><a href="${backLink}">All files</a>${fileDir ? ` / <a href="${folderIndexPath}">${fileDir}</a>` : ''} ${fileName}</h1>
            <a href="${aboutPath}" class="about-link">About Cyclomatic Complexity</a>
        </div>
        ${summarySection}
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
    Complexity report generated by <a href="https://www.github.com/pythonidaer" target="_blank" rel="noopener noreferrer">pythonidaer</a> at ${new Date().toISOString()}
</div>
<script src="${prettifyJsPath}"></script>
<script>${javascriptCode}</script>
</body>
</html>`;
}
