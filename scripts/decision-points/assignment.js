/**
 * Function assignment logic for decision points
 * 
 * This module handles assigning decision points to the correct function,
 * especially for nested functions where ESLint assigns decision points to
 * the innermost function that contains them.
 */

/**
 * Filters functions to only those that actually contain the line
 * @param {Array} containingFunctions - Array of functions
 * @param {number} lineNum - Line number
 * @returns {Array} Valid functions that contain the line
 */
export function getValidFunctions(containingFunctions, lineNum) {
  return containingFunctions.filter(f => 
    f.boundary.start <= lineNum && lineNum <= f.boundary.end
  );
}

/**
 * Finds the immediate parent function
 * @param {Array} sortedFunctions - Functions sorted by start line
 * @param {number} lineNum - Line number
 * @returns {Object|null} Immediate parent function or null
 */
export function findImmediateParent(sortedFunctions, lineNum) {
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
}

/**
 * Finds nested functions ending on or before this line
 * @param {Array} sortedFunctions - Functions sorted by start line
 * @param {Object} parentFunction - Parent function
 * @param {number} lineNum - Line number
 * @returns {Array} Nested functions ending on or before this line
 */
export function findNestedFunctionsEndingOnOrBefore(sortedFunctions, parentFunction, lineNum) {
  return sortedFunctions.filter(f => 
    f.boundary.end <= lineNum && 
    f.boundary.start > parentFunction.boundary.start &&
    f.boundary.start <= lineNum
  );
}

/**
 * Finds nested functions starting on this line
 * @param {Array} sortedFunctions - Functions sorted by start line
 * @param {Object} parentFunction - Parent function
 * @param {number} lineNum - Line number
 * @returns {Array} Nested functions starting on this line
 */
export function findNestedFunctionsStartingOnLine(sortedFunctions, parentFunction, lineNum) {
  return sortedFunctions.filter(f => 
    f.boundary.start === lineNum && f.boundary.start > parentFunction.boundary.start
  );
}

/**
 * Checks if line is inside an active nested function
 * @param {Array} sortedFunctions - Functions sorted by start line
 * @param {Object} parentFunction - Parent function
 * @param {number} lineNum - Line number
 * @returns {boolean} Whether line is inside active nested function
 */
export function isInsideActiveNestedFunction(sortedFunctions, parentFunction, lineNum) {
  return sortedFunctions.some(f => 
    f.boundary.start > parentFunction.boundary.start && 
    f.boundary.start < lineNum && 
    lineNum < f.boundary.end
  );
}

/**
 * Finds active nested functions
 * @param {Array} sortedFunctions - Functions sorted by start line
 * @param {Object} parentFunction - Parent function
 * @param {number} lineNum - Line number
 * @returns {Array} Active nested functions
 */
export function findActiveNestedFunctions(sortedFunctions, parentFunction, lineNum) {
  return sortedFunctions.filter(f => 
    f.boundary.start > parentFunction.boundary.start && 
    f.boundary.start < lineNum && 
    lineNum < f.boundary.end
  );
}

/**
 * Finds functions starting on this line
 * @param {Array} validFunctions - Valid functions
 * @param {number} lineNum - Line number
 * @returns {Array} Functions starting on this line
 */
export function findFunctionsStartingOnLine(validFunctions, lineNum) {
  return validFunctions.filter(f => f.boundary.start === lineNum);
}

/**
 * Finds function with smallest boundary
 * @param {Array} functions - Array of functions
 * @returns {Object} Function with smallest boundary
 */
export function findSmallestBoundaryFunction(functions) {
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
}

/**
 * Finds single-line nested functions (start === end === lineNum)
 * @param {Array} functions - Array of functions
 * @param {number} lineNum - Line number
 * @returns {Array} Single-line nested functions
 */
export function findSingleLineNestedFunctions(functions, lineNum) {
  return functions.filter(f => 
    f.boundary.start === lineNum && f.boundary.end === lineNum
  );
}

/**
 * Handles single-line nested functions on this line
 * @param {Array} singleLineFunctions - Single-line nested functions
 * @returns {number|null} Function line or null
 */
export function handleSingleLineNestedOnLine(singleLineFunctions) {
  if (singleLineFunctions.length > 0) {
    return findSmallestBoundaryFunction(singleLineFunctions).functionLine;
  }
  return null;
}

/**
 * Finds nested functions ending exactly on this line
 * @param {Array} nestedEndingOnOrBefore - Nested functions ending on or before
 * @param {number} lineNum - Line number
 * @returns {Array} Functions ending on this line
 */
export function findNestedEndingOnLine(nestedEndingOnOrBefore, lineNum) {
  return nestedEndingOnOrBefore.filter(f => f.boundary.end === lineNum);
}

/**
 * Finds nested functions ending before this line
 * @param {Array} nestedEndingOnOrBefore - Nested functions ending on or before
 * @param {number} lineNum - Line number
 * @returns {Array} Functions ending before this line
 */
export function findNestedEndedBefore(nestedEndingOnOrBefore, lineNum) {
  return nestedEndingOnOrBefore.filter(f => f.boundary.end < lineNum);
}

