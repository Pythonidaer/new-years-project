# Test Projects for @pythonidaer/complexity-report

This guide shows how to create minimal **Angular**, **Ember**, and **Vue.js** projects that exercise every decision point the complexity report counts. Use these to verify the report works across frameworks and that all decision types appear in the HTML report.

## Decision points the report counts

The report uses ESLint’s complexity rule (classic variant) and an AST-based breakdown. It counts:

| Category | Decision points |
|----------|-----------------|
| **Control flow** | `if`, `else if`, `for`, `for...of`, `for...in`, `while`, `do...while`, `switch`, each `case`, `catch` |
| **Expressions** | ternary (`? :`), `&&`, `\|\|`, `??`, `?.` |
| **Function parameters** | default parameter values |

Your test file should include at least one of each so the report’s breakdown table and totals look correct.

---

## 1. Install the report in any project

In each test project (Angular, Ember, or Vue):

```bash
npm install --save-dev @pythonidaer/complexity-report
```

Add an ESLint flat config at the project root if you don’t have one (e.g. `eslint.config.js`):

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: { parserOptions: { ecmaVersion: 'latest' } },
    rules: { complexity: ['warn', { max: 10 }] },
  }
);
```

Add scripts to `package.json`:

```json
"scripts": {
  "lint:complexity": "complexity-report",
  "lint:complexity:export": "complexity-report --export"
}
```

Run the report:

```bash
npm run lint:complexity
```

Output: `complexity/index.html` (and folder/file pages). Open it in a browser and confirm the test file’s function shows all decision types in the breakdown.

---

## 2. Test file that hits every decision point

Use one of the framework-specific files below in your app. Each contains a single function (or component method) that includes:

- **Control flow:** `if`, `else if`, `for`, `for...of`, `for...in`, `while`, `do...while`, `switch`/`case`, `catch`
- **Expressions:** ternary, `&&`, `||`, `??`, `?.`
- **Default parameter**

So the report will show a non-trivial complexity total and a full breakdown.

---

### Angular (TypeScript)

**Create project:**

```bash
npx @angular/cli@latest new complexity-test-angular --routing=false --style=css --ssr=false
cd complexity-test-angular
```

**Add the report and ESLint:**

```bash
npm install --save-dev @pythonidaer/complexity-report eslint @eslint/js typescript-eslint
```

Create `eslint.config.js` (see “Install the report” above), add the scripts, then add this **service** (or put the logic in a component):

**File: `src/app/decision-point-test.service.ts`**

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DecisionPointTestService {
  /**
   * Single method that hits every decision point for complexity report testing.
   * Control flow: if, else if, for, for-of, for-in, while, do-while, switch, case, catch.
   * Expressions: ternary, &&, ||, ??, ?.
   * Default parameter.
   */
  runAllDecisionPoints(
    items: string[],
    opts: { flag?: boolean; value?: number } = {},
    defaultValue: number = 10
  ): number {
    let total = 0;
    const val = opts?.value ?? defaultValue;
    const flag = opts?.flag && items.length > 0;

    if (items.length === 0) return 0;
    else if (items.length === 1) total += 1;

    for (let i = 0; i < items.length; i += 1) total += 1;
    for (const item of items) total += item?.length ?? 0;
    for (const k in items) total += items[k]?.length ?? 0;

    let n = 0;
    while (n < 3) {
      total += n;
      n += 1;
    }
    let m = 0;
    do {
      total += m;
      m += 1;
    } while (m < 2);

    switch (items.length) {
      case 0:
        break;
      case 1:
        total += 1;
        break;
      default:
        total += 2;
    }

    try {
      total += flag ? 1 : 0;
    } catch {
      total += 0;
    }

    return total;
  }
}
```

Run `npm run lint:complexity` and open `complexity/index.html`; find `DecisionPointTestService` / `runAllDecisionPoints` and check the breakdown.

---

### Ember (JavaScript or TypeScript)

**Create project:**

```bash
npx ember-cli@latest new complexity-test-ember --lang en --skip-git --skip-npm
cd complexity-test-ember
npm install
```

**Add the report and ESLint:**

```bash
npm install --save-dev @pythonidaer/complexity-report eslint @eslint/js typescript-eslint
```

