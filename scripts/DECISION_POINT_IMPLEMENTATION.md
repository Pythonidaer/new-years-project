# Decision Point Parsing & Highlighting Implementation

## Overview

This document describes the implementation needed to add decision point parsing, highlighting, and complexity breakdown display to the complexity report generator.

## Current State

### Existing Functionality
- ✅ Complexity report generates folder-level HTML pages (`complexity/index.html`, `complexity/src/components/index.html`, etc.)
- ✅ Complexity report generates file-level HTML pages (`complexity/src/components/Button.tsx.html`, etc.)
- ✅ File paths are clickable in folder-level reports
- ✅ File HTML pages show full source code with line numbers
- ✅ Function lines are annotated with complexity scores (similar to coverage showing "26x")
- ✅ File-level statistics are displayed (total functions, within threshold, max/avg complexity)

### Current File Structure
- **Main script**: `scripts/generate-complexity-report.js` (1248 lines)
- **Helper file created**: `scripts/decision-point-parsing.js` (contains the parsing functions ready to integrate)

## What Needs to Be Implemented

### 1. Add Decision Point Parsing Functions

**Location**: After `escapeHtml()` function (around line 630 in `generate-complexity-report.js`)

**Functions to add** (already written in `scripts/decision-point-parsing.js`):
- `findFunctionBoundaries(sourceCode, functions)` - Finds start/end lines for each function
- `parseDecisionPoints(sourceCode, functionBoundaries)` - Parses all decision points from source code
- `calculateComplexityBreakdown(functionLine, decisionPoints, baseComplexity)` - Calculates breakdown per function
- `formatComplexityBreakdown(breakdown, actualComplexity)` - Formats breakdown as string

**Decision Point Types to Parse**:
- `if` statements
- `else if` statements
- `for` loops
- `for...of` loops
- `for...in` loops
- `while` loops
- `do...while` loops
- `switch` statements
- `case` statements
- `catch` blocks
- Ternary operators (`? :`)
- Short-circuit logical operators (`&&`, `||`) in conditional contexts

### 2. Update `generateFileHTML()` Function

**Location**: Starts around line 632 in `generate-complexity-report.js`

**Changes needed**:

1. **Parse decision points**:
   ```javascript
   // After reading sourceCode and creating lineToFunction map
   const functionBoundaries = findFunctionBoundaries(sourceCode, functions);
   const decisionPoints = parseDecisionPoints(sourceCode, functionBoundaries);
   ```

2. **Calculate complexity breakdowns for each function**:
   ```javascript
   // Create breakdown map
   const functionBreakdowns = new Map();
   functions.forEach(func => {
     const breakdown = calculateComplexityBreakdown(
       func.line, 
       decisionPoints, 
       parseInt(func.complexity)
     );
     functionBreakdowns.set(func.line, breakdown);
   });
   ```

3. **Create decision point line map**:
   ```javascript
   // Map line numbers to decision points for highlighting
   const lineToDecisionPoint = new Map();
   decisionPoints.forEach(dp => {
     if (!lineToDecisionPoint.has(dp.line)) {
       lineToDecisionPoint.set(dp.line, []);
     }
     lineToDecisionPoint.get(dp.line).push(dp);
   });
   ```

4. **Update line-by-line HTML generation** to:
   - Highlight decision point lines with background color `#F6C6CE` (pale red/pink, matching Vitest coverage style)
   - Show decision point type in tooltip/annotation
   - Apply highlighting to the `<td class="text">` element containing the source code

5. **Add complexity breakdown display at the top**:
   - After the file statistics section (around line 828)
   - Show breakdown for each function in the format: `FunctionName: complexity = n (1 base + 2 if + 1 for + ...)`
   - Display this in a readable format (could be a collapsible section or simple list)

6. **Add CSS for decision point highlighting**:
   - Add `.decision-point` class with `background: #F6C6CE;`
   - Apply to table rows or cells containing decision points

### 3. CSS Styling

**Location**: Inside the `<style>` tag in `generateFileHTML()` (around line 696)

**Add**:
```css
.decision-point {
  background: #F6C6CE;
}
.decision-point td.text {
  background: #F6C6CE;
}
.complexity-breakdown {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
}
```

## Implementation Details

### Function Boundary Detection

