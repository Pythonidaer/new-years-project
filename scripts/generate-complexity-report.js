import { writeFileSync, mkdirSync, copyFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import modules
import { runESLintComplexityCheck } from './eslint-integration.js';
import { extractFunctionName, extractFunctionsFromESLintResults, getComplexityLevel, getDirectory, getBaseFunctionName } from './function-extraction.js';
import { findFunctionBoundaries } from './function-boundaries.js';
import { parseDecisionPointsAST } from './decision-points-ast.js';
import { calculateComplexityBreakdown } from './complexity-breakdown.js';
import { formatFunctionHierarchy, setEscapeHtml } from './function-hierarchy.js';
import { escapeHtml, generateAboutPageHTML, generateMainIndexHTML, generateFolderHTML, generateFileHTML } from './html-generators/index.js';
import { getComplexityThreshold } from './get-complexity-threshold.js';
import { generateAllExports } from './export-generators/index.js';

/**
 * Calculates decision point totals across all functions
 * @param {Array} allFunctions - Array of all function objects
 * @param {string} projectRoot - Project root directory
 * @param {Function} findFunctionBoundaries - Function to find function boundaries
 * @param {Function} parseDecisionPoints - Function to parse decision points
 * @returns {Object} Object with controlFlow, expressions, functionParameters totals
 */
async function calculateDecisionPointTotals(allFunctions, projectRoot, findFunctionBoundaries, parseDecisionPoints) {
  // Control Flow decision points
  const controlFlowTypes = ['if', 'else if', 'for', 'for...of', 'for...in', 'while', 'do...while', 'switch', 'case', 'catch'];
  // Expression decision points
  const expressionTypes = ['ternary', '&&', '||', '??', '?.'];
  // Function Parameter decision points
  const functionParameterTypes = ['default parameter'];
  
  let controlFlowTotal = 0;
  let expressionsTotal = 0;
  let functionParametersTotal = 0;
  
  // Group functions by file
  const fileToFunctions = new Map();
  allFunctions.forEach(func => {
    if (!fileToFunctions.has(func.file)) {
      fileToFunctions.set(func.file, []);
    }
    fileToFunctions.get(func.file).push(func);
  });
  
  // Process each file
  for (const [filePath, functions] of fileToFunctions.entries()) {
    const fullPath = resolve(projectRoot, filePath);
    
    if (!existsSync(fullPath)) {
      continue;
    }
    
    try {
      const sourceCode = readFileSync(fullPath, 'utf-8');
      const functionBoundaries = findFunctionBoundaries(sourceCode, functions);
      const decisionPoints = await parseDecisionPoints(sourceCode, functionBoundaries, functions, filePath, projectRoot);
      
      // Calculate breakdowns for all functions in this file
      functions.forEach(func => {
        const breakdown = calculateComplexityBreakdown(func.line, decisionPoints, 1);
        
        // Sum up totals by category
        controlFlowTypes.forEach(type => {
          controlFlowTotal += breakdown.breakdown[type] || 0;
        });
        
        expressionTypes.forEach(type => {
          expressionsTotal += breakdown.breakdown[type] || 0;
        });
        
        functionParameterTypes.forEach(type => {
          functionParametersTotal += breakdown.breakdown[type] || 0;
        });
      });
    } catch (error) {
      // Skip files that can't be processed
      console.warn(`Warning: Could not process ${filePath} for decision point totals:`, error.message);
    }
  }
  
  return {
    controlFlow: controlFlowTotal,
    expressions: expressionsTotal,
    functionParameters: functionParametersTotal,
  };
}

// Wrap main execution in async function
async function main() {
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Set escapeHtml in function-hierarchy module (circular dependency resolution)
setEscapeHtml(escapeHtml);

// Get complexity threshold from eslint.config.js
const complexityThreshold = getComplexityThreshold(projectRoot);

// Run ESLint to collect complexity data and read results
const eslintResults = runESLintComplexityCheck(projectRoot);

// Extract complexity for ALL functions (not just those over threshold)
const allFunctions = extractFunctionsFromESLintResults(eslintResults, projectRoot, extractFunctionName);

// Sort by complexity (highest first)
allFunctions.sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity));

// Separate functions by threshold
const overThreshold = allFunctions.filter(f => parseInt(f.complexity) > complexityThreshold);
const allFunctionsCount = allFunctions.length;
const maxComplexity = allFunctions.length > 0 ? Math.max(...allFunctions.map(i => parseInt(i.complexity))) : 0;
const avgComplexity = allFunctions.length > 0 ? Math.round(allFunctions.reduce((sum, i) => sum + parseInt(i.complexity), 0) / allFunctions.length) : 0;

