/**
 * Debug script to check AST function matching
 */

import { parse } from '@typescript-eslint/typescript-estree';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Test with PresetSection
const filePath = 'src/components/ThemePicker/ThemePicker.tsx';
const sourceCode = readFileSync(resolve(projectRoot, filePath), 'utf-8');
const ast = parse(sourceCode, { loc: true, range: true, jsx: true });

/**
 * Checks if a node is a function type
 * @param {string} type - Node type
 * @returns {boolean} True if function type
 */
function isFunctionType(type) {
  return type === 'FunctionDeclaration' || 
         type === 'FunctionExpression' ||
         type === 'ArrowFunctionExpression';
}

/**
 * Processes an array of child nodes for function finding
 * @param {Array} array - Array of child nodes
 * @param {Function} traverse - Traverse function to call recursively
 */
function processArrayChildrenForFunctions(array, traverse) {
  array.forEach(item => {
    if (item && typeof item === 'object' && item.type) {
      traverse(item);
    }
  });
}

/**
 * Processes a single child node for function finding
 * @param {Object} child - Child node
 * @param {Function} traverse - Traverse function to call recursively
 */
function processChildNodeForFunctions(child, traverse) {
  if (child && typeof child === 'object' && child.type) {
    traverse(child);
  }
}

/**
 * Creates a function info object from an AST function node
 * @param {Object} node - AST function node
 * @returns {Object} Function info object
 */
function createFunctionInfo(node) {
  return {
    type: node.type,
    line: node.loc?.start?.line,
    range: node.range,
    id: node.id?.name || 'anonymous'
  };
}

function findAllFunctions(ast) {
  const functions = [];
  
  function traverse(node) {
    if (!node || typeof node !== 'object') return;
    
    if (isFunctionType(node.type)) {
      functions.push(createFunctionInfo(node));
    }
    
    for (const key in node) {
      if (key === 'parent' || key === 'range' || key === 'loc') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        processArrayChildrenForFunctions(child, traverse);
      } else {
        processChildNodeForFunctions(child, traverse);
      }
    }
  }
  
  traverse(ast);
  return functions;
}

const astFunctions = findAllFunctions(ast);
const presetSectionFuncs = astFunctions.filter(f => f.line >= 280 && f.line <= 400);

console.log('AST Functions around PresetSection (line 282):');
presetSectionFuncs.forEach(f => {
  console.log(`  ${f.type} "${f.id}" at line ${f.line}, range [${f.range[0]}, ${f.range[1]}]`);
});

// Check what ESLint reports
import { runESLintComplexityCheck } from './eslint-integration.js';
import { extractFunctionsFromESLintResults, extractFunctionName } from './function-extraction.js';

const eslintResults = runESLintComplexityCheck(projectRoot);
const allFunctions = extractFunctionsFromESLintResults(eslintResults, projectRoot, extractFunctionName);
const presetSectionEslint = allFunctions.filter(f => 
  f.file === filePath && f.line >= 280 && f.line <= 400
);

console.log('\nESLint Functions around PresetSection:');
presetSectionEslint.forEach(f => {
  console.log(`  ${f.functionName} (${f.nodeType}) at line ${f.line}, complexity ${f.complexity}`);
});
