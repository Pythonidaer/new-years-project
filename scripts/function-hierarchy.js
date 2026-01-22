import { getBaseFunctionName } from './function-extraction.js';
import { formatComplexityConcise, formatComplexityBreakdownStyled } from './complexity-breakdown.js';

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
export function extractCallbackLabel(node, parentNode, siblingCallbacks, fullSourceCode = '', nodeLine = 0) {
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
 * Formats all functions in scannable, unambiguous format (one line per function)
 * Shows only what ESLint counts for cyclomatic complexity
 * Groups functions by base name, showing the highest complexity version
 * @param {Array} functions - Array of function objects
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Map} functionBreakdowns - Map of functionLine -> breakdown
 * @param {string} sourceCode - Source code for context
 * @returns {string} Formatted HTML string
 */
export function formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, sourceCode = '') {
  if (!escapeHtml) {
    throw new Error('escapeHtml not set. Call setEscapeHtml() first.');
  }
  
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
