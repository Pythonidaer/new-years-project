import { buildHierarchicalFunctionName, getTopLevelFunctions, groupFunctionsByFolder } from './helpers.js';
import { getDirectory } from '../function-extraction.js';

/**
 * Generates TXT export for top-level functions only (alphabetically)
 * @param {Array} allFunctions - All functions array
 * @param {Map} fileBoundariesMap - Map of filePath -> Map of line -> boundary
 * @param {Map} fileToFunctions - Map of filePath -> functions array
 * @returns {string} TXT string
 */
export function generateTopLevelFunctionsTXT(allFunctions, fileBoundariesMap, fileToFunctions) {
  // Build a combined boundaries map for getTopLevelFunctions (it expects a single map)
  const combinedBoundaries = new Map();
  for (const [filePath, boundaries] of fileBoundariesMap.entries()) {
    for (const [line, boundary] of boundaries.entries()) {
      combinedBoundaries.set(line, boundary);
    }
  }
  const topLevel = getTopLevelFunctions(allFunctions, combinedBoundaries);
  
  // Sort alphabetically by function name
  topLevel.sort((a, b) => {
    const nameA = (a.functionName || 'unknown').toLowerCase();
    const nameB = (b.functionName || 'unknown').toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  const lines = [
    'Top-Level Functions (Alphabetical)',
    '==================================',
    '',
    `Total: ${topLevel.length} functions`,
    `Generated: ${new Date().toISOString()}`,
    '',
    ...topLevel.map(func => func.functionName || 'unknown'),
  ];
  
  return lines.join('\n');
}

/**
 * Generates TXT export for all functions including callbacks (alphabetically)
 * @param {Array} allFunctions - All functions array
 * @param {Map} fileBoundariesMap - Map of filePath -> Map of line -> boundary
 * @param {Map} fileToFunctions - Map of filePath -> functions array
 * @returns {string} TXT string
 */
export function generateAllFunctionsTXT(allFunctions, fileBoundariesMap, fileToFunctions) {
  // Build hierarchical names for all functions using file-specific boundaries
  const functionsWithHierarchy = allFunctions.map(func => {
    const fileBoundaries = fileBoundariesMap.get(func.file) || new Map();
    const fileFunctions = fileToFunctions.get(func.file) || [];
    return {
      ...func,
      hierarchicalName: buildHierarchicalFunctionName(func, fileBoundaries, fileFunctions),
    };
  });
  
  // Sort alphabetically by hierarchical name
  functionsWithHierarchy.sort((a, b) => {
    const nameA = (a.hierarchicalName || 'unknown').toLowerCase();
    const nameB = (b.hierarchicalName || 'unknown').toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  const lines = [
    'All Functions Including Callbacks (Alphabetical)',
    '=================================================',
    '',
    `Total: ${functionsWithHierarchy.length} functions`,
    `Generated: ${new Date().toISOString()}`,
    '',
    ...functionsWithHierarchy.map(func => func.hierarchicalName),
  ];
  
  return lines.join('\n');
}

/**
 * Generates TXT export for functions organized by folder/file
 * @param {Array} allFunctions - All functions array
 * @param {Map} fileBoundariesMap - Map of filePath -> Map of line -> boundary
 * @param {Map} fileToFunctions - Map of filePath -> functions array
 * @returns {string} TXT string
 */
export function generateFunctionsByFolderTXT(allFunctions, fileBoundariesMap, fileToFunctions) {
  const folderMap = groupFunctionsByFolder(allFunctions, getDirectory);
  
  const lines = [
    'Functions by Folder/File',
    '=======================',
    '',
    `Total folders: ${folderMap.size}`,
    `Total functions: ${allFunctions.length}`,
    `Generated: ${new Date().toISOString()}`,
    '',
  ];
  
  // Sort folders alphabetically
  const sortedFolders = Array.from(folderMap.entries()).sort((a, b) => 
    a[0].localeCompare(b[0])
  );
  
  for (const [folder, fileMap] of sortedFolders) {
    lines.push(`\n${folder}/`);
    lines.push('─'.repeat(folder.length + 1));
    
    // Sort files alphabetically
    const sortedFiles = Array.from(fileMap.entries()).sort((a, b) => 
      a[0].localeCompare(b[0])
    );
    
    for (const [file, functions] of sortedFiles) {
      const fileName = file.split('/').pop();
      lines.push(`\n  ${fileName}`);
      
      // Get file-specific boundaries and functions
      const fileBoundaries = fileBoundariesMap.get(file) || new Map();
      const fileFunctions = fileToFunctions.get(file) || [];
      
      // Build hierarchical names and sort alphabetically
      const functionsWithHierarchy = functions.map(func => ({
        ...func,
        hierarchicalName: buildHierarchicalFunctionName(func, fileBoundaries, fileFunctions),
      })).sort((a, b) => {
        const nameA = (a.hierarchicalName || 'unknown').toLowerCase();
        const nameB = (b.hierarchicalName || 'unknown').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      for (const func of functionsWithHierarchy) {
        lines.push(`    - ${func.hierarchicalName}`);
      }
    }
  }
  
  return lines.join('\n');
}
