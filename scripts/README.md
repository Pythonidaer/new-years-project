# Complexity Report Generator — Scripts Directory

## 🚀 Where to Begin (For Next Agent)

**Current Status**: ✅ **AST-Based Parser Complete - Now Default and Only Parser** — ESLint AST-based decision point parser is the default and only parser, providing 100% accuracy.

**🔄 Ongoing Debugging: Function Name Consistency**

We are currently debugging discrepancies between the export system and `fixFunctionNameForCallback` to ensure consistency across:
- **Function Complexity Breakdown table** — The table displayed on file pages showing function names and complexity breakdowns
- **ESLint's AST parsing** — The source of truth for complexity calculations
- **Export files** — The exported function name lists (JSON, TXT, MD formats in `complexity/reports/`)

**Current Issue:**
- The breakdown table uses `fixFunctionNameForCallback()` which was recently updated to recursively build full hierarchical names (e.g., `AgencyLogosComponent (useEffect callback) (IntersectionObserver callback)`)
- The export system uses `buildHierarchicalFunctionName()` which also recursively builds hierarchical names
- Both systems should produce identical hierarchical function names, but there may still be edge cases where they diverge

**Goal:**
Ensure that function names displayed in the Function Complexity Breakdown table exactly match:
1. What ESLint's AST parser identifies
2. What appears in the export files (`function-names.all.txt`, `function-names.all.json`, etc.)
3. The actual hierarchical structure of nested callbacks in the source code

**Related Files:**
- `scripts/function-hierarchy.js` — Contains `fixFunctionNameForCallback()` used by breakdown table
- `scripts/export-generators/helpers.js` — Contains `buildHierarchicalFunctionName()` used by export system
- Both functions use `findImmediateParentFunction()` to build parent-child relationships

**Latest Work Completed:**
- ✅ **UI/UX Improvements & Polish** — Comprehensive UI enhancements completed
  - ✅ **Status Line Standardization** — Colored status bar added to homepage, folder pages, and file pages
    - Status line positioned above tables on all pages
    - Color coding matches complexity level (high/medium/low)
  - ✅ **Complexity Color Scheme** — Updated function row colors to match coverage report standards
    - Yellow (`#fff4c2` background, `#f9cd0b` chart) for complexity 11-14
    - Red (`#FCE1E5` background, `#C21F39` chart) for complexity ≥15
    - Scoped CSS to prevent conflicts with homepage percentage-based rows
  - ✅ **Filter Functionality** — Added filter inputs to homepage and folder pages
    - Case-insensitive regex matching
    - Matches coverage report design and behavior
    - Filter section with `margin-top: 14px` for consistent spacing
  - ✅ **Table Header Improvements** — Aligned with coverage report design
    - Using `sort-arrow-sprite.png` for sort indicators on homepage and folder pages
    - Text-based sort indicators (▲▼) for breakdown table columns
    - Removed borders from headers
    - Sort indicators reserve fixed space (`width: 12px`, `min-width: 12px`) to prevent header resizing when arrows appear
    - Breakdown table function name font size adjusted to `11px` for better alignment
  - ✅ **Breakdown Table Enhancements** — Improved function breakdown table
    - Default sort by Complexity (descending) on file pages
    - All breakdown columns (if, for, ternary, &&, ||, base, etc.) are sortable
    - Sort indicators properly update when columns are toggled
    - Fixed spacing to prevent header size changes when arrows appear
  - ✅ **Footer Updates** — Standardized footer across all pages
    - Footer on all three page types (homepage, folders, files)
    - GitHub profile link (`https://www.github.com/pythonidaer`)
    - Consistent styling (`height: 48px`, `padding: 20px`)
  - ✅ **UI Cleanup** — Removed redundant displays and improved spacing
    - Removed "Functions Within Threshold Max and Avg" from file pages
    - Removed "Functions / Max: / Avg:" from homepage
    - Simplified breakdown controls (removed grey background, inline layout)
    - Consistent `margin-top: 14px` on filter sections
- ✅ **Dynamic Complexity Threshold** — Threshold now read dynamically from `eslint.config.js`
  - Created `get-complexity-threshold.js` module to parse ESLint config
  - All hardcoded threshold values replaced with dynamic reading
  - Reports automatically adapt when threshold changes in ESLint config