// Calculate functions within threshold
const withinThreshold = allFunctions.filter(f => parseInt(f.complexity) <= complexityThreshold).length;
const withinThresholdPercentage = allFunctionsCount > 0 
  ? Math.round((withinThreshold / allFunctionsCount) * 100) 
  : 100;

// Group functions by directory (folder)
const folderMap = new Map();
allFunctions.forEach(func => {
  const dir = getDirectory(func.file);
  if (!folderMap.has(dir)) {
    folderMap.set(dir, []);
  }
  folderMap.get(dir).push(func);
});

// Calculate folder-level metrics
const folders = Array.from(folderMap.entries()).map(([dir, functions]) => {
  const totalFunctions = functions.length;
  const withinThreshold = functions.filter(f => parseInt(f.complexity) <= complexityThreshold).length;
  const percentage = totalFunctions > 0 ? Math.round((withinThreshold / totalFunctions) * 100) : 100;
  
  return {
    directory: dir,
    totalFunctions,
    withinThreshold,
    percentage,
    functions: functions.sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity)),
  };
}).sort((a, b) => a.directory.localeCompare(b.directory));

// Group functions by file path for file-level HTML generation
const fileMap = new Map();
allFunctions.forEach(func => {
  if (!fileMap.has(func.file)) {
    fileMap.set(func.file, []);
  }
  fileMap.get(func.file).push(func);
});

// Get initial display state from command line arguments
const showAllInitially = process.argv.includes('--show-all') || process.argv.includes('--all');
const showAllColumnsInitially = process.argv.includes('--show-all-columns');
const hideTableInitially = process.argv.includes('--hide-table');
const shouldExport = process.argv.includes('--export') || process.argv.includes('--exports');

// Use AST parser (100% accuracy) - now the default and only parser
const parseDecisionPointsFn = parseDecisionPointsAST;

// Calculate decision point totals across all functions
const decisionPointTotals = await calculateDecisionPointTotals(
  allFunctions,
  projectRoot,
  findFunctionBoundaries,
  parseDecisionPointsFn
);

// Generate HTML report
const html = generateMainIndexHTML(
  folders, 
  allFunctionsCount, 
  overThreshold, 
  maxComplexity, 
  avgComplexity, 
  showAllInitially, 
  complexityThreshold,
  decisionPointTotals,
  withinThreshold,
  withinThresholdPercentage
);

// Create complexity directory if it doesn't exist
const complexityDir = resolve(projectRoot, 'complexity');
try {
  mkdirSync(complexityDir, { recursive: true });
} catch {
  // Directory might already exist, ignore
}

// Copy prettify files from coverage to complexity folder for syntax highlighting
const coverageDir = resolve(projectRoot, 'coverage');
const prettifyCssSource = resolve(coverageDir, 'prettify.css');
const prettifyJsSource = resolve(coverageDir, 'prettify.js');
const prettifyCssDest = resolve(complexityDir, 'prettify.css');
const prettifyJsDest = resolve(complexityDir, 'prettify.js');

try {
  copyFileSync(prettifyCssSource, prettifyCssDest);
  copyFileSync(prettifyJsSource, prettifyJsDest);
} catch (error) {
  console.warn('Warning: Could not copy prettify files for syntax highlighting:', error.message);
  console.warn('  Syntax highlighting will not work. Make sure coverage/prettify.css and coverage/prettify.js exist.');
}

// Copy sort-arrow-sprite.png from coverage to complexity folder
const sortArrowSpriteSource = resolve(coverageDir, 'sort-arrow-sprite.png');
const sortArrowSpriteDest = resolve(complexityDir, 'sort-arrow-sprite.png');

try {
  copyFileSync(sortArrowSpriteSource, sortArrowSpriteDest);
} catch (error) {
  console.warn('Warning: Could not copy sort-arrow-sprite.png:', error.message);
  console.warn('  Sort arrows may not display correctly. Make sure coverage/sort-arrow-sprite.png exists.');
}

// Copy shared.css from html-generators to complexity folder
const htmlGeneratorsDir = resolve(__dirname, 'html-generators');
const sharedCssSource = resolve(htmlGeneratorsDir, 'shared.css');
const sharedCssDest = resolve(complexityDir, 'shared.css');

try {
  copyFileSync(sharedCssSource, sharedCssDest);
} catch (error) {
  console.warn('Warning: Could not copy shared.css:', error.message);
  console.warn('  Styles may not work correctly. Make sure scripts/html-generators/shared.css exists.');
}

// Write main index.html
const htmlPath = resolve(complexityDir, 'index.html');
writeFileSync(htmlPath, html, 'utf-8');

