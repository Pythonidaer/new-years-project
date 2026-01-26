/**
 * Default parameter parsing
 * 
 * This module handles detection of default parameters in function signatures.
 * Default parameters add +1 to complexity according to ESLint's classic variant.
 */

// Imported functions are used in string-literals.js but not directly in this file
// eslint-disable-next-line no-unused-vars
import { handleEscapeSequence, handleTemplateExpressionStart, trackTemplateExpressionBraces, updateQuoteStates } from './string-literals.js';

/**
 * Finds the callback function line for arrow function parameters
 * @param {number} lineNum - Line number
 * @param {number} functionLine - Current function line
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Function} getInnermostFunction - Function to get innermost function for a line
 * @returns {Object} Object with actualFunctionLine and boundary
 */
export function findCallbackFunctionLine(lineNum, functionLine, functionBoundaries, _getInnermostFunction) {
  let actualFunctionLine = functionLine;
  let boundary = functionBoundaries.get(functionLine);
  
  const callbacksOnThisLine = Array.from(functionBoundaries.entries())
    .filter(([_fl, b]) => b.start === lineNum);
  
  if (callbacksOnThisLine.length > 0) {
    const callbackEntry = callbacksOnThisLine.reduce((min, [fl, b]) => {
      const minSize = min[1].end - min[1].start;
      const bSize = b.end - b.start;
      if (bSize < minSize) {
        return [fl, b];
      }
      if (bSize === minSize && b.start > min[1].start) {
        return [fl, b];
      }
      return min;
    });
    
    actualFunctionLine = callbackEntry[0];
    boundary = callbackEntry[1];
  }
  
  return { actualFunctionLine, boundary };
}

/**
 * Looks ahead for arrow function on subsequent lines
 * @param {number} index - Current line index
 * @param {Array} lines - All lines of source code
 * @param {number} maxLines - Maximum lines to look ahead
 * @returns {number|null} Line number where => is found, or null
 */
export function findArrowOnSubsequentLines(index, lines, maxLines = 5) {
  for (let i = index + 1; i < Math.min(index + maxLines + 1, lines.length); i++) {
    const checkLine = lines[i].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '');
    if (checkLine.includes('=>')) {
      return i + 2; // Return line number (1-based) including the line with =>
    }
  }
  return null;
}

/**
 * Applies fallback 1: Function declaration line with default params
 * @param {number} paramListEnd - Current paramListEnd
 * @param {number} boundaryStart - Function boundary start
 * @param {number} lineNum - Current line number
 * @param {boolean} hasFunctionSig - Whether line has function signature
 * @param {string} lineWithoutComments - Current line without comments
 * @param {RegExp} defaultParamPattern - Pattern to match default parameters
 * @returns {number|null} Updated paramListEnd or null
 */
export function applyFallback1FunctionDeclaration(paramListEnd, boundaryStart, lineNum, hasFunctionSig, lineWithoutComments, defaultParamPattern) {
  if (paramListEnd === boundaryStart && lineNum === boundaryStart && hasFunctionSig) {
    const hasDefaultParams = defaultParamPattern.test(lineWithoutComments);
    if (hasDefaultParams) {
      return boundaryStart + 1;
    }
  }
  return null;
}

/**
 * Applies fallback 2: Check if => is on a later line
 * @param {number} paramListEnd - Current paramListEnd
 * @param {number} boundaryStart - Function boundary start
 * @param {number} lineNum - Current line number
 * @param {number} index - Current line index
 * @param {Array} lines - All lines of source code
 * @param {string} lineWithoutComments - Current line without comments
 * @param {RegExp} defaultParamPattern - Pattern to match default parameters
 * @returns {number|null} Updated paramListEnd or null
 */
export function applyFallback2ArrowOnLaterLine(paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, defaultParamPattern) {
  if (paramListEnd === boundaryStart && lineNum >= boundaryStart) {
    const hasDefaultParams = defaultParamPattern.test(lineWithoutComments);
    if (hasDefaultParams) {
      const arrowLine = findArrowOnSubsequentLines(index, lines, 5);
      if (arrowLine !== null) {
        return arrowLine;
      }
    }
  }
  return null;
}

/**
 * Applies fallback 3: Has opening paren and default params, look ahead for =>
 * @param {number} paramListEnd - Current paramListEnd
 * @param {number} boundaryStart - Function boundary start
 * @param {number} lineNum - Current line number
 * @param {number} index - Current line index
 * @param {Array} lines - All lines of source code
 * @param {string} lineWithoutComments - Current line without comments
 * @param {RegExp} defaultParamPattern - Pattern to match default parameters
 * @returns {number|null} Updated paramListEnd or null
 */
export function applyFallback3OpeningParen(paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, defaultParamPattern) {
  if (paramListEnd === boundaryStart && lineNum >= boundaryStart) {
    const hasOpeningParen = lineWithoutComments.includes('(');
    const hasDefaultParams = defaultParamPattern.test(lineWithoutComments);
    if (hasOpeningParen && hasDefaultParams && !lineWithoutComments.includes('=>')) {
      const arrowLine = findArrowOnSubsequentLines(index, lines, 5);
      if (arrowLine !== null) {
        return arrowLine;
      }
    }
  }
  return null;
}