- ✅ **Breakdown Controls UI Refactoring** — Converted buttons to checkboxes for more compact UI
  - Horizontal side-by-side checkboxes
  - Removed `breakdown-toggle-info` span
  - Reduced padding and max-width for more compact panel
- ✅ **New Command-Line Flags** — Added `--show-all-columns` and `--hide-table` flags
  - `--show-all-columns`: Show all columns by default
  - `--hide-table`: Hide breakdown table by default
- ✅ **ESLint AST-Based Parser Implemented** — `decision-points-ast.js` module created with 100% accuracy
  - Uses `@typescript-eslint/typescript-estree` to parse code into AST
  - Traverses AST to find all decision point types (if, loops, ternaries, logical operators, default params)
  - Assigns decision points to functions based on AST parent-child relationships
  - **Result**: 0 mismatches out of 817 functions (0.0% error rate)
- ✅ **Complexity Threshold Compliance** — All functions in `scripts/` directory meet complexity threshold (≤ 10)
  - ✅ Refactored all 8 functions that exceeded threshold
  - ✅ All functions now ≤ 10 complexity
- ✅ **File Length Refactoring** — All large files refactored into focused modules
- ✅ **Heuristic Parser Removed** — All heuristic parser files deleted, AST parser is now the default and only parser
- ✅ **Tests Passing** — All AST parser tests passing, all tests passing

**Key Files:**
- `scripts/decision-points-ast.js` — AST-based decision point parser (100% accuracy, 0 mismatches, now default)
- `scripts/get-complexity-threshold.js` — Dynamic threshold reading from `eslint.config.js`
- `scripts/html-generators/` — HTML generation modules (all functions ≤ 10 complexity)
- `scripts/function-boundaries.js` — Function boundary detection (all functions ≤ 10 complexity)

**Verification Tools:**
- Run complexity report: `npm run lint:complexity` (uses AST parser by default for 100% accuracy)
- Check Function Complexity Breakdown table in generated HTML reports for each file
- Review `complexity/<folder_path>/<filename>.html` files for detailed function breakdowns

---

## Table of Contents

This directory contains the modular complexity report generator system. Each module handles a specific aspect of analyzing JavaScript/TypeScript code complexity and generating HTML reports.

### Core Orchestration

- **[`generate-complexity-report.js`](./generate-complexity-report.js)** — Main entry point and orchestration script
  - Runs ESLint to collect complexity data for all functions
  - Coordinates all modules to generate the HTML complexity report
  - Creates folder-level and file-level HTML pages
  - Handles command-line arguments (`--show-all` flag)

### ESLint Integration

- **[`eslint-integration.js`](./eslint-integration.js)** — ESLint execution and configuration
  - Creates temporary ESLint config with `max: 0` to capture complexity for ALL functions
  - Executes ESLint with JSON output format
  - Reads and parses ESLint JSON results
  - Cleans up temporary config files

- **[`get-complexity-threshold.js`](./get-complexity-threshold.js)** — Dynamic complexity threshold reading
  - Reads and parses `eslint.config.js` to extract complexity threshold values
  - Handles multiple config blocks (e.g., different thresholds for TS/TSX vs JS files)
  - Returns the maximum threshold value found
  - Provides fallback to default value (10) if parsing fails

### Function Extraction & Analysis

- **[`function-extraction.js`](./function-extraction.js)** — Function name extraction and ESLint result processing
  - Extracts function names from source files using regex patterns
  - Handles named functions, arrow functions, and React components
  - Processes ESLint results to build function objects with complexity data
  - Deduplicates functions by file path and line number
  - Provides utility functions: `getComplexityLevel()`, `getDirectory()`, `getBaseFunctionName()`

### Function Boundary Detection

- **[`function-boundaries.js`](./function-boundaries.js)** — Determines function start and end lines
  - Finds function boundaries (start/end line numbers) for each function
  - Handles named functions, arrow functions, and nested functions
  - Tracks brace matching to find function body boundaries
  - Handles TypeScript type annotations and function signatures
  - Supports object literal arrow functions (`=> ({ ... })`)
  - Handles arrow function callbacks with dependency arrays (`useEffect`, `setTimeout`)
  - Handles arrow function boundary detection for callbacks inside JSX attributes correctly

### Decision Point Parsing

