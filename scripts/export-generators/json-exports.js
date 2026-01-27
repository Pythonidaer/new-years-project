import { buildHierarchicalFunctionName, getTopLevelFunctions, groupFunctionsByFolder } from './helpers.js';
import { getDirectory } from '../function-extraction.js';

/**
 * Generates JSON export for top-level functions only (alphabetically)
 * @param {Array} allFunctions - All functions array
 * @param {Map} fileBoundariesMap - Map of filePath -> Map of line -> boundary
 * @param {Map} fileToFunctions - Map of filePath -> functions array
 * @returns {string} JSON string
 */
export function generateTopLevelFunctionsJSON(allFunctions, fileBoundariesMap, fileToFunctions) {
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
  
  const exportData = {
    metadata: {
      exportType: 'top-level-functions',
      totalFunctions: topLevel.length,
      generatedAt: new Date().toISOString(),
    },
    functions: topLevel.map(func => ({
      name: func.functionName || 'unknown',
      file: func.file,
      line: func.line,
      complexity: parseInt(func.complexity),
      nodeType: func.nodeType,
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generates JSON export for all functions including callbacks (alphabetically)
 * @param {Array} allFunctions - All functions array
 * @param {Map} fileBoundariesMap - Map of filePath -> Map of line -> boundary
 * @param {Map} fileToFunctions - Map of filePath -> functions array
 * @returns {string} JSON string
 */
export function generateAllFunctionsJSON(allFunctions, fileBoundariesMap, fileToFunctions) {
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
  
  const exportData = {
    metadata: {
      exportType: 'all-functions-with-callbacks',
      totalFunctions: functionsWithHierarchy.length,
      generatedAt: new Date().toISOString(),
    },
    functions: functionsWithHierarchy.map(func => ({
      name: func.functionName || 'unknown',
      hierarchicalName: func.hierarchicalName,
      file: func.file,
      line: func.line,
      complexity: parseInt(func.complexity),
      nodeType: func.nodeType,
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generates JSON export for functions organized by folder/file
 * @param {Array} allFunctions - All functions array
 * @param {Map} fileBoundariesMap - Map of filePath -> Map of line -> boundary
 * @param {Map} fileToFunctions - Map of filePath -> functions array
 * @returns {string} JSON string
 */
export function generateFunctionsByFolderJSON(allFunctions, fileBoundariesMap, fileToFunctions) {
  const folderMap = groupFunctionsByFolder(allFunctions, getDirectory);
  
  // Build hierarchical structure
  const structure = {};
  
  // Sort folders alphabetically
  const sortedFolders = Array.from(folderMap.entries()).sort((a, b) => 
    a[0].localeCompare(b[0])
  );
  
  for (const [folder, fileMap] of sortedFolders) {
    structure[folder] = {};
    
    // Sort files alphabetically
    const sortedFiles = Array.from(fileMap.entries()).sort((a, b) => 
      a[0].localeCompare(b[0])
    );
    
    for (const [file, functions] of sortedFiles) {
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
      
      structure[folder][file] = functionsWithHierarchy.map(func => ({
        name: func.functionName || 'unknown',
        hierarchicalName: func.hierarchicalName,
        line: func.line,
        complexity: parseInt(func.complexity),
        nodeType: func.nodeType,
      }));
    }
  }
  
  const exportData = {
    metadata: {
      exportType: 'functions-by-folder',
      totalFolders: folderMap.size,
      totalFunctions: allFunctions.length,
      generatedAt: new Date().toISOString(),
    },
    structure,
  };
  
  return JSON.stringify(exportData, null, 2);
}
