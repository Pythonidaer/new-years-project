import { getBaseFunctionName } from './function-extraction.js';
import { formatComplexityConcise } from './complexity-breakdown.js';

// escapeHtml will be imported from html-generators.js when we create it
// For now, we'll import it here and it will be available when html-generators is created
let escapeHtml = null;

/**
 * Sets the escapeHtml function (called from html-generators.js to avoid circular dependency)
 * @param {Function} fn - escapeHtml function
 */
export function setEscapeHtml(fn) {
  escapeHtml = fn;
}

/**
 * Builds a hierarchical tree structure from functions based on their boundaries
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @returns {Array} Array of top-level function nodes with children
 */
export function buildFunctionHierarchy(functions, functionBoundaries) {
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
export function findMaxComplexityInSubtree(node) {
  let max = parseInt(node.complexity);
  node.children.forEach(child => {
    const childMax = findMaxComplexityInSubtree(child);
    if (childMax > max) max = childMax;
  });
  return max;
}

/**
 * Detects callback type from function name
 * @param {string} functionName - Full function name
 * @param {number} depth - Current depth in tree
 * @returns {Object} Object with displayName and callbackType
 */
function detectCallbackType(functionName, depth) {
  let displayName = functionName;
  let callbackType = null;
  
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
    if (displayName.match(/^on[A-Z]/)) {
      callbackType = 'event handler';
    } else if (depth > 0) {
      callbackType = 'inline JSX callback';
    }
  }
  
  return { displayName, callbackType };
}

/**
 * Formats complexity display string
 * @param {number} actualComplexity - Actual complexity value
 * @param {boolean} showBreakdown - Whether to show breakdown
 * @param {Object|null} breakdown - Breakdown object
 * @returns {string} Formatted complexity display
 */
function formatComplexityDisplay(actualComplexity, showBreakdown, breakdown) {
  if (actualComplexity === 1) {
    return 'base';
  }
  if (showBreakdown && breakdown) {
    const concise = formatComplexityConcise(breakdown.breakdown, actualComplexity);
    return `CC: ${actualComplexity} (${concise})`;
  }
  return `CC: ${actualComplexity}`;
}

/**
 * Determines if this function has the highest complexity in its group
 * @param {number} actualComplexity - Function's complexity
 * @param {number|null} maxComplexityInGroup - Maximum complexity in group
 * @returns {boolean} Whether this is the highest complexity
 */
function isHighestComplexityInGroup(actualComplexity, maxComplexityInGroup) {
  if (maxComplexityInGroup === null) {
    return false;
  }
  const currentGroupMax = Math.max(maxComplexityInGroup, actualComplexity);
  return actualComplexity === currentGroupMax;
}

/**
 * Builds the formatted line string for a function node
 * @param {string} displayName - Display name of function
 * @param {string} complexityDisplay - Formatted complexity string
 * @param {string|null} callbackType - Callback type or null
 * @param {number} depth - Current depth
 * @param {boolean} isLast - Whether this is last child
 * @param {string} prefix - Tree prefix
 * @param {number} actualComplexity - Actual complexity value
 * @param {boolean} isHighestComplexity - Whether this is highest complexity
 * @returns {string} Formatted line string
 */
function buildFunctionLine(displayName, complexityDisplay, callbackType, depth, isLast, prefix, actualComplexity, isHighestComplexity) {
  const escapedName = escapeHtml(displayName);
  const escapedComplexity = escapeHtml(complexityDisplay);
  
  if (depth === 0) {
    // Top-level function
    if (isHighestComplexity) {
      return `<span class="function-highlight">${escapedName} — ${escapedComplexity}</span>`;
    }
    return `${escapedName} — ${escapedComplexity}`;
  }
  
  // Nested function
  const connector = isLast ? '└─' : '├─';
  const callbackLabel = callbackType ? ` (${callbackType})` : '';
  
  if (actualComplexity === 1) {
    return `${prefix}${connector} ${escapedName}${callbackLabel} (base)`;
  }
  
  if (isHighestComplexity) {
    return `${prefix}${connector} <span class="function-highlight">${escapedName}${callbackLabel} — ${escapedComplexity}</span>`;
  }
  
  return `${prefix}${connector} ${escapedName}${callbackLabel} — ${escapedComplexity}`;
}