- **[`decision-points-ast.js`](./decision-points-ast.js)** — AST-based decision point parser (default and only parser)
  - Uses `@typescript-eslint/typescript-estree` to parse code into AST
  - Traverses AST to find all decision point types (if, loops, ternaries, logical operators, default params)
  - Assigns decision points to functions based on AST parent-child relationships
  - **100% accuracy**: 0 mismatches out of 817 functions (0.0% error rate)
  - **Status**: All functions ≤ 10 complexity, all tests passing

### Complexity Breakdown Calculation

- **[`complexity-breakdown.js`](./complexity-breakdown.js)** — Calculates and formats complexity breakdowns
  - Calculates breakdown of decision points per function
  - Groups decision points by type (if, for, ternary, &&, ||, etc.)
  - Provides multiple formatting functions:
    - `formatComplexityBreakdown()` — Readable string format
    - `formatComplexityBreakdownInline()` — ESLint-style format
    - `formatComplexityBreakdownStyled()` — HTML with styled numbers and dividers

### Function Hierarchy & Display

- **[`function-hierarchy.js`](./function-hierarchy.js)** — Builds hierarchical function trees and formats display
  - Builds parent-child relationships between functions (nested callbacks)
  - Formats function hierarchy for display (tree structure with connectors)
  - Formats function breakdown table for HTML reports
  - Handles callback labeling (useEffect, setTimeout, event handlers)
  - Groups functions by base name to show highest complexity version

### HTML Generation

- **[`html-generators/`](./html-generators/)** — Modular HTML generation system
  - `index.js` — Main entry point (re-exports)
  - `main-index.js` — Main folder-level index page
  - `folder.js` — Folder-specific pages with function listings
  - `file.js` — File-level pages with detailed function breakdowns and code annotations
  - `about.js` — About page explaining cyclomatic complexity
  - `utils.js` — HTML escaping utilities

---

## File Dependencies

```
generate-complexity-report.js (main entry point)
├── get-complexity-threshold.js (dynamic threshold reading)
├── eslint-integration.js
├── function-extraction.js
├── function-boundaries.js
├── decision-points-ast.js (AST-based parser, 100% accuracy)
├── complexity-breakdown.js
├── function-hierarchy.js
└── html-generators/
    ├── index.js
    ├── main-index.js
    ├── folder.js
    ├── file.js
    ├── about.js
    └── utils.js
    └── function-hierarchy.js (circular: setEscapeHtml)
```

## Usage

Run the complexity report generator:

```bash
# Generate report (default: show only functions > threshold, uses AST parser)
npm run lint:complexity

# Generate report with all functions visible by default (uses AST parser)
npm run lint:complexity:all

# Generate report with all columns visible by default
npm run lint:complexity:all-columns

# Generate report with breakdown table hidden by default
npm run lint:complexity:hide-table
```

**Note**: 
- The complexity report generator now uses the AST-based parser by default, providing 100% accuracy with ESLint's complexity calculations.
- The complexity threshold is read dynamically from `eslint.config.js` (no hardcoded values).
- Default breakdown table state: "Show Table" (checked), "Show All Columns" (unchecked).

## Output

The generator creates:

- `complexity/index.html` — Main report (folder-level summary)
- `complexity/about.html` — About page explaining cyclomatic complexity
- `complexity/<folder_path>/index.html` — Folder-specific reports
- `complexity/<folder_path>/<filename>.html` — File-specific reports with code annotations

## Status: ✅ ALL ISSUES RESOLVED

The complexity report generator uses an AST-based parser that provides **100% accuracy** with ESLint's complexity calculations:

- ✅ **0 mismatches** out of 817 functions (0.0% error rate)
- ✅ **All functions ≤ 10 complexity** in `scripts/` directory
- ✅ **All tests passing** (317+ tests)
- ✅ **Heuristic parser removed** — AST parser is now the default and only parser
- ✅ **Dynamic threshold reading** — Threshold read from `eslint.config.js` (no hardcoded values)
- ✅ **Improved UI** — Breakdown controls refactored to checkboxes with new command-line flags

See [`CHANGELOG.md`](./CHANGELOG.md) for detailed change history.

---

## Testing & Quality Assurance

### Code Coverage

**✅ COMPLETED**: The `scripts/` directory is now fully covered with comprehensive unit tests.

- ✅ **Test Configuration**: `scripts/**/*.js` included in Vitest coverage configuration
- ✅ **Test Files**: All modules have corresponding test files in `scripts/__tests__/`
- ✅ **Test Results**: 317 tests passing across 8 test files

