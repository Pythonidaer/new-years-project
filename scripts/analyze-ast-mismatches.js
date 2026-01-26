/**
 * Analyzes complexity mismatches when using AST parser
 */

import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import modules
import { runESLintComplexityCheck } from './eslint-integration.js';
import { extractFunctionName, extractFunctionsFromESLintResults } from './function-extraction.js';
import { findFunctionBoundaries } from './function-boundaries.js';
import { parseDecisionPointsAST } from './decision-points-ast.js';
import { calculateComplexityBreakdown } from './complexity-breakdown.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

export async function analyzeASTMismatches() {
  console.log('🔍 Analyzing AST parser mismatches...\n');

  // Run ESLint to collect complexity data
  const eslintResults = runESLintComplexityCheck(projectRoot);

  // Extract complexity for ALL functions
  const allFunctions = extractFunctionsFromESLintResults(eslintResults, projectRoot, extractFunctionName);

  // Group functions by file
  const fileMap = new Map();
  allFunctions.forEach(func => {
    if (!fileMap.has(func.file)) {
      fileMap.set(func.file, []);
    }
    fileMap.get(func.file).push(func);
  });

  const mismatches = [];
  let totalProcessed = 0;
  let totalMismatches = 0;

  for (const [filePath, functions] of fileMap.entries()) {
    try {
      const fullPath = resolve(projectRoot, filePath);
      const sourceCode = readFileSync(fullPath, 'utf-8');

      // Find function boundaries
      const fileBoundaries = findFunctionBoundaries(sourceCode, functions);

      // Parse decision points with AST
      const fileDecisionPoints = await parseDecisionPointsAST(
        sourceCode,
        fileBoundaries,
        functions,
        filePath,
        projectRoot
      );

      // Calculate breakdowns for each function
      functions.forEach(func => {
        totalProcessed++;
        const breakdown = calculateComplexityBreakdown(
          func.line,
          fileDecisionPoints,
          1 // base complexity
        );

        const actualComplexity = parseInt(func.complexity);
        const calculatedTotal = breakdown.calculatedTotal;
        const difference = calculatedTotal - actualComplexity;

        if (calculatedTotal !== actualComplexity) {
          totalMismatches++;
          const functionDecisionPoints = breakdown.decisionPoints || [];
          
          mismatches.push({
            functionName: func.functionName,
            file: func.file,
            line: func.line,
            actualComplexity,
            calculatedTotal,
            difference,
            decisionPointsFound: functionDecisionPoints.length,
            decisionPoints: functionDecisionPoints.map(dp => ({
              type: dp.type,
              line: dp.line,
            })),
            boundary: fileBoundaries.get(func.line) || null,
          });
        }
      });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
    }
  }

  // Sort by absolute difference
  mismatches.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  console.log(`\n📊 AST PARSER MISMATCH ANALYSIS\n`);
  console.log(`Total Functions Processed: ${totalProcessed}`);
  console.log(`Total Mismatches: ${totalMismatches} (${((totalMismatches / totalProcessed) * 100).toFixed(1)}%)`);
  console.log(`\nTop 20 Largest Mismatches:\n`);

  mismatches.slice(0, 20).forEach((m, idx) => {
    console.log(`${idx + 1}. ${m.functionName} (${m.file}:${m.line})`);
    console.log(`   ESLint: ${m.actualComplexity}, Calculated: ${m.calculatedTotal}, Difference: ${m.difference > 0 ? '+' : ''}${m.difference}`);
    console.log(`   Decision Points Found: ${m.decisionPointsFound}`);
    if (m.decisionPoints.length > 0) {
      console.log(`   Types: ${m.decisionPoints.map(dp => `${dp.type}@${dp.line}`).join(', ')}`);
    }
    if (m.boundary) {
      console.log(`   Boundary: lines ${m.boundary.start}-${m.boundary.end}`);
    }
    console.log('');
  });

  // Save detailed report
  const reportPath = resolve(projectRoot, 'ast-mismatch-report.json');
  writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalProcessed,
      totalMismatches,
      accuracy: ((1 - totalMismatches / totalProcessed) * 100).toFixed(2) + '%'
    },
    mismatches
  }, null, 2), 'utf-8');
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

analyzeASTMismatches().catch(error => {
  console.error('Error analyzing AST mismatches:', error);
  process.exit(1);
});
