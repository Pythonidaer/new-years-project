# Complexity Report Generator - Changelog

## 2026-01-25 - AST Parser Made Default & Code Cleanup

### Major Changes

#### ✅ AST Parser Now Default and Only Parser
- **Changed**: AST-based parser is now the default (no `--ast` flag needed)
- **Removed**: All heuristic parser files deleted (~8,500+ lines removed)
- **Result**: 100% accuracy maintained (0 mismatches out of 817 functions)

#### ✅ Complexity Reduction Complete
- **Fixed**: All 8 functions in `scripts/` directory that exceeded complexity threshold (> 10)
- **Result**: All functions now ≤ 10 complexity
- **Files Refactored**:
  - `decision-points-ast.js` - 8 functions refactored
  - `function-boundaries.js` - 1 function refactored
  - `debug-ast-matching.js` - 1 function refactored

#### ✅ Code Cleanup
- **Removed**: Heuristic parser files (`decision-points.js`, `decision-points/` directory)
- **Removed**: Obsolete test file (`decision-points.test.js` - 4,311 lines)
- **Removed**: Obsolete tools (`analyze-mismatches.js`, `debug-decision-points.js`, `test-ternary.js`, `test-boundary.js`)
- **Fixed**: All ESLint errors in `scripts/` directory
- **Updated**: Documentation to reflect AST-only approach

### Files Modified
- `scripts/generate-complexity-report.js` - AST parser now default
- `scripts/html-generators/file.js` - Removed heuristic parser compatibility code
- `scripts/README.md` - Updated to reflect AST-only approach
- `scripts/REFACTORING_PLAN.md` - Updated to show completed work
- `package.json` - Removed `lint:complexity:mismatches` script
- `eslint.config.js` - Added support for underscore-prefixed unused parameters

### Testing
- ✅ All 237 tests passing
- ✅ Complexity report working with AST parser by default
- ✅ 0 ESLint errors in `scripts/` directory

---

## 2026-01-23 - Decision Point Parsing Fixes

### Fixed Issues

#### 1. Decision Point Assignment to Nested Functions ✅
**Problem**: Decision points from nested callbacks were incorrectly assigned to parent functions.

**Fix**: Simplified `getInnermostFunction` logic in `decision-points.js` to use smallest boundary rule.

**Result**: 
- Map callback now correctly shows `base 1 | && 3` = 4
- GradientGroup now correctly shows `base 1 | if 1` = 2

#### 2. Arrow Function Boundary Detection ✅
**Problem**: Single-expression arrow functions inside JSX attributes were incorrectly extending boundaries.

**Fix**: Added detection for arrow functions inside JSX attributes in `function-boundaries.js`.

**Result**:
- ColorItem now correctly shows `base 1 | && 2` = 3
- Decision points in JSX are now assigned to the correct function

#### 3. JSX Expression Duplicate Counting ✅
**Problem**: `&&` operators in JSX expressions were being counted twice.

**Fix**: Prevented double-counting by excluding JSX expressions from multi-line condition detection.

**Result**:
- Map callback now shows correct `&&` count (3 instead of 5)
- All JSX expressions are counted exactly once

#### 4. `else if` Statement Detection ✅
**Problem**: `else if` statements after closing braces were not detected.

**Fix**: Changed regex from `/^\s*else\s+if\s*\(/` to `/\belse\s+if\s*\(/`.

**Result**:
- `handleSavePresetKeyDown` now shows `else if` in breakdown

#### 5. `catch` Block Detection ✅
**Problem**: `catch` blocks without parentheses (`catch {`) were not detected.

**Fix**: Changed regex from `/\bcatch\s*\(/` to `/\bcatch\s*[({]/`.

**Result**:
- `colorToHex` anonymous arrow function now shows `catch` in breakdown

#### 6. Multi-line `if` Condition Detection ✅
**Problem**: `&&` operators on continuation lines of multi-line `if` conditions were not counted.

**Fix**: Enhanced multi-line condition detection to look back up to 5 lines.

**Result**:
- `handleBackdropClick` now shows both `&&` operators in breakdown

#### 7. ThemePicker Decision Points ✅
**Problem**: ThemePicker showed no breakdown (all 12 decision points missing).

**Fix**: Fixed by resolving arrow function boundary detection and JSX expression assignment issues.

**Result**:
- ThemePicker now shows `base 1 | ?: 9 | && 2` = 12 (matches ESLint)

### Files Modified (Historical - Heuristic Parser)

- `scripts/decision-points.js` - Fixed decision point assignment and parsing logic (now removed)
- `scripts/function-boundaries.js` - Fixed arrow function boundary detection
- `scripts/README.md` - Updated with fix status

### Testing

All fixes verified by running:
```bash
npm run lint:complexity
```

All reported functions now show correct breakdowns matching ESLint's complexity counts.
