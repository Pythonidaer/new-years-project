/**
 * Logical operator parsing for boolean expressions
 * 
 * This module handles detection of logical operators (&&, ||) in boolean expressions:
 * - Return statements: `return a && b`
 * - Variable assignments: `const result = a || b`
 * - JSX expressions: `{condition && <Component />}`
 * - Expressions in parentheses: `(a && b)`
 * 
 * Note: Operators in control flow statements (if, for, while) and ternaries are handled
 * by control-flow.js and ternaries.js respectively.
 */

import { isInsideComment, isOperatorInStringLiteral } from './string-literals.js';
import { detectMultiLineTernaries } from './ternaries.js';

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
export function detectJSXExpressions(lineWithoutComments, index, lines, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop) {
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
}

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
export function checkJSXContinuation(lineWithoutComments, index, lines, hasLogicalOp, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop) {
  if (index === 0) return false;
  if (isIfStatement || isElseIfStatement || isForLoop || isWhileLoop) return false;
  
  const prevLine = lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
  const prevLineHasJSXOpening = prevLine.includes('{');
  const currentLineHasJSXOpening = lineWithoutComments.includes('{');
  return prevLineHasJSXOpening && hasLogicalOp && !currentLineHasJSXOpening;
}

/**
 * Finds the correct function line for a logical operator in a boolean expression
 * @param {string} lineWithoutComments - Line without comments
 * @param {number} lineNum - Line number
 * @param {number} operatorIndex - Index of the operator in the line
 * @param {number} functionLine - Default function line
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @returns {number} Function line to assign the operator to
 */
export function findBooleanExpressionFunctionLine(lineWithoutComments, lineNum, operatorIndex, functionLine, functionBoundaries) {
  const callbacksOnThisLine = Array.from(functionBoundaries.entries())
    .filter(([_fl, b]) => b.start === lineNum);
  
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
}

/**
 * Processes logical operators in boolean expressions
 * @param {string} originalLine - Original line with comments (for string literal detection)
 * @param {string} lineWithoutComments - Line without comments (for finding operators)
 * @param {number} lineNum - Line number
 * @param {number} functionLine - Function line
 * @param {Map} functionBoundaries - Map of functionLine -> { start, end }
 * @param {Function} isInsideStringLiteral - Function to check if character is inside string
 * @param {string} operator - Operator to process ('&&' or '||')
 * @param {string} operatorType - Type name ('logical AND' or 'logical OR')
 * @param {Array} decisionPoints - Array to push decision points to
 */
