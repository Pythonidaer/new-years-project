import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Function patterns for finding function declarations
 */
const FUNCTION_PATTERNS = [
  /(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
  /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
  /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
];

/**
 * Finds the closest parent function by looking backwards
 * @param {Array} lines - Array of source code lines
 * @param {number} lineNumber - Current line number (1-based)
 * @param {number} maxLookBack - Maximum lines to look back
 * @returns {string|null} Parent function name or null
 */
function findParentFunction(lines, lineNumber, maxLookBack = 50) {
  let parentFunction = null;
  let closestFunctionLine = -1;
  
  for (let lookBack = 1; lookBack <= maxLookBack && lineNumber - lookBack >= 1; lookBack++) {
    const checkLine = lineNumber - lookBack;
    const checkLineContent = lines[checkLine - 1] || '';
    
    for (const funcPattern of FUNCTION_PATTERNS) {
      const funcMatch = checkLineContent.match(funcPattern);
      if (funcMatch && funcMatch[1]) {
        if (closestFunctionLine === -1 || checkLine > closestFunctionLine) {
          parentFunction = funcMatch[1];
          closestFunctionLine = checkLine;
        }
      }
    }
  }
  
  return parentFunction;
}

/**
 * Finds parent function with fallback to recursive lookup
 * @param {string} filePath - File path
 * @param {number} lineNumber - Line number
 * @param {string} projectRoot - Project root
 * @param {Array} lines - Source code lines
 * @returns {string|null} Parent function name or null
 */
function findParentFunctionWithFallback(filePath, lineNumber, projectRoot, lines) {
  const parentFunction = findParentFunction(lines, lineNumber);
  if (parentFunction) {
    return parentFunction;
  }
  // Fallback: try recursive lookup
  return extractFunctionName(filePath, lineNumber - 5, 'FunctionDeclaration', projectRoot);
}

/**
 * Formats callback name with parent function
 * @param {string} callbackType - Type of callback (e.g., 'map', 'useEffect')
 * @param {string|null} parentFunction - Parent function name
 * @returns {string} Formatted callback name
 */
function formatCallbackName(callbackType, parentFunction) {
  if (parentFunction && parentFunction !== 'anonymous' && parentFunction !== 'unknown') {
    return `${parentFunction} (${callbackType} callback)`;
  }
  return `${callbackType} callback`;
}

/**
 * Checks if this is a named arrow function
 * @param {string} prevLine - Previous line
 * @param {string} currentLine - Current line
 * @returns {string|null} Function name or null
 */
function checkNamedArrowFunction(prevLine, currentLine) {
  const combinedContext = (prevLine + ' ' + currentLine).trim();
  const namedArrowPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?=>/;
  const namedMatch = combinedContext.match(namedArrowPattern);
  return namedMatch && namedMatch[1] ? namedMatch[1] : null;
}

/**
 * Finds method call callback (e.g., .map(, .find()
 * @param {string} beforeArrow - Text before => operator
 * @param {string} filePath - File path
 * @param {number} lineNumber - Line number
 * @param {string} projectRoot - Project root
 * @param {Array} lines - Source code lines
 * @returns {string|null} Callback name or null
 */
function findMethodCallCallback(beforeArrow, filePath, lineNumber, projectRoot, lines) {
  const methodCallMatch = beforeArrow.match(/\.(\w+)\s*\(/);
  if (!methodCallMatch || !methodCallMatch[1]) {
    return null;
  }
  
  const callbackType = methodCallMatch[1];
  const parentFunction = findParentFunctionWithFallback(filePath, lineNumber, projectRoot, lines);
  return formatCallbackName(callbackType, parentFunction);
}

/**
 * Finds function call callback (e.g., useEffect(, setTimeout()
 * @param {string} beforeArrow - Text before => operator
 * @param {string} filePath - File path
 * @param {number} lineNumber - Line number
 * @param {string} projectRoot - Project root
 * @param {Array} lines - Source code lines
 * @returns {string|null} Callback name or null
 */
function findFunctionCallCallback(beforeArrow, filePath, lineNumber, projectRoot, lines) {
  const functionCallMatch = beforeArrow.match(/(?!if|for|while|switch)\b(\w+)\s*\(/);
  if (!functionCallMatch || !functionCallMatch[1]) {
    return null;
  }
  
  const callbackType = functionCallMatch[1];
  const parentFunction = findParentFunctionWithFallback(filePath, lineNumber, projectRoot, lines);
  return formatCallbackName(callbackType, parentFunction);
}

/**
 * Finds callback using fallback patterns
 * @param {string} combinedContext - Combined previous and current line
 * @param {string} filePath - File path
 * @param {number} lineNumber - Line number
 * @param {string} projectRoot - Project root
 * @param {Array} lines - Source code lines
 * @returns {string|null} Callback name or null
 */
function findCallbackWithFallbackPatterns(combinedContext, filePath, lineNumber, projectRoot, lines) {
  const arrowFunctionPatterns = [
    /\.(\w+)\s*\([^)]*\)\s*=>/,
    /\.(\w+)\s*\([^)]*=>/,
    /(\w+)\s*\([^)]*\)\s*=>/,
    /(\w+)\s*\([^)]*=>/,
  ];
  
  for (const pattern of arrowFunctionPatterns) {
    const match = combinedContext.match(pattern);
    if (match && match[1]) {
      const parentFunction = findParentFunctionWithFallback(filePath, lineNumber, projectRoot, lines);
      return formatCallbackName(match[1], parentFunction);
    }
  }
  
  return null;
}

/**
 * Handles final fallback for arrow function (find parent function)
 * @param {string} filePath - File path
 * @param {number} lineNumber - Line number
 * @param {string} projectRoot - Project root
 * @param {Array} lines - Source code lines
 * @returns {string} Function name
 */
function handleArrowFunctionFinalFallback(filePath, lineNumber, projectRoot, lines) {
  const parentFunction = findParentFunctionWithFallback(filePath, lineNumber, projectRoot, lines);
  if (parentFunction && parentFunction !== 'anonymous' && parentFunction !== 'unknown') {
    return `${parentFunction} (arrow function)`;
  }
  return 'anonymous arrow function';
}

/**
 * Tries to find callback from current line (method/function calls before =>)
 * @param {string} currentLine - Current line
 * @param {string} filePath - File path
 * @param {number} lineNumber - Line number
 * @param {string} projectRoot - Project root
 * @param {Array} lines - Source code lines
 * @returns {string|null} Callback name or null
 */
function tryFindCallbackFromCurrentLine(currentLine, filePath, lineNumber, projectRoot, lines) {
  const arrowIndex = currentLine.indexOf('=>');
  if (arrowIndex === -1) {
    return null;
  }
  
  const beforeArrow = currentLine.substring(0, arrowIndex);
  
  const methodCallback = findMethodCallCallback(beforeArrow, filePath, lineNumber, projectRoot, lines);
  if (methodCallback) {
    return methodCallback;
  }
  
  return findFunctionCallCallback(beforeArrow, filePath, lineNumber, projectRoot, lines);
}

/**
 * Handles arrow function expression extraction
 * @param {Array} lines - Source code lines
 * @param {number} lineNumber - Line number (1-based)
 * @param {string} filePath - File path
 * @param {string} projectRoot - Project root
 * @returns {string} Function name
 */
function handleArrowFunctionExpression(lines, lineNumber, filePath, projectRoot) {
  const lineIndex = lineNumber - 1;
  const currentLine = lines[lineIndex] || '';
  const prevLine = lines[lineIndex - 1] || '';
  
  // Check for named arrow function first
  const namedArrow = checkNamedArrowFunction(prevLine, currentLine);
  if (namedArrow) {
    return namedArrow;
  }
  
  // Check for method/function callbacks from current line
  const callbackFromLine = tryFindCallbackFromCurrentLine(currentLine, filePath, lineNumber, projectRoot, lines);
  if (callbackFromLine) {
    return callbackFromLine;
  }
  
  // Try fallback patterns
  const combinedContext = (prevLine + ' ' + currentLine).trim();
  const fallbackCallback = findCallbackWithFallbackPatterns(combinedContext, filePath, lineNumber, projectRoot, lines);
  if (fallbackCallback) {
    return fallbackCallback;
  }
  
  // Final fallback: find parent function
  return handleArrowFunctionFinalFallback(filePath, lineNumber, projectRoot, lines);
}

/**
 * Handles named function declaration extraction
 * @param {Array} lines - Source code lines
 * @param {number} lineNumber - Line number (1-based)
 * @returns {string} Function name
 */
function handleFunctionDeclaration(lines, lineNumber) {
  const startLine = Math.max(0, lineNumber - 50);
  const context = lines.slice(startLine, lineNumber).join('\n');
  
  const patterns = [
    /(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
    /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
    /export\s+default\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
    /(?:export\s+default\s+|const\s+)([A-Z][a-zA-Z0-9_$]*)\s*[:=]\s*(?:\([^)]*\)\s*)?=>/,
  ];
  
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
}

/**
 * Extracts function name from source file
 * @param {string} filePath - Relative path to the file
 * @param {number} lineNumber - Line number where the function is reported
 * @param {string} nodeType - Type of function node (FunctionDeclaration, ArrowFunctionExpression)
 * @param {string} projectRoot - Root directory of the project
 * @returns {string} Function name or 'anonymous'/'unknown'
 */
export function extractFunctionName(filePath, lineNumber, nodeType = 'FunctionDeclaration', projectRoot) {
  try {
    const fullPath = resolve(projectRoot, filePath);
    if (!existsSync(fullPath)) {
      return 'unknown';
    }
    
    const fileContent = readFileSync(fullPath, 'utf-8');
    const lines = fileContent.split('\n');
    
    if (nodeType === 'ArrowFunctionExpression') {
      return handleArrowFunctionExpression(lines, lineNumber, filePath, projectRoot);
    }
    
    return handleFunctionDeclaration(lines, lineNumber);
  } catch {
    return 'unknown';
  }
}

/**
 * Processes ESLint results and extracts function complexity data
 * @param {Array} eslintResults - ESLint JSON results
 * @param {string} projectRoot - Root directory of the project
 * @returns {Array} Array of function objects with complexity data
 */
export function extractFunctionsFromESLintResults(eslintResults, projectRoot) {
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
            const functionName = extractFunctionName(filePath, message.line, nodeType, projectRoot);
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

  return allFunctions;
}

/**
 * Calculates complexity level for color coding
 * @param {string|number} complexity - Complexity value
 * @returns {string} Complexity level ('low', 'medium', 'high', 'acceptable', 'good')
 */
export function getComplexityLevel(complexity) {
  const num = parseInt(complexity);
  if (num >= 20) return 'low'; // Dark red
  if (num >= 15) return 'medium'; // Yellow
  if (num > 10) return 'high'; // Green (but still over limit)
  if (num > 6) return 'acceptable'; // Light green (acceptable for UI components)
  return 'good'; // Very light green (good complexity)
}

/**
 * Gets directory path from file path
 * @param {string} filePath - Full file path
 * @returns {string} Directory path
 */
export function getDirectory(filePath) {
  const parts = filePath.split('/');
  if (parts.length <= 1) return filePath;
  // Remove filename, keep directory path
  return parts.slice(0, -1).join('/');
}

/**
 * Extracts base function name (removes callback suffixes)
 * @param {string} name - Full function name
 * @returns {string} Base function name
 */
export function getBaseFunctionName(name) {
  if (!name) return 'unknown';
  
  // Remove callback suffixes: (useEffect callback), (setTimeout callback), etc.
  // Also handle generic patterns like (forEach callback), (map callback), etc.
  const callbackPatterns = [
    /\s*\(useEffect callback\)/i,
    /\s*\(setTimeout callback\)/i,
    /\s*\(requestAnimationFrame callback\)/i,
    /\s*\(return callback\)/i,
    /\s*\(arrow function\)/i,
    /\s*\(map callback\)/i,
    /\s*\(filter callback\)/i,
    /\s*\(forEach callback\)/i,
    /\s*\(reduce callback\)/i,
    /\s*\(find callback\)/i,
    /\s*\(some callback\)/i,
    /\s*\(every callback\)/i,
    /\s*\(.+?\s+callback\)/i,  // Generic pattern for any callback type
  ];
  
  let baseName = name;
  // Apply patterns in order, with generic pattern last
  for (let i = 0; i < callbackPatterns.length - 1; i++) {
    baseName = baseName.replace(callbackPatterns[i], '');
  }
  // Apply generic pattern last to catch any remaining callback patterns
  baseName = baseName.replace(/\s*\(.+?\s+callback\)/gi, '');
  
  // Also remove standalone callback indicators
  baseName = baseName.replace(/^addEventListener\s+callback$/i, 'addEventListener');
  baseName = baseName.replace(/^anonymous\s+arrow\s+function$/i, 'anonymous');
  
  return baseName.trim() || 'unknown';
}