/**
 * Handles nested functions ending on or before this line
 * @param {Array} nestedEndingOnOrBefore - Nested functions ending on or before
 * @param {Object} parentFunction - Parent function
 * @param {number} lineNum - Line number
 * @param {boolean} isInsideActive - Whether inside active nested function
 * @returns {number|null} Function line or null
 */
export function handleNestedFunctionsEnding(nestedEndingOnOrBefore, parentFunction, lineNum, isInsideActive) {
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
}

/**
 * Handles active nested functions
 * ESLint assigns decision points to the function that contains them.
 * If a decision point is inside both a parent and nested function, ESLint assigns it to the nested function.
 * @param {Array} activeNested - Active nested functions (functions that contain the line and haven't ended)
 * @returns {number|null} Function line or null
 */
export function handleActiveNestedFunctions(activeNested) {
  if (activeNested.length > 0) {
    // ESLint assigns to the innermost (smallest boundary) active nested function
    return findSmallestBoundaryFunction(activeNested).functionLine;
  }
  return null;
}

/**
 * Handles the case when there's only one or no containing function
 * @param {Array} containingFunctions - Array of containing functions
 * @param {Array} validFunctions - Valid functions
 * @returns {number|null} Function line or null
 */
export function handleSimpleCases(containingFunctions, validFunctions) {
  if (containingFunctions.length === 0) return null;
  if (containingFunctions.length === 1) return containingFunctions[0].functionLine;
  if (validFunctions.length === 0) return containingFunctions[0].functionLine;
  if (validFunctions.length === 1) return validFunctions[0].functionLine;
  return null;
}

/**
 * Handles nested functions starting on this line
 * @param {Array} nestedStartingOnLine - Nested functions starting on line
 * @param {Array} singleLineNestedOnLine - Single-line nested functions
 * @param {Object} parentFunction - Parent function
 * @returns {number|null} Function line or null
 */
export function handleNestedStartingOnLine(nestedStartingOnLine, singleLineNestedOnLine, parentFunction) {
  const result = handleSingleLineNestedOnLine(singleLineNestedOnLine);
  if (result !== null) return result;
  if (nestedStartingOnLine.length > 0) return parentFunction.functionLine;
  return null;
}

/**
 * Handles all nested function cases
 * @param {Array} sortedFunctions - Sorted functions
 * @param {Object} parentFunction - Parent function
 * @param {number} lineNum - Line number
 * @returns {number|null} Function line or null
 */
export function handleAllNestedCases(sortedFunctions, parentFunction, lineNum) {
  const nestedEndingOnOrBefore = findNestedFunctionsEndingOnOrBefore(sortedFunctions, parentFunction, lineNum);
  const isInsideActive = isInsideActiveNestedFunction(sortedFunctions, parentFunction, lineNum);
  const endingResult = handleNestedFunctionsEnding(nestedEndingOnOrBefore, parentFunction, lineNum, isInsideActive);
  if (endingResult !== null) return endingResult;
  
  const activeNested = findActiveNestedFunctions(sortedFunctions, parentFunction, lineNum);
  return handleActiveNestedFunctions(activeNested);
}

/**
 * Handles functions starting on this line or finds smallest boundary
 * @param {Array} validFunctions - Valid functions
 * @param {number} lineNum - Line number
 * @returns {number} Function line
 */
export function handleFinalCases(validFunctions, lineNum) {
  const functionsStartingOnLine = findFunctionsStartingOnLine(validFunctions, lineNum);
  if (functionsStartingOnLine.length > 0) {
    return findSmallestBoundaryFunction(functionsStartingOnLine).functionLine;
  }
  return findSmallestBoundaryFunction(validFunctions).functionLine;
}

/**
 * Helper function to find the innermost function for a given line
 * A function "contains" a line if: function.start <= lineNum <= function.end
 * When multiple functions contain a line, assign to the innermost (smallest boundary)
 * 
 * @param {number} lineNum - Line number
 * @param {Map} lineToFunctions - Map of line number -> array of functions containing it
 * @returns {number|null} Function line number or null
 */
export function getInnermostFunction(lineNum, lineToFunctions) {
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
}

/**
 * Finds the function line for a control structure (if, for, while, switch)
 * Control structures should belong to the immediate parent function, not nested callbacks
 * 
 * @param {boolean} isControlStructure - Whether this is a control structure
 * @param {number} lineNum - Line number
 * @param {Array} containingFunctions - Functions containing this line
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Function} getInnermostFunction - Function to get innermost function
 * @returns {number|null} Function line or null
 */
export function getFunctionLineForControlStructure(isControlStructure, lineNum, containingFunctions, functionBoundaries, getInnermostFunction) {
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
    .filter(([_fl, b]) => b.start <= lineNum && lineNum <= b.end);
  
  if (allContainingFunctions.length > 1) {
    // Multiple functions contain this line - check if any nested ones ended before this line
    const nestedEndedBefore = allContainingFunctions.filter(([_fl, b]) => b.end < lineNum);
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
}
