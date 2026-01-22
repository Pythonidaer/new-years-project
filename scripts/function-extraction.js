import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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
          const parentFunction = extractFunctionName(filePath, lineNumber - 5, 'FunctionDeclaration', projectRoot); // Get parent function name
          if (parentFunction && parentFunction !== 'anonymous' && parentFunction !== 'unknown') {
            return `${parentFunction} (${match[1]} callback)`;
          }
          return `${match[1]} callback`;
        }
      }
      
      // LAST: If we can't find a specific pattern, try to get parent function name
      const parentFunction = extractFunctionName(filePath, lineNumber - 5, 'FunctionDeclaration', projectRoot);
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