export function processBooleanExpressionOperators(originalLine, lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, operator, operatorType, decisionPoints) {
  // Find operators directly in the original line to ensure accurate string literal detection
  let searchIndex = 0;
  while ((searchIndex = originalLine.indexOf(operator, searchIndex)) !== -1) {
    // Skip if inside a comment
    if (isInsideComment(originalLine, searchIndex)) {
      searchIndex += operator.length;
      continue;
    }
    
    // Check if this operator is inside a string literal
    // Use both the context-aware check and a simple fallback check for reliability
    const isInString = isInsideStringLiteral(originalLine, searchIndex) || isOperatorInStringLiteral(originalLine, searchIndex);
    if (!isInString) {
      // Find the corresponding index in lineWithoutComments for function assignment logic
      // (This is approximate - we use the same index, which should work for most cases)
      const assignedFunctionLine = findBooleanExpressionFunctionLine(
        lineWithoutComments,
        lineNum,
        searchIndex, // Use same index (should be close enough)
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
}

/**
 * Checks if a line has boolean assignment pattern
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line has boolean assignment
 */
export function hasBooleanAssignmentPattern(lineWithoutComments) {
  return /^\s*(const|let|var)\s+\w+\s*=\s*.*[&|]{2}/.test(lineWithoutComments);
}

/**
 * Checks if line has boolean expression in parentheses
 * @param {string} lineWithoutComments - Line without comments
 * @returns {boolean} Whether line has boolean expression in parentheses
 */
export function hasBooleanExpressionInParens(lineWithoutComments) {
  return /\([^)]*[&|]{2}[^)]*\)/.test(lineWithoutComments);
}

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
export function isLogicalOperatorInNonControlFlow(hasLogicalOperator, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock) {
  return hasLogicalOperator && !isIfStatement && !isElseIfStatement && !isForLoop && !isWhileLoop && !isSwitchStatement && !isCatchBlock;
}

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
export function detectBooleanExpressionType(lineWithoutComments, isReturnStatement, hasLogicalOperator, isJSXExpression, isContinuationOfJSXExpression, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock) {
  return isReturnStatement || 
         hasBooleanAssignmentPattern(lineWithoutComments) ||
         hasBooleanExpressionInParens(lineWithoutComments) ||
         isJSXExpression ||
         isContinuationOfJSXExpression ||
         isLogicalOperatorInNonControlFlow(hasLogicalOperator, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock);
}

/**
 * Detects if a line is a boolean expression (wrapper function)
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
export function detectBooleanExpression(lineWithoutComments, isReturnStatement, isJSXExpression, isContinuationOfJSXExpression, hasLogicalOp, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock) {
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
}

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
export function shouldExcludeFromBooleanExpressions(isBooleanExpression, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock, hasTernaries) {
  return !isBooleanExpression || 
         isIfStatement || 
         isElseIfStatement || 
         isForLoop || 
         isWhileLoop || 
         isSwitchStatement || 
         isCatchBlock || 
         hasTernaries;
}

/**
 * Parses boolean expressions (&&, || operators in return statements, assignments, JSX, etc.)
 * @param {string} lineWithoutComments - Line without comments
 * @param {string} originalLine - Original line with comments (for string literal detection)
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
 * @param {number} index - Line index (0-based, optional)
 * @param {Array} lines - All lines of source code (optional)
 */
export function parseBooleanExpressions(lineWithoutComments, originalLine, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, hasQuestionMarkOutsideString, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock, isJSXExpression, isContinuationOfJSXExpression, decisionPoints, index, lines) {
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
  
  // Check if line has ternaries on the same line (to avoid double-counting &&/|| in ternary expressions)
  const hasTernaries = hasQuestionMarkOutsideString(lineWithoutComments) && lineWithoutComments.includes(':');
  
  // Check if this line is part of a multi-line ternary condition (has &&/|| but ? is on next/prev line)
  // This prevents double-counting &&/|| operators that are already counted in parseTernaryOperators
  // Use the same detection logic as parseTernaryOperators for consistency
  let isMultiLineTernaryCondition = false;
  if (index !== undefined && lines !== undefined && !hasTernaries && hasLogicalOperator) {
    const multiLineInfo = detectMultiLineTernaries(lineWithoutComments, index, lines, hasQuestionMarkOutsideString);
    isMultiLineTernaryCondition = multiLineInfo.isMultiLineTernaryConditionLine;
  }
  
  // If this line is part of a multi-line ternary condition, exclude it from boolean expression processing
  // (the operators are already processed in parseTernaryOperators)
  if (isMultiLineTernaryCondition) {
    return;
  }
  
  if (shouldExcludeFromBooleanExpressions(isBooleanExpression, isIfStatement, isElseIfStatement, isForLoop, isWhileLoop, isSwitchStatement, isCatchBlock, hasTernaries)) {
    return;
  }
  
  // Process && and || operators in boolean expressions
  // Use originalLine for accurate string literal detection (lineWithoutComments has comments removed, which can affect index mapping)
  processBooleanExpressionOperators(originalLine, lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, '&&', 'logical AND', decisionPoints);
  processBooleanExpressionOperators(originalLine, lineWithoutComments, lineNum, functionLine, functionBoundaries, isInsideStringLiteral, '||', 'logical OR', decisionPoints);
}
