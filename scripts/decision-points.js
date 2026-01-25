/**
 * Parses decision points from source code
 * @param {string} sourceCode - Full source code
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Array} functions - Array of function objects (optional, for future use)
 * @returns {Array} Array of decision points: { line, type, name, functionLine }
 */
export function parseDecisionPoints(sourceCode, functionBoundaries, functions = []) {
  const decisionPoints = [];
  const lines = sourceCode.split('\n');
  
  // Create a reverse map: line number -> array of function lines that contain it
  // We'll assign decision points to the innermost function
  const lineToFunctions = new Map();
  functionBoundaries.forEach((boundary, functionLine) => {
    for (let line = boundary.start; line <= boundary.end; line++) {
      if (!lineToFunctions.has(line)) {
        lineToFunctions.set(line, []);
      }
      lineToFunctions.get(line).push({ functionLine, boundary });
    }
  });
  
  // Helper functions for finding innermost function
  
  /**
   * Filters functions to only those that actually contain the line
   * @param {Array} containingFunctions - Array of functions
   * @param {number} lineNum - Line number
   * @returns {Array} Valid functions that contain the line
   */
  const getValidFunctions = (containingFunctions, lineNum) => {
    return containingFunctions.filter(f => 
      f.boundary.start <= lineNum && lineNum <= f.boundary.end
    );
  };
  
  /**
   * Finds the immediate parent function
   * @param {Array} sortedFunctions - Functions sorted by start line
   * @param {number} lineNum - Line number
   * @returns {Object|null} Immediate parent function or null
   */
  const findImmediateParent = (sortedFunctions, lineNum) => {
    return sortedFunctions
      .filter(f => f.boundary.start < lineNum && f.boundary.end >= lineNum)
      .sort((a, b) => {
        const aSize = a.boundary.end - a.boundary.start;
        const bSize = b.boundary.end - b.boundary.start;
        if (aSize !== bSize) {
          return aSize - bSize;
        }
        return b.boundary.start - a.boundary.start;
      })[0] || null;
  };
  
  /**
   * Finds nested functions ending on or before this line
   * @param {Array} sortedFunctions - Functions sorted by start line
   * @param {Object} parentFunction - Parent function
   * @param {number} lineNum - Line number
   * @returns {Array} Nested functions ending on or before this line
   */
  const findNestedFunctionsEndingOnOrBefore = (sortedFunctions, parentFunction, lineNum) => {
    return sortedFunctions.filter(f => 
      f.boundary.end <= lineNum && 
      f.boundary.start > parentFunction.boundary.start &&
      f.boundary.start <= lineNum
    );
  };
  
  /**
   * Finds nested functions starting on this line
   * @param {Array} sortedFunctions - Functions sorted by start line
   * @param {Object} parentFunction - Parent function
   * @param {number} lineNum - Line number
   * @returns {Array} Nested functions starting on this line
   */
  const findNestedFunctionsStartingOnLine = (sortedFunctions, parentFunction, lineNum) => {
    return sortedFunctions.filter(f => 
      f.boundary.start === lineNum && f.boundary.start > parentFunction.boundary.start
    );
  };
  
  /**
   * Checks if line is inside an active nested function
   * @param {Array} sortedFunctions - Functions sorted by start line
   * @param {Object} parentFunction - Parent function
   * @param {number} lineNum - Line number
   * @returns {boolean} Whether line is inside active nested function
   */
  const isInsideActiveNestedFunction = (sortedFunctions, parentFunction, lineNum) => {
    return sortedFunctions.some(f => 
      f.boundary.start > parentFunction.boundary.start && 
      f.boundary.start < lineNum && 
      lineNum < f.boundary.end
    );
  };
  
  /**
   * Finds active nested functions
   * @param {Array} sortedFunctions - Functions sorted by start line
   * @param {Object} parentFunction - Parent function
   * @param {number} lineNum - Line number
   * @returns {Array} Active nested functions
   */
  const findActiveNestedFunctions = (sortedFunctions, parentFunction, lineNum) => {
    return sortedFunctions.filter(f => 
      f.boundary.start > parentFunction.boundary.start && 
      f.boundary.start < lineNum && 
      lineNum < f.boundary.end
    );
  };
  
  /**
   * Finds functions starting on this line
   * @param {Array} validFunctions - Valid functions
   * @param {number} lineNum - Line number
   * @returns {Array} Functions starting on this line
   */
  const findFunctionsStartingOnLine = (validFunctions, lineNum) => {
    return validFunctions.filter(f => f.boundary.start === lineNum);
  };
  
  /**
   * Finds function with smallest boundary
   * @param {Array} functions - Array of functions
   * @returns {Object} Function with smallest boundary
   */
  const findSmallestBoundaryFunction = (functions) => {
    return functions.reduce((min, f) => {
      const minSize = min.boundary.end - min.boundary.start;
      const fSize = f.boundary.end - f.boundary.start;
      if (fSize < minSize) {
        return f;
      }
      if (fSize === minSize && f.boundary.start > min.boundary.start) {
        return f;
      }
      return min;
    });
  };
  
  /**
   * Finds single-line nested functions (start === end === lineNum)
   * @param {Array} functions - Array of functions
   * @param {number} lineNum - Line number
   * @returns {Array} Single-line nested functions
   */
  const findSingleLineNestedFunctions = (functions, lineNum) => {
    return functions.filter(f => 
      f.boundary.start === lineNum && f.boundary.end === lineNum
    );
  };
  
  /**
   * Handles single-line nested functions on this line
   * @param {Array} singleLineFunctions - Single-line nested functions
   * @returns {number|null} Function line or null
   */
  const handleSingleLineNestedOnLine = (singleLineFunctions) => {
    if (singleLineFunctions.length > 0) {
      return findSmallestBoundaryFunction(singleLineFunctions).functionLine;
    }
    return null;
  };
  
  /**
   * Finds nested functions ending exactly on this line
   * @param {Array} nestedEndingOnOrBefore - Nested functions ending on or before
   * @param {number} lineNum - Line number
   * @returns {Array} Functions ending on this line
   */
  const findNestedEndingOnLine = (nestedEndingOnOrBefore, lineNum) => {
    return nestedEndingOnOrBefore.filter(f => f.boundary.end === lineNum);
  };
  
  /**
   * Finds nested functions ending before this line
   * @param {Array} nestedEndingOnOrBefore - Nested functions ending on or before
   * @param {number} lineNum - Line number
   * @returns {Array} Functions ending before this line
   */
  const findNestedEndedBefore = (nestedEndingOnOrBefore, lineNum) => {
    return nestedEndingOnOrBefore.filter(f => f.boundary.end < lineNum);
  };
  
  /**
   * Handles nested functions ending on or before this line
   * @param {Array} nestedEndingOnOrBefore - Nested functions ending on or before
   * @param {Object} parentFunction - Parent function
   * @param {number} lineNum - Line number
   * @param {boolean} isInsideActive - Whether inside active nested function
   * @returns {number|null} Function line or null
   */
  const handleNestedFunctionsEnding = (nestedEndingOnOrBefore, parentFunction, lineNum, isInsideActive) => {
    if (nestedEndingOnOrBefore.length === 0 || isInsideActive) {
      return null;
    }
    
    const nestedEndingOnLine = findNestedEndingOnLine(nestedEndingOnOrBefore, lineNum);
    const singleLineNested = findSingleLineNestedFunctions(nestedEndingOnLine, lineNum);
    
    if (singleLineNested.length > 0) {
      return findSmallestBoundaryFunction(singleLineNested).functionLine;
    }
    
    const nestedEndedBefore = findNestedEndedBefore(nestedEndingOnOrBefore, lineNum);
    if (nestedEndedBefore.length > 0) {
      return parentFunction.functionLine;
    }
    
    if (nestedEndingOnLine.length > 0) {
      return parentFunction.functionLine;
    }
    
    return parentFunction.functionLine;
  };
  
  /**
   * Handles active nested functions
   * @param {Array} activeNested - Active nested functions
   * @returns {number|null} Function line or null
   */
  const handleActiveNestedFunctions = (activeNested) => {
    if (activeNested.length > 0) {
      return findSmallestBoundaryFunction(activeNested).functionLine;
    }
    return null;
  };
  
  /**
   * Handles the case when there's only one or no containing function
   * @param {Array} containingFunctions - Array of containing functions
   * @param {Array} validFunctions - Valid functions
   * @returns {number|null} Function line or null
   */
  const handleSimpleCases = (containingFunctions, validFunctions) => {
    if (containingFunctions.length === 0) return null;
    if (containingFunctions.length === 1) return containingFunctions[0].functionLine;
    if (validFunctions.length === 0) return containingFunctions[0].functionLine;
    if (validFunctions.length === 1) return validFunctions[0].functionLine;
    return null;
  };
  
  /**
   * Handles nested functions starting on this line
   * @param {Array} nestedStartingOnLine - Nested functions starting on line
   * @param {Array} singleLineNestedOnLine - Single-line nested functions
   * @param {Object} parentFunction - Parent function
   * @returns {number|null} Function line or null
   */
  const handleNestedStartingOnLine = (nestedStartingOnLine, singleLineNestedOnLine, parentFunction) => {
    const result = handleSingleLineNestedOnLine(singleLineNestedOnLine);
    if (result !== null) return result;
    if (nestedStartingOnLine.length > 0) return parentFunction.functionLine;
    return null;
  };
  
  /**
   * Handles all nested function cases
   * @param {Array} sortedFunctions - Sorted functions
   * @param {Object} parentFunction - Parent function
   * @param {number} lineNum - Line number
   * @returns {number|null} Function line or null
   */
  const handleAllNestedCases = (sortedFunctions, parentFunction, lineNum) => {
    const nestedEndingOnOrBefore = findNestedFunctionsEndingOnOrBefore(sortedFunctions, parentFunction, lineNum);
    const isInsideActive = isInsideActiveNestedFunction(sortedFunctions, parentFunction, lineNum);
    const endingResult = handleNestedFunctionsEnding(nestedEndingOnOrBefore, parentFunction, lineNum, isInsideActive);
    if (endingResult !== null) return endingResult;
    
    const activeNested = findActiveNestedFunctions(sortedFunctions, parentFunction, lineNum);
    return handleActiveNestedFunctions(activeNested);
  };
  
  /**
   * Handles functions starting on this line or finds smallest boundary
   * @param {Array} validFunctions - Valid functions
   * @param {number} lineNum - Line number
   * @returns {number} Function line
   */
  const handleFinalCases = (validFunctions, lineNum) => {
    const functionsStartingOnLine = findFunctionsStartingOnLine(validFunctions, lineNum);
    if (functionsStartingOnLine.length > 0) {
      return findSmallestBoundaryFunction(functionsStartingOnLine).functionLine;
    }
    return findSmallestBoundaryFunction(validFunctions).functionLine;
  };
  
  // Helper function to find the innermost function for a given line
  // A function "contains" a line if: function.start <= lineNum <= function.end
  // When multiple functions contain a line, assign to the innermost (smallest boundary)
  const getInnermostFunction = (lineNum) => {
    const containingFunctions = lineToFunctions.get(lineNum) || [];
    const validFunctions = getValidFunctions(containingFunctions, lineNum);
    
    const simpleResult = handleSimpleCases(containingFunctions, validFunctions);
    if (simpleResult !== null) return simpleResult;
    
    const sortedFunctions = [...validFunctions].sort((a, b) => a.boundary.start - b.boundary.start);
    const outermostFunction = sortedFunctions[0];
    const immediateParent = findImmediateParent(sortedFunctions, lineNum);
    const parentFunction = immediateParent || outermostFunction;
    
    const nestedStartingOnLine = findNestedFunctionsStartingOnLine(sortedFunctions, parentFunction, lineNum);
    const singleLineNestedOnLine = findSingleLineNestedFunctions(nestedStartingOnLine, lineNum);
    
    const nestedResult = handleNestedStartingOnLine(nestedStartingOnLine, singleLineNestedOnLine, parentFunction);
    if (nestedResult !== null) return nestedResult;
    
    const allNestedResult = handleAllNestedCases(sortedFunctions, parentFunction, lineNum);
    if (allNestedResult !== null) return allNestedResult;
    
    return handleFinalCases(validFunctions, lineNum);
  };
  
  // Helper functions for string literal detection
  
  /**
   * Processes escape sequences in string parsing
   * @param {boolean} escapeNext - Current escape state
   * @param {string} char - Current character
   * @returns {Object} Object with updated escapeNext state and whether to skip processing
   */
  const processEscapeSequence = (escapeNext, char) => {
    if (escapeNext) {
      return { escapeNext: false, skip: true };
    }
    if (char === '\\') {
      return { escapeNext: true, skip: true };
    }
    return { escapeNext: false, skip: false };
  };
  
  /**
   * Processes template literal expression start (${)
   * @param {string} char - Current character
   * @param {string} nextChar - Next character
   * @param {boolean} inTemplateLiteral - Whether we're in a template literal
   * @param {boolean} inTemplateExpression - Whether we're in a template expression
   * @returns {Object} Updated state or null if not a template expression start
   */
  const processTemplateExpressionStart = (char, nextChar, inTemplateLiteral, inTemplateExpression) => {
    if (char === '$' && nextChar === '{' && inTemplateLiteral && !inTemplateExpression) {
      return { inTemplateExpression: true, braceDepth: 1, skipNext: true };
    }
    return null;
  };
  
  /**
   * Processes brace depth in template expressions
   * @param {string} char - Current character
   * @param {boolean} inTemplateExpression - Whether we're in a template expression
   * @param {number} braceDepth - Current brace depth
   * @returns {Object} Updated state
   */
  const processTemplateExpressionBraces = (char, inTemplateExpression, braceDepth) => {
    if (!inTemplateExpression) {
      return { inTemplateExpression: false, braceDepth, skip: false };
    }
    
    if (char === '{') {
      return { inTemplateExpression: true, braceDepth: braceDepth + 1, skip: true };
    }
    if (char === '}') {
      const newDepth = braceDepth - 1;
      return { 
        inTemplateExpression: newDepth > 0, 
        braceDepth: newDepth, 
        skip: true 
      };
    }
    
    return { inTemplateExpression: true, braceDepth, skip: true };
  };
  
  /**
   * Processes quote characters (single, double, backtick)
   * @param {string} char - Current character
   * @param {boolean} inSingleQuote - Current single quote state
   * @param {boolean} inDoubleQuote - Current double quote state
   * @param {boolean} inTemplateLiteral - Current template literal state
   * @returns {Object} Updated quote states
   */
  const processQuoteCharacters = (char, inSingleQuote, inDoubleQuote, inTemplateLiteral) => {
    if (char === "'" && !inDoubleQuote && !inTemplateLiteral) {
      return { 
        inSingleQuote: !inSingleQuote, 
        inDoubleQuote, 
        inTemplateLiteral,
        resetTemplateExpression: false
      };
    }
    if (char === '"' && !inSingleQuote && !inTemplateLiteral) {
      return { 
        inSingleQuote, 
        inDoubleQuote: !inDoubleQuote, 
        inTemplateLiteral,
        resetTemplateExpression: false
      };
    }
    if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      const newTemplateLiteral = !inTemplateLiteral;
      return { 
        inSingleQuote, 
        inDoubleQuote, 
        inTemplateLiteral: newTemplateLiteral,
        resetTemplateExpression: !newTemplateLiteral
      };
    }
    return { 
      inSingleQuote, 
      inDoubleQuote, 
      inTemplateLiteral,
      resetTemplateExpression: false
    };
  };
  
  /**
   * Processes a single character in string literal detection
   * @param {string} char - Current character
   * @param {string} nextChar - Next character
   * @param {Object} state - Current state object
   * @returns {Object} Updated state and whether to skip next character
   */
  const processCharacterForStringLiteral = (char, nextChar, state) => {
    const { inSingleQuote, inDoubleQuote, inTemplateLiteral, inTemplateExpression, braceDepth, escapeNext } = state;
    
    // Process escape sequences
    const escapeResult = processEscapeSequence(escapeNext, char);
    if (escapeResult.skip) {
      return { ...state, escapeNext: escapeResult.escapeNext, skipNext: false };
    }
    
    // Process template expression start
    const templateStart = processTemplateExpressionStart(char, nextChar, inTemplateLiteral, inTemplateExpression);
    if (templateStart) {
      return {
        ...state,
        inTemplateExpression: templateStart.inTemplateExpression,
        braceDepth: templateStart.braceDepth,
        skipNext: templateStart.skipNext
      };
    }
    
    // Process template expression braces
    const braceResult = processTemplateExpressionBraces(char, inTemplateExpression, braceDepth);
    if (braceResult.skip) {
      return {
        ...state,
        inTemplateExpression: braceResult.inTemplateExpression,
        braceDepth: braceResult.braceDepth,
        skipNext: false
      };
    }
    
    // Process quote characters
    const quoteResult = processQuoteCharacters(char, inSingleQuote, inDoubleQuote, inTemplateLiteral);
    const newState = {
      ...state,
      inSingleQuote: quoteResult.inSingleQuote,
      inDoubleQuote: quoteResult.inDoubleQuote,
      inTemplateLiteral: quoteResult.inTemplateLiteral,
      skipNext: false
    };
    
    if (quoteResult.resetTemplateExpression) {
      newState.inTemplateExpression = false;
      newState.braceDepth = 0;
    }
    
    return newState;
  };
  
  /**
   * Determines if we're inside a string literal based on state
   * @param {Object} state - Current state
   * @returns {boolean} Whether inside string literal
   */
  const isInStringLiteralFromState = (state) => {
    const { inSingleQuote, inDoubleQuote, inTemplateLiteral, inTemplateExpression } = state;
    return (inSingleQuote || inDoubleQuote) || (inTemplateLiteral && !inTemplateExpression);
  };
  
  // Helper function to check if a character at a given index is inside a string literal
  // Handles single quotes and double quotes (but NOT template literals, as they can contain expressions)
  // Template literals can contain expressions like ${condition ? a : b}, so decision points inside them should count
  const isInsideStringLiteral = (line, charIndex) => {
    let state = {
      inSingleQuote: false,
      inDoubleQuote: false,
      inTemplateLiteral: false,
      inTemplateExpression: false,
      braceDepth: 0,
      escapeNext: false
    };
    
    for (let i = 0; i < charIndex && i < line.length; i++) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      
      const result = processCharacterForStringLiteral(char, nextChar, state);
      state = result;
      
      if (result.skipNext) {
        i++; // Skip the next character (e.g., '{' in ${)
      }
    }
    
    return isInStringLiteralFromState(state);
  };
  
  // Helper function to check if a line contains a ? that's not inside a string literal
  const hasQuestionMarkOutsideString = (line) => {
    let index = 0;
    while ((index = line.indexOf('?', index)) !== -1) {
      if (!isInsideStringLiteral(line, index)) {
        return true;
      }
      index++; // Move past this ? to check for more
    }
    return false;
  };
  
  /**
   * Finds the callback function line for arrow function parameters
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Current function line
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} getInnermostFunction - Function to get innermost function for a line
   * @returns {Object} Object with actualFunctionLine and boundary
   */
  const findCallbackFunctionLine = (lineNum, functionLine, functionBoundaries, getInnermostFunction) => {
    let actualFunctionLine = functionLine;
    let boundary = functionBoundaries.get(functionLine);
    
    const callbacksOnThisLine = Array.from(functionBoundaries.entries())
      .filter(([fl, b]) => b.start === lineNum);
    
    if (callbacksOnThisLine.length > 0) {
      const callbackEntry = callbacksOnThisLine.reduce((min, [fl, b]) => {
        const minSize = min[1].end - min[1].start;
        const bSize = b.end - b.start;
        return bSize < minSize ? [fl, b] : min;
      });
      actualFunctionLine = callbackEntry[0];
      boundary = callbackEntry[1];
    } else {
      const callbackFunctionLine = getInnermostFunction(lineNum);
      if (callbackFunctionLine && callbackFunctionLine !== functionLine) {
        actualFunctionLine = callbackFunctionLine;
        boundary = functionBoundaries.get(callbackFunctionLine);
      }
    }
    
    return { actualFunctionLine, boundary };
  };
  
  /**
   * Looks ahead for arrow function on subsequent lines
   * @param {number} index - Current line index
   * @param {Array} lines - All lines of source code
   * @param {number} maxLines - Maximum lines to look ahead
   * @returns {number|null} Line number where => is found, or null
   */
  const findArrowOnSubsequentLines = (index, lines, maxLines = 5) => {
    for (let i = index + 1; i < Math.min(index + maxLines + 1, lines.length); i++) {
      const checkLine = lines[i].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '');
      if (checkLine.includes('=>')) {
        return i + 2; // Return line number (1-based) including the line with =>
      }
    }
    return null;
  };
  
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
  const applyFallback1FunctionDeclaration = (paramListEnd, boundaryStart, lineNum, hasFunctionSig, lineWithoutComments, defaultParamPattern) => {
    if (paramListEnd === boundaryStart && lineNum === boundaryStart && hasFunctionSig) {
      const hasDefaultParams = defaultParamPattern.test(lineWithoutComments);
      if (hasDefaultParams) {
        return boundaryStart + 1;
      }
    }
    return null;
  };
  
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
  const applyFallback2ArrowOnLaterLine = (paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, defaultParamPattern) => {
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
  };
  
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
  const applyFallback3OpeningParen = (paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, defaultParamPattern) => {
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
  };
  
  const applyParameterListEndFallbacks = (paramListEnd, boundaryStart, lineNum, index, lines, lineWithoutComments, hasFunctionSig) => {
    const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^=,)\s}]+)/g;
    
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
  };
  
  /**
   * Detects if this is a multi-line arrow function parameter
   * @param {string} lineWithoutComments - Current line without comments
   * @param {number} index - Current line index
   * @param {Array} lines - All lines of source code
   * @returns {boolean} Whether this is a multi-line arrow function parameter
   */
  const detectMultiLineArrowParameter = (lineWithoutComments, index, lines) => {
    const hasDefaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^=,)\s}]+)/.test(lineWithoutComments);
    const hasOpeningParen = lineWithoutComments.includes('(');
    const hasArrowOnLaterLine = index + 1 < lines.length && 
                                lines[index + 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').includes('=>');
    return hasDefaultParamPattern && hasOpeningParen && hasArrowOnLaterLine && !lineWithoutComments.includes('=>');
  };
  
  /**
   * Matches default parameters on a line
   * @param {string} lineWithoutComments - Line without comments
   * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
   * @param {number} arrowIndex - Index of => if arrow function
   * @returns {Array} Array of matched default parameters
   */
  const matchDefaultParameters = (lineWithoutComments, isArrowFunctionParam, arrowIndex) => {
    const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^=,)\s}]+)/g;
    
    if (isArrowFunctionParam) {
      const beforeArrow = lineWithoutComments.substring(0, arrowIndex);
      const matches = beforeArrow.match(defaultParamPattern);
      return matches || [];
    } else {
      const matches = lineWithoutComments.match(defaultParamPattern);
      return matches || [];
    }
  };
  
  /**
   * Handles arrow function detection for parameter list end
   * @param {string} checkLine - Line to check
   * @param {number} lineNum - Current line number
   * @param {number} checkLineNum - Line number being checked (1-based)
   * @param {string} lineWithoutComments - Current line without comments
   * @returns {number|null} Parameter list end line or null if not found
   */
  const handleArrowFunctionDetection = (checkLine, lineNum, checkLineNum, lineWithoutComments) => {
    if (!checkLine.includes('=>')) {
      return null;
    }
    
    const arrowIndex = checkLine.indexOf('=>');
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
  };
  
  /**
   * Updates state when encountering an opening parenthesis
   * @param {Object} state - Current state
   * @returns {Object} Updated state
   */
  const handleOpeningParen = (state) => {
    return {
      ...state,
      parenDepth: state.parenDepth + 1,
      foundParamStart: true
    };
  };
  
  /**
   * Updates state when encountering a closing parenthesis
   * @param {Object} state - Current state
   * @returns {Object} Updated state
   */
  const handleClosingParen = (state) => {
    const newParenDepth = state.parenDepth - 1;
    const foundClosingParen = newParenDepth === 0 && state.foundParamStart;
    return {
      ...state,
      parenDepth: newParenDepth,
      foundClosingParen
    };
  };
  
  /**
   * Handles opening brace and checks if parameter list ends
   * @param {string} checkLine - Line to check
   * @param {number} checkLineNum - Line number being checked
   * @param {number} boundaryStart - Function boundary start
   * @param {Object} state - Current state
   * @returns {number|null} Parameter list end line or null
   */
  const handleOpeningBrace = (checkLine, checkLineNum, boundaryStart, state) => {
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
  };
  
  /**
   * Tracks parentheses and braces to find parameter list boundaries
   * @param {string} checkLine - Line to check
   * @param {number} checkLineNum - Line number being checked (1-based)
   * @param {number} boundaryStart - Function boundary start
   * @param {Object} state - Current state (parenDepth, braceDepth, foundParamStart, foundClosingParen)
   * @returns {number|null} Parameter list end line or null if not found
   */
  const trackParameterListBoundaries = (checkLine, checkLineNum, boundaryStart, state) => {
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
    }
    
    return null;
  };
  
  /**
   * Handles special case for function body on same line
   * @param {number} lineNum - Current line number
   * @param {number} boundaryStart - Function boundary start
   * @param {number} paramListEnd - Current paramListEnd value
   * @param {string} lineWithoutComments - Current line without comments
   * @returns {number} Updated paramListEnd
   */
  const handleFunctionBodyOnSameLine = (lineNum, boundaryStart, paramListEnd, lineWithoutComments) => {
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
  };
  
  /**
   * Finds where the parameter list ends for a function
   * @param {number} lineNum - Current line number
   * @param {number} boundaryStart - Function boundary start
   * @param {Array} lines - All lines of source code
   * @param {string} lineWithoutComments - Current line without comments
   * @returns {number} Line number where parameter list ends
   */
  const findParameterListEnd = (lineNum, boundaryStart, lines, lineWithoutComments) => {
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
      if (boundaryResult !== null) {
        return boundaryResult;
      }
      
      // Update state
      state = {
        parenDepth: state.parenDepth,
        braceDepth: state.braceDepth,
        foundParamStart: state.foundParamStart,
        foundClosingParen: state.foundClosingParen
      };
    }
    
    // Handle special case for function body on same line
    return handleFunctionBodyOnSameLine(lineNum, boundaryStart, paramListEnd, lineWithoutComments);
  };
  
  /**
   * Checks if a line has a function signature pattern
   * @param {string} lineWithoutComments - Line without comments
   * @param {boolean} isArrowFunctionParam - Whether this is an arrow function parameter
   * @returns {boolean} Whether this line has a function signature
   */
  const hasFunctionSignature = (lineWithoutComments, isArrowFunctionParam) => {
    return /^\s*(?:export\s+)?(?:function|const|let|var)\s+\w+\s*[=(]/.test(lineWithoutComments) ||
           /^\s*\([^)]*/.test(lineWithoutComments) ||
           /=>\s*\([^)]*/.test(lineWithoutComments) ||
           /\.\w+\s*\([^)]*/.test(lineWithoutComments) ||
           /\([^)]*\{[^}]*\}/.test(lineWithoutComments) ||
           (isArrowFunctionParam && /\(/.test(lineWithoutComments));
  };
  
  /**
   * Validates if a default parameter context is valid (not a regular assignment)
   * @param {string} lineWithoutComments - Line without comments
   * @returns {boolean} Whether the context is valid for default parameters
   */
  const isValidDefaultParameterContext = (lineWithoutComments) => {
    // Exclude const/let/var assignments that are NOT function declarations
    // Pattern: const x = value (not const x = (params) => or const x = function)
    const isConstLetVarAssignment = /^\s*(const|let|var)\s+\w+\s*=\s*[^(]/.test(lineWithoutComments) &&
                                    !/^\s*(const|let|var)\s+\w+\s*=\s*\(/.test(lineWithoutComments);
    const isReturnStatement = /^\s*return\s+/.test(lineWithoutComments);
    const isMethodCall = /\w+\.\w+\s*\(/.test(lineWithoutComments) && !lineWithoutComments.includes('=>');
    const isRegularAssignment = /^\s*\w+\s*=\s*\w+/.test(lineWithoutComments) && !lineWithoutComments.match(/\([^)]*=/);
    return !isConstLetVarAssignment && !isReturnStatement && !isMethodCall && !isRegularAssignment;
  };
  
  /**
   * Processes default parameter matches and adds them to decision points
   * @param {Array} defaultParamMatches - Matched default parameters
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line to assign to
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processDefaultParameterMatches = (defaultParamMatches, lineNum, functionLine, decisionPoints) => {
    defaultParamMatches.forEach(() => {
      decisionPoints.push({ line: lineNum, type: 'default parameter', name: 'default parameter', functionLine });
    });
  };
  
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
  /**
   * Handles arrow function default parameters
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} arrowIndex - Index of => operator
   * @param {number} lineNum - Line number
   * @param {number} actualFunctionLine - Function line for arrow function
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const handleArrowFunctionDefaultParams = (lineWithoutComments, arrowIndex, lineNum, actualFunctionLine, decisionPoints) => {
    const beforeArrow = lineWithoutComments.substring(0, arrowIndex);
    const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^=,)\s}]+/g;
    const defaultParamMatches = beforeArrow.match(defaultParamPattern);
    
    if (defaultParamMatches && defaultParamMatches.length > 0) {
      if (isValidDefaultParameterContext(lineWithoutComments)) {
        processDefaultParameterMatches(defaultParamMatches, lineNum, actualFunctionLine, decisionPoints);
      }
    }
  };
  
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
  const shouldCheckForDefaultParameters = (isInParameterList, isArrowFunctionParam, hasFunctionSig, lineNum, boundaryStart, isMultiLineArrowParam) => {
    return isInParameterList || 
           isArrowFunctionParam || 
           (hasFunctionSig && lineNum === boundaryStart) || 
           isMultiLineArrowParam;
  };
  
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
  const processDefaultParameterMatchesByContext = (defaultParamMatches, lineNum, isMultiLineArrowParam, isArrowFunctionParam, actualFunctionLine, isInParameterList, hasFunctionSig, boundaryStart, functionLine, decisionPoints) => {
    if (isMultiLineArrowParam) {
      processDefaultParameterMatches(defaultParamMatches, lineNum, functionLine, decisionPoints);
    } else if (isArrowFunctionParam) {
      processDefaultParameterMatches(defaultParamMatches, lineNum, actualFunctionLine, decisionPoints);
    } else if (isInParameterList || (hasFunctionSig && lineNum === boundaryStart)) {
      processDefaultParameterMatches(defaultParamMatches, lineNum, functionLine, decisionPoints);
    }
  };
  
  const parseDefaultParameters = (lineWithoutComments, lineNum, index, lines, functionLine, functionBoundaries, getInnermostFunction, decisionPoints) => {
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
      handleArrowFunctionDefaultParams(lineWithoutComments, arrowIndex, lineNum, actualFunctionLine, decisionPoints);
    }
    
    if (boundary) {
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
      
      const isInParameterList = lineNum >= boundary.start && lineNum < paramListEnd;
      const isMultiLineArrowParam = detectMultiLineArrowParameter(lineWithoutComments, index, lines);
      
      // Determine if we should check for default parameters
      if (shouldCheckForDefaultParameters(isInParameterList, isArrowFunctionParam, hasFunctionSig, lineNum, boundary.start, isMultiLineArrowParam)) {
        const defaultParamMatches = matchDefaultParameters(lineWithoutComments, isArrowFunctionParam, arrowIndex);
        
        if (defaultParamMatches.length > 0 && isValidDefaultParameterContext(lineWithoutComments)) {
          processDefaultParameterMatchesByContext(
            defaultParamMatches,
            lineNum,
            isMultiLineArrowParam,
            isArrowFunctionParam,
            actualFunctionLine,
            isInParameterList,
            hasFunctionSig,
            boundary.start,
            functionLine,
            decisionPoints
          );
        }
      }
    }
  };
  
  /**
   * Handles escape sequences in string parsing
   * @param {string} char - Current character
   * @param {boolean} escapeNext - Whether next character is escaped
   * @returns {Object} Updated escape state
   */
  const handleEscapeSequence = (char, escapeNext) => {
    if (escapeNext) {
      return { escapeNext: false, shouldContinue: true };
    }
    if (char === '\\') {
      return { escapeNext: true, shouldContinue: true };
    }
    return { escapeNext: false, shouldContinue: false };
  };
  
  /**
   * Handles template literal expression start
   * @param {string} char - Current character
   * @param {string} nextChar - Next character
   * @param {boolean} inTemplateLiteral - Whether we're in a template literal
   * @param {boolean} inTemplateExpression - Whether we're in a template expression
   * @returns {Object} Updated template expression state
   */
  const handleTemplateExpressionStart = (char, nextChar, inTemplateLiteral, inTemplateExpression) => {
    if (char === '$' && nextChar === '{' && inTemplateLiteral && !inTemplateExpression) {
      return { 
        inTemplateExpression: true, 
        templateBraceDepth: 1, 
        shouldSkipNext: true 
      };
    }
    return { 
      inTemplateExpression, 
      templateBraceDepth: 0, 
      shouldSkipNext: false 
    };
  };
  
  /**
   * Tracks brace depth in template expressions
   * @param {string} char - Current character
   * @param {boolean} inTemplateExpression - Whether we're in a template expression
   * @param {number} templateBraceDepth - Current brace depth
   * @returns {Object} Updated template expression state
   */
  const trackTemplateExpressionBraces = (char, inTemplateExpression, templateBraceDepth) => {
    if (!inTemplateExpression) {
      return { inTemplateExpression: false, templateBraceDepth: 0 };
    }
    
    if (char === '{') {
      return { inTemplateExpression: true, templateBraceDepth: templateBraceDepth + 1 };
    } else if (char === '}') {
      const newDepth = templateBraceDepth - 1;
      return { 
        inTemplateExpression: newDepth > 0, 
        templateBraceDepth: newDepth 
      };
    }
    
    return { inTemplateExpression: true, templateBraceDepth };
  };
  
  /**
   * Updates quote states based on character
   * @param {string} char - Current character
   * @param {boolean} inSingleQuote - Whether we're in a single-quoted string
   * @param {boolean} inDoubleQuote - Whether we're in a double-quoted string
   * @param {boolean} inTemplateLiteral - Whether we're in a template literal
   * @returns {Object} Updated quote states
   */
  const updateQuoteStates = (char, inSingleQuote, inDoubleQuote, inTemplateLiteral) => {
    if (char === "'" && !inDoubleQuote && !inTemplateLiteral) {
      return { inSingleQuote: !inSingleQuote, inDoubleQuote, inTemplateLiteral };
    } else if (char === '"' && !inSingleQuote && !inTemplateLiteral) {
      return { inSingleQuote, inDoubleQuote: !inDoubleQuote, inTemplateLiteral };
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      const newInTemplateLiteral = !inTemplateLiteral;
      return { 
        inSingleQuote, 
        inDoubleQuote, 
        inTemplateLiteral: newInTemplateLiteral 
      };
    }
    return { inSingleQuote, inDoubleQuote, inTemplateLiteral };
  };
  
  /**
   * Checks if a question mark at a given index is inside a regular string literal
   * @param {string} line - Line to check
   * @param {number} questionIndex - Index of the question mark
   * @returns {boolean} Whether the question mark is inside a regular string
   */
  const isQuestionMarkInRegularString = (line, questionIndex) => {
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplateLiteral = false;
    let inTemplateExpression = false;
    let templateBraceDepth = 0;
    let escapeNext = false;
    
    for (let k = 0; k < questionIndex && k < line.length; k++) {
      const char = line[k];
      const nextChar = k + 1 < line.length ? line[k + 1] : '';
      
      // Handle escape sequences
      const escapeResult = handleEscapeSequence(char, escapeNext);
      escapeNext = escapeResult.escapeNext;
      if (escapeResult.shouldContinue) {
        continue;
      }
      
      // Handle template literal expression start
      const templateStart = handleTemplateExpressionStart(char, nextChar, inTemplateLiteral, inTemplateExpression);
      if (templateStart.shouldSkipNext) {
        inTemplateExpression = templateStart.inTemplateExpression;
        templateBraceDepth = templateStart.templateBraceDepth;
        k++; // Skip the '{'
        continue;
      }
      
      // Track brace depth in template expressions
      const braceResult = trackTemplateExpressionBraces(char, inTemplateExpression, templateBraceDepth);
      inTemplateExpression = braceResult.inTemplateExpression;
      templateBraceDepth = braceResult.templateBraceDepth;
      if (inTemplateExpression) {
        continue; // Don't process quotes/backticks inside template expressions
      }
      
      // Update quote states
      const quoteResult = updateQuoteStates(char, inSingleQuote, inDoubleQuote, inTemplateLiteral);
      inSingleQuote = quoteResult.inSingleQuote;
      inDoubleQuote = quoteResult.inDoubleQuote;
      inTemplateLiteral = quoteResult.inTemplateLiteral;
      
      // Reset template expression when template literal ends
      if (!inTemplateLiteral) {
        inTemplateExpression = false;
        templateBraceDepth = 0;
      }
    }
    
    return inSingleQuote || inDoubleQuote;
  };
  
  /**
   * Checks if a question mark is part of a TypeScript optional parameter
   * @param {string} line - Line to check
   * @param {number} questionIndex - Index of the question mark
   * @returns {boolean} Whether it's a TypeScript optional parameter
   */
  const isTypeScriptOptionalParameter = (line, questionIndex) => {
    const contextStart = Math.max(0, questionIndex - 30);
    const contextEnd = Math.min(line.length, questionIndex + 50);
    const context = line.substring(contextStart, contextEnd);
    return /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*\?\s*:\s*[A-Z][a-zA-Z0-9_$<>[\]]*/.test(context);
  };
  
  /**
   * Calculates nesting depths (parens, braces, brackets) up to a given index
   * @param {string} line - Line to analyze
   * @param {number} upToIndex - Index to calculate up to
   * @returns {Object} Object with parenDepth, braceDepth, bracketDepth
   */
  const calculateNestingDepths = (line, upToIndex) => {
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    
    for (let j = 0; j < upToIndex && j < line.length; j++) {
      const char = line[j];
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;
      else if (char === '{') braceDepth++;
      else if (char === '}') braceDepth--;
      else if (char === '[') bracketDepth++;
      else if (char === ']') bracketDepth--;
    }
    
    return { parenDepth, braceDepth, bracketDepth };
  };
  
  /**
   * Checks if a ternary looks like a JSX ternary
   * @param {string} line - Line to check
   * @param {number} questionIndex - Index of the question mark
   * @returns {boolean} Whether it's a JSX ternary
   */
  const isJSXTernary = (line, questionIndex) => {
    const beforeQuestion = line.substring(0, questionIndex);
    const afterQuestion = line.substring(questionIndex + 1).trim();
    return beforeQuestion.includes('{') || afterQuestion.startsWith('(');
  };
  
  /**
   * Updates depth for a single character type
   * @param {string} char - Current character
   * @param {number} currentDepth - Current depth
   * @returns {Object} Updated depth and whether to break
   */
  const updateSingleDepth = (char, currentDepth) => {
    if (char === '(' || char === '{' || char === '[') {
      return { depth: currentDepth + 1, shouldBreak: false };
    } else if (char === ')' || char === '}' || char === ']') {
      const newDepth = currentDepth - 1;
      return { depth: newDepth, shouldBreak: newDepth < 0 };
    }
    return { depth: currentDepth, shouldBreak: false };
  };
  
  /**
   * Updates nesting depths for same-line colon search
   * @param {string} char - Current character
   * @param {string} nextChar - Next character
   * @param {Object} depths - Current depths
   * @param {Function} isInsideStringLiteral - Function to check if inside string
   * @param {string} line - Current line
   * @param {number} index - Character index
   * @returns {Object} Updated depths and whether to break
   */
  const updateSameLineDepths = (char, nextChar, depths, isInsideStringLiteral, line, index) => {
    let { parenDepth, braceDepth, bracketDepth, ternaryDepth } = depths;
    let shouldBreak = false;
    
    // Handle parentheses
    if (char === '(' || char === ')') {
      const result = updateSingleDepth(char, parenDepth);
      parenDepth = result.depth;
      shouldBreak = result.shouldBreak;
    }
    // Handle braces
    else if (char === '{' || char === '}') {
      const result = updateSingleDepth(char, braceDepth);
      braceDepth = result.depth;
      shouldBreak = result.shouldBreak;
    }
    // Handle brackets
    else if (char === '[' || char === ']') {
      const result = updateSingleDepth(char, bracketDepth);
      bracketDepth = result.depth;
      shouldBreak = result.shouldBreak;
    }
    // Handle ternary operator
    else if (char === '?' && nextChar !== '.') {
      if (!isInsideStringLiteral(line, index)) {
        ternaryDepth++;
      }
    }
    
    return { 
      parenDepth, 
      braceDepth, 
      bracketDepth, 
      ternaryDepth, 
      shouldBreak 
    };
  };
  
  /**
   * Checks if a colon matches the starting depths
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @returns {boolean} Whether depths match
   */
  const checkSameLineColonMatch = (depths, startDepths) => {
    return depths.parenDepth === startDepths.parenDepth && 
           depths.braceDepth === startDepths.braceDepth && 
           depths.bracketDepth === startDepths.bracketDepth;
  };
  
  /**
   * Finds matching colon on the same line for a ternary operator
   * @param {string} line - Line to search
   * @param {number} questionIndex - Index of the question mark
   * @param {Object} startDepths - Starting nesting depths
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @returns {boolean} Whether a matching colon was found
   */
  /**
   * Handles colon character in same-line search
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @returns {boolean|null} True if match found, null if nested ternary, false otherwise
   */
  const handleColonInSameLine = (depths, startDepths) => {
    if (depths.ternaryDepth > 0) {
      return null; // Nested ternary, continue
    }
    
    if (checkSameLineColonMatch(depths, startDepths)) {
      return true; // Match found
    }
    
    return false; // No match
  };
  
  /**
   * Checks if we should stop at a character in same-line search
   * @param {string} char - Current character
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @param {boolean} isJSX - Whether this is JSX
   * @returns {boolean} Whether to stop
   */
  const shouldStopSameLineAtChar = (char, depths, startDepths, isJSX) => {
    if (char !== ';' && char !== ',') {
      return false;
    }
    
    if (!checkSameLineColonMatch(depths, startDepths)) {
      return false;
    }
    
    if (depths.ternaryDepth !== 0) {
      return false;
    }
    
    return !isJSX; // Stop if not JSX
  };
  
  const findMatchingColonOnSameLine = (line, questionIndex, startDepths, isInsideStringLiteral) => {
    let depths = {
      parenDepth: startDepths.parenDepth,
      braceDepth: startDepths.braceDepth,
      bracketDepth: startDepths.bracketDepth,
      ternaryDepth: 0
    };
    const isJSX = isJSXTernary(line, questionIndex);
    
    for (let i = questionIndex + 1; i < line.length; i++) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      
      // Update nesting depths
      const updated = updateSameLineDepths(char, nextChar, depths, isInsideStringLiteral, line, i);
      depths = updated;
      
      if (updated.shouldBreak) {
        break;
      }
      
      // If we hit a :, check if it's our matching colon
      if (char === ':') {
        const colonResult = handleColonInSameLine(depths, startDepths);
        if (colonResult === true) {
          return true;
        }
        if (colonResult === null) {
          depths.ternaryDepth--;
          continue;
        }
      }
      
      // Stop if we hit certain characters
      if (shouldStopSameLineAtChar(char, depths, startDepths, isJSX)) {
        break;
      }
    }
    
    return false;
  };
  
  /**
   * Finds matching colon on subsequent lines for a JSX ternary
   * @param {Array} lines - All lines of source code
   * @param {number} startIndex - Starting line index
   * @param {number} maxScanLines - Maximum lines to scan ahead
   * @param {Object} startDepths - Starting nesting depths
   * @param {boolean} isJSXTernary - Whether this is a JSX ternary
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @returns {boolean} Whether a matching colon was found
   */
  /**
   * Updates depth for subsequent lines with special brace depth check
   * @param {string} char - Current character
   * @param {number} currentDepth - Current depth
   * @param {number} startDepth - Starting depth (for braces)
   * @returns {Object} Updated depth and whether to break
   */
  const updateSubsequentLineDepth = (char, currentDepth, startDepth) => {
    if (char === '(' || char === '{' || char === '[') {
      return { depth: currentDepth + 1, shouldBreak: false };
    } else if (char === ')') {
      const newDepth = currentDepth - 1;
      return { depth: newDepth, shouldBreak: newDepth < -1 };
    } else if (char === '}') {
      const newDepth = currentDepth - 1;
      return { depth: newDepth, shouldBreak: newDepth < startDepth - 1 };
    } else if (char === ']') {
      const newDepth = currentDepth - 1;
      return { depth: newDepth, shouldBreak: newDepth < 0 };
    }
    return { depth: currentDepth, shouldBreak: false };
  };
  
  /**
   * Updates nesting depths based on a character
   * @param {string} char - Current character
   * @param {string} nextChar - Next character
   * @param {Object} depths - Current depths object
   * @param {Object} startDepths - Starting depths
   * @param {Function} isInsideStringLiteral - Function to check if inside string
   * @param {string} line - Current line
   * @param {number} index - Character index
   * @returns {Object} Updated depths and whether to break
   */
  const updateNestingDepths = (char, nextChar, depths, startDepths, isInsideStringLiteral, line, index) => {
    let { parenDepth, braceDepth, bracketDepth, ternaryDepth } = depths;
    let shouldBreak = false;
    
    // Handle parentheses
    if (char === '(' || char === ')') {
      const result = updateSubsequentLineDepth(char, parenDepth, startDepths.parenDepth);
      parenDepth = result.depth;
      shouldBreak = result.shouldBreak;
    }
    // Handle braces
    else if (char === '{' || char === '}') {
      const result = updateSubsequentLineDepth(char, braceDepth, startDepths.braceDepth);
      braceDepth = result.depth;
      shouldBreak = result.shouldBreak;
    }
    // Handle brackets
    else if (char === '[' || char === ']') {
      const result = updateSubsequentLineDepth(char, bracketDepth, startDepths.bracketDepth);
      bracketDepth = result.depth;
      shouldBreak = result.shouldBreak;
    }
    // Handle ternary operator
    else if (char === '?' && nextChar !== '.') {
      if (!isInsideStringLiteral(line, index)) {
        ternaryDepth++;
      }
    }
    
    return { 
      parenDepth, 
      braceDepth, 
      bracketDepth, 
      ternaryDepth, 
      shouldBreak 
    };
  };
  
  /**
   * Checks if a depth matches with tolerance
   * @param {number} currentDepth - Current depth
   * @param {number} startDepth - Starting depth
   * @param {boolean} allowRange - Whether to allow range matching
   * @returns {boolean} Whether depths match
   */
  const checkDepthMatchWithTolerance = (currentDepth, startDepth, allowRange) => {
    if (currentDepth === startDepth) {
      return true;
    }
    if (allowRange) {
      return currentDepth >= startDepth - 1 && currentDepth <= startDepth + 1;
    }
    return currentDepth === startDepth + 1;
  };
  
  /**
   * Checks if depths match for a colon match
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @param {boolean} isJSXTernary - Whether this is a JSX ternary
   * @returns {boolean} Whether depths match
   */
  const checkDepthMatch = (depths, startDepths, isJSXTernary) => {
    const { parenDepth, braceDepth, bracketDepth } = depths;
    
    const parensMatch = checkDepthMatchWithTolerance(parenDepth, startDepths.parenDepth, true);
    const bracketsMatch = checkDepthMatchWithTolerance(bracketDepth, startDepths.bracketDepth, false);
    const bracesMatch = checkDepthMatchWithTolerance(braceDepth, startDepths.braceDepth, startDepths.braceDepth > 0);
    
    if (isJSXTernary) {
      return parensMatch && bracesMatch && bracketDepth >= startDepths.bracketDepth - 1;
    } else {
      return parensMatch && bracketsMatch && bracesMatch;
    }
  };
  
  /**
   * Checks if we should stop scanning at a semicolon
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @returns {boolean} Whether to stop scanning
   */
  const shouldStopAtSemicolon = (depths, startDepths) => {
    return depths.parenDepth === startDepths.parenDepth && 
           depths.braceDepth === startDepths.braceDepth && 
           depths.bracketDepth === startDepths.bracketDepth && 
           depths.ternaryDepth === 0;
  };
  
  /**
   * Handles colon character in subsequent line search
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @param {boolean} isJSXTernary - Whether this is a JSX ternary
   * @returns {boolean|null} True if match found, null if nested ternary, false otherwise
   */
  const handleColonInSubsequentLines = (depths, startDepths, isJSXTernary) => {
    if (depths.ternaryDepth > 0) {
      return null; // Nested ternary, continue
    }
    
    if (checkDepthMatch(depths, startDepths, isJSXTernary)) {
      return true; // Match found
    }
    
    return false; // No match
  };
  
  /**
   * Handles break condition for subsequent line search
   * @param {string} char - Current character
   * @param {boolean} shouldBreak - Whether to break
   * @param {number} scanLineIndex - Current scan line index
   * @param {number} startIndex - Starting line index
   * @returns {boolean} Whether to break
   */
  const shouldBreakSubsequentLineSearch = (char, shouldBreak, scanLineIndex, startIndex) => {
    if (!shouldBreak) {
      return false;
    }
    
    // Handle special case for closing braces
    if (char === '}' && (scanLineIndex - startIndex) <= 15) {
      return false; // Continue scanning if we're within 15 lines
    }
    
    return true;
  };
  
  /**
   * Processes a single line in subsequent line search
   * @param {string} currentScanLine - Current line without comments
   * @param {Object} depths - Current depths
   * @param {Object} startDepths - Starting depths
   * @param {boolean} isJSXTernary - Whether this is a JSX ternary
   * @param {Function} isInsideStringLiteral - Function to check if inside string
   * @param {number} scanLineIndex - Current scan line index
   * @param {number} startIndex - Starting line index
   * @returns {Object} Updated depths and whether match was found
   */
  const processSubsequentLine = (currentScanLine, depths, startDepths, isJSXTernary, isInsideStringLiteral, scanLineIndex, startIndex) => {
    let currentDepths = { ...depths };
    
    for (let i = 0; i < currentScanLine.length; i++) {
      const char = currentScanLine[i];
      const nextChar = i + 1 < currentScanLine.length ? currentScanLine[i + 1] : '';
      
      // Update nesting depths
      const updated = updateNestingDepths(char, nextChar, currentDepths, startDepths, isInsideStringLiteral, currentScanLine, i);
      currentDepths = updated;
      
      // Check if we should break
      if (shouldBreakSubsequentLineSearch(char, updated.shouldBreak, scanLineIndex, startIndex)) {
        return { depths: currentDepths, matchFound: false, shouldBreak: true };
      }
      
      // If we hit a :, check if it's our matching colon
      if (char === ':') {
        const colonResult = handleColonInSubsequentLines(currentDepths, startDepths, isJSXTernary);
        if (colonResult === true) {
          return { depths: currentDepths, matchFound: true, shouldBreak: false };
        }
        if (colonResult === null) {
          currentDepths.ternaryDepth--;
          continue;
        }
      }
      
      // Stop at semicolon if depths match
      if (char === ';' && shouldStopAtSemicolon(currentDepths, startDepths)) {
        return { depths: currentDepths, matchFound: false, shouldBreak: true };
      }
    }
    
    return { depths: currentDepths, matchFound: false, shouldBreak: false };
  };
  
  const findMatchingColonOnSubsequentLines = (lines, startIndex, maxScanLines, startDepths, isJSXTernary, isInsideStringLiteral) => {
    let depths = {
      parenDepth: startDepths.parenDepth,
      braceDepth: startDepths.braceDepth,
      bracketDepth: startDepths.bracketDepth,
      ternaryDepth: 0
    };
    let scanLineIndex = startIndex + 1;
    
    while (scanLineIndex < lines.length && (scanLineIndex - startIndex) < maxScanLines) {
      const currentScanLine = lines[scanLineIndex].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '');
      
      const result = processSubsequentLine(
        currentScanLine,
        depths,
        startDepths,
        isJSXTernary,
        isInsideStringLiteral,
        scanLineIndex,
        startIndex
      );
      
      depths = result.depths;
      
      if (result.matchFound) {
        return true;
      }
      
      if (result.shouldBreak) {
        break;
      }
      
      scanLineIndex++;
    }
    
    return false;
  };
  
  /**
   * Detects multi-line ternary patterns
   * @param {string} lineWithoutComments - Current line without comments
   * @param {number} index - Current line index
   * @param {Array} lines - All lines
   * @param {Function} hasQuestionMarkOutsideString - Function to check for question marks outside strings
   * @returns {Object} Object with flags for multi-line ternary detection
   */
  const detectMultiLineTernaries = (lineWithoutComments, index, lines, hasQuestionMarkOutsideString) => {
    const hasQuestionMark = hasQuestionMarkOutsideString(lineWithoutComments);
    const hasColon = lineWithoutComments.includes(':');
    
    const nextLine = index + 1 < lines.length ? lines[index + 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim() : '';
    const nextLineHasColon = nextLine.includes(':');
    
    const prevLine = index > 0 ? lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim() : '';
    const prevLineHasQuestionMark = hasQuestionMarkOutsideString(prevLine);
    
    const isMultiLineTernaryWithQuestionOnThisLine = hasQuestionMark && nextLineHasColon;
    const isMultiLineTernaryConditionLine = !hasQuestionMark && !hasColon && prevLineHasQuestionMark && /[&|]{2}/.test(lineWithoutComments);
    
    return {
      isMultiLineTernaryWithQuestionOnThisLine,
      isMultiLineTernaryConditionLine,
      hasQuestionMark,
      prevLine
    };
  };
  
  /**
   * Parses nullish coalescing operators (??)
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line to assign decision points to
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const parseNullishCoalescing = (lineWithoutComments, lineNum, functionLine, isInsideStringLiteral, decisionPoints) => {
    let searchIndex = 0;
    while ((searchIndex = lineWithoutComments.indexOf('??', searchIndex)) !== -1) {
      if (!isInsideStringLiteral(lineWithoutComments, searchIndex)) {
        decisionPoints.push({ line: lineNum, type: '??', name: 'nullish coalescing', functionLine });
      }
      searchIndex += 2; // Move past this ??
    }
  };
  
  /**
   * Checks if a question mark should be skipped (optional chaining, string literal, TypeScript optional)
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} questionIndex - Index of the question mark
   * @returns {number} Number of characters to skip (0 if not skipped)
   */
  const shouldSkipQuestionMark = (lineWithoutComments, questionIndex) => {
    // Skip if it's optional chaining (?.)
    if (questionIndex + 1 < lineWithoutComments.length && lineWithoutComments[questionIndex + 1] === '.') {
      return 2;
    }
    
    // Skip if inside a regular string literal
    if (isQuestionMarkInRegularString(lineWithoutComments, questionIndex)) {
      return 1;
    }
    
    // Skip if TypeScript optional parameter
    if (isTypeScriptOptionalParameter(lineWithoutComments, questionIndex)) {
      return 1;
    }
    
    return 0;
  };
  
  /**
   * Finds matching colon for a ternary operator
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} questionIndex - Index of the question mark
   * @param {number} index - Line index
   * @param {Array} lines - All lines of source code
   * @param {Object} startDepths - Starting nesting depths
   * @param {boolean} jsxTernary - Whether this is a JSX ternary
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @returns {boolean} Whether a matching colon was found
   */
  const findMatchingColonForTernary = (lineWithoutComments, questionIndex, index, lines, startDepths, jsxTernary, isInsideStringLiteral) => {
    // Try to find matching colon on the same line
    let foundColon = findMatchingColonOnSameLine(
      lineWithoutComments,
      questionIndex,
      startDepths,
      isInsideStringLiteral
    );
    
    // If not found and it's a JSX ternary, scan subsequent lines
    if (!foundColon && jsxTernary && index < lines.length - 1) {
      const maxScanLines = jsxTernary ? 20 : 10;
      foundColon = findMatchingColonOnSubsequentLines(
        lines,
        index,
        maxScanLines,
        startDepths,
        jsxTernary,
        isInsideStringLiteral
      );
    }
    
    return foundColon;
  };
  
  /**
   * Finds all valid ternary operators on a line
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} index - Line index
   * @param {Array} lines - All lines of source code
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @returns {Array} Array of ternary match indices
   */
  const findAllTernaryOperators = (lineWithoutComments, index, lines, isInsideStringLiteral) => {
    const ternaryMatches = [];
    let ternarySearchIndex = 0;
    
    while ((ternarySearchIndex = lineWithoutComments.indexOf('?', ternarySearchIndex)) !== -1) {
      // Check if we should skip this question mark
      const skipCount = shouldSkipQuestionMark(lineWithoutComments, ternarySearchIndex);
      if (skipCount > 0) {
        ternarySearchIndex += skipCount;
        continue;
      }
      
      // Calculate nesting depths up to this question mark
      const startDepths = calculateNestingDepths(lineWithoutComments, ternarySearchIndex);
      const jsxTernary = isJSXTernary(lineWithoutComments, ternarySearchIndex);
      
      // Find matching colon
      const foundColon = findMatchingColonForTernary(
        lineWithoutComments,
        ternarySearchIndex,
        index,
        lines,
        startDepths,
        jsxTernary,
        isInsideStringLiteral
      );
      
      if (foundColon) {
        ternaryMatches.push({ index: ternarySearchIndex });
      }
      
      ternarySearchIndex++;
    }
    
    return ternaryMatches;
  };
  
  /**
   * Processes logical operators in ternary expressions
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processTernaryLogicalOperators = (lineWithoutComments, lineNum, functionLine, decisionPoints) => {
    const andMatches = lineWithoutComments.match(/&&/g);
    const orMatches = lineWithoutComments.match(/\|\|/g);
    if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
    if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
  };
  
  /**
   * Processes logical operators from previous line for multi-line ternaries
   * @param {string} prevLine - Previous line
   * @param {number} prevLineNum - Previous line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processPreviousLineLogicalOperators = (prevLine, prevLineNum, functionLine, decisionPoints) => {
    if (!prevLine || !/[&|]{2}/.test(prevLine)) {
      return;
    }
    
    const prevAndMatches = prevLine.match(/&&/g);
    const prevOrMatches = prevLine.match(/\|\|/g);
    if (prevAndMatches) prevAndMatches.forEach(() => decisionPoints.push({ line: prevLineNum, type: '&&', name: 'logical AND', functionLine }));
    if (prevOrMatches) prevOrMatches.forEach(() => decisionPoints.push({ line: prevLineNum, type: '||', name: 'logical OR', functionLine }));
  };
  
  /**
   * Parses ternary operators and nullish coalescing operators
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} index - Line index (0-based)
   * @param {Array} lines - All lines of source code
   * @param {number} functionLine - Function line to assign decision points to
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {Function} hasQuestionMarkOutsideString - Function to check for question marks outside strings
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const parseTernaryOperators = (lineWithoutComments, lineNum, index, lines, functionLine, isInsideStringLiteral, hasQuestionMarkOutsideString, decisionPoints) => {
    // Find all valid ternary operators
    const ternaryMatches = findAllTernaryOperators(lineWithoutComments, index, lines, isInsideStringLiteral);
    
    // Detect multi-line ternaries
    const multiLineInfo = detectMultiLineTernaries(lineWithoutComments, index, lines, hasQuestionMarkOutsideString);
    const { isMultiLineTernaryWithQuestionOnThisLine, isMultiLineTernaryConditionLine, hasQuestionMark, prevLine } = multiLineInfo;
    
    // Process ternary matches and multi-line ternaries
    if (ternaryMatches.length > 0 || isMultiLineTernaryWithQuestionOnThisLine) {
      const ternaryCount = ternaryMatches.length > 0 ? ternaryMatches.length : (hasQuestionMark ? 1 : 0);
      for (let i = 0; i < ternaryCount; i++) {
        decisionPoints.push({ line: lineNum, type: 'ternary', name: 'ternary operator', functionLine });
      }
      
      // Process logical operators on this line
      processTernaryLogicalOperators(lineWithoutComments, lineNum, functionLine, decisionPoints);
      
      // For multi-line ternaries, also check previous line for &&/|| operators
      if (isMultiLineTernaryWithQuestionOnThisLine && index > 0) {
        processPreviousLineLogicalOperators(prevLine, lineNum - 1, functionLine, decisionPoints);
      }
    }
    
    // Handle case where this line is the condition line of a multi-line ternary
    if (isMultiLineTernaryConditionLine) {
      processTernaryLogicalOperators(lineWithoutComments, lineNum, functionLine, decisionPoints);
    }
    
    // Parse nullish coalescing operator (??)
    parseNullishCoalescing(lineWithoutComments, lineNum, functionLine, isInsideStringLiteral, decisionPoints);
  };
  
  /**
   * Detects if a line is a boolean expression
   * @param {string} lineWithoutComments - Line without comments
   * @param {boolean} isReturnStatement - Whether this is a return statement
   * @param {boolean} isJSXExpression - Whether this is a JSX expression
   * @param {boolean} isContinuationOfJSXExpression - Whether this continues a JSX expression
   * @param {boolean} hasLogicalOp - Whether line has && or || operators
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @param {boolean} isSwitchStatement - Whether this is a switch statement
   * @param {boolean} isCatchBlock - Whether this is a catch block
   * @returns {boolean} Whether this is a boolean expression
   */
  const detectBooleanExpression = (lineWithoutComments, isReturnStatement, isJSXExpression, isContinuationOfJSXExpression, hasLogicalOp, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock) => {
    return detectBooleanExpressionType(
      lineWithoutComments,
      isReturnStatement,
      hasLogicalOp,
      isJSXExpression,
      isContinuationOfJSXExpression,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop,
      isSwitchStatement,
      isCatchBlock
    );
  };
  
  /**
   * Detects JSX expressions and their continuations
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} index - Line index (0-based)
   * @param {Array} lines - All lines of source code
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @returns {Object} Object with isJSXExpression and isContinuationOfJSXExpression flags
   */
  /**
   * Checks if this line continues a JSX expression from the previous line
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} index - Line index (0-based)
   * @param {Array} lines - All lines of source code
   * @param {boolean} hasLogicalOp - Whether line has && or || operators
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @returns {boolean} Whether this continues a JSX expression
   */
  const checkJSXContinuation = (lineWithoutComments, index, lines, hasLogicalOp, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop) => {
    if (index === 0) return false;
    if (isIfStatement || isElseIfStatement || isForLoop || isWhileLoop) return false;
    
    const prevLine = lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
    const prevLineHasJSXOpening = prevLine.includes('{');
    const currentLineHasJSXOpening = lineWithoutComments.includes('{');
    return prevLineHasJSXOpening && hasLogicalOp && !currentLineHasJSXOpening;
  };
  
  const detectJSXExpressions = (lineWithoutComments, index, lines, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop) => {
    const hasJSXOpeningBrace = lineWithoutComments.includes('{') && 
                                (/\{[^}]*[&|]{2}/.test(lineWithoutComments) ||
                                 /^\s*\{[^}]*[&|]{2}/.test(lineWithoutComments));
    const hasLogicalOp = /[&|]{2}/.test(lineWithoutComments);
    const isJSXExpression = hasJSXOpeningBrace && hasLogicalOp;
    
    // Check if previous line started a JSX expression and this line continues it
    const isContinuationOfJSXExpression = checkJSXContinuation(
      lineWithoutComments,
      index,
      lines,
      hasLogicalOp,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop
    );
    
    return { isJSXExpression, isContinuationOfJSXExpression };
  };
  
  /**
   * Finds the correct function line for a logical operator in a boolean expression
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} operatorIndex - Index of the operator in the line
   * @param {number} functionLine - Default function line
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @returns {number} Function line to assign the operator to
   */
  const findBooleanExpressionFunctionLine = (lineWithoutComments, lineNum, operatorIndex, functionLine, functionBoundaries) => {
    const callbacksOnThisLine = Array.from(functionBoundaries.entries())
      .filter(([fl, b]) => b.start === lineNum);
    
    if (callbacksOnThisLine.length === 0) {
      return functionLine;
    }
    
    // Find where callbacks start (look for => or function keyword)
    const callbackStartPattern = /(?:=>|function\s*\()/;
    const callbackStartMatch = lineWithoutComments.match(callbackStartPattern);
    const callbackStartIndex = callbackStartMatch && callbackStartMatch.index !== undefined 
      ? callbackStartMatch.index 
      : -1;
    
    // If operator appears before any callback starts, it belongs to the parent function
    if (callbackStartIndex > operatorIndex) {
      // Find parent function (function that contains this line but isn't a callback on this line)
      const parentFunctions = Array.from(functionBoundaries.entries())
        .filter(([fl, b]) => 
          b.start <= lineNum && lineNum <= b.end && 
          !callbacksOnThisLine.some(([cfl]) => cfl === fl)
        );
      
      if (parentFunctions.length > 0) {
        // Use the most recent parent (smallest boundary that's larger than callbacks)
        const sortedParents = parentFunctions.sort((a, b) => {
          const aSize = a[1].end - a[1].start;
          const bSize = b[1].end - b[1].start;
          return aSize - bSize; // Prefer smaller boundary (more nested parent)
        });
        return sortedParents[0][0];
      }
    }
    
    return functionLine;
  };
  
  /**
   * Processes logical operators in boolean expressions
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {string} operator - Operator to process ('&&' or '||')
   * @param {string} operatorType - Type name ('logical AND' or 'logical OR')
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processBooleanExpressionOperators = (lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, operator, operatorType, decisionPoints) => {
    let searchIndex = 0;
    while ((searchIndex = lineWithoutComments.indexOf(operator, searchIndex)) !== -1) {
      if (!isInsideStringLiteral(lineWithoutComments, searchIndex)) {
        const assignedFunctionLine = findBooleanExpressionFunctionLine(
          lineWithoutComments,
          lineNum,
          searchIndex,
          functionLine,
          functionBoundaries
        );
        decisionPoints.push({ 
          line: lineNum, 
          type: operator, 
          name: operatorType, 
          functionLine: assignedFunctionLine 
        });
      }
      searchIndex += operator.length; // Move past this operator
    }
  };
  
  /**
   * Parses boolean expressions (&&, || operators in return statements, assignments, JSX, etc.)
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line to assign decision points to
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {Function} hasQuestionMarkOutsideString - Function to check for question marks outside strings
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @param {boolean} isSwitchStatement - Whether this is a switch statement
   * @param {boolean} isCatchBlock - Whether this is a catch block
   * @param {boolean} isJSXExpression - Whether this is a JSX expression
   * @param {boolean} isContinuationOfJSXExpression - Whether this continues a JSX expression
   * @param {Array} decisionPoints - Array to push decision points to
   */
  /**
   * Checks if a line should be excluded from boolean expression processing
   * @param {boolean} isBooleanExpression - Whether this is a boolean expression
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @param {boolean} isSwitchStatement - Whether this is a switch statement
   * @param {boolean} isCatchBlock - Whether this is a catch block
   * @param {boolean} hasTernaries - Whether line has ternaries
   * @returns {boolean} Whether to exclude
   */
  const shouldExcludeFromBooleanExpressions = (isBooleanExpression, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock, hasTernaries) => {
    return !isBooleanExpression || 
           isIfStatement || 
           isElseIfStatement || 
           isForLoop || 
           isWhileLoop || 
           isSwitchStatement || 
           isCatchBlock || 
           hasTernaries;
  };
  
  /**
   * Checks if line has boolean assignment pattern
   * @param {string} lineWithoutComments - Line without comments
   * @returns {boolean} Whether line has boolean assignment
   */
  const hasBooleanAssignmentPattern = (lineWithoutComments) => {
    return /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(lineWithoutComments);
  };
  
  /**
   * Checks if line has boolean expression in parentheses
   * @param {string} lineWithoutComments - Line without comments
   * @returns {boolean} Whether line has boolean expression in parentheses
   */
  const hasBooleanExpressionInParens = (lineWithoutComments) => {
    return /\([^)]*[&|]{2}[^)]*\)/.test(lineWithoutComments);
  };
  
  /**
   * Checks if logical operator is in a non-control-flow context
   * @param {boolean} hasLogicalOperator - Whether line has logical operators
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @param {boolean} isSwitchStatement - Whether this is a switch statement
   * @param {boolean} isCatchBlock - Whether this is a catch block
   * @returns {boolean} Whether logical operator is in non-control-flow context
   */
  const isLogicalOperatorInNonControlFlow = (hasLogicalOperator, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock) => {
    return hasLogicalOperator && !isIfStatement && !isElseIfStatement && !isForLoop && !isWhileLoop && !isSwitchStatement && !isCatchBlock;
  };
  
  /**
   * Detects if a line is a boolean expression
   * @param {string} lineWithoutComments - Line without comments
   * @param {boolean} isReturnStatement - Whether this is a return statement
   * @param {boolean} hasLogicalOperator - Whether line has logical operators
   * @param {boolean} isJSXExpression - Whether this is a JSX expression
   * @param {boolean} isContinuationOfJSXExpression - Whether this continues a JSX expression
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @param {boolean} isSwitchStatement - Whether this is a switch statement
   * @param {boolean} isCatchBlock - Whether this is a catch block
   * @returns {boolean} Whether this is a boolean expression
   */
  const detectBooleanExpressionType = (lineWithoutComments, isReturnStatement, hasLogicalOperator, isJSXExpression, isContinuationOfJSXExpression, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock) => {
    return isReturnStatement || 
           hasBooleanAssignmentPattern(lineWithoutComments) ||
           hasBooleanExpressionInParens(lineWithoutComments) ||
           isJSXExpression ||
           isContinuationOfJSXExpression ||
           isLogicalOperatorInNonControlFlow(hasLogicalOperator, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock);
  };
  
  const parseBooleanExpressions = (lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, hasQuestionMarkOutsideString, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock, isJSXExpression, isContinuationOfJSXExpression, decisionPoints) => {
    const isReturnStatement = /^\s*return\s+/.test(lineWithoutComments);
    const hasLogicalOperator = /[&|]{2}/.test(lineWithoutComments);
    const isBooleanExpression = detectBooleanExpressionType(
      lineWithoutComments,
      isReturnStatement,
      hasLogicalOperator,
      isJSXExpression,
      isContinuationOfJSXExpression,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop,
      isSwitchStatement,
      isCatchBlock
    );
    
    // Check if line has ternaries (to avoid double-counting &&/|| in ternary expressions)
    const hasTernaries = hasQuestionMarkOutsideString(lineWithoutComments) && lineWithoutComments.includes(':');
    
    if (shouldExcludeFromBooleanExpressions(isBooleanExpression, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock, hasTernaries)) {
      return;
    }
    
    // Process && and || operators in boolean expressions
    processBooleanExpressionOperators(lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, '&&', 'logical AND', decisionPoints);
    processBooleanExpressionOperators(lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, '||', 'logical OR', decisionPoints);
  };
  
  /**
   * Checks if a line is a condition start (if, else if, while, for)
   * @param {string} line - Line to check
   * @returns {boolean} Whether this is a condition start
   */
  const isConditionStart = (line) => {
    return /^\s*if\s*\(/.test(line) || 
           /\belse\s+if\s*\(/.test(line) || 
           /^\s*while\s*\(/.test(line) || 
           /^\s*for\s*\(/.test(line);
  };
  
  /**
   * Checks if a line is a boolean assignment
   * @param {string} line - Line to check
   * @returns {boolean} Whether this is a boolean assignment
   */
  const isBooleanAssignmentLine = (line) => {
    return /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(line);
  };
  
  /**
   * Checks if a line is a boolean expression
   * @param {string} line - Line to check
   * @returns {boolean} Whether this is a boolean expression
   */
  const isBooleanExpressionLine = (line) => {
    return /^\s*return\s+/.test(line) ||
           /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(line) ||
           /\([^)]*[&|]{2}[^)]*\)/.test(line) ||
           (line.includes('{') && /[&|]{2}/.test(line));
  };
  
  /**
   * Checks if a line should stop the lookback search
   * @param {string} checkLine - Line to check
   * @param {boolean} checkLineHasLogicalOp - Whether line has logical operators
   * @param {boolean} checkLineIsBooleanAssignment - Whether line is a boolean assignment
   * @returns {boolean} Whether to stop searching
   */
  const shouldStopConditionLookback = (checkLine, checkLineHasLogicalOp, checkLineIsBooleanAssignment) => {
    // Skip if this is a JSX expression line
    const checkLineIsJSX = checkLine.includes('{') && /[&|]{2}/.test(checkLine);
    if (checkLineIsJSX) {
      return true;
    }
    
    // Skip boolean assignments - they're handled separately
    if (checkLineIsBooleanAssignment) {
      return true;
    }
    
    // Stop if we hit a closing brace or semicolon (end of condition)
    if (/[;}]/.test(checkLine) && !checkLineHasLogicalOp) {
      return true;
    }
    
    return false;
  };
  
  /**
   * Checks if we're continuing a multi-line condition by looking back
   * @param {number} index - Current line index
   * @param {Array} lines - All lines of source code
   * @param {boolean} currentLineHasLogicalOp - Whether current line has logical operators
   * @returns {boolean} Whether we're continuing a condition
   */
  const isContinuingMultiLineCondition = (index, lines, currentLineHasLogicalOp) => {
    if (!currentLineHasLogicalOp) {
      return false;
    }
    
    // Look back up to 5 lines to find the start of the condition
    for (let lookBack = 1; lookBack <= 5 && index - lookBack >= 0; lookBack++) {
      const checkLine = lines[index - lookBack].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
      const checkLineIsCondition = isConditionStart(checkLine);
      const checkLineHasLogicalOp = /[&|]{2}/.test(checkLine);
      const checkLineIsBooleanAssignment = isBooleanAssignmentLine(checkLine);
      
      // Check if we should stop searching
      if (shouldStopConditionLookback(checkLine, checkLineHasLogicalOp, checkLineIsBooleanAssignment)) {
        break;
      }
      
      if (checkLineIsCondition || checkLineHasLogicalOp) {
        return true;
      }
    }
    
    return false;
  };
  
  /**
   * Handles multi-line conditions (conditions split across multiple lines)
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} index - Line index (0-based)
   * @param {Array} lines - All lines of source code
   * @param {number} functionLine - Function line to assign decision points to
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isForLoop - Whether this is a for loop
   * @param {boolean} isWhileLoop - Whether this is a while loop
   * @param {boolean} isJSXExpression - Whether this is a JSX expression
   * @param {boolean} isContinuationOfJSXExpression - Whether this continues a JSX expression
   * @param {boolean} isBooleanAssignment - Whether this is a boolean assignment
   * @param {boolean} isBooleanExpression - Whether this is a boolean expression
   * @param {Array} decisionPoints - Array to push decision points to
   */
  /**
   * Checks if we should exclude this line from multi-line condition processing
   * @param {number} index - Line index
   * @param {boolean} isIfStatement - Whether this is an if statement
   * @param {boolean} isElseIfStatement - Whether this is an else if statement
   * @param {boolean} isJSXExpression - Whether this is a JSX expression
   * @param {boolean} isContinuationOfJSXExpression - Whether this continues a JSX expression
   * @param {boolean} isBooleanAssignment - Whether this is a boolean assignment
   * @param {boolean} isBooleanExpression - Whether this is a boolean expression
   * @returns {boolean} Whether to exclude this line
   */
  const shouldExcludeFromMultiLineConditions = (index, isIfStatement, isElseIfStatement, isJSXExpression, isContinuationOfJSXExpression, isBooleanAssignment, isBooleanExpression) => {
    return index === 0 || isIfStatement || isElseIfStatement || isJSXExpression || isContinuationOfJSXExpression || isBooleanAssignment || isBooleanExpression;
  };
  
  /**
   * Determines if we should process multi-line condition logical operators
   * @param {boolean} isBooleanAssignment - Whether current line is a boolean assignment
   * @param {boolean} isBooleanExpression - Whether current line is a boolean expression
   * @param {boolean} prevLineIsCondition - Whether previous line is a condition start
   * @param {boolean} currentLineHasLogicalOp - Whether current line has logical operators
   * @param {boolean} prevLineIsBooleanAssignment - Whether previous line is a boolean assignment
   * @param {boolean} prevLineIsBooleanExpression - Whether previous line is a boolean expression
   * @param {boolean} isContinuingCondition - Whether we're continuing a multi-line condition
   * @returns {boolean} Whether to process
   */
  const shouldProcessMultiLineCondition = (isBooleanAssignment, isBooleanExpression, prevLineIsCondition, currentLineHasLogicalOp, prevLineIsBooleanAssignment, prevLineIsBooleanExpression, isContinuingCondition) => {
    if (isBooleanAssignment || isBooleanExpression) {
      return false;
    }
    
    const prevLineContinuesCondition = prevLineIsCondition && currentLineHasLogicalOp && !prevLineIsBooleanAssignment && !prevLineIsBooleanExpression;
    const continuingMultiLine = isContinuingCondition && !prevLineIsBooleanAssignment && !prevLineIsBooleanExpression;
    
    return prevLineContinuesCondition || continuingMultiLine;
  };
  
  /**
   * Processes logical operators for multi-line conditions
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processMultiLineConditionOperators = (lineWithoutComments, lineNum, functionLine, decisionPoints) => {
    const andMatches = lineWithoutComments.match(/&&/g);
    const orMatches = lineWithoutComments.match(/\|\|/g);
    if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
    if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
  };
  
  const parseMultiLineConditions = (lineWithoutComments, lineNum, index, lines, functionLine, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isJSXExpression, isContinuationOfJSXExpression, isBooleanAssignment, isBooleanExpression, decisionPoints) => {
    // EXCLUDE JSX expressions and boolean expressions - they're already handled above
    if (shouldExcludeFromMultiLineConditions(index, isIfStatement, isElseIfStatement, isJSXExpression, isContinuationOfJSXExpression, isBooleanAssignment, isBooleanExpression)) {
      return;
    }
    
    const prevLine = lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
    const prevLineHasLogicalOp = /[&|]{2}/.test(prevLine);
    const currentLineHasLogicalOp = /[&|]{2}/.test(lineWithoutComments);
    const prevLineIsCondition = isConditionStart(prevLine);
    const prevLineIsBooleanAssignment = isBooleanAssignmentLine(prevLine);
    const prevLineIsBooleanExpression = isBooleanExpressionLine(prevLine);
    
    // Check if we're continuing a multi-line condition
    const isContinuingCondition = isContinuingMultiLineCondition(index, lines, currentLineHasLogicalOp);
    
    // Determine if we should process
    const shouldProcess = shouldProcessMultiLineCondition(
      isBooleanAssignment,
      isBooleanExpression,
      prevLineIsCondition,
      currentLineHasLogicalOp,
      prevLineIsBooleanAssignment,
      prevLineIsBooleanExpression,
      isContinuingCondition
    );
    
    if (shouldProcess && !isIfStatement && !isElseIfStatement && !isForLoop && !isWhileLoop) {
      processMultiLineConditionOperators(lineWithoutComments, lineNum, functionLine, decisionPoints);
    }
  };
  
  /**
   * Checks if we're in a destructured assignment by looking backwards
   * @param {string} lineWithoutComments - Current line without comments
   * @param {number} index - Current line index
   * @param {number} lineNum - Current line number
   * @param {Array} lines - All lines of source code
   * @param {Object} boundary - Function boundary
   * @returns {boolean} Whether we're in a destructured assignment
   */
  const isInDestructuredAssignment = (lineWithoutComments, index, lineNum, lines, boundary) => {
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
  };
  
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
  const parseDestructuredAssignments = (lineWithoutComments, lineNum, index, lines, functionLine, boundary, decisionPoints) => {
    // Only check if this is near the start of the function (first 15 lines)
    if (!boundary || lineNum < boundary.start || lineNum > boundary.start + 15) {
      return;
    }
    
    // Check if this line has a default parameter pattern (prop = value)
    const defaultParamPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?![=<>])(?:"[^"]*"|'[^']*'|`[^`]*`|[^=,}\s]+)/g;
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
  };
  
  /**
   * Finds the correct function line for an if statement
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Default function line
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @returns {number} Function line to assign the if statement to
   */
  const findIfStatementFunctionLine = (lineNum, functionLine, functionBoundaries) => {
    const containingFunctions = Array.from(functionBoundaries.entries())
      .filter(([fl, b]) => b.start <= lineNum && lineNum <= b.end);
    
    if (containingFunctions.length <= 1) {
      return functionLine;
    }
    
    // Sort by boundary size (largest first) to find parent functions
    const sortedBySize = [...containingFunctions].sort((a, b) => {
      const aSize = a[1].end - a[1].start;
      const bSize = b[1].end - b[1].start;
      return bSize - aSize; // Largest first (parent functions)
    });
    
    // Check if any nested functions ended before this line
    const nestedFunctionsEndedBefore = sortedBySize.filter(([fl, b]) => 
      b.end < lineNum && fl !== sortedBySize[0][0]
    );
    
    if (nestedFunctionsEndedBefore.length > 0) {
      return sortedBySize[0][0]; // Assign to parent (largest boundary)
    }
    
    // No nested functions ended before - use the one with smallest boundary (innermost)
    const smallestBoundary = sortedBySize[sortedBySize.length - 1];
    const isInsideSmallest = lineNum > smallestBoundary[1].start && lineNum <= smallestBoundary[1].end;
    
    return isInsideSmallest ? smallestBoundary[0] : sortedBySize[0][0];
  };
  
  /**
   * Finds the function line for a logical operator in an if statement
   * @param {number} operatorIndex - Index of the operator
   * @param {number} arrowIndex - Index of => if arrow function exists
   * @param {boolean} hasArrowFunction - Whether there's an arrow function
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Default function line
   * @param {Array} callbacksOnThisLine - Callbacks on this line
   * @param {Function} getInnermostFunction - Function to get innermost function
   * @returns {number} Function line to assign the operator to
   */
  const findIfStatementOperatorFunctionLine = (operatorIndex, arrowIndex, hasArrowFunction, lineNum, functionLine, callbacksOnThisLine, getInnermostFunction) => {
    if (hasArrowFunction && operatorIndex > arrowIndex) {
      const callbackFunctionLine = getInnermostFunction(lineNum);
      if (callbackFunctionLine && callbackFunctionLine !== functionLine) {
        return callbackFunctionLine;
      } else if (callbacksOnThisLine.length > 0) {
        return callbacksOnThisLine[0][0];
      }
    }
    return functionLine;
  };
  
  /**
   * Processes a single type of logical operator in if statement conditions
   * @param {Array} matches - Matches for the operator
   * @param {string} operatorType - Operator type ('&&' or '||')
   * @param {string} operatorName - Operator name ('logical AND' or 'logical OR')
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {number} arrowIndex - Index of => if arrow function exists
   * @param {boolean} hasArrowFunction - Whether there's an arrow function
   * @param {Array} callbacksOnThisLine - Callbacks on this line
   * @param {Function} getInnermostFunction - Function to get innermost function
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processIfStatementOperatorType = (matches, operatorType, operatorName, lineWithoutComments, lineNum, functionLine, arrowIndex, hasArrowFunction, callbacksOnThisLine, getInnermostFunction, decisionPoints) => {
    for (const match of matches) {
      const operatorIndex = match.index;
      const assignedFunctionLine = findIfStatementOperatorFunctionLine(
        operatorIndex,
        arrowIndex,
        hasArrowFunction,
        lineNum,
        functionLine,
        callbacksOnThisLine,
        getInnermostFunction
      );
      decisionPoints.push({ line: lineNum, type: operatorType, name: operatorName, functionLine: assignedFunctionLine });
    }
  };
  
  /**
   * Processes logical operators in if statement conditions, handling callbacks
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} getInnermostFunction - Function to get innermost function for a line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processIfStatementLogicalOperators = (lineWithoutComments, lineNum, functionLine, functionBoundaries, getInnermostFunction, decisionPoints) => {
    const callbacksOnThisLine = Array.from(functionBoundaries.entries())
      .filter(([fl, boundary]) => boundary.start === lineNum && fl !== functionLine);
    
    const andMatches = Array.from(lineWithoutComments.matchAll(/&&/g));
    const orMatches = Array.from(lineWithoutComments.matchAll(/\|\|/g));
    const arrowIndex = lineWithoutComments.indexOf('=>');
    const hasArrowFunction = arrowIndex !== -1 && callbacksOnThisLine.length > 0;
    
    // Process && operators
    processIfStatementOperatorType(andMatches, '&&', 'logical AND', lineWithoutComments, lineNum, functionLine, arrowIndex, hasArrowFunction, callbacksOnThisLine, getInnermostFunction, decisionPoints);
    
    // Process || operators
    processIfStatementOperatorType(orMatches, '||', 'logical OR', lineWithoutComments, lineNum, functionLine, arrowIndex, hasArrowFunction, callbacksOnThisLine, getInnermostFunction, decisionPoints);
  };
  
  /**
   * Processes else-if statements and their logical operators
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processElseIfStatement = (lineWithoutComments, lineNum, functionLine, decisionPoints) => {
    decisionPoints.push({ line: lineNum, type: 'else if', name: 'else if statement', functionLine });
    const andMatches = lineWithoutComments.match(/&&/g);
    const orMatches = lineWithoutComments.match(/\|\|/g);
    if (andMatches) {
      andMatches.forEach(() => {
        decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine });
      });
    }
    if (orMatches) {
      orMatches.forEach(() => {
        decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine });
      });
    }
  };
  
  /**
   * Checks if a line is a regular for loop (not for...of or for...in)
   * @param {string} lineWithoutComments - Line without comments
   * @returns {boolean} Whether this is a regular for loop
   */
  const isRegularForLoop = (lineWithoutComments) => {
    return /^\s*for\s*\(/.test(lineWithoutComments) && 
           !/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments) && 
           !/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments);
  };
  
  /**
   * Processes logical operators for loops with conditions
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processLoopLogicalOperators = (lineWithoutComments, lineNum, functionLine, decisionPoints) => {
    const andMatches = lineWithoutComments.match(/&&/g);
    const orMatches = lineWithoutComments.match(/\|\|/g);
    if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
    if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
  };
  
  /**
   * Processes loops (for, for...of, for...in, while, do...while) and their logical operators
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processLoops = (lineWithoutComments, lineNum, functionLine, decisionPoints) => {
    // Regular for loop
    if (isRegularForLoop(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for', name: 'for loop', functionLine });
      processLoopLogicalOperators(lineWithoutComments, lineNum, functionLine, decisionPoints);
      return;
    }
    
    // for...of loop
    if (/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for...of', name: 'for...of loop', functionLine });
      return;
    }
    
    // for...in loop
    if (/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for...in', name: 'for...in loop', functionLine });
      return;
    }
    
    // while loop
    if (/^\s*while\s*\(/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'while', name: 'while loop', functionLine });
      processLoopLogicalOperators(lineWithoutComments, lineNum, functionLine, decisionPoints);
      return;
    }
    
    // do...while loop
    if (/^\s*do\s*\{/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'do...while', name: 'do...while loop', functionLine });
    }
  };
  
  /**
   * Processes switch statements, case statements, and catch blocks
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processSwitchAndCatch = (lineWithoutComments, lineNum, functionLine, decisionPoints) => {
    // Switch statement
    const isSwitchStatement = /^\s*switch\s*\(/.test(lineWithoutComments);
    if (isSwitchStatement) {
      decisionPoints.push({ line: lineNum, type: 'switch', name: 'switch statement', functionLine });
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
      return;
    }
    
    // Case statements
    if (/^\s*case\s+/.test(lineWithoutComments) || /^\s*default\s*:/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'case', name: 'case/default', functionLine });
      return;
    }
    
    // Catch blocks
    const isCatchBlock = /\bcatch\s*[({]/.test(lineWithoutComments);
    if (isCatchBlock) {
      decisionPoints.push({ line: lineNum, type: 'catch', name: 'catch block', functionLine });
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
  };
  
  /**
   * Processes optional chaining operators (?.)
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processOptionalChaining = (lineWithoutComments, lineNum, functionLine, isInsideStringLiteral, decisionPoints) => {
    let searchIndex = 0;
    while ((searchIndex = lineWithoutComments.indexOf('?.', searchIndex)) !== -1) {
      if (!isInsideStringLiteral(lineWithoutComments, searchIndex)) {
        decisionPoints.push({ line: lineNum, type: '?.', name: 'optional chaining', functionLine });
      }
      searchIndex += 2; // Move past this ?.
    }
  };
  
  /**
   * Parses control flow statements (if, else if, loops, switch, catch, optional chaining)
   * @param {string} lineWithoutComments - Line without comments
   * @param {number} lineNum - Line number
   * @param {number} functionLine - Function line to assign decision points to
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} getInnermostFunction - Function to get innermost function for a line
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const parseControlFlowStatements = (lineWithoutComments, lineNum, functionLine, functionBoundaries, getInnermostFunction, isInsideStringLiteral, decisionPoints) => {
    // Parse if statements
    const isIfStatement = /^\s*if\s*\(/.test(lineWithoutComments);
    if (isIfStatement) {
      const assignedFunctionLine = findIfStatementFunctionLine(lineNum, functionLine, functionBoundaries);
      decisionPoints.push({ line: lineNum, type: 'if', name: 'if statement', functionLine: assignedFunctionLine });
      processIfStatementLogicalOperators(lineWithoutComments, lineNum, assignedFunctionLine, functionBoundaries, getInnermostFunction, decisionPoints);
    }
    
    // Parse else if statements
    const isElseIfStatement = /\belse\s+if\s*\(/.test(lineWithoutComments);
    if (isElseIfStatement) {
      processElseIfStatement(lineWithoutComments, lineNum, functionLine, decisionPoints);
    }
    
    // Parse loops
    processLoops(lineWithoutComments, lineNum, functionLine, decisionPoints);
    
    // Parse switch and catch
    processSwitchAndCatch(lineWithoutComments, lineNum, functionLine, decisionPoints);
    
    // Parse optional chaining
    processOptionalChaining(lineWithoutComments, lineNum, functionLine, isInsideStringLiteral, decisionPoints);
  };
  
  /**
   * Gets the function line for a control structure, preferring immediate parent over nested callbacks
   * @param {boolean} isControlStructure - Whether this line is a control structure
   * @param {number} lineNum - Line number
   * @param {Array} containingFunctions - Functions containing this line
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} getInnermostFunction - Function to get innermost function for a line
   * @returns {number|null} Function line or null
   */
  const getFunctionLineForControlStructure = (isControlStructure, lineNum, containingFunctions, functionBoundaries, getInnermostFunction) => {
    if (!isControlStructure) {
      return getInnermostFunction(lineNum);
    }
    
    // For control structures, find the immediate parent function (not nested callbacks, not outermost function)
    // Filter to functions that actually contain this line
    const validFunctions = containingFunctions.filter(f => 
      f.boundary.start <= lineNum && lineNum <= f.boundary.end
    );
    
    if (validFunctions.length === 0) {
      return getInnermostFunction(lineNum);
    }
    
    // Sort by start line (earliest first)
    const sortedFunctions = [...validFunctions].sort((a, b) => a.boundary.start - b.boundary.start);
    
    // Find nested functions starting on this line (callbacks)
    const nestedFunctionsOnThisLine = sortedFunctions.filter(f => 
      f.boundary.start === lineNum && f.boundary.start > sortedFunctions[0].boundary.start
    );
    
    if (nestedFunctionsOnThisLine.length > 0) {
      // There are nested callbacks on this line - find the immediate parent (not the outermost)
      const nonNestedFunctions = sortedFunctions.filter(f => 
        !nestedFunctionsOnThisLine.some(nested => nested.functionLine === f.functionLine)
      );
      
      if (nonNestedFunctions.length > 0) {
        // Find the function that starts most recently before this line (immediate parent)
        const immediateParent = nonNestedFunctions
          .filter(f => f.boundary.start < lineNum && f.boundary.end >= lineNum)
          .sort((a, b) => b.boundary.start - a.boundary.start)[0]; // Most recent start
        
        if (immediateParent) {
          return immediateParent.functionLine;
        }
        // Fallback: use the first non-nested function
        return nonNestedFunctions[0].functionLine;
      }
      // Fallback: use normal innermost function logic
      return getInnermostFunction(lineNum);
    }
    
    // No nested callbacks on this line - but check if we're after nested callbacks have ended
    const allContainingFunctions = Array.from(functionBoundaries.entries())
      .filter(([fl, b]) => b.start <= lineNum && lineNum <= b.end);
    
    if (allContainingFunctions.length > 1) {
      // Multiple functions contain this line - check if any nested ones ended before this line
      const nestedEndedBefore = allContainingFunctions.filter(([fl, b]) => b.end < lineNum);
      if (nestedEndedBefore.length > 0) {
        // Nested functions ended before - prefer parent (largest boundary)
        const parentFunc = allContainingFunctions.reduce((max, [fl, b]) => {
          const maxSize = max[1].end - max[1].start;
          const bSize = b.end - b.start;
          return bSize > maxSize ? [fl, b] : max;
        });
        return parentFunc[0];
      }
    }
    
    // Use normal innermost function logic
    return getInnermostFunction(lineNum);
  };
  
  /**
   * Processes a single line to extract decision points
   * @param {string} line - The line to process
   * @param {number} index - Line index (0-based)
   * @param {Array} lines - All lines of source code
   * @param {Map} lineToFunctions - Map of line number -> array of functions containing it
   * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
   * @param {Function} getInnermostFunction - Function to get innermost function for a line
   * @param {Function} isInsideStringLiteral - Function to check if character is inside string
   * @param {Function} hasQuestionMarkOutsideString - Function to check for question marks outside strings
   * @param {Array} decisionPoints - Array to push decision points to
   */
  const processLineForDecisionPoints = (line, index, lines, lineToFunctions, functionBoundaries, getInnermostFunction, isInsideStringLiteral, hasQuestionMarkOutsideString, decisionPoints) => {
    const lineNum = index + 1;
    const containingFunctions = lineToFunctions.get(lineNum) || [];
    if (containingFunctions.length === 0) return; // Skip lines outside functions
    
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return; // Skip empty lines and comments
    }
    
    // Remove comments from line for parsing
    const lineWithoutComments = line.replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
    
    // Special handling for control structures (if, for, while, etc.) that contain callbacks
    // These should always belong to the immediate parent function, not nested callbacks
    // Check if this line contains a control structure
    const isControlStructure = /^\s*(if|for|while|switch)\s*\(/.test(lineWithoutComments);
    
    // Find the function to assign this decision point to
    // For control structures, prefer immediate parent function even if there's a nested callback on the same line
    const functionLine = getFunctionLineForControlStructure(
      isControlStructure,
      lineNum,
      containingFunctions,
      functionBoundaries,
      getInnermostFunction
    );
    
    if (!functionLine) return; // Skip if no function found
    
    // Parse default parameters in function signatures
    parseDefaultParameters(
      lineWithoutComments,
      lineNum,
      index,
      lines,
      functionLine,
      functionBoundaries,
      getInnermostFunction,
      decisionPoints
    );
    
    const boundary = functionBoundaries.get(functionLine);
    
    // Parse destructured assignments with default values in function bodies
    parseDestructuredAssignments(
      lineWithoutComments,
      lineNum,
      index,
      lines,
      functionLine,
      boundary,
      decisionPoints
    );
    
    // Parse control flow statements (if, else if, loops, switch, catch, optional chaining)
    parseControlFlowStatements(
      lineWithoutComments,
      lineNum,
      functionLine,
      functionBoundaries,
      getInnermostFunction,
      isInsideStringLiteral,
      decisionPoints
    );
    
    // Re-declare control flow flags for use in boolean expression parsing
    const isIfStatement = /^\s*if\s*\(/.test(lineWithoutComments);
    const isElseIfStatement = /\belse\s+if\s*\(/.test(lineWithoutComments);
    const isForLoop = /^\s*for\s*\(/.test(lineWithoutComments) && !/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments) && !/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments);
    const isWhileLoop = /^\s*while\s*\(/.test(lineWithoutComments);
    const isSwitchStatement = /^\s*switch\s*\(/.test(lineWithoutComments);
    const isCatchBlock = /\bcatch\s*[({]/.test(lineWithoutComments);
    
    // Parse ternary operators and nullish coalescing
    parseTernaryOperators(
      lineWithoutComments,
      lineNum,
      index,
      lines,
      functionLine,
      isInsideStringLiteral,
      hasQuestionMarkOutsideString,
      decisionPoints
    );
    
    // Detect JSX expressions
    const { isJSXExpression, isContinuationOfJSXExpression } = detectJSXExpressions(
      lineWithoutComments,
      index,
      lines,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop
    );
    
    // Parse boolean expressions (&&, || operators in return statements, assignments, JSX, etc.)
    parseBooleanExpressions(
      lineWithoutComments,
      lineNum,
      functionLine,
      functionBoundaries,
      isInsideStringLiteral,
      hasQuestionMarkOutsideString,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop,
      isSwitchStatement,
      isCatchBlock,
      isJSXExpression,
      isContinuationOfJSXExpression,
      decisionPoints
    );
    
    // Handle multi-line conditions (conditions split across multiple lines)
    const isBooleanAssignment = /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(lineWithoutComments);
    const hasLogicalOp = /[&|]{2}/.test(lineWithoutComments);
    const isReturnStatement = /^\s*return\s+/.test(lineWithoutComments);
    const isBooleanExpression = detectBooleanExpression(
      lineWithoutComments,
      isReturnStatement,
      isJSXExpression,
      isContinuationOfJSXExpression,
      hasLogicalOp,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop,
      isSwitchStatement,
      isCatchBlock
    );
    
    parseMultiLineConditions(
      lineWithoutComments,
      lineNum,
      index,
      lines,
      functionLine,
      isIfStatement,
      isElseIfStatement,
      isForLoop,
      isWhileLoop,
      isJSXExpression,
      isContinuationOfJSXExpression,
      isBooleanAssignment,
      isBooleanExpression,
      decisionPoints
    );
  };
  
  // Process each line
  lines.forEach((line, index) => {
    processLineForDecisionPoints(
      line,
      index,
      lines,
      lineToFunctions,
      functionBoundaries,
      getInnermostFunction,
      isInsideStringLiteral,
      hasQuestionMarkOutsideString,
      decisionPoints
    );
  });
  
  // Deduplicate decision points: remove duplicates based on line, type, functionLine, and name
  // This prevents the same decision point from being counted twice
  // BUT: Allow multiple instances of the same type on the same line (e.g., multiple && operators, nested ternaries)
  // by using a counter to make each instance unique
  const seen = new Map(); // Map from key to count
  const deduplicated = [];
  for (const dp of decisionPoints) {
    const baseKey = `${dp.line}:${dp.type}:${dp.functionLine}`;
    const count = seen.get(baseKey) || 0;
    seen.set(baseKey, count + 1);
    
    // For &&, ||, ternary operators, and default parameters, allow multiple instances on the same line
    // (nested ternaries like `a ? b : (c ? d : e)` should count both ? operators)
    // (multiple default parameters like `function foo(x = 1, y = 2)` should count both)
    // For other types, only keep one instance per line
    if (dp.type === '&&' || dp.type === '||' || dp.type === 'ternary' || dp.type === 'default parameter') {
      // Always add &&, ||, ternary operators, and default parameters (they can appear multiple times on the same line)
      deduplicated.push(dp);
    } else {
      // For other types, only add if this is the first instance
      if (count === 0) {
        deduplicated.push(dp);
      }
    }
  }
  
  return deduplicated;
}