/**
 * Applies fallback logic to find parameter list end when initial detection fails
 * @param {number} paramListEnd - Current paramListEnd value
 * @param {number} boundaryStart - Function boundary start
 * @param {number} lineNum - Current line number
 * @param {number} index - Current line index
 * @param {Array} lines - All lines of source code
 * @param {string} lineWithoutComments - Current line without comments
 * @param {boolean} hasFunctionSig - Whether line has function signature
 * @returns {number} Updated paramListEnd
 */
export function applyParameterListEndFallbacks(paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, hasFunctionSig) {
  // Match default parameters: identifier = value (including booleans, numbers, strings, etc.)
  const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|\b(?:true|false|null|undefined)\b|\d+(?:\.\d+)?|[^=,)\s}]+)/g;
  
  // Try fallback 1
  const fallback1Result = applyFallback1FunctionDeclaration(paramListEnd, boundaryStart, lineNum, hasFunctionSig, lineWithoutComments, defaultParamPattern);
  if (fallback1Result !== null) {
    return fallback1Result;
  }
  
  // Try fallback 2
  const fallback2Result = applyFallback2ArrowOnLaterLine(paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, defaultParamPattern);
  if (fallback2Result !== null) {
    return fallback2Result;
  }
  
  // Try fallback 3
  const fallback3Result = applyFallback3OpeningParen(paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, defaultParamPattern);
  if (fallback3Result !== null) {
    return fallback3Result;
  }
  
  return paramListEnd;
}

/**
 * Detects if this is a multi-line arrow function parameter
 * @param {string} lineWithoutComments - Current line without comments
 * @param {number} index - Current line index
 * @param {Array} lines - All lines of source code
 * @returns {boolean} Whether this is a multi-line arrow function parameter
 */
export function detectMultiLineArrowParameter(lineWithoutComments, index, lines) {
  // Check for default parameters including booleans, numbers, strings, etc.
  const hasDefaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|\b(?:true|false|null|undefined)\b|\d+(?:\.\d+)?|[^=,)\s}]+)/.test(lineWithoutComments);
  const hasOpeningParen = lineWithoutComments.includes('(');
  const hasArrowOnLaterLine = index + 1 < lines.length && 
                              lines[index + 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').includes('=>');
  return hasDefaultParamPattern && hasOpeningParen && hasArrowOnLaterLine && !lineWithoutComments.includes('=>');
}

/**
 * Extracts parameter list from variable assignment with arrow function
 * @param {string} beforeArrow - Text before => operator
 * @returns {string|null} Parameter list string or null if not found
 */
export function extractParamListFromVariableAssignment(beforeArrow) {
  const openParenIndex = beforeArrow.lastIndexOf('(');
  if (openParenIndex < 0) return null;
  
  let depth = 1;
  let paramStart = openParenIndex + 1;
  let paramEnd = -1;
  for (let i = openParenIndex + 1; i < beforeArrow.length; i++) {
    if (beforeArrow[i] === '(') depth++;
    else if (beforeArrow[i] === ')') {
      depth--;
      if (depth === 0) {
        paramEnd = i;
        break;
      }
    }
  }
  
  if (paramEnd > paramStart) {
    return beforeArrow.substring(paramStart, paramEnd);
  }
  return null;
}

/**
 * Matches default parameters in arrow function parameter list
 * @param {string} lineWithoutComments - Line without comments
 * @param {string} beforeArrow - Text before => operator
 * @param {RegExp} defaultParamPattern - Pattern to match default parameters
 * @returns {Array} Array of matched default parameters
 */
export function matchArrowFunctionDefaultParams(lineWithoutComments, beforeArrow, defaultParamPattern) {
  const isVariableAssignment = /^\s*(const|let|var)\s+\w+\s*=/.test(lineWithoutComments);
  if (isVariableAssignment) {
    const paramList = extractParamListFromVariableAssignment(beforeArrow);
    if (paramList) {
      const matches = paramList.match(defaultParamPattern);
      return matches || [];
    }
    return [];
  }
  
  const matches = beforeArrow.match(defaultParamPattern);
  return matches || [];
}

/**
 * Matches default parameters on a line
 * @param {string} lineWithoutComments - Line without comments
 * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
 * @param {number} arrowIndex - Index of => if arrow function
 * @returns {Array} Array of matched default parameters
 */
export function matchDefaultParameters(lineWithoutComments, isArrowFunctionParam, arrowIndex) {
  // Match default parameters: identifier = value
  // Values can be: strings ("...", '...', `...`), booleans (true, false), numbers, or other expressions
  const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|\b(?:true|false|null|undefined)\b|\d+(?:\.\d+)?|[^=,)\s}]+)/g;
  
  if (isArrowFunctionParam) {
    const beforeArrow = lineWithoutComments.substring(0, arrowIndex);
    return matchArrowFunctionDefaultParams(lineWithoutComments, beforeArrow, defaultParamPattern);
  }
  
  const matches = lineWithoutComments.match(defaultParamPattern);
  return matches || [];
}

