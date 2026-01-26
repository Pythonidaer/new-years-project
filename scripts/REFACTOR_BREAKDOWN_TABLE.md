# Refactor Function Complexity Breakdown Table

## Overview

Refactor the Function Complexity Breakdown table to display breakdown values as individual columns grouped by category (Control Flow, Expressions, Function Parameters) instead of a single formatted string column.

## Current Structure

The table is currently generated in `scripts/html-generators/file.js` (lines 348-363) and has:
- **Function** column
- **Complexity** column  
- **Breakdown** column (formatted string like "base 1 | for 1 | catch 1")

## Target Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    Function Complexity Breakdown                                             │
├──────────┬─────────────┬─────────────────────────────────────────────────────────────────────┤
│ Function │ Complexity  │ Control Flow              │ Expressions        │ Function Parameters│
│          │             ├───┬───┬───┬───┬───┬───┬───┼───┬───┬───┬───┬───┼───────────────────┤
│          │             │if│for│...│...│...│...│...│?: │&& │|| │?? │?. │default parameter  │
├──────────┼─────────────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───────────────────┤
│ func1    │ 3           │ 1 │ 1 │ 0 │...│...│...│...│ 0 │ 0 │ 0 │ 0 │ 0 │ 0                │
│ func2    │ 4           │ 0 │ 0 │...│...│...│...│...│ 1 │ 1 │ 1 │ 0 │ 0 │ 0                │
└──────────┴─────────────┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───────────────────┘
```

## Column Definitions

### Control Flow
- `if` - if statements
- `else if` - else if statements
- `for` - for loops
- `for...of` - for...of loops
- `for...in` - for...in loops
- `while` - while loops
- `do...while` - do...while loops
- `switch` - switch statements
- `case` - switch case statements (each case counts separately)
- `catch` - catch blocks
- `early return` - early return guarded by a condition (verify if currently detected)

### Expressions
- `ternary` (displayed as `?:`) - Ternary operator: `cond ? a : b`
- `&&` - Logical AND operator
- `||` - Logical OR operator
- `??` - Nullish coalescing operator
- `?.` - Optional chaining operator

### Function Parameters
- `default parameter` - Default parameter values

### Base
- `base` - Base complexity (always 1, but displayed as a column)

## Implementation Steps

### Step 1: Create Column Structure Configuration

Create a new function in `scripts/html-generators/file.js`:

```javascript
/**
 * Defines the breakdown column structure with groupings
 * @returns {Object} Column configuration
 */
function getBreakdownColumnStructure() {
  return {
    groups: [
      {
        name: 'Control Flow',
        columns: [
          { key: 'if', label: 'if' },
          { key: 'else if', label: 'else if' },
          { key: 'for', label: 'for' },
          { key: 'for...of', label: 'for...of' },
          { key: 'for...in', label: 'for...in' },
          { key: 'while', label: 'while' },
          { key: 'do...while', label: 'do...while' },
          { key: 'switch', label: 'switch' },
          { key: 'case', label: 'case' },
          { key: 'catch', label: 'catch' },
          { key: 'early return', label: 'early return' }, // Verify if this is detected
        ]
      },
      {
        name: 'Expressions',
        columns: [
          { key: 'ternary', label: '?:' },
          { key: '&&', label: '&&' },
          { key: '||', label: '||' },
          { key: '??', label: '??' },
          { key: '?.', label: '?.' },
        ]
      },
      {
        name: 'Function Parameters',
        columns: [
          { key: 'default parameter', label: 'default parameter' },
        ]
      }
    ],
    // Base complexity column (always first or last - decide based on UX)
    baseColumn: { key: 'base', label: 'base' }
  };
}
```

### Step 2: Update Table Header Generation

Modify the table header in `scripts/html-generators/file.js` around line 348-363:

**Current code:**
```javascript
const breakdownSection = functions.length > 0 ? `
  <div class="complexity-breakdown">
    <table>
      <thead>
        <tr>
          <th>Function</th>
          <th>Complexity</th>
          <th>Breakdown</th>
        </tr>
      </thead>
      <tbody>
        ${breakdownItems}
      </tbody>
    </table>
  </div>
` : '';
```

**Replace with:**
```javascript
const columnStructure = getBreakdownColumnStructure();
const totalBreakdownCols = columnStructure.groups.reduce((sum, group) => sum + group.columns.length, 0) + 1; // +1 for base