The `findFunctionBoundaries()` function:
- Looks backwards from the ESLint-reported line to find the function declaration
- Uses regex patterns to match various function declaration styles:
  - `function functionName()`
  - `const functionName = () =>`
  - `export function functionName()`
  - React component patterns
- Tracks braces to find the function end
- Returns a Map of `functionLine -> { start, end }`

### Decision Point Parsing

The `parseDecisionPoints()` function:
- Iterates through each line of source code
- Matches decision point patterns using regex
- Checks if each decision point is within a function boundary
- Returns array of decision points with: `{ line, type, name, functionLine }`

**Important**: The function should:
- Skip empty lines and comments
- Handle multiple decision points on the same line
- Correctly identify `for...of` vs `for...in` vs regular `for`
- Count additional `&&` and `||` operators beyond the first one in conditions

### Complexity Breakdown Calculation

The `calculateComplexityBreakdown()` function:
- Filters decision points for a specific function
- Counts each decision point type
- Returns: `{ breakdown: {...}, calculatedTotal: number, decisionPoints: [...] }`

**Breakdown structure**:
```javascript
{
  base: 1,        // Always 1
  if: 2,          // Number of if statements
  'else if': 1,   // Number of else if statements
  for: 1,         // Number of for loops
  // ... etc for each type
}
```

### Formatting Breakdown

The `formatComplexityBreakdown()` function:
- Takes breakdown object and actual complexity number
- Formats as: `"complexity = 6 (1 base + 2 if + 1 for + 1 ternary)"`
- Orders decision points consistently

## Example Output

### At Top of File HTML:
```
Function Breakdown:
- getVariantClass: complexity = 3 (1 base + 2 if)
- shouldDisplayChevron: complexity = 3 (1 base + 1 if + 1 ||)
- Button: complexity = 6 (1 base + 1 if + 1 for + 1 ternary)
```

### In Source Code View:
- Lines with decision points should have `#F6C6CE` background color
- Tooltip showing decision point type (e.g., "if statement", "for loop")
- Similar visual style to Vitest coverage highlighting

## Files to Modify

1. **`scripts/generate-complexity-report.js`**:
   - Add decision point parsing functions after `escapeHtml()` (line 630)
   - Update `generateFileHTML()` function (starts at line 632)
   - Add CSS for decision point highlighting
   - Add complexity breakdown display section

2. **`scripts/decision-point-parsing.js`**:
   - This file contains the functions ready to copy/integrate
   - Can be deleted after integration

## Testing

After implementation:
1. Run `npm run lint:complexity` to generate reports
2. Check that decision points are highlighted in file HTML pages
3. Verify complexity breakdowns are displayed at the top
4. Verify breakdown calculations match ESLint complexity scores
5. Test with various file types (components, utilities, hooks, etc.)

## Reference

- **Coverage report example**: `coverage/src/components/Button.tsx.html` - Shows how Vitest highlights uncovered branches
- **Current complexity file example**: `complexity/src/components/Button.tsx.html` - Shows current structure
- **Decision point parsing functions**: `scripts/decision-point-parsing.js` - Ready to integrate

## Notes

- Decision point highlighting should match Vitest's style: pale red/pink background (#F6C6CE)
- Breakdown should show how each decision point type contributes to total complexity
- The breakdown calculation should match ESLint's complexity calculation (base 1 + decision points)
- Function boundaries detection may need refinement for edge cases (nested functions, arrow functions, etc.)

## Current Work & Future TODOs

### ✅ Completed Implementation (2024-2025)

#### Modularization (Completed)
- [x] Split monolithic `generate-complexity-report.js` (3,103 lines) into focused modules
  - **Modules created:**
    - `eslint-integration.js` (71 lines) - ESLint execution and result parsing
    - `function-extraction.js` (207 lines) - Function name extraction and processing
    - `function-boundaries.js` (254 lines) - Function boundary detection
    - `decision-points.js` (454 lines) - Decision point parsing
    - `complexity-breakdown.js` (140 lines) - Complexity calculation and formatting
    - `function-hierarchy.js` (405 lines) - Function hierarchy building
    - `html-generators.js` (1,475 lines) - HTML generation (⚠️ exceeds 1000 line guideline)
    - `generate-complexity-report.js` (161 lines) - Main orchestration
  - **Benefits:** Better maintainability, reduced AI hallucinations, easier troubleshooting