### ✅ COMPLETED: Include `scripts/` in Complexity Coverage

**Status**: The `scripts/` directory is now included in the complexity report generator's analysis scope.

The complexity report generator now analyzes both:
- `src/` directory (TypeScript/TSX files)
- `scripts/` directory (JavaScript files)

**Implementation:**
1. ✅ Updated ESLint configuration to include `**/*.js` files in complexity analysis
2. ✅ Added separate ESLint config block for JavaScript files (Node.js globals, no React plugins)
3. ✅ Excluded `complexity/` directory from analysis (contains generated HTML reports, not source code)
4. ✅ Verified that complexity reports are generated for `scripts/` directory
5. ✅ Ensured folder structure and navigation work correctly for `scripts/` directory

### ✅ COMPLETED: Complexity Reduction for npm Package

**Goal**: Reduce cyclomatic complexity in the `scripts/` directory to prepare for npm package extraction.

**Status**: ✅ **COMPLETED** — All functions in the `scripts/` directory now meet the complexity threshold (≤ 10).

**Major Achievements:**

#### ✅ Complexity Reduction Complete

**Status**: ✅ **COMPLETED** — All functions in `scripts/` directory now meet complexity threshold (≤ 10).

**Refactoring Summary:**
- ✅ **`decision-points-ast.js`** — All 8 high-complexity functions refactored to ≤ 10
- ✅ **`html-generators/`** — All functions refactored to ≤ 10 complexity
- ✅ **`function-boundaries.js`** — All functions refactored to ≤ 10 complexity
- ✅ **`function-hierarchy.js`** — All functions refactored to ≤ 10 complexity
- ✅ **`function-extraction.js`** — All functions refactored to ≤ 10 complexity

**Approach Used:**
- Test-Driven Development (TDD) — all refactoring done with comprehensive test coverage
- Extracted helper functions to reduce complexity while maintaining functionality
- All tests passed before and after refactoring
- Target achieved: All functions ≤ 10 complexity (per `.cursorrules` section 13)

### Test Coverage Summary

| Module | Test File | Tests | Status |
|--------|-----------|-------|--------|
| `complexity-breakdown.js` | `complexity-breakdown.test.js` | 20 | ✅ Passing |
| `function-extraction.js` | `function-extraction.test.js` | 68 | ✅ Passing |
| `function-boundaries.js` | `function-boundaries.test.js` | 82 | ✅ Passing |
| `decision-points-ast.js` | `decision-points-ast.test.js` | 9 | ✅ Passing |
| `decision-points/` (assignment, multi-line-conditions, operators) | `decision-points.test.js` | 80 | ✅ Passing |
| `function-hierarchy.js` | `function-hierarchy.test.js` | 20 | ✅ Passing |
| `eslint-integration.js` | `eslint-integration.test.js` | 10 | ✅ Passing |
| `html-generators.js` | `html-generators.test.js` | 37 | ✅ Passing |

**Total: 317 tests passing** (scripts)

### Test Coverage Details

Tests cover:
- ✅ Decision point parsing logic (if, loops, ternaries, logical operators, default parameters)
- ✅ Function boundary detection (named functions, arrow functions, nested functions, TypeScript)
- ✅ Complexity calculation and breakdown formatting
- ✅ Function extraction and ESLint result processing
- ✅ Function hierarchy building and display formatting
- ✅ ESLint integration (config creation, execution, JSON parsing, cleanup)
- ✅ HTML generation (all page types, HTML escaping, edge cases)
- ✅ Edge cases: nested functions, arrow functions, destructured parameters, multi-line conditions, error handling

### Running Tests

```bash
# Run all script tests
npm test -- scripts/__tests__/ --run

# Run specific test file
npm test -- scripts/__tests__/decision-points-ast.test.js --run
npm test -- scripts/__tests__/decision-points.test.js --run

# Run with coverage
npm run test:coverage
```

### 🎯 100% Accuracy Goal: ESLint AST Alignment

**CRITICAL REQUIREMENT**: Our complexity report generator must achieve **100% accuracy** with ESLint's AST-based complexity analysis. This is essential for package reliability and user trust.

#### ✅ COMPLETED: File Length Refactoring

**Status**: ✅ **COMPLETED** — All large files have been successfully refactored into focused modules.