const breakdownSection = functions.length > 0 ? `
  <div class="complexity-breakdown">
    <table class="complexity-breakdown-table">
      <thead>
        <!-- Full-spanning header row -->
        <tr>
          <th colspan="2"></th>
          <th colspan="${totalBreakdownCols}" class="breakdown-header">Function Complexity Breakdown</th>
        </tr>
        <!-- Column header row with group headers -->
        <tr>
          <th>Function</th>
          <th>Complexity</th>
          ${columnStructure.groups.map(group => 
            `<th colspan="${group.columns.length}" class="breakdown-group-header">${group.name}</th>`
          ).join('')}
          <th class="breakdown-group-header">${columnStructure.baseColumn.label}</th>
        </tr>
        <!-- Individual column headers -->
        <tr>
          <th></th>
          <th></th>
          ${columnStructure.groups.map(group => 
            group.columns.map(col => `<th class="breakdown-col-header">${col.label}</th>`).join('')
          ).join('')}
          <th class="breakdown-col-header">${columnStructure.baseColumn.label}</th>
        </tr>
      </thead>
      <tbody>
        ${breakdownItems}
      </tbody>
    </table>
  </div>
` : '';
```

### Step 3: Update Row Generation

Modify `formatFunctionHierarchy` in `scripts/function-hierarchy.js` to generate table rows instead of formatted strings.

**Current behavior:** `formatFunctionHierarchy` returns HTML strings that are inserted into the table body.

**New behavior:** Generate proper table rows with individual cells for each breakdown column.

**Option A: Modify existing function**
- Update `formatFunctionHierarchy` to accept column structure
- Generate `<tr>` elements with `<td>` cells for each column

**Option B: Create new function**
- Create `generateBreakdownTableRows()` function
- Keep `formatFunctionHierarchy` for other uses (if any)

**Recommended approach (Option A):**

In `scripts/function-hierarchy.js`, modify `formatFunctionHierarchy`:

```javascript
export function formatFunctionHierarchy(functions, functionBoundaries, functionBreakdowns, sourceCode) {
  if (!escapeHtml) {
    throw new Error('escapeHtml not set. Call setEscapeHtml() first.');
  }
  
  if (functions.length === 0) return '';
  
  // ... existing deduplication logic ...
  
  // Import or pass column structure
  const columnStructure = getBreakdownColumnStructure(); // You'll need to import this
  
  const rows = sortedFunctions.map(func => {
    const breakdown = functionBreakdowns.get(func.line);
    const breakdownData = breakdown ? breakdown.breakdown : {};
    const complexity = parseInt(func.complexity);
    
    // Generate cells for each breakdown column
    const breakdownCells = columnStructure.groups.flatMap(group => 
      group.columns.map(col => {
        const value = breakdownData[col.key] || 0;
        return `<td class="breakdown-value">${value}</td>`;
      })
    );
    
    // Add base column (at the end)
    const baseValue = breakdownData.base || 1;
    breakdownCells.push(`<td class="breakdown-value">${baseValue}</td>`);
    
    return `
      <tr>
        <td class="function-name">${escapeHtml(func.functionName)}</td>
        <td class="complexity-value">${complexity}</td>
        ${breakdownCells.join('')}
      </tr>
    `;
  }).join('');
  
  return rows;
}
```

**Note:** You'll need to either:
1. Move `getBreakdownColumnStructure()` to a shared location, or
2. Pass it as a parameter, or
3. Import it in both files

### Step 4: Add CSS Styling

Add CSS styles to the HTML generation. You can add this to the existing style section in `scripts/html-generators/file.js` or create a shared stylesheet.

Add to the HTML template in `generateFileHTML`:

```css
.complexity-breakdown-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 13px;
}

.complexity-breakdown-table th {
  padding: 8px 4px;
  text-align: center;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  font-weight: bold;
  vertical-align: middle;
}

.complexity-breakdown-table td {
  padding: 6px 4px;
  text-align: center;
  border: 1px solid #ddd;
  vertical-align: middle;
}

.breakdown-header {
  text-align: center;
  font-size: 16px;
  background-color: #e8e8e8;
  font-weight: bold;
  padding: 10px;
}

.breakdown-group-header {
  background-color: #f0f0f0;
  font-weight: 600;
  font-size: 13px;
}

