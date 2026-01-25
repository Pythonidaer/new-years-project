/**
 * Finds the start line for an arrow function
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {number} Start line number (1-based)
 */
function findArrowFunctionStart(lines, functionLine) {
  // Arrow function starts at the reported line (where => appears)
  // Look for the arrow function pattern on or before this line
  let start = functionLine;
  
  // Check if the arrow function starts on this line or the line before
  // Arrow functions can be: () => { or (params) => { or on previous line: (params) =>\n {
  let foundArrow = false;
  for (let i = Math.max(0, functionLine - 1); i <= functionLine; i++) {
    const line = lines[i];
    if (line.includes('=>')) {
      start = i + 1; // Convert to 1-based
      foundArrow = true;
      break;
    }
  }
  
  if (!foundArrow) {
    // Fallback: use the reported line
    start = functionLine;
  }
  
  return start;
}

/**
 * Checks if a closing paren matches the JSX return pattern ()) or )} followed by )
 * @param {string} scanLine - Current line being scanned
 * @param {number} k - Index of closing paren
 * @param {number} j - Current line index
 * @param {Array<string>} lines - All lines
 * @returns {number|null} End line number if pattern matches, null otherwise
 */
function checkJSXReturnClosingPattern(scanLine, k, j, lines) {
  const nextChar = k + 1 < scanLine.length ? scanLine[k + 1] : '';
  
  // Check for )) pattern (two closing parens)
  if (nextChar === ')') {
    return j + 1;
  }
  
  // Check for )} followed by ) on next line
  if (nextChar === '}' && j + 1 < lines.length) {
    const nextLine = lines[j + 1];
    if (nextLine.trim().startsWith(')')) {
      return j + 2;
    }
  }
  
  return null;
}

/**
 * Scans lines to find matching closing parens for JSX return pattern
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} startLine - Start line index (0-based)
 * @param {string} line - First line content
 * @param {number} scanIndex - Starting character index
 * @returns {number|null} End line number if found, null otherwise
 */