/**
 * Handles arrow function detection for parameter list end
 * @param {string} checkLine - Line to check
 * @param {number} lineNum - Current line number
 * @param {number} checkLineNum - Line number being checked (1-based)
 * @param {string} lineWithoutComments - Current line without comments
 * @returns {number|null} Parameter list end line or null if not found
 */
export function handleArrowFunctionDetection(checkLine, lineNum, checkLineNum, lineWithoutComments) {
  if (!checkLine.includes('=>')) {
    return null;
  }
  
  // arrowIndex calculated but not used in this branch
  if (lineNum === checkLineNum) {
    // Current line is the line with =>, check if we're before it
    if (lineWithoutComments.indexOf('=>') === -1 || lineWithoutComments.indexOf('=') < lineWithoutComments.indexOf('=>')) {
      return checkLineNum + 1; // Parameter list includes this line
    } else {
      return checkLineNum; // Parameter list ends before =>
    }
  } else if (lineNum < checkLineNum) {
    // Current line is before the line with =>, so it's in parameter list
    return checkLineNum + 1; // Include the line with =>
  }
  
  return null;
}

/**
 * Updates state when encountering an opening parenthesis
 * @param {Object} state - Current state
 * @returns {Object} Updated state
 */
export function handleOpeningParen(state) {
  return {
    ...state,
    parenDepth: state.parenDepth + 1,
    foundParamStart: true
  };
}

/**
 * Updates state when encountering a closing parenthesis
 * @param {Object} state - Current state
 * @returns {Object} Updated state
 */
export function handleClosingParen(state) {
  const newParenDepth = state.parenDepth - 1;
  const foundClosingParen = newParenDepth === 0 && state.foundParamStart;
  return {
    ...state,
    parenDepth: newParenDepth,
    foundClosingParen
  };
}

/**
 * Handles opening brace and checks if parameter list ends
 * @param {string} checkLine - Line to check
 * @param {number} checkLineNum - Line number being checked
 * @param {number} boundaryStart - Function boundary start
 * @param {Object} state - Current state
 * @returns {number|Object} Parameter list end line or updated state
 */
export function handleOpeningBrace(checkLine, checkLineNum, boundaryStart, state) {
  if (state.foundClosingParen && state.parenDepth === 0 && checkLine.includes('function')) {
    return checkLineNum === boundaryStart ? checkLineNum + 1 : checkLineNum;
  }
  if (!state.foundClosingParen || state.parenDepth > 0) {
    return {
      ...state,
      braceDepth: state.braceDepth + 1
    };
  }
  return state;
}

/**
 * Tracks parentheses and braces to find parameter list boundaries
 * @param {string} checkLine - Line to check
 * @param {number} checkLineNum - Line number being checked (1-based)
 * @param {number} boundaryStart - Function boundary start
 * @param {Object} state - Current state (parenDepth, braceDepth, foundParamStart, foundClosingParen)
 * @returns {number|Object} Parameter list end line or updated state
 */
export function trackParameterListBoundaries(checkLine, checkLineNum, boundaryStart, state) {
  let currentState = { ...state };
  
  for (let j = 0; j < checkLine.length; j++) {
    const char = checkLine[j];
    
    if (char === '(') {
      currentState = handleOpeningParen(currentState);
    } else if (char === ')') {
      currentState = handleClosingParen(currentState);
    } else if (char === '{') {
      const braceResult = handleOpeningBrace(checkLine, checkLineNum, boundaryStart, currentState);
      if (typeof braceResult === 'number') {
        return braceResult;
      }
      currentState = braceResult;
    } else if (char === '}') {
      currentState = {
        ...currentState,
        braceDepth: currentState.braceDepth - 1
      };
    }
    
    // Check if we've found the closing paren after processing this character
    // For destructured parameters like }: Type), we need parenDepth = 0 and braceDepth = 0
    if (currentState.foundClosingParen && currentState.parenDepth === 0 && currentState.braceDepth === 0) {
      return checkLineNum;
    }
  }
  
  // Return updated state so it can be used in next iteration
  return currentState;
}

/**
 * Handles special case for function body on same line
 * @param {number} lineNum - Current line number
 * @param {number} boundaryStart - Function boundary start
 * @param {number} paramListEnd - Current paramListEnd value
 * @param {string} lineWithoutComments - Current line without comments
 * @returns {number} Updated paramListEnd
 */
export function handleFunctionBodyOnSameLine(lineNum, boundaryStart, paramListEnd, lineWithoutComments) {
  if (lineNum !== boundaryStart) {
    return paramListEnd;
  }
  
  const hasFunctionBodyOnSameLine = lineWithoutComments.includes('{') && 
                                   lineWithoutComments.includes('function') &&
                                   /\)\s*\{/.test(lineWithoutComments);
  if (hasFunctionBodyOnSameLine) {
    return boundaryStart + 1;
  } else if (paramListEnd === boundaryStart) {
    return boundaryStart + 1;
  }
  
  return paramListEnd;
}

/**
 * Finds where the parameter list ends for a function
 * @param {number} lineNum - Current line number
 * @param {number} boundaryStart - Function boundary start
 * @param {Array} lines - All lines of source code
 * @param {string} lineWithoutComments - Current line without comments
 * @returns {number} Line number where parameter list ends
 */
