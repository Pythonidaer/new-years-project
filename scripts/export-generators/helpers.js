import { getBaseFunctionName } from '../function-extraction.js';

/**
 * Checks if a function name has a callback suffix (e.g., "functionA (useEffect callback)")
 * This is used to identify functions that should be deduplicated with their base name
 * @param {string} functionName - Function name to check
 * @returns {boolean} True if the name has a callback suffix
 */
function hasCallbackSuffix(functionName) {
  if (!functionName) return false;
  
  // Check for callback patterns in parentheses (e.g., "functionA (useEffect callback)")
  const callbackSuffixPatterns = [
    /\s*\(.+?\s+callback\)/i,  // Generic callback pattern: (forEach callback), (map callback), etc.
    /\s*\(useEffect\s+callback\)/i,
    /\s*\(setTimeout\s+callback\)/i,
    /\s*\(requestAnimationFrame\s+callback\)/i,
    /\s*\(return\s+callback\)/i,
    /\s*\(arrow\s+function\)/i,
  ];
  
  return callbackSuffixPatterns.some(pattern => pattern.test(functionName));
}

/**
 * Finds the immediate parent function for a callback using function boundaries
 * @param {Object} func - Function object
 * @param {Map} functionBoundaries - Map of function boundaries (file-specific)
 * @param {Array} fileFunctions - Functions in the same file
 * @returns {Object|null} Parent function or null
 */
function findImmediateParentFunction(func, functionBoundaries, fileFunctions) {
  const funcBoundary = functionBoundaries.get(func.line);
  if (!funcBoundary) {
    return null;
  }
  
  // Find all functions that contain this function (only within the same file)
  const containingFunctions = Array.from(functionBoundaries.entries())
    .filter(([fl, boundary]) => {
      if (fl === func.line) return false;
      // Function must be in the same file
      const funcObj = fileFunctions.find(f => f.line === fl);
      if (!funcObj) return false;
      // Function must contain this callback
      return boundary.start < funcBoundary.start && boundary.end > funcBoundary.end;
    });
  
  if (containingFunctions.length === 0) {
    return null;
  }
  
  // Find the smallest containing function (immediate parent)
  // Sort by size (end - start) ascending, then by start descending
  containingFunctions.sort((a, b) => {
    const sizeA = a[1].end - a[1].start;
    const sizeB = b[1].end - b[1].start;
    if (sizeA !== sizeB) {
      return sizeA - sizeB; // Smaller size first (more immediate parent)
    }
    return b[1].start - a[1].start; // If same size, prefer later start (more nested)
  });
  
  // Get the immediate parent (smallest containing function)
  const immediateParentLine = containingFunctions[0][0];
  return fileFunctions.find(f => f.line === immediateParentLine) || null;
}

/**
 * Builds a full hierarchical function name by recursively finding all parent functions
 * Uses file-specific boundaries (like the HTML report) for accurate parent detection
 * @param {Object} func - Function object
 * @param {Map} fileBoundaries - Map of function boundaries for this file
 * @param {Array} fileFunctions - All functions in the same file
 * @param {Set} visited - Set to track visited functions (prevents infinite loops)
 * @returns {string} Full hierarchical name (e.g., "parent (callback) (nested callback)")
 */
export function buildHierarchicalFunctionName(func, fileBoundaries, fileFunctions, visited = new Set()) {
  let displayName = func.functionName || 'unknown';
  
  // Prevent infinite loops
  const funcKey = `${func.file}:${func.line}`;
  if (visited.has(funcKey)) {
    return displayName;
  }
  visited.add(funcKey);
  
  if (!fileBoundaries || !fileFunctions) {
    return displayName;
  }
  
  // Find the actual immediate parent using boundaries (regardless of what the name says)
  const immediateParentFunc = findImmediateParentFunction(func, fileBoundaries, fileFunctions);
  
  if (!immediateParentFunc) {
    // No parent found, return name as-is
    return displayName;
  }
  
  // Recursively build the parent's hierarchical name
  const parentHierarchicalName = buildHierarchicalFunctionName(
    immediateParentFunc, 
    fileBoundaries, 
    fileFunctions,
    new Set(visited) // New visited set for parent traversal
  );
  
  // Extract callback type from current function name
  // Pattern 1: "parentName (callbackType callback)" - extract callbackType
  // Pattern 2: "callbackType callback" - extract callbackType
  // Pattern 3: "callbackType callback (nested callback)" - extract the last callbackType
  let callbackType = null;
  const nestedCallbackMatch = displayName.match(/\((.+?)\s+callback\)\s*$/);
  if (nestedCallbackMatch) {
    callbackType = nestedCallbackMatch[1];
  } else {
    const simpleCallbackMatch = displayName.match(/^(.+?)\s+callback$/i);
    if (simpleCallbackMatch) {
      callbackType = simpleCallbackMatch[1];
    }
  }
  
  if (callbackType) {
    // Build full chain: parent's full hierarchical name + this callback
    const parentBaseName = getBaseFunctionName(parentHierarchicalName);
    if (parentBaseName && parentBaseName !== 'unknown' && parentBaseName !== 'anonymous') {
      displayName = `${parentHierarchicalName} (${callbackType} callback)`;
    }
  } else {
    // Not a callback, or couldn't extract callback type - use parent's name if it's different
    const currentBaseName = getBaseFunctionName(displayName);
    const parentBaseName = getBaseFunctionName(parentHierarchicalName);
    if (parentBaseName && parentBaseName !== currentBaseName && 
        parentBaseName !== 'unknown' && parentBaseName !== 'anonymous') {
      // This might be a nested function that should show its parent
      // But for now, keep the original name if it's not a callback
      return displayName;
    }
  }
  
  return displayName;
}

