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
    let start = functionLine;
    let end = functionLine;
    const nodeType = func.nodeType || 'FunctionDeclaration';
    
    // For arrow functions, find boundaries starting from the reported line
    // For named functions, look backwards to find the declaration
    if (nodeType === 'ArrowFunctionExpression') {
      // Arrow function starts at the reported line (where => appears)
      // Look for the arrow function pattern on or before this line
      start = functionLine;
      
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
    } else {
      // Named function: look backwards from the reported line to find function declaration
      // Check up to 50 lines back
      const startLine = Math.max(0, functionLine - 50);
      const context = lines.slice(startLine, functionLine).join('\n');
      
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
      const functionName = func.functionName;
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
    }
    
    // Find the end of the function by tracking braces
    // For arrow functions, start tracking from the arrow function's body
    // For TypeScript functions, we need to skip type definition braces and only track function body braces
    let braceCount = 0;
    let inFunctionBody = false;
    let typeBraceCount = 0; // Track type definition braces separately
    
    // For arrow functions, we need to find where the arrow function body starts
    // Arrow functions can be: () => { or (params) => { or on multiple lines
    let arrowFunctionHandled = false;
    if (nodeType === 'ArrowFunctionExpression') {
      // Find the arrow function body start (where { appears after =>)
      for (let i = start - 1; i < lines.length; i++) {
        const line = lines[i];
        // Look for => followed by { on same or next line
        if (line.includes('=>')) {
          // Check if { is on the same line
          if (line.includes('{')) {
            inFunctionBody = true;
            const openBraces = (line.match(/{/g) || []).length;
            braceCount = openBraces;
            start = i + 1; // Body starts on this line (1-based)
            arrowFunctionHandled = true;
          } else {
            // { might be on next line
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('{')) {
              inFunctionBody = true;
              braceCount = 1;
              start = i + 2; // Body starts on next line (1-based)
              arrowFunctionHandled = true;
            } else {
              // Arrow function without braces (single expression)
              // Find the end by looking for semicolon or comma
              let j = i + 1;
              while (j < lines.length && !lines[j].trim().match(/^[;},]/)) {
                j++;
              }
              end = j + 1;
              boundaries.set(functionLine, { start, end });
              arrowFunctionHandled = true;
              break; // Skip rest of processing for this function
            }
          }
          break;
        }
      }
    }
    
    // Now find the end of the function body
    // Skip if arrow function without braces was already handled
    if (!(arrowFunctionHandled && end !== functionLine)) {
      // For arrow functions that we've already handled, start from the line after the body start
      // (since we've already counted the opening brace on the body start line)
      // For other functions, start from start - 1 to find the body
      const loopStart = (arrowFunctionHandled && inFunctionBody) ? start : start - 1;
      for (let i = loopStart; i < lines.length; i++) {
      const line = lines[i];
      
      if (!inFunctionBody) {
        // Look for the function body opening brace
        // It's either: 1) "): ReturnType {" pattern, or 2) first "{" if no type annotation
        // Union types can contain | characters, so we need to match more broadly
        const hasFunctionBodyPattern = /\)\s*[:\w\s<>\[\]|'"]*\s*\{/.test(line);
        const hasArrowFunction = line.includes('=>') && !line.includes('{');
        
        if (hasFunctionBodyPattern) {
          // Function body starts here (e.g., "}): ContrastIssue[] {")
          inFunctionBody = true;
          // Count only the function body opening brace(s), not the closing type brace
          const allOpenBraces = (line.match(/{/g) || []).length;
          const allCloseBraces = (line.match(/}/g) || []).length;
          // The function body brace is the last opening brace after closing the type
          // When both closing and opening braces are on the same line, we only count the opening brace
          // because we're starting function body tracking (the closing brace was for the type definition)
          braceCount = allOpenBraces; // This is the function body opening brace
          // Don't process this line's braces again in the function body tracking section
          // The opening brace is already counted in braceCount
        } else if (hasArrowFunction) {
          // Arrow function without braces
          inFunctionBody = true;
          let j = i + 1;
          while (j < lines.length && !lines[j].trim().match(/^[;}]/)) {
            j++;
          }
          end = j + 1;
          break;
        } else if (line.includes('{')) {
          // This might be a type definition brace - track it separately
          // Don't set inFunctionBody yet, keep looking for the function body
          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          typeBraceCount += openBraces - closeBraces;
        }
      } else {
        // We're in the function body, track its braces
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        // Special handling for arrow function callbacks (useEffect, setTimeout, etc.)
        // These end with }, [deps] or }, delay) pattern
        // Check if this closing brace is followed by a dependency array or parameter
        if (braceCount === 0 && closeBraces > 0) {
          // Check if this line or next line has dependency array pattern: }, [deps]
          // Look for the pattern starting from the first } on this line
          const firstBraceIndex = line.indexOf('}');
          if (firstBraceIndex !== -1) {
            const restOfLine = line.substring(firstBraceIndex);
            const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
            const combined = restOfLine + ' ' + nextLine;
            const hasDependencyArray = /}\s*,\s*\[/.test(combined);
            const hasCallbackParam = /}\s*,\s*\d+/.test(combined); // setTimeout(..., delay)
            
            if (hasDependencyArray) {
              // This is the end of an arrow function callback with dependency array
              // Find where the dependency array closes (look for ] on same line or next few lines)
              let foundEnd = false;
              for (let k = i; k < Math.min(i + 3, lines.length); k++) {
                const checkLine = lines[k];
                if (checkLine.includes(']')) {
                  end = k + 1;
                  foundEnd = true;
                  break;
                }
              }
              if (foundEnd) {
                break; // Found the end, exit the loop
              }
            } else if (hasCallbackParam) {
              // setTimeout/setInterval callback - ends at the closing paren
              for (let k = i; k < Math.min(i + 3, lines.length); k++) {
                const checkLine = lines[k];
                if (checkLine.includes(')') && (checkLine.includes(';') || k === i + 1)) {
                  end = k + 1;
                  break;
                }
              }
              if (end !== functionLine) {
                break; // Found the end
              }
            }
          }
          
          // Regular function end (braces balanced)
          end = i + 1; // Convert to 1-based line number
          break;
        }
      }
    }
    }
    
    // Fallback: if we couldn't find the end, use a reasonable default
    // Also fallback if we never entered the function body (might be a type-only function or parsing issue)
    if (end === functionLine || !inFunctionBody) {
      // Try to find the end by looking for the last closing brace that matches the function
      // This is a fallback for edge cases
      let fallbackBraceCount = 0;
      let foundFunctionBody = false;
      for (let i = start - 1; i < lines.length; i++) {
        const line = lines[i];
        if (!foundFunctionBody && /\)\s*[:\w\s<>\[\]|'"]*\s*\{/.test(line)) {
          foundFunctionBody = true;
          fallbackBraceCount = (line.match(/{/g) || []).length;
        } else if (foundFunctionBody) {
          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          fallbackBraceCount += openBraces - closeBraces;
          if (fallbackBraceCount === 0 && closeBraces > 0) {
            end = i + 1; // Convert to 1-based line number
            break;
          }
        }
      }
      // If still not found, use reasonable default
      if (end === functionLine) {
        end = Math.min(start + 500, lines.length); // Increased from 100 to 500 for large functions
      }
    }
    
    boundaries.set(functionLine, { start, end });
  });
  
  return boundaries;
}
