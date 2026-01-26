/**
 * Multi-line condition handling
 * 
 * This module handles detection of logical operators (&&, ||) in multi-line conditions,
 * where conditions are split across multiple lines (e.g., if statements with conditions
 * that span multiple lines).
 */

/**
 * Checks if a line is a condition start (if, else if, while, for)
 * @param {string} line - Line to check
 * @returns {boolean} Whether this is a condition start
 */
export function isConditionStart(line) {
  return /^\s*if\s*\(/.test(line) || 
         /\belse\s+if\s*\(/.test(line) || 
         /^\s*while\s*\(/.test(line) || 
         /^\s*for\s*\(/.test(line);
}

/**
 * Checks if a line is a boolean assignment
 * @param {string} line - Line to check
 * @returns {boolean} Whether this is a boolean assignment
 */
export function isBooleanAssignmentLine(line) {
  return /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(line);
}

/**
 * Checks if a line is a boolean expression
 * @param {string} line - Line to check
 * @returns {boolean} Whether this is a boolean expression
 */
export function isBooleanExpressionLine(line) {
  return /^\s*return\s+/.test(line) ||
         /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(line) ||
         /\([^)]*[&|]{2}[^)]*\)/.test(line) ||
         (line.includes('{') && /[&|]{2}/.test(line));
}

/**
 * Checks if a line should stop the lookback search
 * @param {string} checkLine - Line to check
 * @param {boolean} checkLineHasLogicalOp - Whether line has logical operators
 * @param {boolean} checkLineIsBooleanAssignment - Whether line is a boolean assignment
 * @returns {boolean} Whether to stop searching
 */
export function shouldStopConditionLookback(checkLine, checkLineHasLogicalOp, checkLineIsBooleanAssignment) {
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
}

/**
 * Checks if we're continuing a multi-line condition by looking back
 * @param {number} index - Current line index
 * @param {Array} lines - All lines of source code
 * @param {boolean} currentLineHasLogicalOp - Whether current line has logical operators
 * @returns {boolean} Whether we're continuing a condition
 */
export function isContinuingMultiLineCondition(index, lines, currentLineHasLogicalOp) {
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
}

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
export function shouldExcludeFromMultiLineConditions(index, isIfStatement, isElseIfStatement, isJSXExpression, isContinuationOfJSXExpression, isBooleanAssignment, isBooleanExpression) {
  return index === 0 || isIfStatement || isElseIfStatement || isJSXExpression || isContinuationOfJSXExpression || isBooleanAssignment || isBooleanExpression;
}

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
export function shouldProcessMultiLineCondition(isBooleanAssignment, isBooleanExpression, prevLineIsCondition, currentLineHasLogicalOp, prevLineIsBooleanAssignment, prevLineIsBooleanExpression, isContinuingCondition) {
  if (isBooleanAssignment || isBooleanExpression) {
    return false;
  }
  
  const prevLineContinuesCondition = prevLineIsCondition && currentLineHasLogicalOp && !prevLineIsBooleanAssignment && !prevLineIsBooleanExpression;
  const continuingMultiLine = isContinuingCondition && !prevLineIsBooleanAssignment && !prevLineIsBooleanExpression;
  
  return prevLineContinuesCondition || continuingMultiLine;
}

/**
 * Processes logical operators for multi-line conditions
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} lineNum - Line number
 * @param {number} functionLine - Function line
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function processMultiLineConditionOperators(lineWithoutComments, lineNum, functionLine, decisionPoints) {
  const andMatches = lineWithoutComments.match(/&&/g);
  const orMatches = lineWithoutComments.match(/\|\|/g);
  if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
  if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
}

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
export function parseMultiLineConditions(lineWithoutComments, lineNum, index, lines, functionLine, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isJSXExpression, isContinuationOfJSXExpression, isBooleanAssignment, isBooleanExpression, decisionPoints) {
  // EXCLUDE JSX expressions and boolean expressions - they're already handled above
  if (shouldExcludeFromMultiLineConditions(index, isIfStatement, isElseIfStatement, isJSXExpression, isContinuationOfJSXExpression, isBooleanAssignment, isBooleanExpression)) {
    return;
  }
  
  const prevLine = lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
  // eslint-disable-next-line no-unused-vars
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
}