/**
 * Gets top-level functions only (no nested functions)
 * Deduplicates by base function name so "functionA" and "functionA (useEffect callback)" 
 * only show "functionA" once. Standalone names like "useCallback callback" and "anonymous" 
 * are kept as-is.
 * @param {Array} allFunctions - All functions array
 * @param {Map} functionBoundaries - Map of function boundaries
 * @returns {Array} Top-level functions only, deduplicated by base name
 */
export function getTopLevelFunctions(allFunctions, functionBoundaries) {
  const topLevel = [];
  const seenBaseNames = new Set(); // Track seen base names to deduplicate
  
  for (const func of allFunctions) {
    const functionName = func.functionName || 'unknown';
    
    const funcBoundary = functionBoundaries.get(func.line);
    
    // If no boundary found, assume it's top-level (boundary detection might have failed)
    if (!funcBoundary) {
      // Extract base name for deduplication
      const baseName = getBaseFunctionName(functionName);
      const key = `${func.file}:${baseName}`;
      
      // Only deduplicate if this function has a callback suffix
      // Standalone names like "useCallback callback" or "anonymous" don't have suffixes
      if (hasCallbackSuffix(functionName)) {
        // This is a callback variant - only include if we haven't seen the base name
        if (!seenBaseNames.has(key)) {
          seenBaseNames.add(key);
          // Create a new function object with the base name for display
          topLevel.push({
            ...func,
            functionName: baseName,
          });
        }
      } else {
        // Standalone name - deduplicate by exact name + file to avoid duplicates
        const exactKey = `${func.file}:${functionName}`;
        if (!seenBaseNames.has(exactKey)) {
          seenBaseNames.add(exactKey);
          // Also mark the base name as seen to prevent callback variants from being added
          seenBaseNames.add(key);
          topLevel.push(func);
        }
      }
      continue;
    }
    
    // Check if this function is contained by any other function
    // Only check against functions that have boundaries and are in the same file
    let isNested = false;
    for (const otherFunc of allFunctions) {
      if (otherFunc.line === func.line) continue;
      
      // Only check nesting within the same file
      if (otherFunc.file !== func.file) continue;
      
      const otherBoundary = functionBoundaries.get(otherFunc.line);
      if (!otherBoundary) continue;
      
      // If otherFunc contains this func, it's nested
      // Use strict < and > to ensure it's actually nested (not just overlapping)
      if (otherBoundary.start < funcBoundary.start && otherBoundary.end > funcBoundary.end) {
        isNested = true;
        break;
      }
    }
    
    if (!isNested) {
      // Extract base name for deduplication
      const baseName = getBaseFunctionName(functionName);
      const key = `${func.file}:${baseName}`;
      
      // Only deduplicate if this function has a callback suffix
      if (hasCallbackSuffix(functionName)) {
        // This is a callback variant - only include if we haven't seen the base name
        if (!seenBaseNames.has(key)) {
          seenBaseNames.add(key);
          // Create a new function object with the base name for display
          topLevel.push({
            ...func,
            functionName: baseName,
          });
        }
      } else {
        // Standalone name or base function - deduplicate by exact name + file
        const exactKey = `${func.file}:${functionName}`;
        if (!seenBaseNames.has(exactKey)) {
          seenBaseNames.add(exactKey);
          // Also mark the base name as seen to prevent callback variants from being added
          seenBaseNames.add(key);
          topLevel.push(func);
        }
      }
    }
  }
  
  return topLevel;
}

/**
 * Groups functions by folder/file structure
 * @param {Array} functions - Functions to group
 * @param {Function} getDirectory - Function to get directory from file path
 * @returns {Map} Map of directory -> file -> functions
 */
export function groupFunctionsByFolder(functions, getDirectory) {
  const folderMap = new Map();
  
  for (const func of functions) {
    const dir = getDirectory(func.file);
    if (!folderMap.has(dir)) {
      folderMap.set(dir, new Map());
    }
    
    const fileMap = folderMap.get(dir);
    if (!fileMap.has(func.file)) {
      fileMap.set(func.file, []);
    }
    
    fileMap.get(func.file).push(func);
  }
  
  return folderMap;
}