.breakdown-col-header {
  font-weight: normal;
  font-size: 11px;
  background-color: #fafafa;
  white-space: nowrap;
}

.breakdown-value {
  text-align: center;
  font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  color: #333;
}

.breakdown-value:not(:empty) {
  /* Style non-zero values differently if desired */
}

.function-name {
  text-align: left;
  font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  padding-left: 10px;
}

.complexity-value {
  text-align: center;
  font-weight: bold;
  font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
}

.complexity-breakdown-table tbody tr {
  background-color: rgb(230, 245, 208);
}

.complexity-breakdown-table tbody tr:hover {
  background-color: rgb(220, 235, 198);
}
```

### Step 5: Verify Early Return Detection

Check if "early return guarded by a condition" is currently detected in `scripts/decision-points-ast.js`. If not, you may need to:

1. Add detection logic for early returns with conditions
2. Or remove it from the column structure if it's not needed
3. Or document that it's not currently detected

**To check:** Search for "early return" or "return" in `decision-points-ast.js` and see if conditional returns are tracked.

### Step 6: Handle Missing Breakdown Data

Ensure that when a breakdown is missing or incomplete, all columns show `0` (or the base shows `1`):

```javascript
// In row generation
const breakdownData = breakdown ? breakdown.breakdown : {};
// Default to 0 for all keys, 1 for base
const getValue = (key) => {
  if (key === 'base') return breakdownData.base || 1;
  return breakdownData[key] || 0;
};
```

## Files to Modify

1. **`scripts/html-generators/file.js`**
   - Add `getBreakdownColumnStructure()` function
   - Update table header generation (lines 348-363)
   - Add CSS styles to the HTML template

2. **`scripts/function-hierarchy.js`**
   - Modify `formatFunctionHierarchy()` to generate table rows with individual cells
   - Import or access `getBreakdownColumnStructure()`

3. **`scripts/complexity-breakdown.js`** (verify)
   - Ensure breakdown object includes all required keys (should already be correct)
   - Verify all decision point types are included in the breakdown calculation

4. **`scripts/decision-points-ast.js`** (if needed)
   - Add "early return" detection if it's not currently implemented

## Testing Checklist

After implementation:

- [ ] Run `npm run lint:complexity` to generate a new report
- [ ] Open `complexity/<folder>/<file>.html` and verify:
  - [ ] Full-spanning header row displays "Function Complexity Breakdown"
  - [ ] Group headers display correctly (Control Flow, Expressions, Function Parameters)
  - [ ] Individual column headers display correctly
  - [ ] All breakdown values are numbers (not formatted strings)
  - [ ] Numbers match the previous breakdown string format
  - [ ] Base column displays correctly
  - [ ] Table is readable and properly styled
- [ ] Test with functions that have:
  - [ ] Various control flow structures (if, for, while, etc.)
  - [ ] Various expressions (ternary, &&, ||, ??, ?.)
  - [ ] Default parameters
  - [ ] High complexity functions (> 10)
  - [ ] Low complexity functions (= 1)
- [ ] Verify responsive design (if applicable)
- [ ] Check that sorting still works (if implemented)
- [ ] Verify no regressions in other parts of the report

## Design Decisions

### Column Order
- **Base column position**: Decide whether base should be first or last. Recommendation: Last (after Function Parameters) to keep it visually separate.

### Zero Values
- **Display zeros**: Show `0` for all columns, or hide/show based on whether any value exists? Recommendation: Show `0` for consistency and easier scanning.

### Responsive Design
- **Wide table**: The table will be quite wide. Consider:
  - Horizontal scrolling container
  - Or: Make table scrollable on smaller screens
  - Or: Hide less common columns by default with a toggle

### Styling
- Match existing Vitest-style design (green background `rgb(230, 245, 208)`)
- Use consistent fonts (Consolas for monospace)
- Ensure good contrast and readability

## Notes

- The breakdown data structure already exists in `complexity-breakdown.js` - you're just changing how it's displayed
- All decision point types should already be tracked by the AST parser
- The `formatComplexityBreakdownStyled` function can be kept for other uses, or removed if no longer needed
- Consider adding tooltips to column headers explaining what each decision point type means

## Success Criteria

✅ Table displays with grouped columns  
✅ All breakdown values are numeric (not strings)  
✅ Numbers match previous breakdown calculations  
✅ Table is readable and well-styled  
✅ No regressions in report generation  
✅ All tests pass