export function findParameterListEnd(lineNum, boundaryStart, lines, lineWithoutComments) {
  let paramListEnd = boundaryStart;
  let state = {
    parenDepth: 0,
    braceDepth: 0,
    foundParamStart: false,
    foundClosingParen: false
  };
  
  for (let i = boundaryStart - 1; i < Math.min(boundaryStart + 20, lines.length); i++) {
    if (i < 0) continue;
    const checkLine = lines[i].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '');
    const checkLineNum = i + 1;
    
    // Check for arrow function
    const arrowResult = handleArrowFunctionDetection(checkLine, lineNum, checkLineNum, lineWithoutComments);
    if (arrowResult !== null) {
      return arrowResult;
    }
    
    // Track parameter list boundaries
    const boundaryResult = trackParameterListBoundaries(checkLine, checkLineNum, boundaryStart, state);
    if (typeof boundaryResult === 'number') {
      return boundaryResult;
    }
    // Update state with the returned state object (always an object, never null)
    state = boundaryResult;
  }
  
  // Handle special case for function body on same line
  return handleFunctionBodyOnSameLine(lineNum, boundaryStart, paramListEnd, lineWithoutComments);
}

/**
 * Checks if a line has a function signature pattern
 * @param {string} lineWithoutComments - Line without comments
 * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
 * @returns {boolean} Whether this line has a function signature
 */
export function hasFunctionSignature(lineWithoutComments, isArrowFunctionParam) {
  return /^\s*(?:export\s+)?(?:function|const|let|var)\s+\w+\s*[=(]/.test(lineWithoutComments) ||
         /^\s*\([^)]*/.test(lineWithoutComments) ||
         /=>\s*\([^)]*/.test(lineWithoutComments) ||
         /\.\w+\s*\([^)]*/.test(lineWithoutComments) ||
         /\([^)]*\{[^}]*\}/.test(lineWithoutComments) ||
         (isArrowFunctionParam && /\(/.test(lineWithoutComments));
}

/**
 * Checks if current line has JSX tag or expression
 * @param {string} lineWithoutComments - Current line without comments
 * @returns {boolean} Whether line has JSX tag or expression
 */
export function hasJSXOnCurrentLine(lineWithoutComments) {
  const hasJSXExpression = /\{[^}]*\}/.test(lineWithoutComments);
  const hasJSXTag = /<[A-Za-z]/.test(lineWithoutComments) || /<\/[A-Za-z]/.test(lineWithoutComments) || /\/>/.test(lineWithoutComments);
  return hasJSXExpression || hasJSXTag;
}

/**
 * Checks if a previous line indicates we're in JSX context
 * @param {number} index - Current line index (0-based)
 * @param {Array} lines - All lines of source code
 * @returns {boolean} Whether previous lines indicate JSX context
 */
export function hasJSXInPreviousLines(index, lines) {
  for (let i = index - 1; i >= Math.max(0, index - 10); i--) {
    const prevLine = lines[i].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '');
    
    // If we find a closing tag, we're not in JSX context
    if (/\/>/.test(prevLine) || /<\/[A-Za-z]/.test(prevLine)) {
      return false;
    }
    
    // If we find an opening tag, we're in JSX context
    if (/<[A-Za-z]/.test(prevLine)) {
      return true;
    }
    
    // If we hit a line that's clearly not JSX (like a function declaration or return statement), stop
    if (/^\s*(function|const|let|var|return|if|for|while)\s/.test(prevLine)) {
      return false;
    }
  }
  return false;
}

/**
 * Checks if a line is a JSX attribute by looking at current and previous lines
 * @param {string} lineWithoutComments - Current line without comments
 * @param {number} index - Current line index (0-based)
 * @param {Array} lines - All lines of source code
 * @returns {boolean} Whether this line is a JSX attribute
 */
