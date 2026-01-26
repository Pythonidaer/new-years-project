import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import modules
import { runESLintComplexityCheck } from './eslint-integration.js';
import { extractFunctionName, extractFunctionsFromESLintResults, getComplexityLevel, getDirectory, getBaseFunctionName } from './function-extraction.js';
import { findFunctionBoundaries } from './function-boundaries.js';
import { parseDecisionPointsAST } from './decision-points-ast.js';
import { calculateComplexityBreakdown } from './complexity-breakdown.js';
import { formatFunctionHierarchy, setEscapeHtml } from './function-hierarchy.js';
import { escapeHtml, generateAboutPageHTML, generateAboutExamplesPageHTML, generateMainIndexHTML, generateFolderHTML, generateFileHTML } from './html-generators/index.js';

// Wrap main execution in async function
async function main() {
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Set escapeHtml in function-hierarchy module (circular dependency resolution)
setEscapeHtml(escapeHtml);

// Run ESLint to collect complexity data and read results
const eslintResults = runESLintComplexityCheck(projectRoot);

// Extract complexity for ALL functions (not just those over threshold)
const allFunctions = extractFunctionsFromESLintResults(eslintResults, projectRoot, extractFunctionName);

// Sort by complexity (highest first)
allFunctions.sort((a, b) => parseInt(b.complexity) - parseInt(a.complexity));

// Separate functions by threshold
const overThreshold = allFunctions.filter(f => parseInt(f.complexity) > 10);
const allFunctionsCount = allFunctions.length;
const maxComplexity = allFunctions.length > 0 ? Math.max(...allFunctions.map(i => parseInt(i.complexity))) : 0;
const avgComplexity = allFunctions.length > 0 ? Math.round(allFunctions.reduce((sum, i) => sum + parseInt(i.complexity), 0) / allFunctions.length) : 0;

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
  const withinThreshold = functions.filter(f => parseInt(f.complexity) <= 10).length;
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

// Get initial display state from command line argument (default: false = show only over threshold)
const showAllInitially = process.argv.includes('--show-all') || process.argv.includes('--all');

// Use AST parser (100% accuracy) - now the default and only parser
const parseDecisionPointsFn = parseDecisionPointsAST;

// Generate HTML report
const html = generateMainIndexHTML(folders, allFunctionsCount, overThreshold, maxComplexity, avgComplexity, showAllInitially);

// Create complexity directory if it doesn't exist
const complexityDir = resolve(projectRoot, 'complexity');
try {
  mkdirSync(complexityDir, { recursive: true });
} catch {
  // Directory might already exist, ignore
}

// Write main index.html
const htmlPath = resolve(complexityDir, 'index.html');
writeFileSync(htmlPath, html, 'utf-8');

// Write about page (complexity/about.html) and examples page (complexity/about-examples.html)
const aboutPath = resolve(complexityDir, 'about.html');
writeFileSync(aboutPath, generateAboutPageHTML(), 'utf-8');
const aboutExamplesPath = resolve(complexityDir, 'about-examples.html');
writeFileSync(aboutExamplesPath, generateAboutExamplesPageHTML(), 'utf-8');

// Generate separate HTML files for each folder
let foldersGenerated = 0;
folders.forEach(folder => {
  if (!folder.directory) return; // Skip root level
  
  const folderPath = folder.directory;
  const folderParts = folderPath.split('/');
  const folderDir = resolve(complexityDir, ...folderParts);
  
  try {
    mkdirSync(folderDir, { recursive: true });
    const folderHTML = generateFolderHTML(folder, folders, showAllInitially, getComplexityLevel, getBaseFunctionName);
    const folderHTMLPath = resolve(folderDir, 'index.html');
    writeFileSync(folderHTMLPath, folderHTML, 'utf-8');
    foldersGenerated++;
  } catch (e) {
    console.error(`Error generating folder HTML for ${folderPath}:`, e.message);
  }
});

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
      escapeHtml
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

console.log(`\n✅ Complexity report generated: complexity/index.html`);
console.log(`   About: complexity/about.html | Examples: complexity/about-examples.html`);
console.log(`   Generated ${foldersGenerated} folder HTML file(s)`);
console.log(`   Generated ${filesGenerated} file HTML page(s)`);
console.log(`   Found ${allFunctionsCount} total function(s)`);
if (overThreshold.length > 0) {
  console.log(`   ${overThreshold.length} function(s) with complexity > 10`);
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