// Write about page (complexity/about.html)
const aboutPath = resolve(complexityDir, 'about.html');
writeFileSync(aboutPath, generateAboutPageHTML(), 'utf-8');

// Generate separate HTML files for each folder
let foldersGenerated = 0;
const folderGenerationPromises = folders.map(async folder => {
  if (!folder.directory) return; // Skip root level
  
  const folderPath = folder.directory;
  const folderParts = folderPath.split('/');
  const folderDir = resolve(complexityDir, ...folderParts);
  
  try {
    mkdirSync(folderDir, { recursive: true });
    
    // Calculate decision point totals for this folder's functions
    const folderDecisionPointTotals = await calculateDecisionPointTotals(
      folder.functions,
      projectRoot,
      findFunctionBoundaries,
      parseDecisionPointsFn
    );
    
    const folderHTML = generateFolderHTML(
      folder, 
      folders, 
      showAllInitially, 
      getComplexityLevel, 
      getBaseFunctionName, 
      complexityThreshold,
      folderDecisionPointTotals
    );
    const folderHTMLPath = resolve(folderDir, 'index.html');
    writeFileSync(folderHTMLPath, folderHTML, 'utf-8');
    foldersGenerated++;
  } catch (e) {
    console.error(`Error generating folder HTML for ${folderPath}:`, e.message);
  }
});

// Wait for all folder HTML generation to complete
await Promise.all(folderGenerationPromises);

// Generate file-level HTML pages
let filesGenerated = 0;
const fileGenerationPromises = Array.from(fileMap.entries()).map(async ([filePath, functions]) => {
  try {
    const fileDir = getDirectory(filePath);
    const fileName = filePath.split('/').pop();
    
    // Create directory structure for file
    if (fileDir) {
      const fileDirPath = resolve(complexityDir, ...fileDir.split('/'));
      mkdirSync(fileDirPath, { recursive: true });
    }
    
    // Generate file HTML (await if async)
    const fileHTML = await generateFileHTML(
      filePath,
      functions,
      projectRoot,
      findFunctionBoundaries,
      parseDecisionPointsFn,
      calculateComplexityBreakdown,
      formatFunctionHierarchy,
      getComplexityLevel,
      getDirectory,
      escapeHtml,
      showAllColumnsInitially,
      hideTableInitially,
      complexityThreshold
    );
    const fileHTMLPath = fileDir 
      ? resolve(complexityDir, ...fileDir.split('/'), `${fileName}.html`)
      : resolve(complexityDir, `${fileName}.html`);
    
    writeFileSync(fileHTMLPath, fileHTML, 'utf-8');
    filesGenerated++;
  } catch (e) {
    console.error(`Error generating file HTML for ${filePath}:`, e.message);
  }
});

// Wait for all file HTML generation to complete
await Promise.all(fileGenerationPromises);

// Generate exports if requested
if (shouldExport) {
  try {
    // Read export directory from package.json config
    const packageJsonPath = resolve(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const exportDirConfig = packageJson.complexityReport?.exportDir || 'complexity/reports';
    const exportDir = resolve(projectRoot, exportDirConfig);
    
    // Generate all exports (boundaries will be built inside generateAllExports using file-specific approach)
    const exportResult = generateAllExports(allFunctions, projectRoot, exportDir);
    
    console.log(`\n✅ Exports generated in: ${exportDirConfig}/`);
    console.log(`   Generated ${exportResult.generatedFiles.length} export file(s):`);
    exportResult.generatedFiles.forEach(file => {
      const relativePath = file.replace(projectRoot + '/', '');
      console.log(`   - ${relativePath}`);
    });
  } catch (error) {
    console.error('Error generating exports:', error.message);
    console.error('  Exports will be skipped, but HTML report generation will continue.');
  }
}

console.log(`\n✅ Complexity report generated: complexity/index.html`);
console.log(`   About: complexity/about.html`);
console.log(`   Generated ${foldersGenerated} folder HTML file(s)`);
console.log(`   Generated ${filesGenerated} file HTML page(s)`);
console.log(`   Found ${allFunctionsCount} total function(s)`);
if (overThreshold.length > 0) {
  console.log(`   ${overThreshold.length} function(s) with complexity > ${complexityThreshold}`);
}
if (allFunctionsCount > 0) {
  console.log(`   Highest complexity: ${maxComplexity} / Average: ${avgComplexity}`);
}
console.log(`   Using AST-based parser for 100% accuracy`);
}

// Run main function
main().catch(error => {
  console.error('Error generating complexity report:', error);
  process.exit(1);
});