#### Decision Point Detection Improvements (Completed)
- [x] **Nullish Coalescing Operator (`??`)** - Added detection for `??` operator
  - ESLint counts `??` as a decision point (similar to `&&` and `||`)
  - Added to breakdown calculation and formatting functions
  - **Result:** Functions like `getGradientPreview` now show correct breakdowns: `base 1 | ?? 2`

- [x] **JSX Logical Operators** - Improved detection of `&&` and `||` in JSX expressions
  - Handles multi-line JSX expressions: `{condition && (`
  - Detects continuation of JSX expressions across lines
  - **Result:** Functions like `ColorItem` now show breakdowns with JSX operators

- [x] **Decision Point Assignment** - Fixed assignment logic for nested functions
  - Updated `getInnermostFunction` to prefer parent functions when decision points appear before nested function starts
  - Ensures decision points in parent function bodies aren't assigned to nested callbacks
  - **Result:** Functions like `handleBackdropClick` now show correct breakdowns

#### Complexity Calculation Investigation (Completed)
- [x] Investigate why `ScrollToTop.tsx.html` seems to mis-track complexity - the breakdown shows `(1 base + 2 if)` which equals 3, but the reported complexity is 2
  - **Root Cause**: ESLint reports complexity separately for nested arrow functions (useEffect callback, setTimeout callback), but the code was finding boundaries for the outer function and counting all decision points within it
  - **Fix**: 
    1. Capture `nodeType` from ESLint messages to distinguish arrow functions from named functions
    2. Update `findFunctionBoundaries` to find boundaries for arrow functions starting from the reported line
    3. Update `parseDecisionPoints` to assign decision points to the innermost function that contains them (using boundary size to determine innermost)
    4. Simplified `calculateComplexityBreakdown` since decision points are now correctly assigned
  - **Result**: Breakdowns now correctly show:
    - ScrollToTop (line 8): complexity = 1 (1 base)
    - useEffect callback (line 11): complexity = 2 (1 base + 1 if)
    - setTimeout callback (line 14): complexity = 2 (1 base + 1 if)
- [x] Understand why `if` statements within `useEffect` hooks are being counted in the breakdown, but the base function declaration containing them doesn't seem to be included in the total correctly
  - **Status**: Fixed - decision points are now correctly assigned to the innermost function (the useEffect callback), not the outer function
- [x] Verify ESLint's complexity calculation matches our breakdown calculation for edge cases (nested functions, hooks, callbacks)
  - **Status**: Fixed for basic nested function cases - decision points are assigned to innermost functions, and breakdowns match ESLint's complexity scores

### 🔄 In Progress / Known Issues

#### Decision Point Assignment for Complex Functions
- [ ] **GradientGroup** (line 132, complexity 2) - `if` on line 133 may be assigned to map callback instead
- [ ] **handleColorChange** (line 322, complexity 2) - `if` on line 326 may be assigned to nested arrow function
- [ ] **ThemePicker** (line 281, complexity 12) - Many decision points likely assigned to nested callbacks instead of main function
- [ ] **Root Cause**: Arrow function boundaries in `.map()`, `.filter()`, etc. may be calculated incorrectly
- [ ] **Next Steps**: 
  1. Fix boundary detection for arrow functions in array methods
  2. Verify decision point assignment for functions with complex JSX return statements
  3. Improve JSX `&&` detection for multi-line expressions

### Future TODOs

### Styling & Highlighting Fixes
- [ ] Continue fixing areas that aren't properly highlighted in the complexity report
- [ ] Ensure all decision points are correctly identified and visually highlighted
- [ ] Improve visual consistency of highlighting across different decision point types

### Decision Path Tracking
- [ ] Add features to numerically track decision paths per file (e.g., count of if statements, else statements, ternaries, loops, etc.)
- [ ] Decide on categorization: track individually (if, else, ternary, etc.) or chunked into groups (statements, loops, ternaries, etc.)
- [ ] Display decision path statistics at file and folder levels

### Documentation Updates
- [ ] Update `complexity/about.html` to clarify why some constructs that seem like decision paths are not counted:
  - `try` blocks don't add complexity (only `catch` blocks do)
  - `else` blocks don't add complexity independently (they're part of the `if` statement's complexity)
  - Other edge cases where constructs may seem like decision points but aren't counted

### npm Package Extraction
- [ ] Package the complexity report generator as a reusable npm package
- [ ] Extract core functionality into a standalone package
- [ ] Create documentation for npm package usage
- [ ] Set up package publishing workflow
