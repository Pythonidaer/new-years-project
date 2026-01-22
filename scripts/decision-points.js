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
  
  // Helper function to find the innermost function for a given line
  const getInnermostFunction = (lineNum) => {
    const containingFunctions = lineToFunctions.get(lineNum) || [];
    if (containingFunctions.length === 0) return null;
    if (containingFunctions.length === 1) return containingFunctions[0].functionLine;
    
    // Find the function with the smallest boundary (innermost)
    let innermost = containingFunctions[0];
    for (let i = 1; i < containingFunctions.length; i++) {
      const current = containingFunctions[i];
      const currentSize = current.boundary.end - current.boundary.start;
      const innermostSize = innermost.boundary.end - innermost.boundary.start;
      if (currentSize < innermostSize) {
        innermost = current;
      }
    }
    return innermost.functionLine;
  };
  
  // Helper function to check if a character at a given index is inside a string literal
  // Handles single quotes and double quotes (but NOT template literals, as they can contain expressions)
  // Template literals can contain expressions like ${condition ? a : b}, so decision points inside them should count
  const isInsideStringLiteral = (line, charIndex) => {
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplateLiteral = false;
    let inTemplateExpression = false; // Track if we're inside ${...} expression
    let braceDepth = 0; // Track nested braces in template expressions
    let escapeNext = false;
    
    for (let i = 0; i < charIndex && i < line.length; i++) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      // Check for template literal expression start: ${ 
      if (char === '$' && nextChar === '{' && inTemplateLiteral && !inTemplateExpression) {
        inTemplateExpression = true;
        braceDepth = 1;
        i++; // Skip the '{' as we'll process it next
        continue;
      }
      
      // Track brace depth in template expressions
      if (inTemplateExpression) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            inTemplateExpression = false;
          }
        }
        continue; // Don't process quotes/backticks inside template expressions
      }
      
      if (char === "'" && !inDoubleQuote && !inTemplateLiteral) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote && !inTemplateLiteral) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
        inTemplateLiteral = !inTemplateLiteral;
        // Reset template expression state when exiting template literal
        if (!inTemplateLiteral) {
          inTemplateExpression = false;
          braceDepth = 0;
        }
      }
    }
    
    // Only return true if we're in a regular string (single/double quote) or in template literal but NOT in an expression
    // If we're in a template expression (${...}), decision points should count
    return (inSingleQuote || inDoubleQuote) || (inTemplateLiteral && !inTemplateExpression);
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
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const containingFunctions = lineToFunctions.get(lineNum) || [];
    if (containingFunctions.length === 0) return; // Skip lines outside functions
    
    // Find the function to assign this decision point to
    // Always use the innermost function (smallest boundary) - this ensures
    // decision points in nested functions are assigned to the nested function, not the parent
    const functionLine = getInnermostFunction(lineNum);
    if (!functionLine) return; // Skip if no function found
    
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return; // Skip empty lines and comments
    }
    
    // Remove comments from line for parsing
    const lineWithoutComments = line.replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
    
    // Parse default parameters in function signatures
    // ESLint's classic variant counts default parameters as decision points
    // Default parameters only appear in function parameter lists, not as standalone assignments
    // Pattern: function foo(x = 5) or const foo = (x = 5) => or (x = 5) =>
    const boundary = functionBoundaries.get(functionLine);
    if (boundary && (lineNum - boundary.start < 3)) {
      // Only check the first few lines where function signatures appear
      // Default parameters appear in: function name(params) or (params) => or name = (params) =>
      // They're part of the parameter list, not standalone assignments
      const hasFunctionSignature = /^\s*(?:export\s+)?(?:function|const|let|var)\s+\w+\s*[=(]/.test(lineWithoutComments) ||
                                   /^\s*\([^)]*=\s*[^,)]+/.test(lineWithoutComments) ||
                                   /=>\s*\([^)]*=\s*[^,)]+/.test(lineWithoutComments);
      
      // Match default parameter pattern: identifier = value inside parentheses (function params)
      // This matches: function foo(x = 5, y = 10) or (x = 5) => or const foo = (x = 5) =>
      const defaultParamInSignature = /[=(][^=)]*\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^=,)\s{}]+/.test(lineWithoutComments);
      
      if (hasFunctionSignature && defaultParamInSignature && 
          !/^\s*(const|let|var)\s+\w+\s*=\s*[^(]/.test(lineWithoutComments) && // Not a const/let/var assignment
          !/^\s*return\s+/.test(lineWithoutComments)) { // Not a return statement
        // Count each default parameter in the signature
        const defaultParamMatches = lineWithoutComments.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^=,)\s{}]+/g);
        if (defaultParamMatches) {
          defaultParamMatches.forEach(() => {
            decisionPoints.push({ line: lineNum, type: 'default parameter', name: 'default parameter', functionLine });
          });
        }
      }
    }
    
    // Parse if statements
    const isIfStatement = /^\s*if\s*\(/.test(lineWithoutComments);
    if (isIfStatement) {
      decisionPoints.push({ line: lineNum, type: 'if', name: 'if statement', functionLine });
      // Count && and || operators anywhere in the line (they're in the condition)
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
    }
    
    // Parse else if statements
    const isElseIfStatement = /^\s*else\s+if\s*\(/.test(lineWithoutComments);
    if (isElseIfStatement) {
      decisionPoints.push({ line: lineNum, type: 'else if', name: 'else if statement', functionLine });
      // Count && and || operators anywhere in the line (they're in the condition)
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
    }
    
    // Parse for loops (regular for)
    const isForLoop = /^\s*for\s*\(/.test(lineWithoutComments) && !/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments) && !/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments);
    if (isForLoop) {
      decisionPoints.push({ line: lineNum, type: 'for', name: 'for loop', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse for...of loops
    if (/^\s*for\s*\([^)]*\s+of\s+/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for...of', name: 'for...of loop', functionLine });
    }
    
    // Parse for...in loops
    if (/^\s*for\s*\([^)]*\s+in\s+/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'for...in', name: 'for...in loop', functionLine });
    }
    
    // Parse while loops
    const isWhileLoop = /^\s*while\s*\(/.test(lineWithoutComments);
    if (isWhileLoop) {
      decisionPoints.push({ line: lineNum, type: 'while', name: 'while loop', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse do...while loops
    if (/^\s*do\s*\{/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'do...while', name: 'do...while loop', functionLine });
    }
    
    // Parse switch statements
    const isSwitchStatement = /^\s*switch\s*\(/.test(lineWithoutComments);
    if (isSwitchStatement) {
      decisionPoints.push({ line: lineNum, type: 'switch', name: 'switch statement', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse case statements
    if (/^\s*case\s+/.test(lineWithoutComments) || /^\s*default\s*:/.test(lineWithoutComments)) {
      decisionPoints.push({ line: lineNum, type: 'case', name: 'case/default', functionLine });
    }
    
    // Parse catch blocks
    // Catch can appear as "catch (" or "} catch (" (on same line as closing brace)
    const isCatchBlock = /\bcatch\s*\(/.test(lineWithoutComments);
    if (isCatchBlock) {
      decisionPoints.push({ line: lineNum, type: 'catch', name: 'catch block', functionLine });
      // Count && and || operators anywhere in the line
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse ternary operators (?:)
    // Count each ? as a decision point, but only if it's part of a ternary (has : after it)
    // Match pattern: ? ... : (ternary operator)
    // This avoids matching ? characters inside string literals like includes('?')
    
    // First, find all potential ternary matches
    const ternaryPattern = /\?\s*[^:]*:/g;
    let ternaryMatches = [];
    let match;
    while ((match = ternaryPattern.exec(lineWithoutComments)) !== null) {
      // Check if the ? is inside a string literal
      const questionMarkIndex = match.index;
      if (!isInsideStringLiteral(lineWithoutComments, questionMarkIndex)) {
        ternaryMatches.push(match);
      }
    }
    
    // Check if this line has a ? outside of string literals (could be part of a multi-line ternary)
    const hasQuestionMark = hasQuestionMarkOutsideString(lineWithoutComments);
    const hasColon = lineWithoutComments.includes(':');
    
    // Check next line for : (multi-line ternary: ? on this line, : on next)
    const nextLine = index + 1 < lines.length ? lines[index + 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim() : '';
    const nextLineHasColon = nextLine.includes(':');
    
    // Check previous line for ? outside string literals (multi-line ternary: ? on prev line, this line has condition with &&)
    const prevLine = index > 0 ? lines[index - 1].replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim() : '';
    const prevLineHasQuestionMark = hasQuestionMarkOutsideString(prevLine);
    
    // Detect multi-line ternaries
    const isMultiLineTernaryWithQuestionOnThisLine = hasQuestionMark && nextLineHasColon;
    const isMultiLineTernaryConditionLine = !hasQuestionMark && !hasColon && prevLineHasQuestionMark && /[&|]{2}/.test(lineWithoutComments);
    
    if (ternaryMatches.length > 0 || isMultiLineTernaryWithQuestionOnThisLine) {
      // Count ternary operator
      const ternaryCount = ternaryMatches.length > 0 ? ternaryMatches.length : (hasQuestionMark ? 1 : 0);
      for (let i = 0; i < ternaryCount; i++) {
        decisionPoints.push({ line: lineNum, type: 'ternary', name: 'ternary operator', functionLine });
      }
      
      // Count && and || operators on this line (they're in the ternary expression)
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
      
      // For multi-line ternaries, also check previous line for &&/|| operators
      if (isMultiLineTernaryWithQuestionOnThisLine && index > 0) {
        const prevLineWithoutComments = prevLine;
        if (prevLineWithoutComments && /[&|]{2}/.test(prevLineWithoutComments)) {
          const prevAndMatches = prevLineWithoutComments.match(/&&/g);
          const prevOrMatches = prevLineWithoutComments.match(/\|\|/g);
          // Add decision points for previous line, but use previous line number
          const prevLineNum = lineNum - 1;
          if (prevAndMatches) prevAndMatches.forEach(() => decisionPoints.push({ line: prevLineNum, type: '&&', name: 'logical AND', functionLine }));
          if (prevOrMatches) prevOrMatches.forEach(() => decisionPoints.push({ line: prevLineNum, type: '||', name: 'logical OR', functionLine }));
        }
      }
    }
    
    // Handle case where this line is the condition line of a multi-line ternary (has &&/||, previous line has ?)
    if (isMultiLineTernaryConditionLine) {
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      if (andMatches) andMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine }));
      if (orMatches) orMatches.forEach(() => decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine }));
    }
    
    // Parse short-circuit logical operators (&&, ||) in boolean expressions
    // These create decision points in:
    // 1. Return statements with boolean expressions
    // 2. Variable assignments with boolean expressions
    // 3. Function arguments with boolean expressions
    // Note: && and || inside if/while/for conditions are handled above
    const isReturnStatement = /^\s*return\s+/.test(lineWithoutComments);
    const isBooleanExpression = isReturnStatement || 
                                 /^\s*(const|let|var)\s+\w+\s*=\s*[^=]*[&|]{2}/.test(lineWithoutComments) ||
                                 /\([^)]*[&|]{2}[^)]*\)/.test(lineWithoutComments);
    
    if (isBooleanExpression && !isIfStatement && !isElseIfStatement && !isForLoop && !isWhileLoop && !isSwitchStatement && !isCatchBlock && !ternaryMatches) {
      // Count && and || operators in boolean expressions
      // Each operator creates a decision point
      // Exclude if/else if since we already handled them above
      const andMatches = lineWithoutComments.match(/&&/g);
      const orMatches = lineWithoutComments.match(/\|\|/g);
      
      if (andMatches && andMatches.length > 0) {
        // Count all && operators (each adds complexity)
        andMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '&&', name: 'logical AND', functionLine });
        });
      }
      
      if (orMatches && orMatches.length > 0) {
        // Count all || operators (each adds complexity)
        orMatches.forEach(() => {
          decisionPoints.push({ line: lineNum, type: '||', name: 'logical OR', functionLine });
        });
      }
    }
  });
  
  return decisionPoints;
}