Add `eslint.config.js` and scripts as above. Then add a **utility** or **service** that contains the same logic:

**File: `app/utils/decision-point-test.js`** (or `.ts` if you use TypeScript)

```javascript
/**
 * Hits every decision point for complexity report testing.
 * Control flow: if, else if, for, for-of, for-in, while, do-while, switch, case, catch.
 * Expressions: ternary, &&, ||, ??, ?.
 * Default parameter.
 */
export function runAllDecisionPoints(
  items = [],
  opts = {},
  defaultValue = 10
) {
  let total = 0;
  const val = opts?.value ?? defaultValue;
  const flag = opts?.flag && items.length > 0;

  if (items.length === 0) return 0;
  else if (items.length === 1) total += 1;

  for (let i = 0; i < items.length; i += 1) total += 1;
  for (const item of items) total += item?.length ?? 0;
  for (const k in items) total += items[k]?.length ?? 0;

  let n = 0;
  while (n < 3) {
    total += n;
    n += 1;
  }
  let m = 0;
  do {
    total += m;
    m += 1;
  } while (m < 2);

  switch (items.length) {
    case 0:
      break;
    case 1:
      total += 1;
      break;
    default:
      total += 2;
  }

  try {
    total += flag ? 1 : 0;
  } catch {
    total += 0;
  }

  return total;
}
```

Run `npm run lint:complexity` and check the report for this file/function.

---

### Vue (Vite + TypeScript)

**Create project:**

```bash
npm create vue@latest complexity-test-vue -- --typescript --router --pinia
cd complexity-test-vue
npm install
```

**Add the report and ESLint:**

```bash
npm install --save-dev @pythonidaer/complexity-report eslint @eslint/js typescript-eslint
```

Add `eslint.config.js` and scripts. Then add a **composable** or **util** with the same logic:

**File: `src/composables/decisionPointTest.ts`** (or `src/utils/decisionPointTest.ts`)

```typescript
/**
 * Hits every decision point for complexity report testing.
 * Control flow: if, else if, for, for-of, for-in, while, do-while, switch, case, catch.
 * Expressions: ternary, &&, ||, ??, ?.
 * Default parameter.
 */
export function runAllDecisionPoints(
  items: string[],
  opts: { flag?: boolean; value?: number } = {},
  defaultValue: number = 10
): number {
  let total = 0;
  const val = opts?.value ?? defaultValue;
  const flag = opts?.flag && items.length > 0;

  if (items.length === 0) return 0;
  else if (items.length === 1) total += 1;

  for (let i = 0; i < items.length; i += 1) total += 1;
  for (const item of items) total += item?.length ?? 0;
  for (const k in items) total += items[k]?.length ?? 0;

  let n = 0;
  while (n < 3) {
    total += n;
    n += 1;
  }
  let m = 0;
  do {
    total += m;
    m += 1;
  } while (m < 2);

  switch (items.length) {
    case 0:
      break;
    case 1:
      total += 1;
      break;
    default:
      total += 2;
  }

  try {
    total += flag ? 1 : 0;
  } catch {
    total += 0;
  }

  return total;
}
```

Run `npm run lint:complexity` and confirm the function appears with a full breakdown.

---

## 3. Quick checklist

- [ ] Project created (Angular / Ember / Vue).
- [ ] `@pythonidaer/complexity-report` installed as dev dependency.
- [ ] ESLint flat config present with a `complexity` rule (e.g. `max: 10`).
- [ ] Test file added with the “all decision points” function.
- [ ] `npm run lint:complexity` runs and creates `complexity/index.html`.
- [ ] In the report, open the test file’s page and confirm the breakdown shows: if, else if, for, for-of, for-in, while, do-while, switch, case(s), catch, ternary, `&&`, `||`, `??`, `?.`, and default parameter.

---

## 4. Optional: Export and CI

To also generate TXT/MD exports and use the report in CI:

```bash
npm run lint:complexity:export
```

Output goes to `complexity/reports/` (or the path in `package.json` → `complexityReport.exportDir`). You can add a CI step that runs `npm run lint:complexity` and fails if the script exits non-zero.