/**
 * Processes children of a function node
 * @param {Array} children - Array of child nodes
 * @param {Map} functionBreakdowns - Map of functionLine -> breakdown
 * @param {number} depth - Current depth
 * @param {boolean} isLast - Whether parent is last child
 * @param {string} prefix - Tree prefix
 * @param {number} actualComplexity - Parent's complexity
 * @returns {Array} Array of formatted child lines
 */
function processChildren(children, functionBreakdowns, depth, isLast, prefix, actualComplexity) {
  if (children.length === 0) {
    return [];
  }
  
  const childPrefix = depth === 0 ? '' : (isLast ? prefix + '   ' : prefix + '│  ');
  const groupMaxComplexity = Math.max(
    actualComplexity,
    ...children.map(c => findMaxComplexityInSubtree(c))
  );
  
  return children.map((child, index) => {
    const isChildLast = index === children.length - 1;
    return formatFunctionNode(child, functionBreakdowns, depth + 1, isChildLast, childPrefix, groupMaxComplexity);
  });
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
export function formatFunctionNode(node, functionBreakdowns, depth = 0, isLast = true, prefix = '', maxComplexityInGroup = null) {
  if (!escapeHtml) {
    throw new Error('escapeHtml not set. Call setEscapeHtml() first.');
  }
  
  const breakdown = functionBreakdowns.get(node.line);
  const actualComplexity = parseInt(node.complexity);
  const calculatedTotal = breakdown ? breakdown.calculatedTotal : actualComplexity;
  
  // Determine if we should show breakdown
  const showBreakdown = breakdown && (
    calculatedTotal === actualComplexity || 
    (Math.abs(calculatedTotal - actualComplexity) === 1 && calculatedTotal < actualComplexity)
  );
  
  // Extract function name and callback type
  const { displayName, callbackType } = detectCallbackType(node.functionName, depth);
  
  // Format complexity display
  const complexityDisplay = formatComplexityDisplay(actualComplexity, showBreakdown, breakdown);
  
  // Determine if this is the highest complexity function in its group
  const isHighestComplexity = isHighestComplexityInGroup(actualComplexity, maxComplexityInGroup);
  
  // Build the line
  const line = buildFunctionLine(
    displayName,
    complexityDisplay,
    callbackType,
    depth,
    isLast,
    prefix,
    actualComplexity,
    isHighestComplexity
  );
  
  // Process children
  const lines = [line];
  const childLines = processChildren(node.children, functionBreakdowns, depth, isLast, prefix, actualComplexity);
  lines.push(...childLines);
  
  return lines.join('\n');
}

/**
 * Gets context around a line number
 * @param {string} fullSourceCode - Full source code
 * @param {number} nodeLine - Line number (1-based)
 * @param {number} contextLines - Number of lines before/after to include
 * @returns {string} Context string
 */
function getContextAroundLine(fullSourceCode, nodeLine, contextLines = 10) {
  const lines = fullSourceCode.split('\n');
  const startLine = Math.max(0, nodeLine - contextLines);
  const endLine = Math.min(lines.length, nodeLine + contextLines);
  return lines.slice(startLine, endLine).join('\n');
}

/**
 * Checks if this is a cleanup callback
 * @param {string} functionName - Function name
 * @param {string} context - Context around the function
 * @param {Object|null} parentNode - Parent node
 * @param {Map} siblingCallbacks - Map tracking callback counts
 * @param {string} fullSourceCode - Full source code
 * @returns {string|null} Cleanup label or null
 */
function checkCleanupCallback(functionName, context, parentNode, siblingCallbacks, fullSourceCode) {
  if (!functionName.includes('(return callback)') && 
      !functionName.includes('cleanup') && 
      !context.includes('return ()')) {
    return null;
  }
  
  if (parentNode) {
    const parentLabel = extractCallbackLabel(parentNode, null, siblingCallbacks, fullSourceCode, parentNode.line);
    if (parentLabel.startsWith('useEffect#')) {
      return `${parentLabel} cleanup`;
    }
  }
  
  return 'cleanup';
}

/**
 * Checks if this is a useEffect callback
 * @param {string} functionName - Function name
 * @param {string} context - Context around the function
 * @param {Object|null} parentNode - Parent node
 * @param {Map} siblingCallbacks - Map tracking callback counts
 * @returns {string|null} useEffect label or null
 */
function checkUseEffectCallback(functionName, context, parentNode, siblingCallbacks) {
  if (!functionName.includes('(useEffect callback)') && !context.includes('useEffect(')) {
    return null;
  }
  
  const parentName = parentNode ? parentNode.functionName : '';
  const key = `${parentName}_useEffect`;
  const count = (siblingCallbacks.get(key) || 0) + 1;
  siblingCallbacks.set(key, count);
  return `useEffect#${count}`;
}

/**
 * Checks if this is a requestAnimationFrame callback
 * @param {string} functionName - Function name
 * @param {string} context - Context around the function
 * @returns {string|null} rAF label or null
 */
function checkRequestAnimationFrameCallback(functionName, context) {
  if (functionName.includes('(requestAnimationFrame callback)') || context.includes('requestAnimationFrame(')) {
    return 'rAF callback';
  }
  return null;
}

/**
 * Checks if this is a setTimeout callback
 * @param {string} functionName - Function name
 * @param {string} context - Context around the function
 * @returns {string|null} setTimeout label or null
 */
function checkSetTimeoutCallback(functionName, context) {
  if (functionName.includes('(setTimeout callback)') || context.includes('setTimeout(')) {
    return 'setTimeout callback';
  }
  return null;
}

/**
 * Checks if this is an event handler from function name
 * @param {string} functionName - Function name
 * @returns {string|null} Event handler label or null
 */
function checkEventHandlerFromName(functionName) {
  const handlerMatch = functionName.match(/^on([A-Z]\w+)/);
  if (handlerMatch) {
    return `${handlerMatch[0]} handler`;
  }
  return null;
}

/**
 * Checks if this is a JSX inline callback
 * @param {string} context - Context around the function
 * @returns {string|null} JSX handler label or null
 */
function checkJSXInlineCallback(context) {
  const jsxHandlerMatch = context.match(/(on[A-Z]\w+)\s*=\s*\{/);
  if (jsxHandlerMatch) {
    return `JSX ${jsxHandlerMatch[1]}`;
  }
  return null;
}

/**
 * Checks if this is an event handler from context
 * @param {string} context - Context around the function
 * @returns {string|null} Event handler label or null
 */
function checkEventHandlerFromContext(context) {
  if (context.includes('onScroll') && !context.includes('onScroll=')) {
    return 'onScroll handler';
  }
  if (context.includes('onClick') && !context.includes('onClick=')) {
    return 'onClick handler';
  }
  return null;
}

/**
 * Gets default callback label from function name
 * @param {string} functionName - Function name
 * @param {Object|null} parentNode - Parent node
 * @returns {string} Default callback label
 */
function getDefaultCallbackLabel(functionName, parentNode) {
  if (!functionName.includes('(arrow function)')) {
    return 'callback';
  }
  
  const parentName = parentNode ? parentNode.functionName : '';
  if (parentName && parentName !== 'unknown' && parentName !== 'anonymous') {
    if (!functionName.includes(parentName)) {
      return `${parentName} callback`;
    }
  }
  
  return 'callback';
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
export function extractCallbackLabel(node, parentNode, siblingCallbacks, fullSourceCode = '', nodeLine = 0) {
  const functionName = node.functionName;
  const context = getContextAroundLine(fullSourceCode, nodeLine);
  
  // Check each callback type in order of specificity
  const cleanupLabel = checkCleanupCallback(functionName, context, parentNode, siblingCallbacks, fullSourceCode);
  if (cleanupLabel) return cleanupLabel;
  
  const useEffectLabel = checkUseEffectCallback(functionName, context, parentNode, siblingCallbacks);
  if (useEffectLabel) return useEffectLabel;
  
  const rafLabel = checkRequestAnimationFrameCallback(functionName, context);
  if (rafLabel) return rafLabel;
  
  const setTimeoutLabel = checkSetTimeoutCallback(functionName, context);
  if (setTimeoutLabel) return setTimeoutLabel;
  
  const eventHandlerFromName = checkEventHandlerFromName(functionName);
  if (eventHandlerFromName) return eventHandlerFromName;
  
  const jsxLabel = checkJSXInlineCallback(context);
  if (jsxLabel) return jsxLabel;
  
  const eventHandlerFromContext = checkEventHandlerFromContext(context);
  if (eventHandlerFromContext) return eventHandlerFromContext;
  
  return getDefaultCallbackLabel(functionName, parentNode);
}

/**
 * Finds the immediate parent function for a callback
 * @param {Object} func - Function object
 * @param {Map} functionBoundaries - Map of function boundaries
 * @param {Array} sortedFunctions - Sorted array of all functions
 * @returns {Object|null} Parent function or null
 */
function findImmediateParentFunction(func, functionBoundaries, sortedFunctions) {
  const funcBoundary = functionBoundaries.get(func.line);
  if (!funcBoundary) {
    return null;
  }
  
  const containingFunctions = Array.from(functionBoundaries.entries())
    .filter(([fl, boundary]) => 
      fl !== func.line && 
      boundary.start < funcBoundary.start && 
      boundary.end >= funcBoundary.end
    )
    .sort((a, b) => b[1].start - a[1].start);
  
  if (containingFunctions.length === 0) {
    return null;
  }
  
  const immediateParentLine = containingFunctions[0][0];
  return sortedFunctions.find(f => f.line === immediateParentLine) || null;
}

/**
 * Fixes function name for callbacks using function boundaries
 * Recursively builds the full hierarchical chain (e.g., "AgencyLogosComponent (useEffect callback) (IntersectionObserver callback)")
 * @param {Object} func - Function object
 * @param {Map} functionBoundaries - Map of function boundaries
 * @param {Array} sortedFunctions - Sorted array of all functions
 * @param {Set} visited - Set to track visited functions (prevents infinite loops)
 * @returns {string} Fixed display name with full hierarchical chain
 */
function fixFunctionNameForCallback(func, functionBoundaries, sortedFunctions, visited = new Set()) {
  let displayName = func.functionName || 'unknown';
  
  // Prevent infinite loops
  const funcKey = `${func.file}:${func.line}`;
  if (visited.has(funcKey)) {
    return displayName;
  }
  visited.add(funcKey);
  
  if (!functionBoundaries) {
    return displayName;
  }
  
  // Find the actual immediate parent using boundaries
  const immediateParentFunc = findImmediateParentFunction(func, functionBoundaries, sortedFunctions);
  
  if (!immediateParentFunc) {
    // No parent found, return name as-is
    return displayName;
  }
  
  // Recursively build the parent's hierarchical name
  const parentHierarchicalName = fixFunctionNameForCallback(
    immediateParentFunc, 
    functionBoundaries, 
    sortedFunctions,
    new Set(visited) // New visited set for parent traversal
  );
  
  // Extract callback type from current function name
  // Pattern 1: "parentName (callbackType callback)" - extract callbackType
  // Pattern 2: "callbackType callback" - extract callbackType
  // Pattern 3: "callbackType callback (nested callback)" - extract the last callbackType
  let callbackType = null;
  const nestedCallbackMatch = displayName.match(/\((.+?)\s+callback\)\s*$/);
  if (nestedCallbackMatch) {
    callbackType = nestedCallbackMatch[1];
  } else {
    const simpleCallbackMatch = displayName.match(/^(.+?)\s+callback$/i);
    if (simpleCallbackMatch) {
      callbackType = simpleCallbackMatch[1];
    }
  }
  
  if (callbackType) {
    // Build full chain: parent's full hierarchical name + this callback
    const parentBaseName = getBaseFunctionName(parentHierarchicalName);
    if (parentBaseName && parentBaseName !== 'unknown' && parentBaseName !== 'anonymous') {
      displayName = `${parentHierarchicalName} (${callbackType} callback)`;
    }
  } else {
    // Not a callback, or couldn't extract callback type - use parent's name if it's different
    const currentBaseName = getBaseFunctionName(displayName);
    const parentBaseName = getBaseFunctionName(parentHierarchicalName);
    if (parentBaseName && parentBaseName !== currentBaseName && 
        parentBaseName !== 'unknown' && parentBaseName !== 'anonymous') {
      // This might be a nested function that should show its parent
      // But for now, keep the original name if it's not a callback
      return displayName;
    }
  }
  
  return displayName;
}

/**
 * Gets default column structure (used when not provided)
 * @returns {Object} Column configuration
 */
function getDefaultColumnStructure() {
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
    baseColumn: { key: 'base', label: 'base' }
  };
}

/**
 * Generates HTML for a function table row with individual breakdown columns
 * @param {string} displayName - Function display name
 * @param {number} complexity - Function complexity
 * @param {Object} breakdownData - Breakdown data object
 * @param {Object} columnStructure - Column structure configuration
 * @param {Set} emptyColumns - Set of column keys that are completely empty
 * @param {Array} visibleColumns - Array of visible column objects (only include these)
 * @returns {string} HTML string for table row
 */
function generateFunctionRowHTML(displayName, complexity, breakdownData, columnStructure, emptyColumns, visibleColumns) {
  // Generate cells only for visible columns
  const breakdownCells = visibleColumns.map(col => {
    const value = breakdownData[col.key] || 0;
    // Display "-" instead of 0 for better readability
    const displayValue = value === 0 ? '-' : value;
    // Add empty class for styling when value is "-"
    const emptyClass = value === 0 ? ' breakdown-value-empty' : '';
    return `<td class="breakdown-value${emptyClass}" data-column-key="${col.key}">${displayValue}</td>`;
  });
  
  // Add base column (at the end) - always show 1, never "-"
  const baseValue = breakdownData.base || 1;
  breakdownCells.push(`<td class="breakdown-value">${baseValue}</td>`);
  
  return `        <tr>
          <td class="function-name"><span class="strong">${escapeHtml(displayName)}</span></td>
          <td class="complexity-value"><span class="complexity-number">${complexity}</span></td>
          ${breakdownCells.join('')}
        </tr>`;
}

/**
 * Formats all functions in scannable, unambiguous format (one line per function)
 * Shows only what ESLint counts for cyclomatic complexity
 * Groups functions by base name, showing the highest complexity version
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Map} functionBreakdowns - Map of functionLine -> breakdown
 * @param {string} sourceCode - Source code for context
 * @param {Object} [columnStructure] - Column structure configuration (optional, uses default if not provided)
 * @param {Set} [emptyColumns] - Set of column keys that are completely empty (optional)
 * @param {boolean} [showAllColumns] - Whether to show all columns including empty ones (default: false)
 * @returns {string} Formatted HTML string
 */
export function formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, _sourceCode, columnStructure, emptyColumns, showAllColumns = false) {
  if (!escapeHtml) {
    throw new Error('escapeHtml not set. Call setEscapeHtml() first.');
  }
  
  if (functions.length === 0) return '';
  
  // Use default column structure if not provided (for backward compatibility with tests)
  const structure = columnStructure || getDefaultColumnStructure();
  
  // Use empty set if not provided (for backward compatibility with tests)
  const emptyCols = emptyColumns || new Set();
  
  // Build visible columns list based on showAllColumns flag
  const visibleColumns = structure.groups.flatMap(group => {
    if (showAllColumns) {
      return group.columns;
    }
    return group.columns.filter(col => !emptyCols.has(col.key));
  });
  
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
  
  // Show each function separately, but group functions with the same name and line number
  // This ensures functions with the same name but different line numbers are shown separately
  // This matches what users see in the code view annotations
  const functionGroups = new Map();
  
  Array.from(lineToFunction.values()).forEach(func => {
    // Use file + function name + line number as key to ensure uniqueness
    // This allows multiple functions with the same name (e.g., "addEventListener callback" on different lines)
    // to be shown separately, each with their own breakdown
    const key = `${func.file}:${func.functionName}:${func.line}`;
    
    const existing = functionGroups.get(key);
    if (!existing) {
      functionGroups.set(key, func);
    } else {
      // If somehow we have duplicate key, keep the one with higher complexity
      if (parseInt(func.complexity) > parseInt(existing.complexity)) {
        functionGroups.set(key, func);
      }
    }
  });
  
  // Sort by line number to match code order
  const sortedFunctions = Array.from(functionGroups.values()).sort((a, b) => a.line - b.line);
  
  const lines = [];
  
  // Format each function on one line with individual breakdown columns
  sortedFunctions.forEach(func => {
    const complexity = parseInt(func.complexity);
    const breakdown = functionBreakdowns.get(func.line);
    const breakdownData = breakdown ? breakdown.breakdown : {};
    const displayName = fixFunctionNameForCallback(func, functionBoundaries, sortedFunctions);
    const rowHTML = generateFunctionRowHTML(displayName, complexity, breakdownData, structure, emptyCols, visibleColumns);
    lines.push(rowHTML);
  });
  
  return lines.join('\n');
}