export function isJSXAttributeLine(lineWithoutComments, index, lines) {
  // Check for JSX attribute pattern: identifier = "value" or identifier = {expression}
  const hasJSXAttributePattern = /^\s*\w+\s*=\s*["'{]/.test(lineWithoutComments) || /\s+\w+\s*=\s*["'{]/.test(lineWithoutComments);
  if (!hasJSXAttributePattern) return false;
  
  // Check current line for JSX tag or expression
  if (hasJSXOnCurrentLine(lineWithoutComments)) return true;
  
  // Check previous lines (up to 10 lines back) for JSX tags
  return hasJSXInPreviousLines(index, lines);
}

/**
 * Checks if line is a TypeScript type or interface definition
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a type definition
 */
export function isTypeDefinition(lineWithoutComments) {
  return /^\s*(type|interface)\s+\w+/.test(lineWithoutComments);
}

/**
 * Checks if line is a const/let/var assignment (not function)
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a variable assignment
 */
export function isConstLetVarAssignment(lineWithoutComments) {
  return /^\s*(const|let|var)\s+\w+\s*=\s*[^(]/.test(lineWithoutComments) &&
         !/^\s*(const|let|var)\s+\w+\s*=\s*\(/.test(lineWithoutComments);
}

/**
 * Checks if line is an arrow function assignment
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is an arrow function assignment
 */
export function isArrowFunctionAssignment(lineWithoutComments) {
  return /^\s*(const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(lineWithoutComments) ||
         /^\s*(const|let|var)\s+\w+\s*=\s*[^=]+\s*=>/.test(lineWithoutComments);
}

/**
 * Checks if line is a regular assignment (not parameter list)
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a regular assignment
 */
export function isRegularAssignment(lineWithoutComments) {
  const endsWithComma = /,\s*$/.test(lineWithoutComments.trim());
  const hasBraces = /[{}]/.test(lineWithoutComments);
  return /^\s*\w+\s*=\s*\w+/.test(lineWithoutComments) && 
         !lineWithoutComments.match(/\([^)]*=/) && 
         !endsWithComma && 
         !hasBraces;
}

/**
 * Checks if line is a JSX attribute (with fallback for single-line check)
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} index - Current line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional)
 * @returns {boolean} Whether line is a JSX attribute
 */
export function checkJSXAttribute(lineWithoutComments, index, lines) {
  if (index >= 0 && lines.length > 0) {
    return isJSXAttributeLine(lineWithoutComments, index, lines);
  }
  // Fallback for single-line check (backward compatibility)
  const hasJSXExpression = /\{[^}]*\}/.test(lineWithoutComments);
  const hasJSXTag = /<[A-Za-z]/.test(lineWithoutComments) || /<\/[A-Za-z]/.test(lineWithoutComments) || /\/>/.test(lineWithoutComments);
  const hasJSXAttributePattern = /^\s*\w+\s*=\s*["'{]/.test(lineWithoutComments) || /\s+\w+\s*=\s*["'{]/.test(lineWithoutComments);
  return (hasJSXExpression || hasJSXTag) && hasJSXAttributePattern;
}

/**
 * Checks if line is a method call (not arrow function)
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a method call
 */
export function isMethodCall(lineWithoutComments) {
  return /\w+\.\w+\s*\(/.test(lineWithoutComments) && !lineWithoutComments.includes('=>');
}

/**
 * Checks if line is a property assignment
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a property assignment
 */
export function isPropertyAssignment(lineWithoutComments) {
  return /^\s*\w+(\.\w+)+\s*=/.test(lineWithoutComments);
}

/**
 * Checks if line is a dependency array pattern
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a dependency array
 */
export function isDependencyArrayPattern(lineWithoutComments) {
  return /}\s*,\s*\[/.test(lineWithoutComments);
}

/**
 * Checks if line is a return statement
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line is a return statement
 */
export function isReturnStatement(lineWithoutComments) {
  return /^\s*return\s+/.test(lineWithoutComments);
}

/**
 * Checks all exclusion conditions for default parameter context
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} index - Current line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional)
 * @returns {boolean} Whether any exclusion condition matches
 */
export function hasExclusionCondition(lineWithoutComments, index, lines) {
  return isTypeDefinition(lineWithoutComments) ||
         isConstLetVarAssignment(lineWithoutComments) ||
         isArrowFunctionAssignment(lineWithoutComments) ||
         isReturnStatement(lineWithoutComments) ||
         isMethodCall(lineWithoutComments) ||
         isRegularAssignment(lineWithoutComments) ||
         isPropertyAssignment(lineWithoutComments) ||
         isDependencyArrayPattern(lineWithoutComments) ||
         checkJSXAttribute(lineWithoutComments, index, lines);
}

/**
 * Validates if a default parameter context is valid (not a regular assignment)
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} index - Current line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional, for JSX detection)
 * @returns {boolean} Whether the context is valid for default parameters
 */
export function isValidDefaultParameterContext(lineWithoutComments, index = -1, lines = []) {
  return !hasExclusionCondition(lineWithoutComments, index, lines);
}

/**
 * Processes default parameter matches and adds them to decision points
 * @param {Array} defaultParamMatches - Matched default parameters
 * @param {number} lineNum - Line number
 * @param {number} functionLine - Function line to assign to
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function processDefaultParameterMatches(defaultParamMatches, lineNum, functionLine, decisionPoints) {
  defaultParamMatches.forEach(() => {
    decisionPoints.push({ line: lineNum, type: 'default parameter', name: 'default parameter', functionLine });
  });
}

/**
 * Finds parameter boundaries for arrow function with parentheses
 * @param {string} beforeArrow - Text before => operator
 * @param {number} openParenIndex - Index of opening parenthesis
 * @returns {Object} { paramStart, paramEnd } or { paramStart: -1, paramEnd: -1 } if not found
 */
export function findParamBoundariesWithParens(beforeArrow, openParenIndex) {
  let paramStart = openParenIndex + 1;
  let depth = 1;
  for (let i = openParenIndex + 1; i < beforeArrow.length; i++) {
    if (beforeArrow[i] === '(') depth++;
    else if (beforeArrow[i] === ')') {
      depth--;
      if (depth === 0) {
        return { paramStart, paramEnd: i };
      }
    }
  }
  return { paramStart: -1, paramEnd: -1 };
}

/**
 * Finds parameter boundaries for destructured parameter
 * @param {string} trimmed - Trimmed text before => operator
 * @returns {Object} { paramStart, paramEnd } or { paramStart: -1, paramEnd: -1 } if not found
 */
export function findDestructuredParamBoundaries(trimmed) {
  let depth = 1;
  for (let i = 1; i < trimmed.length; i++) {
    if (trimmed[i] === '{') depth++;
    else if (trimmed[i] === '}') {
      depth--;
      if (depth === 0) {
        return { paramStart: 0, paramEnd: i + 1 };
      }
    }
  }
  return { paramStart: -1, paramEnd: -1 };
}

/**
 * Extracts parameter boundaries from arrow function
 * @param {string} beforeArrow - Text before => operator
 * @returns {Object} { paramStart, paramEnd }
 */
export function extractArrowFunctionParamBoundaries(beforeArrow) {
  const openParenIndex = beforeArrow.lastIndexOf('(');
  if (openParenIndex >= 0) {
    return findParamBoundariesWithParens(beforeArrow, openParenIndex);
  }
  
  // No parentheses - single parameter: param => or { destructured } =>
  const trimmed = beforeArrow.trim();
  if (trimmed.startsWith('{')) {
    return findDestructuredParamBoundaries(trimmed);
  }
  
  // Single parameter - entire beforeArrow is the parameter
  return { paramStart: 0, paramEnd: beforeArrow.length };
}

/**
 * Validates context for arrow function default parameters (excludes regular assignments but allows arrow functions)
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} index - Current line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional)
 * @returns {boolean} Whether the context is valid for default parameters
 */
export function isValidArrowFunctionDefaultParameterContext(lineWithoutComments, index, lines) {
  if (isTypeDefinition(lineWithoutComments)) return false;
  if (/^\s*return\s+/.test(lineWithoutComments)) return false;
  if (/\w+\.\w+\s*\(/.test(lineWithoutComments) && !lineWithoutComments.includes('=>')) return false;
  if (isRegularAssignment(lineWithoutComments)) return false;
  if (/^\s*\w+(\.\w+)+\s*=/.test(lineWithoutComments)) return false;
  if (/}\s*,\s*\[/.test(lineWithoutComments)) return false;
  if (checkJSXAttribute(lineWithoutComments, index, lines)) return false;
  
  return true;
}

/**
 * Processes default parameters in arrow function parameter list
 * @param {string} lineWithoutComments - Line without comments
 * @param {string} paramList - Parameter list string
 * @param {number} lineNum - Line number
 * @param {number} actualFunctionLine - Function line for arrow function
 * @param {number} index - Current line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional)
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function processArrowFunctionDefaultParams(lineWithoutComments, paramList, lineNum, actualFunctionLine, index, lines, decisionPoints) {
  const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|\b(?:true|false|null|undefined)\b|\d+(?:\.\d+)?|[^=,)\s}]+)/g;
  const defaultParamMatches = paramList.match(defaultParamPattern);
  
  if (defaultParamMatches && defaultParamMatches.length > 0) {
    if (isValidArrowFunctionDefaultParameterContext(lineWithoutComments, index, lines)) {
      processDefaultParameterMatches(defaultParamMatches, lineNum, actualFunctionLine, decisionPoints);
    }
  }
}

/**
 * Handles arrow function default parameters
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} arrowIndex - Index of => operator
 * @param {number} lineNum - Line number
 * @param {number} actualFunctionLine - Function line for arrow function
 * @param {Array} decisionPoints - Array to push decision points to
 * @param {number} index - Current line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional)
 */
export function handleArrowFunctionDefaultParams(lineWithoutComments, arrowIndex, lineNum, actualFunctionLine, decisionPoints, index = -1, lines = []) {
  const beforeArrow = lineWithoutComments.substring(0, arrowIndex);
  const { paramStart, paramEnd } = extractArrowFunctionParamBoundaries(beforeArrow);
  
  // Only check for default parameters within the parameter list
  // Skip if this looks like a variable assignment (const x = ... =>)
  const isVariableAssignment = /^\s*(const|let|var)\s+\w+\s*=/.test(lineWithoutComments);
  if (isVariableAssignment && (paramStart < 0 || paramEnd <= paramStart)) {
    return; // No parameter list found, skip
  }
  
  if (paramStart >= 0 && paramEnd > paramStart) {
    const paramList = beforeArrow.substring(paramStart, paramEnd);
    processArrowFunctionDefaultParams(lineWithoutComments, paramList, lineNum, actualFunctionLine, index, lines, decisionPoints);
  }
}

/**
 * Determines if we should check for default parameters
 * @param {boolean} isInParameterList - Whether we're in a parameter list
 * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
 * @param {boolean} hasFunctionSig - Whether line has function signature
 * @param {number} lineNum - Line number
 * @param {number} boundaryStart - Function boundary start
 * @param {boolean} isMultiLineArrowParam - Whether this is a multi-line arrow parameter
 * @returns {boolean} Whether to check for defaults
 */
export function shouldCheckForDefaultParameters(isInParameterList, isArrowFunctionParam, hasFunctionSig, lineNum, boundaryStart, isMultiLineArrowParam) {
  return isInParameterList || 
         isArrowFunctionParam || 
         (hasFunctionSig && lineNum === boundaryStart) || 
         isMultiLineArrowParam;
}

/**
 * Processes default parameter matches based on context
 * @param {Array} defaultParamMatches - Matched default parameters
 * @param {number} lineNum - Line number
 * @param {boolean} isMultiLineArrowParam - Whether this is a multi-line arrow parameter
 * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
 * @param {number} actualFunctionLine - Function line for arrow function
 * @param {boolean} isInParameterList - Whether we're in a parameter list
 * @param {boolean} hasFunctionSig - Whether line has function signature
 * @param {number} boundaryStart - Function boundary start
 * @param {number} functionLine - Default function line
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function processDefaultParameterMatchesByContext(defaultParamMatches, lineNum, isMultiLineArrowParam, isArrowFunctionParam, actualFunctionLine, isInParameterList, hasFunctionSig, boundaryStart, functionLine, decisionPoints) {
  if (isMultiLineArrowParam) {
    processDefaultParameterMatches(defaultParamMatches, lineNum, functionLine, decisionPoints);
  } else if (isArrowFunctionParam) {
    processDefaultParameterMatches(defaultParamMatches, lineNum, actualFunctionLine, decisionPoints);
  } else if (isInParameterList || (hasFunctionSig && lineNum === boundaryStart)) {
    processDefaultParameterMatches(defaultParamMatches, lineNum, functionLine, decisionPoints);
  }
}

/**
 * Checks if line is a dependency array (React hooks pattern)
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} index - Current line index (0-based)
 * @param {Array} lines - All lines of source code
 * @returns {boolean} Whether line is a dependency array
 */
export function isDependencyArray(lineWithoutComments, index, lines) {
  if (/}\s*,\s*\[/.test(lineWithoutComments)) return true;
  if (index > 0) {
    const prevLine = lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '');
    return /}\s*,\s*$/.test(prevLine) && /^\s*\[/.test(lineWithoutComments);
  }
  return false;
}

/**
 * Determines if default parameters should be processed for this line
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} lineNum - Line number
 * @param {number} index - Current line index (0-based)
 * @param {Array} lines - All lines of source code
 * @param {Object} boundary - Function boundary object
 * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
 * @param {boolean} hasFunctionSig - Whether line has function signature
 * @param {number} paramListEnd - End of parameter list
 * @returns {boolean} Whether to process default parameters
 */
export function shouldProcessDefaultParameters(lineWithoutComments, lineNum, index, lines, boundary, isArrowFunctionParam, hasFunctionSig, paramListEnd) {
  const isInParameterList = lineNum >= boundary.start && lineNum < paramListEnd;
  const isMultiLineArrowParam = detectMultiLineArrowParameter(lineWithoutComments, index, lines);
  
  if (isDependencyArray(lineWithoutComments, index, lines)) return false;
  
  return shouldCheckForDefaultParameters(isInParameterList, isArrowFunctionParam, hasFunctionSig, lineNum, boundary.start, isMultiLineArrowParam);
}

/**
 * Processes default parameters for non-arrow functions
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} lineNum - Line number
 * @param {number} index - Current line index (0-based)
 * @param {Array} lines - All lines of source code
 * @param {number} arrowIndex - Index of => operator
 * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
 * @param {Object} boundary - Function boundary object
 * @param {boolean} hasFunctionSig - Whether line has function signature
 * @param {number} paramListEnd - End of parameter list
 * @param {number} functionLine - Function line to assign decision points to
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function processNonArrowDefaultParameters(lineWithoutComments, lineNum, index, lines, arrowIndex, isArrowFunctionParam, boundary, hasFunctionSig, paramListEnd, functionLine, decisionPoints) {
  const defaultParamMatches = matchDefaultParameters(lineWithoutComments, isArrowFunctionParam, arrowIndex);
  if (defaultParamMatches.length === 0) return;
  
  const isJSXAttribute = isJSXAttributeLine(lineWithoutComments, index, lines);
  const isOnFunctionSignature = hasFunctionSig && lineNum === boundary.start;
  const isInParameterList = lineNum >= boundary.start && lineNum < paramListEnd;
  const isJSXAttributeOutsideParams = !isInParameterList && !isOnFunctionSignature && isJSXAttribute;
  
  if (isJSXAttributeOutsideParams) return;
  
  const shouldValidateContext = !isOnFunctionSignature;
  if (shouldValidateContext && !isValidDefaultParameterContext(lineWithoutComments, index, lines)) return;
  
  const isMultiLineArrowParam = detectMultiLineArrowParameter(lineWithoutComments, index, lines);
  processDefaultParameterMatchesByContext(
    defaultParamMatches,
    lineNum,
    isMultiLineArrowParam,
    isArrowFunctionParam,
    functionLine,
    isInParameterList,
    hasFunctionSig,
    boundary.start,
    functionLine,
    decisionPoints
  );
}

/**
 * Parses default parameters in function signatures and destructured assignments
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} lineNum - Line number
 * @param {number} index - Line index (0-based)
 * @param {Array} lines - All lines of source code
 * @param {number} functionLine - Function line to assign decision points to
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Function} getInnermostFunction - Function to get innermost function for a line
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function parseDefaultParameters(lineWithoutComments, lineNum, index, lines, functionLine, functionBoundaries, getInnermostFunction, decisionPoints) {
  const hasArrowFunction = lineWithoutComments.includes('=>');
  const arrowIndex = hasArrowFunction ? lineWithoutComments.indexOf('=>') : -1;
  const isArrowFunctionParam = hasArrowFunction && arrowIndex > 0;
  
  // Determine which function's boundary to use
  let actualFunctionLine = functionLine;
  let boundary = functionBoundaries.get(functionLine);
  
  if (isArrowFunctionParam) {
    const callbackInfo = findCallbackFunctionLine(lineNum, functionLine, functionBoundaries, getInnermostFunction);
    actualFunctionLine = callbackInfo.actualFunctionLine;
    boundary = callbackInfo.boundary;
    
    // Handle arrow function default parameters directly
    handleArrowFunctionDefaultParams(lineWithoutComments, arrowIndex, lineNum, actualFunctionLine, decisionPoints, index, lines);
  }
  
  if (!boundary) return;
  
  const hasFunctionSig = hasFunctionSignature(lineWithoutComments, isArrowFunctionParam);
  let paramListEnd = findParameterListEnd(lineNum, boundary.start, lines, lineWithoutComments);
  paramListEnd = applyParameterListEndFallbacks(
    paramListEnd,
    boundary.start,
    lineNum,
    index,
    lines,
    lineWithoutComments,
    hasFunctionSig
  );
  
  if (shouldProcessDefaultParameters(lineWithoutComments, lineNum, index, lines, boundary, isArrowFunctionParam, hasFunctionSig, paramListEnd)) {
    processNonArrowDefaultParameters(
      lineWithoutComments,
      lineNum,
      index,
      lines,
      arrowIndex,
      isArrowFunctionParam,
      boundary,
      hasFunctionSig,
      paramListEnd,
      functionLine,
      decisionPoints
    );
  }
}

/**
 * Checks if we're in a destructured assignment by looking backwards
 * @param {string} lineWithoutComments - Current line without comments
 * @param {number} index - Current line index
 * @param {number} lineNum - Current line number
 * @param {Array} lines - All lines of source code
 * @param {Object} boundary - Function boundary
 * @returns {boolean} Whether we're in a destructured assignment
 */
export function isInDestructuredAssignment(lineWithoutComments, index, lineNum, lines, boundary) {
  // Check if current line starts destructuring
  if (/^\s*(const|let|var)\s+\{/.test(lineWithoutComments)) {
    return true;
  }
  
  // Look backwards up to 10 lines to find destructuring start
  for (let lookBack = 1; lookBack <= 10 && index - lookBack >= 0; lookBack++) {
    const prevLine = lines[index - lookBack].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
    
    // Check if previous line starts destructuring
    if (/^\s*(const|let|var)\s+\{/.test(prevLine)) {
      return true;
    }
    
    // Stop if we hit a closing brace followed by = (end of destructuring: } = obj)
    if (prevLine.includes('}') && prevLine.includes('=')) {
      break;
    }
    
    // Stop if we hit a semicolon (end of statement)
    if (prevLine.endsWith(';')) {
      break;
    }
    
    // Stop if we're past the function start
    const prevLineNum = lineNum - lookBack;
    if (prevLineNum < boundary.start) {
      break;
    }
  }
  
  return false;
}

/**
 * Parses destructured assignments with default values in function bodies
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} lineNum - Line number
 * @param {number} index - Line index (0-based)
 * @param {Array} lines - All lines of source code
 * @param {number} functionLine - Function line to assign decision points to
 * @param {Object|null} boundary - Function boundary or null
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function parseDestructuredAssignments(lineWithoutComments, lineNum, index, lines, functionLine, boundary, decisionPoints) {
  // Only check if this is near the start of the function (first 15 lines)
  if (!boundary || lineNum < boundary.start || lineNum > boundary.start + 15) {
    return;
  }
  
  // Check if this line has a default parameter pattern (prop = value)
  // Include booleans, numbers, strings, etc.
  const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?![=<>])(?:"[^"]*"|'[^']*'|`[^`]*`|\b(?:true|false|null|undefined)\b|\d+(?:\.\d+)?|[^=,}\s]+)/g;
  const hasDefaultParam = defaultParamPattern.test(lineWithoutComments);
  
  if (!hasDefaultParam) {
    return;
  }
  
  // Check if we're in a destructured assignment
  const inDestructuredAssignment = isInDestructuredAssignment(lineWithoutComments, index, lineNum, lines, boundary);
  
  // EXCLUDE regular const/let/var assignments that are NOT destructuring
  const isRegularAssignment = /^\s*(const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*(?!\{)/.test(lineWithoutComments);
  
  if (inDestructuredAssignment && !isRegularAssignment) {
    // Match all default parameters on this line
    const defaultParamMatches = lineWithoutComments.match(defaultParamPattern);
    if (defaultParamMatches && defaultParamMatches.length > 0) {
      // Count each default parameter in the destructured assignment
      defaultParamMatches.forEach(() => {
        decisionPoints.push({ line: lineNum, type: 'default parameter', name: 'default parameter', functionLine });
      });
    }
  }
}
