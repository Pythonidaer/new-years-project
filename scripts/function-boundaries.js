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
function findArrowFunctionEndSingleExpression(lines, startLine, arrowIndex, _functionLine) {
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
function findSetTimeoutCallbackEnd(lines, i, _functionLine) {
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
  const hasFunctionBodyPattern = /\)\s*[:\w\s<>[\]|'"]*\s*\{/.test(line);
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
 * Handles escape sequences in strings
 * @param {string} char - Current character
 * @param {boolean} inString - Whether we're inside a string
 * @param {boolean} escapeNext - Whether next character should be escaped
 * @returns {{escapeNext: boolean, shouldContinue: boolean}} Result
 */
function handleEscapeSequence(char, inString, escapeNext) {
  if (escapeNext) {
    return { escapeNext: false, shouldContinue: true };
  }
  if (char === '\\' && inString) {
    return { escapeNext: true, shouldContinue: true };
  }
  return { escapeNext: false, shouldContinue: false };
}

/**
 * Checks if a single-line comment starts
 * @param {string} char - Current character
 * @param {string} nextChar - Next character
 * @param {boolean} inString - Whether we're inside a string
 * @param {boolean} inRegex - Whether we're inside a regex
 * @param {boolean} inMultiLineComment - Whether we're in a multi-line comment
 * @returns {boolean} True if single-line comment starts
 */
function isSingleLineCommentStart(char, nextChar, inString, inRegex, inMultiLineComment) {
  return char === '/' && nextChar === '/' && !inString && !inRegex && !inMultiLineComment;
}

/**
 * Checks if a multi-line comment starts
 * @param {string} char - Current character
 * @param {string} nextChar - Next character
 * @param {boolean} inString - Whether we're inside a string
 * @param {boolean} inRegex - Whether we're inside a regex
 * @param {boolean} inSingleLineComment - Whether we're in a single-line comment
 * @returns {boolean} True if multi-line comment starts
 */
function isMultiLineCommentStart(char, nextChar, inString, inRegex, inSingleLineComment) {
  return char === '/' && nextChar === '*' && !inString && !inRegex && !inSingleLineComment;
}

/**
 * Checks if a multi-line comment ends
 * @param {string} char - Current character
 * @param {string} nextChar - Next character
 * @param {boolean} inMultiLineComment - Whether we're in a multi-line comment
 * @returns {boolean} True if multi-line comment ends
 */
function isMultiLineCommentEnd(char, nextChar, inMultiLineComment) {
  return char === '*' && nextChar === '/' && inMultiLineComment;
}

/**
 * Handles comment detection and state updates
 * @param {string} char - Current character
 * @param {string} nextChar - Next character
 * @param {boolean} inString - Whether we're inside a string
 * @param {boolean} inRegex - Whether we're inside a regex
 * @param {boolean} inSingleLineComment - Whether we're in a single-line comment
 * @param {boolean} inMultiLineComment - Whether we're in a multi-line comment
 * @returns {{inSingleLineComment: boolean, inMultiLineComment: boolean, shouldBreak: boolean, shouldContinue: boolean, skipNext: boolean}} Result
 */
function handleComments(char, nextChar, inString, inRegex, inSingleLineComment, inMultiLineComment) {
  // Handle single-line comments (//)
  if (isSingleLineCommentStart(char, nextChar, inString, inRegex, inMultiLineComment)) {
    return { inSingleLineComment: true, inMultiLineComment: false, shouldBreak: true, shouldContinue: false, skipNext: false };
  }
  
  // Handle multi-line comment start (/*)
  if (isMultiLineCommentStart(char, nextChar, inString, inRegex, inSingleLineComment)) {
    return { inSingleLineComment: false, inMultiLineComment: true, shouldBreak: false, shouldContinue: true, skipNext: true };
  }
  
  // Handle multi-line comment end (*/)
  if (isMultiLineCommentEnd(char, nextChar, inMultiLineComment)) {
    return { inSingleLineComment: false, inMultiLineComment: false, shouldBreak: false, shouldContinue: true, skipNext: true };
  }
  
  // Skip everything if we're in a comment
  if (inSingleLineComment || inMultiLineComment) {
    return { inSingleLineComment, inMultiLineComment, shouldBreak: false, shouldContinue: true, skipNext: false };
  }
  
  return { inSingleLineComment: false, inMultiLineComment: false, shouldBreak: false, shouldContinue: false, skipNext: false };
}

/**
 * Handles string literal detection
 * @param {string} char - Current character
 * @param {boolean} inRegex - Whether we're inside a regex
 * @param {boolean} inString - Whether we're inside a string
 * @param {string|null} stringChar - The quote character that started the string
 * @returns {{inString: boolean, stringChar: string|null}} Result
 */
function handleStringLiterals(char, inRegex, inString, stringChar) {
  if ((char === '"' || char === "'") && !inRegex) {
    if (!inString) {
      return { inString: true, stringChar: char };
    } else if (char === stringChar) {
      return { inString: false, stringChar: null };
    }
  }
  return { inString, stringChar };
}

/**
 * Detects if a slash character is the start of a regex pattern
 * @param {string} line - Current line
 * @param {number} j - Current character index
 * @param {string} prevChar - Previous character
 * @returns {boolean} True if this is a regex start
 */
function isRegexStart(line, j, _prevChar) {
  const beforeSlash = line.substring(Math.max(0, j - 2), j).trim();
  return beforeSlash === '' || beforeSlash.endsWith('=') || beforeSlash.endsWith('(') || 
         beforeSlash.endsWith('[') || beforeSlash.endsWith(',') || /^\s*$/.test(beforeSlash);
}

/**
 * Checks if a slash could start a regex
 * @param {string} char - Current character
 * @param {string} prevChar - Previous character
 * @param {boolean} inRegex - Whether we're inside a regex
 * @param {boolean} inString - Whether we're inside a string
 * @returns {boolean} True if could be regex start
 */
function couldBeRegexStart(char, prevChar, inRegex, inString) {
  return char === '/' && prevChar !== '/' && prevChar !== '*' && !inRegex && !inString;
}

/**
 * Checks if a slash could end a regex
 * @param {string} char - Current character
 * @param {string} nextChar - Next character
 * @param {boolean} inRegex - Whether we're inside a regex
 * @returns {boolean} True if could be regex end
 */
function couldBeRegexEnd(char, nextChar, inRegex) {
  return char === '/' && inRegex && nextChar !== '/' && nextChar !== '*';
}

/**
 * Handles regex detection
 * @param {string} char - Current character
 * @param {string} prevChar - Previous character
 * @param {string} nextChar - Next character
 * @param {string} line - Current line
 * @param {number} j - Current character index
 * @param {boolean} inRegex - Whether we're inside a regex
 * @param {boolean} inString - Whether we're inside a string
 * @returns {boolean} Updated regex state
 */
function handleRegexDetection(char, prevChar, nextChar, line, j, inRegex, inString) {
  if (couldBeRegexStart(char, prevChar, inRegex, inString)) {
    if (isRegexStart(line, j, prevChar)) {
      return true;
    }
  }
  
  if (couldBeRegexEnd(char, nextChar, inRegex)) {
    return false;
  }
  
  return inRegex;
}

/**
 * Checks if braces are balanced and function ends
 * @param {number} updatedBraceCount - Updated brace count
 * @param {number} closeBraces - Number of closing braces found
 * @param {string} line - Current line
 * @param {number} i - Current line index
 * @param {number} functionLine - Reported line number
 * @param {Array<string>} lines - All lines
 * @returns {number|null} End line number if found, null otherwise
 */
function checkFunctionEnd(updatedBraceCount, closeBraces, line, i, functionLine, lines) {
  if (updatedBraceCount === 0 && closeBraces > 0) {
    // Special case: For arrow functions assigned to const/let/var, check if line ends with };
    const trimmed = line.trim();
    if (trimmed === '};' || trimmed.endsWith('};')) {
      if (i > 0) {
        const prevLines = lines.slice(Math.max(0, i - 10), i);
        const hasAssignmentPattern = prevLines.some(prevLine => 
          /^\s*(const|let|var)\s+\w+\s*=.*=>/.test(prevLine.trim())
        );
        if (hasAssignmentPattern) {
          return i + 1;
        }
      }
    }
    
    const endLine = handleFunctionBodyEnd(line, i, functionLine, lines);
    if (endLine !== null) {
      return endLine;
    }
  }
  return null;
}

/**
 * Creates a result object with updated state
 * @param {number} openBraces - Current open braces count
 * @param {number} closeBraces - Current close braces count
 * @param {Object} state - Current parsing state
 * @param {Object} updatedState - Updated state properties
 * @param {boolean} shouldBreak - Whether to break processing
 * @param {boolean} shouldContinue - Whether to continue to next character
 * @param {boolean} skipNext - Whether to skip next character
 * @returns {{openBraces: number, closeBraces: number, state: Object, shouldBreak: boolean, shouldContinue: boolean, skipNext: boolean}} Result
 */
function createBracesResult(openBraces, closeBraces, state, updatedState, shouldBreak, shouldContinue, skipNext) {
  return {
    openBraces,
    closeBraces,
    state: { ...state, ...updatedState },
    shouldBreak,
    shouldContinue,
    skipNext
  };
}

/**
 * Handles escape sequence processing
 * @param {string} char - Current character
 * @param {boolean} inString - Whether inside string
 * @param {boolean} escapeNext - Whether next character is escaped
 * @param {Object} state - Current state
 * @param {number} openBraces - Current open braces count
 * @param {number} closeBraces - Current close braces count
 * @returns {{result: Object|null, escapeNext: boolean}} Result object or null if should continue
 */
function processEscapeSequence(char, inString, escapeNext, state, openBraces, closeBraces) {
  const escapeResult = handleEscapeSequence(char, inString, escapeNext);
  if (escapeResult.shouldContinue) {
    return {
      result: createBracesResult(openBraces, closeBraces, state, { escapeNext: escapeResult.escapeNext }, false, true, false),
      escapeNext: escapeResult.escapeNext
    };
  }
  return { result: null, escapeNext: escapeResult.escapeNext };
}

/**
 * Handles comment processing
 * @param {string} char - Current character
 * @param {string} nextChar - Next character
 * @param {boolean} inString - Whether inside string
 * @param {boolean} inRegex - Whether inside regex
 * @param {boolean} inSingleLineComment - Whether in single-line comment
 * @param {boolean} inMultiLineComment - Whether in multi-line comment
 * @param {boolean} escapeNext - Whether next character is escaped
 * @param {Object} state - Current state
 * @param {number} openBraces - Current open braces count
 * @param {number} closeBraces - Current close braces count
 * @returns {{result: Object|null, inSingleLineComment: boolean, inMultiLineComment: boolean}} Result object or null if should continue
 */
function processCommentHandling(char, nextChar, inString, inRegex, inSingleLineComment, inMultiLineComment, escapeNext, state, openBraces, closeBraces) {
  const commentResult = handleComments(char, nextChar, inString, inRegex, inSingleLineComment, inMultiLineComment);
  if (commentResult.shouldBreak) {
    return {
      result: createBracesResult(openBraces, closeBraces, state, {
        inSingleLineComment: commentResult.inSingleLineComment,
        inMultiLineComment: commentResult.inMultiLineComment,
        escapeNext
      }, true, false, false),
      inSingleLineComment: commentResult.inSingleLineComment,
      inMultiLineComment: commentResult.inMultiLineComment
    };
  }
  if (commentResult.shouldContinue) {
    return {
      result: createBracesResult(openBraces, closeBraces, state, {
        inSingleLineComment: commentResult.inSingleLineComment,
        inMultiLineComment: commentResult.inMultiLineComment,
        escapeNext
      }, false, true, commentResult.skipNext),
      inSingleLineComment: commentResult.inSingleLineComment,
      inMultiLineComment: commentResult.inMultiLineComment
    };
  }
  return {
    result: null,
    inSingleLineComment: commentResult.inSingleLineComment,
    inMultiLineComment: commentResult.inMultiLineComment
  };
}

/**
 * Handles string literal processing
 * @param {string} char - Current character
 * @param {boolean} inRegex - Whether inside regex
 * @param {boolean} inString - Whether inside string
 * @param {string|null} stringChar - String quote character
 * @param {boolean} escapeNext - Whether next character is escaped
 * @param {Object} state - Current state
 * @param {number} openBraces - Current open braces count
 * @param {number} closeBraces - Current close braces count
 * @returns {{result: Object|null, inString: boolean, stringChar: string|null}} Result object or null if should continue
 */
function processStringLiteralHandling(char, inRegex, inString, stringChar, escapeNext, state, openBraces, closeBraces) {
  const stringResult = handleStringLiterals(char, inRegex, inString, stringChar);
  if (stringResult.inString !== inString || stringResult.stringChar !== stringChar) {
    return {
      result: createBracesResult(openBraces, closeBraces, state, {
        inString: stringResult.inString,
        stringChar: stringResult.stringChar,
        escapeNext
      }, false, true, false),
      inString: stringResult.inString,
      stringChar: stringResult.stringChar
    };
  }
  return { result: null, inString: stringResult.inString, stringChar: stringResult.stringChar };
}

/**
 * Processes a single character in the line to count braces
 * @param {string} char - Current character
 * @param {string} prevChar - Previous character
 * @param {string} nextChar - Next character
 * @param {string} line - Current line
 * @param {number} j - Current character index
 * @param {Object} state - Current parsing state
 * @param {number} openBraces - Current open braces count
 * @param {number} closeBraces - Current close braces count
 * @returns {{openBraces: number, closeBraces: number, state: Object, shouldBreak: boolean, shouldContinue: boolean, skipNext: boolean}} Result
 */
function processCharacterForBraces(char, prevChar, nextChar, line, j, state, openBraces, closeBraces) {
  let { inRegex, inString, inSingleLineComment, inMultiLineComment, stringChar, escapeNext } = state;
  
  // Handle escape sequences
  const escapeHandling = processEscapeSequence(char, inString, escapeNext, state, openBraces, closeBraces);
  if (escapeHandling.result) return escapeHandling.result;
  escapeNext = escapeHandling.escapeNext;
  
  // Handle comments
  const commentHandling = processCommentHandling(char, nextChar, inString, inRegex, inSingleLineComment, inMultiLineComment, escapeNext, state, openBraces, closeBraces);
  if (commentHandling.result) return commentHandling.result;
  inSingleLineComment = commentHandling.inSingleLineComment;
  inMultiLineComment = commentHandling.inMultiLineComment;
  
  // Handle string literals
  const stringHandling = processStringLiteralHandling(char, inRegex, inString, stringChar, escapeNext, state, openBraces, closeBraces);
  if (stringHandling.result) return stringHandling.result;
  inString = stringHandling.inString;
  stringChar = stringHandling.stringChar;
  
  // Handle regex detection
  const newRegexState = handleRegexDetection(char, prevChar, nextChar, line, j, inRegex, inString);
  if (newRegexState !== inRegex) {
    return createBracesResult(openBraces, closeBraces, state, {
      inRegex: newRegexState,
      inString,
      stringChar,
      escapeNext
    }, false, true, false);
  }
  inRegex = newRegexState;
  
  // Count braces only if not inside regex, string, or comment
  if (!inRegex && !inString) {
    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
  }
  
  return createBracesResult(openBraces, closeBraces, state, { inRegex, inString, stringChar, escapeNext }, false, false, false);
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
  let openBraces = 0;
  let closeBraces = 0;
  let state = {
    inRegex: false,
    inString: false,
    inSingleLineComment: false,
    inMultiLineComment: false,
    stringChar: null,
    escapeNext: false
  };
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : '';
    const nextChar = j + 1 < line.length ? line[j + 1] : '';
    
    const result = processCharacterForBraces(char, prevChar, nextChar, line, j, state, openBraces, closeBraces);
    openBraces = result.openBraces;
    closeBraces = result.closeBraces;
    state = result.state;
    
    if (result.shouldBreak) {
      break;
    }
    if (result.shouldContinue) {
      if (result.skipNext) {
        j++; // Skip next character
      }
      continue;
    }
  }
  
  const updatedBraceCount = braceCount + openBraces - closeBraces;
  const endLine = checkFunctionEnd(updatedBraceCount, closeBraces, line, i, functionLine, lines);
  
  if (endLine !== null) {
    return { braceCount: updatedBraceCount, end: endLine };
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
  
  // For arrow functions that we've already handled, start from the body start line
  // but skip counting braces on that line since we already counted them in handleBraceOnSameLine
  // For other functions, start from start - 1 to find the body
  // loopStart must be 0-based (array index)
  const loopStart = start - 1; // Always 0-based array index (start is 1-based line number)
  // Skip the first line if we already counted its braces in handleBraceOnSameLine
  const skipFirstLine = (arrowFunctionHandled && inFunctionBody);
  
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
      // Skip the first line if we already counted its braces in handleBraceOnSameLine
      // i is 0-based index, start is 1-based line number, so compare i + 1 === start
      if (skipFirstLine && i + 1 === start) {
        // Skip this line - braces already counted in handleBraceOnSameLine
        continue;
      }
      
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
  return /\)\s*[:\w\s<>[\]|'"]*\s*\{/.test(line);
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
      // Use the same brace counting logic that excludes comments, strings, and regex
      const result = processLineInFunctionBody(line, i, functionLine, 0, lines);
      fallbackBraceCount = result.braceCount;
    } else if (foundFunctionBody) {
      // Use the same brace counting logic that excludes comments, strings, and regex
      const result = processLineInFunctionBody(line, i, functionLine, fallbackBraceCount, lines);
      fallbackBraceCount = result.braceCount;
      
      if (fallbackBraceCount === 0 && result.end !== null) {
        return result.end;
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