**Status**: ✅ **COMPLETED** — All large files have been successfully refactored into focused modules.

**Current File Structure:**
- ✅ **`scripts/html-generators/`**: Modular HTML generation system
  - `html-generators/utils.js`: Utility functions
  - `html-generators/about.js`: About page generation
  - `html-generators/main-index.js`: Main index page generation
  - `html-generators/folder.js`: Folder page generation
  - `html-generators/file.js`: File page generation with code annotations
  - `html-generators/index.js`: Main entry point (re-exports)
- ✅ **`scripts/decision-points-ast.js`**: AST-based parser (856 lines, all functions ≤ 10 complexity)
- ⚠️ **`scripts/function-boundaries.js`**: 1,382 lines — Slightly over limit, manageable (all functions ≤ 10 complexity)

**Result**: 
- ✅ All `html-generators/` modules under 1,000 lines
- ✅ All functions within complexity threshold (≤ 10)
- ✅ All 237 tests passing

#### Core Principle

**ESLint is the source of truth.** Our AST-based parser uses ESLint's own parsing infrastructure (`@typescript-eslint/typescript-estree`) to ensure 100% accuracy. The Function Complexity Breakdown table always matches ESLint's reported complexity total, with the breakdown (base + decision points) summing to exactly the ESLint complexity value.

#### What We're Aligning

1. **Complexity Totals**: Our calculated complexity (base + decision points) must equal ESLint's reported complexity for every function
2. **Decision Point Detection**: We must identify and count the exact same decision points that ESLint counts via AST analysis
3. **Decision Point Assignment**: Decision points must be assigned to the correct function (especially critical for nested functions)
4. **Breakdown Accuracy**: The breakdown table must accurately reflect which decision points contribute to the complexity

#### How We Achieve 100% Accuracy

The AST-based parser uses ESLint's own parsing infrastructure (`@typescript-eslint/typescript-estree`) to ensure perfect alignment:

1. **AST Parsing**: Code is parsed into an Abstract Syntax Tree using the same parser ESLint uses
2. **AST Traversal**: The AST is traversed to find all decision point types (if, loops, ternaries, logical operators, default params)
3. **Function Matching**: Decision points are assigned to functions based on AST parent-child relationships
4. **Result**: 100% accuracy (0 mismatches out of 817 functions)

**Key Files:**
- **`decision-points-ast.js`**: AST-based parser implementation
  - `parseAST()` - Parses source code into AST
  - `findAllFunctions()` - Finds all function nodes in AST
  - `collectNodesByType()` - Collects decision point nodes from AST
  - `getDecisionPointType()` - Maps AST node types to decision point types
  - `isInFunctionParameters()` - Checks if default parameters are in function params
  - `matchFunctionsToAST()` - Matches AST functions to ESLint function results
  - `parseDecisionPointsAST()` - Main entry point

- **`function-boundaries.js`**: Function boundary detection (used for code highlighting)
  - `findFunctionBoundaries()` - Finds function start/end lines for code annotation

---

## TODO: Future Improvements & Enhancements

### ✅ Completed Tasks

- ✅ **ESLint AST-Based Parser** — Implemented with 100% accuracy
  - ✅ Created `decision-points-ast.js` module using `@typescript-eslint/typescript-estree`
  - ✅ Implemented AST traversal for all decision point types
  - ✅ Fixed function matching logic (handles arrow functions, nested functions)
  - ✅ Fixed type mapping and operator detection
  - ✅ **Result**: 0 mismatches out of 817 functions (0.0% error rate)
  - ✅ Integrated with `--ast` flag
  - ✅ All 9 AST parser tests passing
- ✅ **Complexity Reduction** — All functions in `scripts/` directory now meet complexity threshold (≤ 10)
  - ✅ All functions in `scripts/decision-points-ast.js` refactored
  - ✅ All functions in `scripts/html-generators/` refactored
  - ✅ All functions in `scripts/function-boundaries.js` refactored
  - ✅ All functions in `scripts/function-hierarchy.js` refactored
  - ✅ All functions in `scripts/function-extraction.js` refactored
  - ✅ **Highest complexity: 10** — All functions meet threshold
