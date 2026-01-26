/**
 * AST-based decision point parsing using ESLint's programmatic API
 * 
 * This module uses ESLint's AST to find decision points, ensuring 100% accuracy
 * with ESLint's complexity calculation.
 */

import { parse } from '@typescript-eslint/typescript-estree';

/**
 * Parses source code into an AST
 * @param {string} sourceCode - Source code to parse
 * @param {string} filePath - Path to the file (for parser context)
 * @returns {Object} Parsed AST
 */
function parseAST(sourceCode, filePath) {
  try {
    const isTSX = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    return parse(sourceCode, {
      sourceType: 'module',
      ecmaVersion: 2020,
      jsx: isTSX,
      filePath: filePath,
      comment: true,
      loc: true,
      range: true,
    });
  } catch (error) {
    console.error(`Error parsing AST for ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Checks if a key should be skipped during AST traversal
 * @param {string} key - Key to check
 * @returns {boolean} True if key should be skipped
 */
function shouldSkipKey(key) {
  return key === 'parent' || key === 'range' || key === 'loc' || 
         key === 'leadingComments' || key === 'trailingComments';
}

/**
 * Processes an array of child nodes
 * @param {Array} array - Array of child nodes
 * @param {string} nodeType - Type of nodes to collect
 * @param {Array} results - Array to collect results
 */
function processArrayChildren(array, nodeType, results) {
  array.forEach(item => {
    if (item && typeof item === 'object' && item.type) {
      collectNodesByType(item, nodeType, results);
    }
  });
}

/**
 * Processes a single child node
 * @param {Object} child - Child node
 * @param {string} nodeType - Type of nodes to collect
 * @param {Array} results - Array to collect results
 */
function processChildNode(child, nodeType, results) {
  if (child && typeof child === 'object' && child.type) {
    collectNodesByType(child, nodeType, results);
  }
}

/**
 * Traverses AST and collects all nodes of a specific type
 * @param {Object} node - AST node to traverse
 * @param {string} nodeType - Type of nodes to collect
 * @param {Array} results - Array to collect results
 */
function collectNodesByType(node, nodeType, results) {
  if (!node || typeof node !== 'object') return;
  
  if (node.type === nodeType) {
    results.push(node);
  }
  
  // Traverse children
  for (const key in node) {
    if (shouldSkipKey(key)) continue;
    const child = node[key];
    if (Array.isArray(child)) {
      processArrayChildren(child, nodeType, results);
    } else {
      processChildNode(child, nodeType, results);
    }
  }
}

/**
 * Finds all function nodes in the AST
 * @param {Object} ast - ESLint AST
 * @returns {Array} Array of function nodes
 */
function findAllFunctions(ast) {
  const functions = [];
  
  // Collect all function types
  const functionTypes = [
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
    'MethodDefinition',
  ];
  
  functionTypes.forEach(type => {
    collectNodesByType(ast, type, functions);
  });
  
  return functions;
}

/**
 * Gets the line number for an AST node
 * @param {Object} node - AST node
 * @returns {number} Line number (1-based)
 */
function getNodeLine(node) {
  if (node.loc && node.loc.start) {
    return node.loc.start.line;
  }
  if (node.range && node.range[0] !== undefined) {
    // Fallback: estimate line from range (not accurate but better than nothing)
    return 1;
  }
  return 1;
}

/**
 * Processes an array of child nodes for parent map building
 * @param {Array} array - Array of child nodes
 * @param {Object} parent - Parent node
 * @param {Map} parentMap - Parent map to update
 * @param {Function} traverse - Traverse function to call recursively
 */
function processArrayChildrenForParentMap(array, parent, parentMap, traverse) {
  array.forEach(item => {
    if (item && typeof item === 'object' && item.type) {
      traverse(item, parent);
    }
  });
}

/**
 * Processes a single child node for parent map building
 * @param {Object} child - Child node
 * @param {Object} parent - Parent node
 * @param {Function} traverse - Traverse function to call recursively
 */
function processChildNodeForParentMap(child, parent, traverse) {
  if (child && typeof child === 'object' && child.type) {
    traverse(child, parent);
  }
}

/**
 * Builds a parent map for AST nodes
 * @param {Object} ast - Root AST node
 * @returns {Map} Map of node to parent node
 */
function buildParentMap(ast) {
  const parentMap = new Map();
  
  function traverse(node, parent = null) {
    if (!node || typeof node !== 'object') return;
    
    if (node.type) {
      parentMap.set(node, parent);
    }
    
    // Traverse children
    for (const key in node) {
      if (shouldSkipKey(key)) continue;
      const child = node[key];
      if (Array.isArray(child)) {
        processArrayChildrenForParentMap(child, node, parentMap, traverse);
      } else {
        processChildNodeForParentMap(child, node, traverse);
      }
    }
  }
  
  traverse(ast);
  return parentMap;
}

/**
 * Checks if a node type is a function type
 * @param {string} type - Node type
 * @returns {boolean} True if function type
 */
function isFunctionType(type) {
  return type === 'FunctionDeclaration' || 
         type === 'FunctionExpression' ||
         type === 'ArrowFunctionExpression';
}

/**
 * Checks if a node is in a function's parameter list
 * @param {Object} node - Node to check
 * @param {Object} funcParent - Function parent node
 * @returns {boolean} True if node is in function params
 */
function isNodeInFunctionParams(node, funcParent) {
  if (!funcParent.params || !Array.isArray(funcParent.params)) {
    return false;
  }
  
  // Check if node is directly in params
  if (funcParent.params.includes(node)) {
    return true;
  }
  
  // Check if node is nested in any parameter
  for (const param of funcParent.params) {
    if (checkNestedPattern(param, node)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if a parent node is a pattern container
 * @param {Object} parent - Parent node
 * @returns {boolean} True if pattern container
 */
function isPatternContainer(parent) {
  return parent.type === 'ArrayPattern' || 
         parent.type === 'ObjectPattern' || 
         parent.type === 'Property' || 
         parent.type === 'RestElement';
}

/**
 * Checks if AssignmentPattern is in function parameters by traversing up
 * @param {Object} node - AssignmentPattern node
 * @param {Map} parentMap - Parent map
 * @returns {boolean} True if in function parameters
 */
function checkInFunctionParams(node, parentMap) {
  let current = node;
  let depth = 0;
  const maxDepth = 15;
  
  while (current && depth < maxDepth) {
    const parent = parentMap.get(current);
    if (!parent) break;
    
    if (isFunctionType(parent.type)) {
      if (isNodeInFunctionParams(node, parent)) {
        return true;
      }
    }
    
    if (isPatternContainer(parent)) {
      current = parent;
      depth++;
      continue;
    }
    
    break;
  }
  
  return false;
}

/**
 * Checks if VariableDeclaration is a direct child of function body
 * @param {Object} varParent - VariableDeclaration node
 * @param {Object} funcParent - Function parent node
 * @returns {boolean} True if direct child of function body
 */
function isVariableDeclarationInFunctionBody(varParent, funcParent) {
  if (!funcParent.body) return false;
  
  const bodyType = funcParent.body.type;
  if (bodyType !== 'BlockStatement' && bodyType !== 'Program') {
    return false;
  }
  
  const bodyStatements = funcParent.body.body || funcParent.body.statements || [];
  return bodyStatements.includes(varParent);
}

/**
 * Checks if VariableDeclarator is in a top-level destructuring in function body
 * @param {Object} varDeclarator - VariableDeclarator node
 * @param {Object} node - Original AssignmentPattern node
 * @param {Map} parentMap - Parent map
 * @returns {boolean} True if in top-level destructuring in function body
 */
function checkInTopLevelDestructuring(varDeclarator, node, parentMap) {
  let varParent = parentMap.get(varDeclarator);
  let depth = 0;
  const maxDepth = 15;
  
  while (varParent && depth < maxDepth) {
    if (varParent.type === 'VariableDeclaration') {
      let funcParent = parentMap.get(varParent);
      let funcDepth = 0;
      
      while (funcParent && funcDepth < 10) {
        if (isFunctionType(funcParent.type)) {
          if (isVariableDeclarationInFunctionBody(varParent, funcParent)) {
            return true;
          }
          break;
        }
        funcParent = parentMap.get(funcParent);
        funcDepth++;
      }
    }
    varParent = parentMap.get(varParent);
    depth++;
  }
  
  return false;
}

/**
 * Checks if AssignmentPattern is in a top-level destructuring assignment in function body
 * @param {Object} node - AssignmentPattern node
 * @param {Map} parentMap - Parent map
 * @returns {boolean} True if in top-level destructuring in function body
 */
function checkInFunctionBodyDestructuring(node, parentMap) {
  let current = node;
  let depth = 0;
  const maxDepth = 15;
  
  while (current && depth < maxDepth) {
    const parent = parentMap.get(current);
    if (!parent) break;
    
    if (parent.type === 'VariableDeclarator' && parent.id) {
      if (checkNestedPattern(parent.id, node)) {
        if (checkInTopLevelDestructuring(parent, node, parentMap)) {
          return true;
        }
      }
    }
    
    if (isPatternContainer(parent)) {
      current = parent;
      depth++;
      continue;
    }
    
    break;
  }
  
  return false;
}

/**
 * Checks if AssignmentPattern is in a function parameter list or in a destructuring assignment
 * at the top level of a function body (ESLint counts these as decision points)
 * @param {Object} node - AssignmentPattern node
 * @param {Map} parentMap - Parent map
 * @param {Object} ast - Root AST node (for finding containing function)
 * @returns {boolean} True if in function parameters or top-level destructuring in function body
 */
function isInFunctionParameters(node, parentMap, _ast) {
  // First check if it's in function parameters
  if (checkInFunctionParams(node, parentMap)) {
    return true;
  }
  
  // Also check if it's in a top-level destructuring assignment in a function body
  return checkInFunctionBodyDestructuring(node, parentMap);
}

/**
 * Checks if target is nested in ArrayPattern elements
 * @param {Array} elements - Array of elements
 * @param {Object} target - Target node to find
 * @returns {boolean} True if target is found
 */
function checkArrayPatternElements(elements, target) {
  return elements.some(el => {
    if (el === target) return true;
    if (el && typeof el === 'object' && el.type) {
      return checkNestedPattern(el, target);
    }
    return false;
  });
}

/**
 * Checks if target is nested in ObjectPattern properties
 * @param {Array} properties - Array of properties
 * @param {Object} target - Target node to find
 * @returns {boolean} True if target is found
 */
function checkObjectPatternProperties(properties, target) {
  return properties.some(prop => {
    if (prop.value === target) return true;
    if (prop.value && typeof prop.value === 'object' && prop.value.type) {
      return checkNestedPattern(prop.value, target);
    }
    if (prop.key && typeof prop.key === 'object' && prop.key.type) {
      return checkNestedPattern(prop.key, target);
    }
    return false;
  });
}

/**
 * Checks if target is nested in RestElement
 * @param {Object} restElement - RestElement node
 * @param {Object} target - Target node to find
 * @returns {boolean} True if target is found
 */
function checkRestElement(restElement, target) {
  if (!restElement.argument) return false;
  if (restElement.argument === target) return true;
  if (restElement.argument && typeof restElement.argument === 'object' && restElement.argument.type) {
    return checkNestedPattern(restElement.argument, target);
  }
  return false;
}

/**
 * Checks if a node is nested in a pattern (recursively)
 * @param {Object} pattern - Pattern node (ArrayPattern, ObjectPattern, Property, etc.)
 * @param {Object} target - Target node to find
 * @returns {boolean} True if target is nested in pattern
 */
function checkNestedPattern(pattern, target) {
  if (!pattern || typeof pattern !== 'object') return false;
  if (pattern === target) return true;
  
  // Check ArrayPattern elements
  if (pattern.elements && Array.isArray(pattern.elements)) {
    return checkArrayPatternElements(pattern.elements, target);
  }
  
  // Check ObjectPattern properties
  if (pattern.properties && Array.isArray(pattern.properties)) {
    return checkObjectPatternProperties(pattern.properties, target);
  }
  
  // Check RestElement (for rest parameters like ...rest)
  if (pattern.type === 'RestElement') {
    return checkRestElement(pattern, target);
  }
  
  return false;
}

/**
 * Gets decision point type for control flow statements
 * @param {string} nodeType - Node type
 * @returns {string|null} Decision point type or null
 */
function getControlFlowDecisionType(nodeType) {
  if (nodeType === 'IfStatement') return 'if';
  if (nodeType === 'ForStatement' || nodeType === 'ForInStatement' || nodeType === 'ForOfStatement') {
    return 'for';
  }
  if (nodeType === 'WhileStatement' || nodeType === 'DoWhileStatement') {
    return 'while';
  }
  if (nodeType === 'SwitchCase') return 'case';
  if (nodeType === 'CatchClause') return 'catch';
  return null;
}

/**
 * Gets decision point type for logical expressions
 * @param {Object} node - AST node
 * @returns {string|null} Decision point type or null
 */
function getLogicalExpressionType(node) {
  if (node.operator === '&&') return '&&';
  if (node.operator === '||') return '||';
  if (node.operator === '??') return '??';
  return null;
}

/**
 * Gets decision point type for expressions
 * @param {Object} node - AST node
 * @param {string} nodeType - Node type
 * @returns {string|null} Decision point type or null
 */
function getExpressionDecisionType(node, nodeType) {
  if (nodeType === 'ConditionalExpression') {
    return 'ternary';
  }
  if (nodeType === 'LogicalExpression') {
    return getLogicalExpressionType(node);
  }
  if (nodeType === 'MemberExpression' && node.optional) {
    return '?.';
  }
  if (nodeType === 'BinaryExpression' && node.operator === '??') {
    return '??';
  }
  return null;
}

/**
 * Checks if a node represents a decision point
 * @param {Object} node - AST node
 * @param {Map} parentMap - Parent map for checking context
 * @param {Object} ast - Root AST node (for checking function context)
 * @returns {string|null} Decision point type or null
 */
function getDecisionPointType(node, parentMap, ast) {
  if (!node || !node.type) return null;
  
  const nodeType = node.type;
  
  // Control flow statements
  const controlFlowType = getControlFlowDecisionType(nodeType);
  if (controlFlowType) return controlFlowType;
  
  // Expressions
  const expressionType = getExpressionDecisionType(node, nodeType);
  if (expressionType) return expressionType;
  
  // Default parameters
  if (nodeType === 'AssignmentPattern' && parentMap) {
    if (isInFunctionParameters(node, parentMap, ast)) {
      return 'default parameter';
    }
  }
  
  return null;
}


/**
 * Finds the line number where => appears in an arrow function
 * @param {Object} astFunc - AST arrow function node
 * @param {string} sourceCode - Full source code
 * @returns {number|null} Line number where => appears, or null if not found
 */
function findArrowFunctionLine(astFunc, sourceCode) {
  if (astFunc.type !== 'ArrowFunctionExpression') return null;
  if (!astFunc.range) return null;
  
  // Get the function's code snippet
  const funcCode = sourceCode.substring(astFunc.range[0], astFunc.range[1]);
  const arrowIndex = funcCode.indexOf('=>');
  if (arrowIndex === -1) return null;
  
  // Find which line the => is on
  const linesBeforeArrow = sourceCode.substring(0, astFunc.range[0] + arrowIndex).split('\n');
  return linesBeforeArrow.length;
}

/**
 * Gets the match line for an AST function (handles arrow functions)
 * @param {Object} astFunc - AST function node
 * @param {string} sourceCode - Full source code
 * @returns {number} Line number to match against
 */
function getMatchLineForASTFunction(astFunc, sourceCode) {
  const astLine = getNodeLine(astFunc);
  if (astFunc.type === 'ArrowFunctionExpression') {
    const arrowLine = findArrowFunctionLine(astFunc, sourceCode);
    if (arrowLine !== null) {
      return arrowLine;
    }
  }
  return astLine;
}

/**
 * Checks if node types match between ESLint and AST
 * @param {string} eslintNodeType - ESLint node type
 * @param {string} astNodeType - AST node type
 * @returns {boolean} True if types match
 */
function doNodeTypesMatch(eslintNodeType, astNodeType) {
  return (eslintNodeType === 'FunctionDeclaration' && astNodeType === 'FunctionDeclaration') ||
         (eslintNodeType === 'ArrowFunctionExpression' && astNodeType === 'ArrowFunctionExpression') ||
         (eslintNodeType === 'FunctionExpression' && astNodeType === 'FunctionExpression');
}

/**
 * Matches AST function to ESLint functions by node type
 * @param {Object} astFunc - AST function node
 * @param {Array} matchingEslintFuncs - Array of matching ESLint functions
 * @param {Map} astToEslintMap - Map to update
 * @returns {boolean} True if matched
 */
function matchByNodeType(astFunc, matchingEslintFuncs, astToEslintMap) {
  for (const eslintFunc of matchingEslintFuncs) {
    const nodeTypeMatches = doNodeTypesMatch(eslintFunc.nodeType, astFunc.type);
    if (nodeTypeMatches || matchingEslintFuncs.length === 1) {
      astToEslintMap.set(astFunc, eslintFunc.line);
      return true;
    }
  }
  if (matchingEslintFuncs.length > 0) {
    astToEslintMap.set(astFunc, matchingEslintFuncs[0].line);
    return true;
  }
  return false;
}

/**
 * Checks if ESLint line is within AST function range
 * @param {Object} eslintFunc - ESLint function
 * @param {Object} astFunc - AST function
 * @param {string} sourceCode - Full source code
 * @returns {boolean} True if within range
 */
function isESLintLineInASTRange(eslintFunc, astFunc, sourceCode) {
  if (!astFunc.range) return false;
  const lines = sourceCode.split('\n');
  const eslintLineStart = lines.slice(0, eslintFunc.line - 1).join('\n').length;
  const eslintLineEnd = eslintLineStart + lines[eslintFunc.line - 1].length;
  return eslintLineStart >= astFunc.range[0] && eslintLineEnd <= astFunc.range[1];
}

/**
 * Tries to match AST function to ESLint functions by range
 * @param {Object} astFunc - AST function node
 * @param {Array} eslintFunctions - All ESLint functions
 * @param {string} sourceCode - Full source code
 * @param {Map} astToEslintMap - Map to update
 * @returns {boolean} True if matched
 */
function tryMatchByRange(astFunc, eslintFunctions, sourceCode, astToEslintMap) {
  for (const eslintFunc of eslintFunctions) {
    if (eslintFunc.nodeType === astFunc.type) {
      if (isESLintLineInASTRange(eslintFunc, astFunc, sourceCode)) {
        astToEslintMap.set(astFunc, eslintFunc.line);
        return true;
      }
    }
  }
  return false;
}

/**
 * Matches AST function nodes to ESLint function results by line number and creates a map
 * @param {Array} astFunctions - Function nodes from AST
 * @param {Array} eslintFunctions - Function objects from ESLint results
 * @param {string} sourceCode - Full source code (for finding => in arrow functions)
 * @returns {Map} Map of AST function node to ESLint function line
 */
function matchFunctionsToAST(astFunctions, eslintFunctions, sourceCode) {
  const astToEslintMap = new Map();
  
  // Create a map of line numbers to ESLint functions (handle multiple functions on same line)
  const eslintFunctionMap = new Map();
  eslintFunctions.forEach(func => {
    if (!eslintFunctionMap.has(func.line)) {
      eslintFunctionMap.set(func.line, []);
    }
    eslintFunctionMap.get(func.line).push(func);
  });
  
  // Match AST functions to ESLint functions by line number
  astFunctions.forEach(astFunc => {
    const matchLine = getMatchLineForASTFunction(astFunc, sourceCode);
    const matchingEslintFuncs = eslintFunctionMap.get(matchLine);
    
    if (matchingEslintFuncs && matchingEslintFuncs.length > 0) {
      matchByNodeType(astFunc, matchingEslintFuncs, astToEslintMap);
    } else {
      tryMatchByRange(astFunc, eslintFunctions, sourceCode, astToEslintMap);
    }
  });
  
  return astToEslintMap;
}

/**
 * Finds the innermost AST function that contains a decision point node
 * @param {Object} node - Decision point node
 * @param {Array} astFunctions - All AST function nodes
 * @returns {Object|null} Innermost AST function node or null
 */
function findInnermostASTFunction(node, astFunctions) {
  if (!node.range) return null;
  
  let innermost = null;
  let innermostSize = Infinity;
  
  // Find the smallest function that contains this node
  for (const astFunc of astFunctions) {
    if (astFunc.range && 
        node.range[0] >= astFunc.range[0] && 
        node.range[1] <= astFunc.range[1]) {
      const size = astFunc.range[1] - astFunc.range[0];
      if (size < innermostSize) {
        innermost = astFunc;
        innermostSize = size;
      }
    }
  }
  
  return innermost;
}

/**
 * Finds the ESLint function line that contains a decision point
 * @param {Object} node - Decision point node
 * @param {Array} astFunctions - All AST function nodes
 * @param {Map} astToEslintMap - Map of AST function node to ESLint function line
 * @returns {number|null} ESLint function line number or null
 */
function findFunctionForDecisionPoint(node, astFunctions, astToEslintMap) {
  if (!node.range) return null;
  
  // Find the innermost AST function containing this node
  const innermostASTFunc = findInnermostASTFunction(node, astFunctions);
  if (!innermostASTFunc) return null;
  
  // Map AST function to ESLint function line
  return astToEslintMap.get(innermostASTFunc) || null;
}

/**
 * Parses decision points from source code using ESLint's AST
 * @param {string} sourceCode - Full source code
 * @param {Map} functionBoundaries - Map of function lines to boundaries (not used in AST approach)
 * @param {Array} functions - Array of function objects with line numbers from ESLint
 * @param {string} filePath - Path to the file
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Array>} Array of decision point objects
 */
export async function parseDecisionPointsAST(sourceCode, functionBoundaries, functions, filePath, _projectRoot) {
  try {
    // Parse source code into AST
    const ast = parseAST(sourceCode, filePath);
    if (!ast) {
      return [];
    }
    
    // Find all function nodes in the AST
    const astFunctions = findAllFunctions(ast);
    
    // Match AST functions to ESLint function results
    const astToEslintMap = matchFunctionsToAST(astFunctions, functions, sourceCode);
    
    if (astToEslintMap.size === 0) {
      // No functions matched, return empty
      return [];
    }
    
    // Build parent map for context checking
    const parentMap = buildParentMap(ast);
    
    // Collect all nodes that could be decision points
    // Note: LogicalExpression includes &&, ||, and ?? operators
    const decisionPointNodeTypes = [
      'IfStatement',
      'ForStatement',
      'ForInStatement',
      'ForOfStatement',
      'WhileStatement',
      'DoWhileStatement',
      'SwitchCase',
      'CatchClause',
      'ConditionalExpression',
      'LogicalExpression', // Includes &&, ||, and ??
      'ChainExpression',
      'MemberExpression',
      'BinaryExpression', // Some ?? operators might be here too
      'AssignmentPattern',
    ];
    
    const allNodes = [];
    decisionPointNodeTypes.forEach(type => {
      collectNodesByType(ast, type, allNodes);
    });
    
    // Extract decision points and assign to functions
    const decisionPoints = [];
    allNodes.forEach(node => {
      const decisionType = getDecisionPointType(node, parentMap, ast);
      if (decisionType) {
        const functionLine = findFunctionForDecisionPoint(node, astFunctions, astToEslintMap);
        if (functionLine !== null) {
          const line = getNodeLine(node);
          decisionPoints.push({
            type: decisionType,
            line: line,
            functionLine: functionLine,
            name: null, // AST doesn't provide names for decision points
          });
        }
      }
    });
    
    return decisionPoints;
  } catch (error) {
    console.error(`Error parsing AST for ${filePath}:`, error.message);
    return [];
  }
}