function scanForJSXReturnClosingParens(lines, startLine, line, scanIndex) {
  let parenCount = 1; // Count the opening ( after =>
  
  // Scan forward to find the matching closing parens
  for (let j = startLine; j < lines.length && j < startLine + 50; j++) { // Limit scan to 50 lines
    const scanLine = j === startLine ? line.substring(scanIndex) : lines[j];
    
    for (let k = 0; k < scanLine.length; k++) {
      const char = scanLine[k];
      
      if (char === '(') {
        parenCount++;
      } else if (char === ')') {
        parenCount--;
        if (parenCount === 0) {
          const endLine = checkJSXReturnClosingPattern(scanLine, k, j, lines);
          if (endLine !== null) {
            return endLine;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Finds the end line for an arrow function returning JSX (=> ( ... ))
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} startLine - Start line index (0-based)
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {{end: number, found: boolean}} End line (1-based) and whether end was found
 */
function findArrowFunctionEndJSXReturn(lines, startLine, arrowIndex, functionLine) {
  const line = lines[startLine];
  const afterArrow = line.substring(arrowIndex + 2).trim();
  
  if (!afterArrow.startsWith('(')) {
    return { end: functionLine, found: false };
  }
  
  // Find the actual position of ( after => in the original line
  const arrowEndPos = arrowIndex + 2; // Position after =>
  const parenPos = line.indexOf('(', arrowEndPos);
  
  // Start scanning from the character after the opening (
  const scanIndex = parenPos + 1;
  
  // Scan forward to find the matching closing parens
  const endLine = scanForJSXReturnClosingParens(lines, startLine, line, scanIndex);
  
  if (endLine !== null) {
    return { end: endLine, found: true };
  }
  
  return { end: functionLine, found: false };
}

/**
 * Checks if a brace is part of an object literal pattern
 * @param {string} line - Line content
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} braceIndex - Index of { in the line
 * @returns {boolean} True if object literal pattern
 */
function isObjectLiteralPattern(line, arrowIndex, braceIndex) {
  if (braceIndex === -1) {
    return false;
  }
  
  const betweenArrowAndBrace = line.substring(arrowIndex + 2, braceIndex).trim();
  
  // Object literal pattern: => ( { or => ({ (with optional whitespace)
  // Function body pattern: => { (directly, no paren before)
  return /^\(/.test(betweenArrowAndBrace) || 
         (betweenArrowAndBrace === '' && braceIndex > 0 && line[braceIndex - 1] === '(');
}

/**
 * Finds the closing paren of an object literal and checks if expression ends
 * @param {string} line - Line content
 * @param {number} braceIndex - Index of { in the line
 * @returns {boolean} True if closing paren found and expression ends
 */
function findObjectLiteralClosingParen(line, braceIndex) {
  let parenCount = 1; // We know there's an opening ( before the {
  
  for (let k = braceIndex + 1; k < line.length; k++) {
    if (line[k] === '(') {
      parenCount++;
    } else if (line[k] === ')') {
      parenCount--;
      if (parenCount === 0) {
        // Found the closing paren of the object literal
        // Check if there's a semicolon or closing paren after (end of expression)
        const restOfLine = line.substring(k + 1).trim();
        // Allow: ); or ; or ) or empty (end of expression)
        return restOfLine.startsWith(';') || restOfLine.startsWith(')') || restOfLine === '';
      }
    }
  }
  
  return false;
}

/**
 * Finds the end line for an arrow function returning object literal (=> ({ ... }))
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} startLine - Start line index (0-based)
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} braceIndex - Index of { in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {{end: number, found: boolean}} End line (1-based) and whether end was found
 */
function findArrowFunctionEndObjectLiteral(lines, startLine, arrowIndex, braceIndex, functionLine) {
  const line = lines[startLine];
  
  // Check if the { is part of an object literal: => ({ ... })
  if (!isObjectLiteralPattern(line, arrowIndex, braceIndex)) {
    return { end: functionLine, found: false };
  }
  
  // Arrow function returning object literal: => ({ ... })
  // This is a single expression, ends on the same line (at the closing paren)
  // Look for the closing ) and ; on this line
  if (findObjectLiteralClosingParen(line, braceIndex)) {
    return { end: startLine + 1, found: true };
  }
  
  // Fallback: ends on this line (single-line expression)
  return { end: startLine + 1, found: true };
}

/**
 * Finds the end line for an arrow function inside JSX attribute (onChange={...})
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} startLine - Start line index (0-based)
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {{end: number, found: boolean}} End line (1-based) and whether end was found
 */
function findArrowFunctionEndJSXAttribute(lines, startLine, arrowIndex, functionLine) {
  const line = lines[startLine];
  
  // Check if this arrow function is inside JSX attribute: onChange={...} or onClick={...}
  const isInJSXAttribute = line.includes('{') && line.indexOf('{') < arrowIndex;
  
  if (!isInJSXAttribute) {
    return { end: functionLine, found: false };
  }
  
  // Arrow function inside JSX attribute - it ends on the same line
  // Find the closing ) of the expression (the arrow function ends there)
  const afterArrow = line.substring(arrowIndex + 2);
  // Look for the closing ) that matches the opening ( after =>
  let parenCount = 0;
  for (let k = 0; k < afterArrow.length; k++) {
    if (afterArrow[k] === '(') parenCount++;
    else if (afterArrow[k] === ')') {
      parenCount--;
      if (parenCount === 0) {
        // Found the closing paren - arrow function ends here
        return { end: startLine + 1, found: true };
      }
    }
  }
  
  // Arrow function ends on the same line (or at the closing } of JSX attribute if no parens)
  return { end: startLine + 1, found: true };
}

/**
 * Checks if arrow function ends on the same line
 * @param {string} lineAfterArrow - Content after => on the line
 * @returns {boolean} True if ends on same line
 */
function endsOnSameLine(lineAfterArrow) {
  return lineAfterArrow.includes(';') || 
         lineAfterArrow.includes(',') || 
         lineAfterArrow.includes(')');
}

/**
 * Calculates initial paren depth before arrow function
 * @param {string} lineBeforeArrow - Content before => on the line
 * @returns {number} Initial paren depth
 */
function calculateInitialParenDepth(lineBeforeArrow) {
  const openParens = (lineBeforeArrow.match(/\(/g) || []).length;
  const closeParens = (lineBeforeArrow.match(/\)/g) || []).length;
  return openParens - closeParens;
}

/**
 * Scans forward to find end of single-expression arrow function
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} startLine - Start line index (0-based)
 * @param {number} parenDepth - Initial paren depth
 * @returns {number} End line number (1-based)
 */
function scanForSingleExpressionEnd(lines, startLine, parenDepth) {
  for (let j = startLine + 1; j < lines.length; j++) {
    const scanLine = lines[j];
    
    // Track paren depth to find the matching closing paren of the method call
    for (let k = 0; k < scanLine.length; k++) {
      if (scanLine[k] === '(') {
        parenDepth++;
      } else if (scanLine[k] === ')') {
        parenDepth--;
        // If we've closed all parens (back to 0 or negative), we've found the end
        if (parenDepth <= 0) {
          return j + 1;
        }
      }
    }
    
    // Also check for semicolon or comma (end of statement)
    if (scanLine.trim().match(/^[;},]/)) {
      return j + 1;
    }
  }
  
  // Fallback: use the line where we stopped scanning
  return lines.length;
}

/**
 * Finds the end line for a single-expression arrow function
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} startLine - Start line index (0-based)
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {{end: number, found: boolean}} End line (1-based) and whether end was found
 */
function findArrowFunctionEndSingleExpression(lines, startLine, arrowIndex, functionLine) {
  const line = lines[startLine];
  const lineAfterArrow = line.substring(arrowIndex + 2);
  
  if (endsOnSameLine(lineAfterArrow)) {
    // Arrow function ends on the same line
    return { end: startLine + 1, found: true };
  }
  
  // Look for semicolon, comma, or closing paren on next lines
  // For arrow functions inside method calls (like .find(cat => ...)), 
  // stop at the closing paren of the method call, not the end of the parent function
  const lineBeforeArrow = line.substring(0, arrowIndex);
  const parenDepth = calculateInitialParenDepth(lineBeforeArrow);
  
  // Scan forward to find where the arrow function ends
  const endLine = scanForSingleExpressionEnd(lines, startLine, parenDepth);
  
  return { end: endLine, found: true };
}

/**
 * Handles arrow function with JSX return pattern
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} i - Current line index
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @param {Map} boundaries - Map to store boundaries
 * @returns {{end: number, found: boolean, arrowFunctionHandled: boolean, arrowFunctionEndSet: boolean}|null} Result or null
 */
function handleJSXReturnPattern(lines, i, arrowIndex, functionLine, boundaries) {
  const jsxResult = findArrowFunctionEndJSXReturn(lines, i, arrowIndex, functionLine);
  if (jsxResult.found) {
    boundaries.set(functionLine, { start: i + 1, end: jsxResult.end });
    return {
      end: jsxResult.end,
      found: true,
      arrowFunctionHandled: true,
      arrowFunctionEndSet: true
    };
  }
  return null;
}

/**
 * Handles arrow function with brace on same line
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} i - Current line index
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @param {Map} boundaries - Map to store boundaries
 * @param {string} line - Current line content
 * @returns {{end: number, found: boolean, arrowFunctionHandled: boolean, arrowFunctionEndSet: boolean, inFunctionBody: boolean, braceCount: number}|null} Result or null
 */
function handleBraceOnSameLine(lines, i, arrowIndex, functionLine, boundaries, line) {
  const braceIndex = line.indexOf('{', arrowIndex);
  
  // If { is before => (like in JSX: onChange={...}), braceIndex will be -1
  if (braceIndex === -1) {
    // Try JSX attribute pattern
    const jsxAttrResult = findArrowFunctionEndJSXAttribute(lines, i, arrowIndex, functionLine);
    if (jsxAttrResult.found) {
      boundaries.set(functionLine, { start: i + 1, end: jsxAttrResult.end });
      return {
        end: jsxAttrResult.end,
        found: true,
        arrowFunctionHandled: true,
        arrowFunctionEndSet: true,
        inFunctionBody: false,
        braceCount: 0
      };
    }
    return null;
  }
  
  // Try object literal pattern
  const objLiteralResult = findArrowFunctionEndObjectLiteral(lines, i, arrowIndex, braceIndex, functionLine);
  if (objLiteralResult.found) {
    boundaries.set(functionLine, { start: i + 1, end: objLiteralResult.end });
    return {
      end: objLiteralResult.end,
      found: true,
      arrowFunctionHandled: true,
      arrowFunctionEndSet: true,
      inFunctionBody: false,
      braceCount: 0
    };
  }
  
  // Function body: => { ... }
  const openBraces = (line.match(/{/g) || []).length;
  return {
    end: functionLine,
    found: false,
    arrowFunctionHandled: true,
    arrowFunctionEndSet: false,
    inFunctionBody: true,
    braceCount: openBraces
  };
}

/**
 * Handles arrow function without brace on same line
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} i - Current line index
 * @param {number} arrowIndex - Index of => in the line
 * @param {number} functionLine - Reported line number (1-based)
 * @param {Map} boundaries - Map to store boundaries
 * @returns {{end: number, found: boolean, arrowFunctionHandled: boolean, arrowFunctionEndSet: boolean, inFunctionBody: boolean, braceCount: number}} Result
 */
function handleNoBraceOnSameLine(lines, i, arrowIndex, functionLine, boundaries) {
  // { might be on next line
  if (i + 1 < lines.length && lines[i + 1].trim().startsWith('{')) {
    return {
      end: functionLine,
      found: false,
      arrowFunctionHandled: true,
      arrowFunctionEndSet: false,
      inFunctionBody: true,
      braceCount: 1
    };
  }
  
  // Arrow function without braces (single expression)
  // Try JSX attribute pattern first
  const jsxAttrResult = findArrowFunctionEndJSXAttribute(lines, i, arrowIndex, functionLine);
  if (jsxAttrResult.found) {
    boundaries.set(functionLine, { start: i + 1, end: jsxAttrResult.end });
    return {
      end: jsxAttrResult.end,
      found: true,
      arrowFunctionHandled: true,
      arrowFunctionEndSet: false,
      inFunctionBody: false,
      braceCount: 0
    };
  }
  
  // Try single expression pattern
  const singleExprResult = findArrowFunctionEndSingleExpression(lines, i, arrowIndex, functionLine);
  if (singleExprResult.found) {
    boundaries.set(functionLine, { start: i + 1, end: singleExprResult.end });
    return {
      end: singleExprResult.end,
      found: true,
      arrowFunctionHandled: true,
      arrowFunctionEndSet: false,
      inFunctionBody: false,
      braceCount: 0
    };
  }
  
  return {
    end: functionLine,
    found: false,
    arrowFunctionHandled: false,
    arrowFunctionEndSet: false,
    inFunctionBody: false,
    braceCount: 0
  };
}

/**
 * Finds the end line for an arrow function (main dispatcher)
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} start - Start line number (1-based)
 * @param {number} functionLine - Reported line number (1-based)
 * @param {Map} boundaries - Map to store boundaries
 * @returns {{end: number, found: boolean, arrowFunctionHandled: boolean, arrowFunctionEndSet: boolean, inFunctionBody: boolean, braceCount: number}} Result object
 */
function findArrowFunctionEnd(lines, start, functionLine, boundaries) {
  let end = functionLine;
  let arrowFunctionHandled = false;
  let arrowFunctionEndSet = false;
  let inFunctionBody = false;
  let braceCount = 0;
  
  // Find the arrow function body start (where { appears after =>)
  for (let i = start - 1; i < lines.length; i++) {
    const line = lines[i];
    // Look for => followed by { or ( on same or next line
    if (line.includes('=>')) {
      const arrowIndex = line.indexOf('=>');
      const afterArrow = line.substring(arrowIndex + 2).trim();
      
      // Try JSX return pattern first
      if (afterArrow.startsWith('(')) {
        const jsxResult = handleJSXReturnPattern(lines, i, arrowIndex, functionLine, boundaries);
        if (jsxResult) {
          return { ...jsxResult, inFunctionBody, braceCount };
        }
      }
      
      // Check if { is on the same line after =>
      if (line.includes('{')) {
        const braceResult = handleBraceOnSameLine(lines, i, arrowIndex, functionLine, boundaries, line);
        if (braceResult) {
          return braceResult;
        }
      } else {
        const noBraceResult = handleNoBraceOnSameLine(lines, i, arrowIndex, functionLine, boundaries);
        return noBraceResult;
      }
      break;
    }
  }
  
  return { end, found: false, arrowFunctionHandled, arrowFunctionEndSet, inFunctionBody, braceCount };
}

/**
 * Checks if a line matches function declaration pattern
 * @param {string} line - Line content
 * @returns {boolean} True if function declaration pattern
 */
function isFunctionDeclarationPattern(line) {
  return /^\s*(?:export\s+)?function\s+\w+/.test(line) && 
         line.includes('(') && 
         line.includes('{') && 
         !line.includes('=>');
}

/**
 * Calculates initial brace count for function body
 * @param {string} line - Line content
 * @returns {number} Initial brace count
 */
function calculateFunctionBodyBraceCount(line) {
  const functionBodyBraceIndex = line.lastIndexOf('{');
  
  if (functionBodyBraceIndex === -1) {
    return 1; // Fallback
  }
  
  // Count opening braces after the parameter closing paren (this is the function body brace)
  const paramCloseIndex = line.lastIndexOf(')');
  if (paramCloseIndex !== -1 && functionBodyBraceIndex > paramCloseIndex) {
    const afterParams = line.substring(paramCloseIndex);
    const openBracesAfterParams = (afterParams.match(/{/g) || []).length;
    return openBracesAfterParams; // Should be 1 for function body
  }
  
  // Fallback: count all opening braces
  const allOpenBraces = (line.match(/{/g) || []).length;
  return allOpenBraces;
}

/**
 * Handles arrow function without braces case
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} i - Current line index
 * @returns {number} End line number (1-based)
 */
function handleArrowFunctionWithoutBraces(lines, i) {
  let j = i + 1;
  while (j < lines.length && !lines[j].trim().match(/^[;}]/)) {
    j++;
  }
  return j + 1;
}

/**
 * Finds end line for dependency array pattern (}, [deps])
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} i - Current line index
 * @returns {number|null} End line number if found, null otherwise
 */
function findDependencyArrayEnd(lines, i) {
  for (let k = i; k < Math.min(i + 3, lines.length); k++) {
    const checkLine = lines[k];
    if (checkLine.includes(']')) {
      return k + 1;
    }
  }
  return null;
}

/**
 * Finds end line for setTimeout callback pattern (}, delay)
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} i - Current line index
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {number|null} End line number if found, null otherwise
 */
function findSetTimeoutCallbackEnd(lines, i, functionLine) {
  for (let k = i; k < Math.min(i + 3, lines.length); k++) {
    const checkLine = lines[k];
    if (checkLine.includes(')') && (checkLine.includes(';') || k === i + 1)) {
      return k + 1;
    }
  }
  return null;
}

/**
 * Checks if closing brace is followed by dependency array or callback parameter
 * @param {string} line - Current line content
 * @param {number} i - Current line index
 * @param {Array<string>} lines - All lines
 * @returns {{hasDependencyArray: boolean, hasCallbackParam: boolean}} Pattern detection result
 */
function checkCallbackPatterns(line, i, lines) {
  const firstBraceIndex = line.indexOf('}');
  if (firstBraceIndex === -1) {
    return { hasDependencyArray: false, hasCallbackParam: false };
  }
  
  const restOfLine = line.substring(firstBraceIndex);
  const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
  const combined = restOfLine + ' ' + nextLine;
  
  const hasDependencyArray = /}\s*,\s*\[/.test(combined);
  const hasCallbackParam = /}\s*,\s*\d+/.test(combined); // setTimeout(..., delay)
  
  return { hasDependencyArray, hasCallbackParam };
}

/**
 * Handles function body start detection
 * @param {string} line - Current line content
 * @param {number} i - Current line index
 * @param {Array<string>} lines - All lines
 * @returns {{inFunctionBody: boolean, braceCount: number, end: number|null}} Result
 */
function handleFunctionBodyStart(line, i, lines) {
  const hasFunctionBodyPattern = /\)\s*[:\w\s<>\[\]|'"]*\s*\{/.test(line);
  const isFunctionDeclaration = isFunctionDeclarationPattern(line);
  const hasArrowFunction = line.includes('=>') && !line.includes('{');
  
  if (hasFunctionBodyPattern || isFunctionDeclaration) {
    // Function body starts here
    const braceCount = calculateFunctionBodyBraceCount(line);
    return { inFunctionBody: true, braceCount, end: null };
  }
  
  if (hasArrowFunction) {
    // Arrow function without braces
    const end = handleArrowFunctionWithoutBraces(lines, i);
    return { inFunctionBody: true, braceCount: 0, end };
  }
  
  return { inFunctionBody: false, braceCount: 0, end: null };
}

/**
 * Handles function body end detection (when braces balance)
 * @param {string} line - Current line content
 * @param {number} i - Current line index
 * @param {number} functionLine - Reported line number (1-based)
 * @param {Array<string>} lines - All lines
 * @returns {number|null} End line number if found, null otherwise
 */
function handleFunctionBodyEnd(line, i, functionLine, lines) {
  const { hasDependencyArray, hasCallbackParam } = checkCallbackPatterns(line, i, lines);
  
  if (hasDependencyArray) {
    return findDependencyArrayEnd(lines, i);
  }
  
  if (hasCallbackParam) {
    return findSetTimeoutCallbackEnd(lines, i, functionLine);
  }
  
  // Regular function end (braces balanced)
  return i + 1;
}

/**
 * Tracks type definition braces (before function body is found)
 * @param {string} line - Current line content
 * @param {number} typeBraceCount - Current type brace count
 * @returns {number} Updated type brace count
 */
function trackTypeBraces(line, typeBraceCount) {
  if (!line.includes('{')) {
    return typeBraceCount;
  }
  
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  return typeBraceCount + openBraces - closeBraces;
}

/**
 * Handles processing a line before function body is found
 * @param {string} line - Current line content
 * @param {number} i - Current line index
 * @param {Array<string>} lines - All lines
 * @returns {{inFunctionBody: boolean, braceCount: number, end: number|null, typeBraceCount: number}} Result
 */
function processLineBeforeFunctionBody(line, i, lines, typeBraceCount) {
  const bodyStartResult = handleFunctionBodyStart(line, i, lines);
  
  if (bodyStartResult.end !== null) {
    // Arrow function without braces - end found
    return {
      inFunctionBody: true,
      braceCount: 0,
      end: bodyStartResult.end,
      typeBraceCount
    };
  }
  
  if (bodyStartResult.inFunctionBody) {
    // Function body found
    return {
      inFunctionBody: true,
      braceCount: bodyStartResult.braceCount,
      end: null,
      typeBraceCount
    };
  }
  
  // Track type definition braces
  const updatedTypeBraceCount = trackTypeBraces(line, typeBraceCount);
  return {
    inFunctionBody: false,
    braceCount: 0,
    end: null,
    typeBraceCount: updatedTypeBraceCount
  };
}

/**
 * Handles processing a line within function body
 * @param {string} line - Current line content
 * @param {number} i - Current line index
 * @param {number} functionLine - Reported line number (1-based)
 * @param {number} braceCount - Current brace count
 * @param {Array<string>} lines - All lines
 * @returns {{braceCount: number, end: number|null}} Result
 */
function processLineInFunctionBody(line, i, functionLine, braceCount, lines) {
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  const updatedBraceCount = braceCount + openBraces - closeBraces;
  
  // Check if braces are balanced (function end)
  if (updatedBraceCount === 0 && closeBraces > 0) {
    const endLine = handleFunctionBodyEnd(line, i, functionLine, lines);
    if (endLine !== null) {
      return { braceCount: updatedBraceCount, end: endLine };
    }
  }
  
  return { braceCount: updatedBraceCount, end: null };
}

/**
 * Finds the end line for a named function by tracking braces
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} start - Start line number (1-based)
 * @param {number} functionLine - Reported line number (1-based)
 * @param {boolean} arrowFunctionHandled - Whether this is an arrow function that was already handled
 * @param {boolean} inFunctionBody - Whether we're already in the function body
 * @param {number} braceCount - Current brace count
 * @returns {number} End line number (1-based)
 */
function findNamedFunctionEnd(lines, start, functionLine, arrowFunctionHandled, inFunctionBody, braceCount) {
  let end = functionLine;
  let typeBraceCount = 0;
  
  // For arrow functions that we've already handled, start from the line after the body start
  // (since we've already counted the opening brace on the body start line)
  // For other functions, start from start - 1 to find the body
  const loopStart = (arrowFunctionHandled && inFunctionBody) ? start : start - 1;
  
  for (let i = loopStart; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inFunctionBody) {
      const result = processLineBeforeFunctionBody(line, i, lines, typeBraceCount);
      
      if (result.end !== null) {
        // Arrow function without braces - end found
        return result.end;
      }
      
      if (result.inFunctionBody) {
        // Function body found
        inFunctionBody = true;
        braceCount = result.braceCount;
        typeBraceCount = result.typeBraceCount;
        // Don't process this line's braces again in the function body tracking section
        continue;
      }
      
      typeBraceCount = result.typeBraceCount;
    } else {
      // We're in the function body, track its braces
      const result = processLineInFunctionBody(line, i, functionLine, braceCount, lines);
      
      if (result.end !== null) {
        // Function end found
        return result.end;
      }
      
      braceCount = result.braceCount;
    }
  }
  
  return end;
}

/**
 * Checks if a line contains the function body pattern
 * @param {string} line - Line content
 * @returns {boolean} True if function body pattern found
 */
function hasFunctionBodyPattern(line) {
  return /\)\s*[:\w\s<>\[\]|'"]*\s*\{/.test(line);
}

/**
 * Scans lines to find function end using brace counting
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} start - Start line number (1-based)
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {number|null} End line number if found, null otherwise
 */
function scanForFunctionEndWithBraces(lines, start, functionLine) {
  let fallbackBraceCount = 0;
  let foundFunctionBody = false;
  
  for (let i = start - 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (!foundFunctionBody && hasFunctionBodyPattern(line)) {
      foundFunctionBody = true;
      fallbackBraceCount = (line.match(/{/g) || []).length;
    } else if (foundFunctionBody) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      fallbackBraceCount += openBraces - closeBraces;
      
      if (fallbackBraceCount === 0 && closeBraces > 0) {
        return i + 1; // Convert to 1-based line number
      }
    }
  }
  
  return null;
}

/**
 * Fallback logic to find function end when normal detection fails
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} start - Start line number (1-based)
 * @param {number} functionLine - Reported line number (1-based)
 * @returns {number} End line number (1-based)
 */
function findFunctionEndFallback(lines, start, functionLine) {
  // Try to find the end by looking for the last closing brace that matches the function
  const end = scanForFunctionEndWithBraces(lines, start, functionLine);
  
  if (end !== null) {
    return end;
  }
  
  // If still not found, use reasonable default
  return Math.min(start + 500, lines.length); // Increased from 100 to 500 for large functions
}

/**
 * Finds the start line for a named function
 * @param {Array<string>} lines - Array of source code lines
 * @param {number} functionLine - Reported line number (1-based)
 * @param {string} functionName - Function name to match
 * @returns {number} Start line number (1-based)
 */
function findNamedFunctionStart(lines, functionLine, functionName) {
  // Named function: look backwards from the reported line to find function declaration
  // Check up to 50 lines back
  const startLine = Math.max(0, functionLine - 50);
  
  // Try various function patterns to find the actual declaration line
  const patterns = [
    /(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
    /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|function)/,
    /export\s+default\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
    /(?:export\s+default\s+|const\s+)([A-Z][a-zA-Z0-9_$]*)\s*[:=]\s*(?:\([^)]*\)\s*)?=>/,
  ];
  
  // Find the actual function declaration line
  // Match the function name to ensure we find the correct function
  let start = functionLine;
  for (let i = functionLine - 1; i >= startLine; i--) {
    const line = lines[i];
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1] === functionName) {
        start = i + 1; // Convert to 1-based line number
        break;
      }
    }
    if (start !== functionLine) break;
  }
  
  return start;
}

/**
 * Finds function boundaries (start and end lines) for each function
 * @param {string} sourceCode - Full source code
 * @param {Array} functions - Array of function objects with line numbers
 * @returns {Map} Map of functionLine -> { start, end }
 */
export function findFunctionBoundaries(sourceCode, functions) {
  const boundaries = new Map();
  const lines = sourceCode.split('\n');
  
  functions.forEach(func => {
    const functionLine = func.line;
    const nodeType = func.nodeType || 'FunctionDeclaration';
    
    // Find the start line
    const start = nodeType === 'ArrowFunctionExpression'
      ? findArrowFunctionStart(lines, functionLine)
      : findNamedFunctionStart(lines, functionLine, func.functionName);
    
    let end = functionLine;
    
    // Find the end of the function by tracking braces
    // For arrow functions, start tracking from the arrow function's body
    // For TypeScript functions, we need to skip type definition braces and only track function body braces
    let braceCount = 0;
    let inFunctionBody = false;
    let typeBraceCount = 0; // Track type definition braces separately
    let arrowFunctionEndSet = false; // Track if we've set the end for an arrow function (object literal case)
    let arrowFunctionHandled = false;
    
    // For arrow functions, use the dedicated helper function
    if (nodeType === 'ArrowFunctionExpression') {
      const arrowResult = findArrowFunctionEnd(lines, start, functionLine, boundaries);
      end = arrowResult.end;
      arrowFunctionHandled = arrowResult.arrowFunctionHandled;
      arrowFunctionEndSet = arrowResult.arrowFunctionEndSet;
      inFunctionBody = arrowResult.inFunctionBody;
      braceCount = arrowResult.braceCount;
      
      // If the arrow function end was already set (e.g., object literal, JSX return), skip rest
      if (arrowFunctionEndSet) {
        // Boundary already set, skip to next function
        return;
      }
    }
    
    // Now find the end of the function body
    // Skip if arrow function was already handled (with or without braces, including object literals)
    // If we've set the end for an arrow function (object literal case), skip the rest
    if (!arrowFunctionEndSet) {
      end = findNamedFunctionEnd(lines, start, functionLine, arrowFunctionHandled, inFunctionBody, braceCount);
    }
    
    // Fallback: if we couldn't find the end, use a reasonable default
    // Also fallback if we never entered the function body (might be a type-only function or parsing issue)
    if (end === functionLine || !inFunctionBody) {
      end = findFunctionEndFallback(lines, start, functionLine);
    }
    
    // Only set boundary if we haven't already set it (e.g., for object literal arrow functions)
    if (!boundaries.has(functionLine)) {
      boundaries.set(functionLine, { start, end });
    }
  });
  
  return boundaries;
}