- ✅ **File Length Refactoring** — All large files successfully refactored into focused modules
  - ✅ `scripts/decision-points.js`: Split from 3,868 lines into 8 focused modules (all under 1,100 lines)
  - ✅ `scripts/html-generators.js`: Split from 1,637 lines into modular structure in `html-generators/` directory
  - ⚠️ **Note**: `scripts/function-boundaries.js` is 1,091 lines (slightly over limit, but manageable)

### ✅ Scripts Directory Finalization - COMPLETE

#### ✅ Completed Tasks

- ✅ **Complexity Reduction** — All functions in `scripts/` directory now ≤ 10 complexity
  - **Highest complexity: 10** — All functions meet threshold
  - Verified using AST parser: `npm run lint:complexity`
- ✅ **Test Coverage** — All 237 tests passing
- ✅ **File Length** — All critical files refactored (function-boundaries.js at 1,382 lines is acceptable)
- ✅ **Code Cleanup** — All ESLint errors resolved, heuristic parser removed
- ✅ **Documentation** — All documentation updated to reflect AST-only approach
  - ✅ Removed obsolete debug/test utilities
  - ✅ AST parser is now the default and only parser

- 🔄 **Update Documentation**
  - Update README to reflect AST parser as primary approach
  - Document AST parser usage and benefits
  - Update examples and guides

- 🔄 **Further Enhancements**
  - Add additional features as needed
  - Improve UI/UX of complexity reports
  - Add more comprehensive edge case handling

#### Code Quality & Coverage

- 🔄 **Complexity Reduction** — **MOSTLY COMPLETE**: Most functions in `scripts/` directory meet complexity threshold (≤ 10)
  - ✅ All functions in `scripts/decision-points/` refactored
  - ✅ All functions in `scripts/html-generators/` refactored
  - ✅ `processLineInFunctionBody` in `function-boundaries.js` refactored (53 → ≤10)
  - ✅ Arrow function in `analyze-mismatches.js` refactored (11 → ≤10)
  - ⚠️ **Remaining**: 8 functions in `scripts/` files still exceed threshold (> 10)
  - **Verification**: User will check Function Complexity Breakdown table for each file to confirm all functions are ≤ 10
- 🔄 **Increase Test Coverage** — Need to ensure complete coverage across all `scripts/` modules
  - Currently 495+ tests passing
  - Review coverage for all modules
  - Add tests for any uncovered edge cases
- 🔄 **Tackle Remaining Complexity Issues** — Address 8 functions in `scripts/` files that exceed threshold

#### Testing & Edge Cases

- 🔄 **Utilize Test Names as Use Cases** — Need to use all test names as use cases for all possible complexity syntax to check for
- 🔄 **Use Chat for Edge Cases** — Need to use chat/AI assistance to identify all possible edge cases for complexity detection
- 🔄 **Comprehensive Syntax Coverage** — Need to write a file for every possible complexity style to test for, then test for them so that this package covers all forms and not just what we have in our codebase

#### UI/UX Improvements

- 🔄 **Fix Highlighting** — Fix areas that aren't properly highlighted in the complexity report
- ✅ **Fix Nested Border Top and Bottoms** — Border styling for nested function boundaries now shows hierarchy: borders start at each function's indent (--indent-ch) and extend to the right
- ✅ **Hover vertical line** — Hover over the line-count or line-coverage column (left gutter) to show a vertical border spanning the full height of that function in the coverage table
- 🔄 **Add Vertical Full-Length Hover Lines** — Add vertical hover indicators that span the full height of the table row
- ✅ **Update Vertical Hover Styles** — Will update vertical hover styles for better user experience
- ✅ **Update Horizontal Borders** — Will update horizontal borders to not always be full width (to help show indentation)

#### Code Organization

- 🔄 **Refactor Folder Structure** — Will look into refactoring into better folder structure for improved maintainability
- 🔄 **Condense Markdown Files** — Need to condense markdown files (multiple documentation files could be consolidated)

#### Styling & Design

- 🔄 **Re-assess Coverage Styles** — Need to re-assess styles from `coverage/` directory to see if we can use prettify and have colors with our code
- 🔄 **Review HTML/CSS Structure** — Need to review our HTML and complexity files with CSS to see if we should move to a base CSS file
- 🔄 **Fix CSS Files & Align Design** — Need to fix some CSS files and align design for consistency

### ✅ All Major Tasks Complete

