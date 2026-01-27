import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  generateTopLevelFunctionsJSON,
  generateAllFunctionsJSON,
  generateFunctionsByFolderJSON,
} from './json-exports.js';
import {
  generateTopLevelFunctionsTXT,
  generateAllFunctionsTXT,
  generateFunctionsByFolderTXT,
} from './txt-exports.js';
import {
  generateTopLevelFunctionsMD,
  generateAllFunctionsMD,
  generateFunctionsByFolderMD,
} from './md-exports.js';
import { findFunctionBoundaries } from '../function-boundaries.js';

/**
 * Generates all export files (JSON, TXT, MD) for complexity report
 * @param {Array} allFunctions - All functions array
 * @param {string} projectRoot - Project root directory
 * @param {string} exportDir - Directory to write export files to
 * @returns {Object} Object with generated file paths
 */
export function generateAllExports(allFunctions, projectRoot, exportDir) {
  // Create export directory if it doesn't exist
  try {
    mkdirSync(exportDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore
  }
  
  const generatedFiles = [];
  
  // Build file-specific boundaries map (like HTML report does)
  // Map of filePath -> Map of line -> boundary
  const fileBoundariesMap = new Map();
  const fileToFunctions = new Map();
  
  // Group functions by file
  allFunctions.forEach(func => {
    if (!fileToFunctions.has(func.file)) {
      fileToFunctions.set(func.file, []);
    }
    fileToFunctions.get(func.file).push(func);
  });
  
  // Build boundaries for each file
  for (const [filePath, functions] of fileToFunctions.entries()) {
    const fullPath = resolve(projectRoot, filePath);
    if (!existsSync(fullPath)) continue;
    
    try {
      const sourceCode = readFileSync(fullPath, 'utf-8');
      const boundaries = findFunctionBoundaries(sourceCode, functions);
      fileBoundariesMap.set(filePath, boundaries);
    } catch (error) {
      console.warn(`Warning: Could not process ${filePath} for export boundaries:`, error.message);
      // Create empty boundaries map for this file
      fileBoundariesMap.set(filePath, new Map());
    }
  }
  
  // Generate top-level functions exports
  const topLevelJSON = generateTopLevelFunctionsJSON(allFunctions, fileBoundariesMap, fileToFunctions);
  const topLevelJSONPath = resolve(exportDir, 'function-names.json');
  writeFileSync(topLevelJSONPath, topLevelJSON, 'utf-8');
  generatedFiles.push(topLevelJSONPath);
  
  const topLevelTXT = generateTopLevelFunctionsTXT(allFunctions, fileBoundariesMap, fileToFunctions);
  const topLevelTXTPath = resolve(exportDir, 'function-names.txt');
  writeFileSync(topLevelTXTPath, topLevelTXT, 'utf-8');
  generatedFiles.push(topLevelTXTPath);
  
  const topLevelMD = generateTopLevelFunctionsMD(allFunctions, fileBoundariesMap, fileToFunctions);
  const topLevelMDPath = resolve(exportDir, 'function-names.md');
  writeFileSync(topLevelMDPath, topLevelMD, 'utf-8');
  generatedFiles.push(topLevelMDPath);
  
  // Generate all functions (including callbacks) exports
  const allFunctionsJSON = generateAllFunctionsJSON(allFunctions, fileBoundariesMap, fileToFunctions);
  const allFunctionsJSONPath = resolve(exportDir, 'function-names.all.json');
  writeFileSync(allFunctionsJSONPath, allFunctionsJSON, 'utf-8');
  generatedFiles.push(allFunctionsJSONPath);
  
  const allFunctionsTXT = generateAllFunctionsTXT(allFunctions, fileBoundariesMap, fileToFunctions);
  const allFunctionsTXTPath = resolve(exportDir, 'function-names.all.txt');
  writeFileSync(allFunctionsTXTPath, allFunctionsTXT, 'utf-8');
  generatedFiles.push(allFunctionsTXTPath);
  
  const allFunctionsMD = generateAllFunctionsMD(allFunctions, fileBoundariesMap, fileToFunctions);
  const allFunctionsMDPath = resolve(exportDir, 'function-names.all.md');
  writeFileSync(allFunctionsMDPath, allFunctionsMD, 'utf-8');
  generatedFiles.push(allFunctionsMDPath);
  
  // Generate functions by folder exports
  const byFolderJSON = generateFunctionsByFolderJSON(allFunctions, fileBoundariesMap, fileToFunctions);
  const byFolderJSONPath = resolve(exportDir, 'function-names-by-file.json');
  writeFileSync(byFolderJSONPath, byFolderJSON, 'utf-8');
  generatedFiles.push(byFolderJSONPath);
  
  const byFolderTXT = generateFunctionsByFolderTXT(allFunctions, fileBoundariesMap, fileToFunctions);
  const byFolderTXTPath = resolve(exportDir, 'function-names-by-file.txt');
  writeFileSync(byFolderTXTPath, byFolderTXT, 'utf-8');
  generatedFiles.push(byFolderTXTPath);
  
  const byFolderMD = generateFunctionsByFolderMD(allFunctions, fileBoundariesMap, fileToFunctions);
  const byFolderMDPath = resolve(exportDir, 'function-names-by-file.md');
  writeFileSync(byFolderMDPath, byFolderMD, 'utf-8');
  generatedFiles.push(byFolderMDPath);
  
  return {
    generatedFiles,
    exportDir,
  };
}
