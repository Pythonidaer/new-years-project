# Coverage TODO

## Goal

Run the coverage script, get **branch coverage** as close to **100%** as possible, then **identify the files with the lowest coverage remaining** so they can be prioritized for future tests or refactors.

---

## Process

### 1. Run tests with coverage

```bash
npm run test:coverage
```

- Runs the full test suite once (no watch) and generates coverage.
- Uses Vitest with the **v8** coverage provider.

### 2. Check coverage results

- **Terminal:** The command prints a table with **% Stmts**, **% Branch**, **% Funcs**, **% Lines** per file and an overall **All files** row.
- **HTML report:** Open `coverage/index.html` in a browser for line-by-line and branch-level detail (red/yellow = uncovered).

### 3. Optional: analysis and suggestions

If you use the project’s analysis tooling:

```bash
npm run analysis
```

- May produce or use `coverage/analysis.json` and feed into **`docs/COVERAGE_IMPROVEMENT_SUGGESTIONS.md`**, which lists uncovered lines/decision points and one-line test ideas per file.

### 4. Add or update tests

- Target files with the **lowest branch (and function) coverage** first.
- Use the uncovered line numbers in the terminal or the HTML report to see which branches (e.g. `if`/`else`, ternaries, `&&`/`||`) are not hit.
- Re-run `npm run test:coverage` after changes to confirm improvements.

### 5. Identify remaining gaps

After pushing coverage as high as practical:

- Note which **files** still have the lowest **branch** (and optionally **function**) coverage.
- Document them here or in `COVERAGE_IMPROVEMENT_SUGGESTIONS.md` so they can be tackled later or accepted as known gaps.

---

## Current status (as of last run)

- **Overall branch coverage:** **91.79%** (target: as close to 95% as practical)
- **Overall:** Statements 98.24%, Functions 98.73%, Lines 98.77%

**Files with lowest branch coverage (prioritize for future tests or accept as known gaps):**

| File | % Branch | Uncovered |
|------|----------|----------|
| `src/sections/AgencyLogos/index.tsx` | 63.33 | 73–78 (useLayoutEffect prevApi cleanup when emblaApi changes; hard to simulate with mocks) |
| `src/sections/FeatureAccordion/index.tsx` | 75 | 160 (desktop matchHeights branch; refs must be measured) |
| `src/context/ThemeContext.tsx` | 84.61 | 38, 54, 70, 155 (initial state when `window` undefined; localStorage catch paths) |
| `src/components/ThemePicker/ThemePicker.tsx` | 88.42 | 137, 631, 732–736 (export/import and UI edge paths) |
| `src/data/blog/index.ts` | 88.37 | 154 (early return when `otherPosts.length === 0`; requires mocking `getAllBlogPosts`) |
| `src/sections/Header/index.tsx` | 91.22 | 24, 116, 147 (hash click `getAttribute` fallback; scroll/resize branches) |
| `src/hooks/useMetaTags.ts` | 93.93 | 35, 150 (`getBaseUrl` when `window` undefined; conditional meta skip) |
| `src/pages/BlogPost.tsx` | 94.11 | 32 (effect/setState path) |
| `src/components/AudioControl/AudioControl.tsx` | 92.3 | 69 (defensive; see below) |

---

## Known exception: defensive branch

One branch is intentionally hard to cover and is treated as a **defensive** path:

- **`src/components/AudioControl/AudioControl.tsx`** — **line 69**  
  In `initializeAudio()`, the `if (!audioFileRef.current) return null;` branch only runs if the user could click “Play” before the effect that sets `audioFileRef.current` has run. In normal execution the effect always runs before the button is available, so this path is not realistically reachable without heavy mocking (e.g. skipping the first `useEffect`), which would be brittle. It is left as defensive code and is not required for “100% branch coverage” in practice.

---

## Quick reference

| Task              | Command                 |
|-------------------|-------------------------|
| Run tests (watch) | `npm test`              |
| Run tests once    | `npm test -- --run`     |
| Coverage          | `npm run test:coverage` |
| Coverage UI       | `npm run test:ui` (then use coverage in UI) |