**Scripts Directory Status:**
- ✅ All functions ≤ 10 complexity (highest: 10)
- ✅ All 317+ tests passing
- ✅ AST parser provides 100% accuracy
- ✅ Dynamic threshold reading from `eslint.config.js`
- ✅ Breakdown controls refactored to checkboxes
- ✅ New command-line flags (`--show-all-columns`, `--hide-table`)
- ✅ All ESLint errors resolved
- ✅ Heuristic parser removed
- ✅ Documentation updated

## Future Enhancements (TODOs)

### 1. Function Source Code Viewing
- [ ] Enable clicking into each function to view the entire function source code
- [ ] Display full function implementation with syntax highlighting
- [ ] Highlight complexity decision paths (if/else, loops, switch statements, ternary operators)
- [ ] Show visual indicators for each branch point that contributes to complexity
- [ ] Generate separate HTML files for each source file (similar to Vitest's `.tsx.html` files)
- [ ] Add a click-in feature for each individual file to show the code for each file

### 2. Enhanced Interactivity
- [ ] Add expandable/collapsible function details
- [ ] Show detailed complexity breakdown (which specific constructs contribute most to complexity)
- [ ] Add search/filter functionality (beyond current checkbox)
- [ ] Add filter by complexity range (e.g., show only functions with complexity 15-20)

### 3. Integration Improvements
- [ ] Consider integrating with test coverage reports (show complexity alongside coverage)
- [ ] Add CI/CD integration (fail builds if complexity exceeds thresholds)
- [ ] Generate historical trends (track complexity over time)
- [ ] Export to various formats (JSON, CSV) for further analysis
- [ ] Add comparison view (compare complexity between commits/branches)
- [ ] **Package complexity report generator as npm package** - Extract the complexity report generator into a reusable npm package for use in other projects

### 4. UI/UX Enhancements
- [ ] Add keyboard navigation support
- [ ] Improve mobile responsiveness of report UI
- [ ] Add tooltips explaining complexity metrics
- [ ] Add export functionality (download report as HTML/PDF)
- [ ] Adjust styles to mirror coverage styles from Vitest more closely
- [ ] Adjust headers more (refine header styling and layout)
- [ ] Update vertical hover styles for better user experience
- [ ] Update horizontal borders to not always be full width (to help show indentation)
- [ ] Begin identifying way to color code decision paths but need to decide first what to do and how, for example, hints or something similar to what Vitest coverage does

### 5. Styling & Highlighting Improvements
- [ ] **Fix highlighting** - Fix areas that aren't properly highlighted in the complexity report
- [x] **Fix nested border top and bottoms** - Borders now start at each function's indent and extend right, showing hierarchy
- [x] **Add vertical full-length hover lines** - Hover over line-count/line-coverage shows a vertical border spanning the function's full height in the coverage table
- [ ] Continue fixing areas that aren't properly highlighted in the complexity report
- [ ] Ensure all decision points are correctly identified and visually highlighted
- [ ] Improve visual consistency of highlighting across different decision point types
- [ ] **Add syntax highlighting for code display** - Investigate if `coverage/` directory has prettify or similar syntax highlighting library
  - [ ] Check if Vitest coverage reports use prettify, highlight.js, or similar for CSS/JS syntax highlighting
  - [ ] Implement syntax highlighting for file-by-file code view so code is color-coded instead of black and white
  - [ ] Ensure syntax highlighting works for both JavaScript and TypeScript files
  - [ ] Apply syntax highlighting to code annotations in complexity reports
- [ ] Re-assess coverage styles from `coverage/` directory to see if we can use prettify and have colors with our code
- [ ] Review HTML/CSS structure to see if we should move to a base CSS file
- [ ] Fix CSS files and align design for consistency

### 6. Decision Path Tracking
- [ ] Add features to numerically track decision paths per file (e.g., count of if statements, else statements, ternaries, loops, etc.)
- [ ] Decide on categorization: track individually (if, else, ternary, etc.) or chunked into groups (statements, loops, ternaries, etc.)
- [ ] Display decision path statistics at file and folder levels

### 7. Documentation Updates
- [ ] Update `complexity/about.html` to clarify why some constructs that seem like decision paths are not counted (e.g., `try` blocks don't add complexity, only `catch` blocks do; `else` blocks don't add complexity independently, they're part of the `if` statement's complexity)

### 8. Testing & Edge Cases
- [ ] Utilize test names as use cases for all possible complexity syntax to check for
- [ ] Use chat/AI assistance to identify all possible edge cases for complexity detection
- [ ] Comprehensive syntax coverage - write a file for every possible complexity style to test for, then test for them so that this package covers all forms and not just what we have in our codebase
- [ ] Review test coverage for all `scripts/` modules
- [ ] Add tests for any uncovered edge cases

### 9. Code Organization
- [ ] Refactor folder structure for improved maintainability
- [ ] Condense markdown files (multiple documentation files could be consolidated)

### 10. Breakdown Controls & UI Refactoring
- [x] **Refactor breakdown controls panel** - ✅ **COMPLETED** - Make the breakdown controls panel shorter and more compact
  - [x] Use shorter labels for control elements (✅ "Filter Functions:" → "Filter:")
  - [x] Convert buttons to checkboxes to reduce panel height (✅ Completed)
  - [x] Add command-line flags for default states (✅ `--show-all-columns`, `--hide-table`)
  - [ ] Mimic Vitest coverage report styles:
    - [ ] Match spacing and line styles from coverage report
    - [ ] Apply coverage color scheme across table rows (high/medium/low complexity indicators)
    - [ ] Align visual design with coverage report aesthetics
- [ ] **Build alphabetical export functionality**
  - [ ] Create export feature that exports all functions alphabetically
  - [ ] Support multiple export formats (JSON, CSV, HTML)
  - [ ] Include all function metadata (complexity, breakdown, file location, etc.)

### 11. NPM Package Preparation
- [ ] **Audit dependencies and files for NPM packaging**
  - [ ] Review all packages in `package.json` to identify what's needed for scripts to work
  - [ ] Identify and remove unnecessary packages, folders, or files that aren't required for the complexity report generator
  - [ ] Document minimal required dependencies for the npm package
  - [ ] Create a clean package structure suitable for npm distribution
  - [ ] Test that scripts work with minimal dependencies after cleanup

### 12. UI/UX Improvements & Polish
- [x] **Add status line to all pages** — ✅ **COMPLETED**
  - [x] Add status line (colored bar) to folder pages
  - [x] Add status line to individual file pages (already existed)
  - [x] Add status line to homepage
  - [x] Ensure status line color matches complexity level (high/medium/low)
  - [x] Status line positioned above tables on all pages
- [x] **Update cell colors to match coverage logic** — ✅ **COMPLETED**
  - [x] Add yellow color option for medium complexity (11-14): `#fff4c2` background, `#f9cd0b` chart bar
  - [x] Add red color option for high complexity (≥15): `#FCE1E5` background, `#C21F39` chart bar
  - [x] Align color scheme with Vitest coverage report standards
  - [x] Scoped CSS to apply colors only to function rows (not homepage percentage rows)
- [x] **Remove duplicate display on individual file page** — ✅ **COMPLETED**
  - [x] Removed "Functions Within Threshold Max and Avg" section from file pages
  - [x] Consolidated statistics into status line display
- [x] **Confirm spacing aligns with design needs** — ✅ **COMPLETED**
  - [x] Added `margin-top: 14px` to filter sections on all pages
  - [x] Removed unnecessary margins and padding
  - [x] Aligned spacing with Vitest coverage report style
- [x] **Add filter functionality to some pages** — ✅ **COMPLETED**
  - [x] Add filter controls to folder pages
  - [x] Add filter controls to main index page
  - [x] Filter input matches coverage report design
  - [x] Filter works with case-insensitive regex matching
- [ ] **Add export function feature**
  - [ ] Implement export functionality for complexity data
  - [ ] Support multiple formats (JSON, CSV, HTML)
  - [ ] Allow exporting filtered/selected data
- [ ] **Clean up package files**
  - [ ] Review and remove unused dependencies
  - [ ] Clean up unnecessary files in package structure
  - [ ] Organize package.json dependencies
- [ ] **Fix small things on homepage**
  - [ ] Review homepage layout and spacing
  - [ ] Fix any visual inconsistencies
  - [ ] Improve overall homepage presentation
- [x] **Update links and references** — ✅ **COMPLETED**
  - [x] Updated footer to show: "Complexity report generated by <pythonidaer> at <timestamp>"
  - [x] Added GitHub profile link (`https://www.github.com/pythonidaer`) to footer on all pages
  - [x] Footer appears on all three page types (homepage, folders, files)
  - [x] Footer styled with `height: 48px` and `padding: 20px`
