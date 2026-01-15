# Theme Picker Transition Plan

**Date:** January 15, 2026  
**Status:** Work in Progress - Draft

## Intended Goal

- Provide an in-app, non-destructive way to preview and edit theme colors (CSS variables) for the site.
- Persist a user's selected theme and allow saving/loading named presets (including deletion for user-made presets).
- Keep the theme picker UI itself theme-agnostic (fixed colors) so it remains usable regardless of the selected site theme.
- Surface accessibility issues by warning when important color pairs fail WCAG contrast thresholds.

## Current Progress (What Exists Now)

- ✅ ThemePicker component implemented with a slide-in drawer, backdrop, and fixed trigger button.
- ✅ Supports live preview: changing a color updates a CSS variable on the `#root` element immediately (without saving).
- ✅ Supports per-token cancel: removing a local change reverts the CSS variable to the saved theme value.
- ✅ Supports save/reset flows: Save commits local changes via `updateTheme()`; Reset calls `resetTheme()`.
- ✅ Presets UI implemented: list of presets, load preset, create new preset from current theme + local edits, and delete user presets.
- ✅ Contrast warnings are computed via `checkContrastIssues()` using `useMemo`, based on current theme merged with local changes.
- ✅ Color tokens are organized into categories (core, primary, accent, gradient, footer, shadows) with human labels and usage hints.
- ✅ Gradient editing includes multiple gradient pairs (hero, campaign, author box, related section) with preview swatches.
- ✅ 29 built-in preset themes (all meet WCAG AA contrast requirements).
- ✅ Drawer UI with smooth slide-in/slide-out transitions and backdrop overlay.
- ✅ Presets section with accordion functionality (collapsible/expandable).
- ✅ All color inputs have associated labels for accessibility.

## What Is Known / Assumed

- Theme values are stored in a theme object provided by `useTheme()`, and tokens map 1:1 to CSS variables.
- The theme picker UI uses fixed (hard-coded) colors in `ThemePicker.module.css` to avoid becoming unreadable under extreme themes.
- The preview mechanism currently writes CSS variables to `#root`, using a derived name: `--color-${camelCaseKey -> kebab-case}`.
- Presets include built-in presets (protected from deletion) and user presets (deletable). Built-in detection is currently based on `id` prefixes.
- Theme persistence uses `localStorage` with no-flicker loading (applied before React render).
- Contrast checking uses the `color` library for WCAG AA/AAA compliance validation.

## What Needs to Be Known Still (Open Questions / Missing Context)

### 1. Authoritative CSS Variable Mapping
- **Issue:** The component derives the CSS variable name from the token key, but each token also has an explicit `cssVar` field.
- **Decision Needed:** Decide which is the source of truth and make them consistent.
- **Recommendation:** Use `token.cssVar` as the authoritative source to eliminate mismatches.

### 2. CSS Variable Application Scope
- **Question:** Where are CSS variables defined and applied in the app (e.g., `:root` vs `#root`, global stylesheet vs component-level)?
- **Current State:** Variables are applied to `#root` element.
- **Confirmation Needed:** Confirm that updating `#root` is correct everywhere (including portals/modals).

### 3. useTheme() Implementation Details
- **Needed:** Exact shape of `useTheme()`: theme keys, default theme values, persistence mechanism (`localStorage`? cookies?), and how `updateTheme`/`resetTheme`/`loadPreset` are implemented.
- **Action:** Review `src/context/ThemeContext.tsx` and `src/context/useTheme.ts` to document the API.

### 4. Accessibility Warning Requirements
- **Question:** Which text sizes count as 'normal' vs 'large', and whether AA/AAA targets vary by component (e.g., headings, buttons, muted text)?
- **Current State:** Uses WCAG AA (4.5:1) for normal text, AAA (7:1) for large text.
- **Confirmation Needed:** Verify that warnings match real UI use-cases and component types.

### 5. Gradient Usage Locations
- **Question:** Confirm which gradients are used where and whether there are additional gradient pairs beyond the four currently handled (hero, campaign, author box, related section).
- **Action:** Audit codebase for all gradient usages.

### 6. Preset Lifecycle Decisions
- **Questions:**
  - Naming rules (allowed characters, length limits)?
  - Deduping behavior (prevent duplicate names)?
  - Max presets limit?
  - Should saving a preset also commit changes?
  - How to handle renaming?
- **Current State:** Basic save/load/delete implemented. No deduping or limits.

### 7. Performance Expectations
- **Questions:**
  - Number of tokens/presets expected?
  - Should contrast checks be debounced for rapid input changes?
- **Current State:** Contrast checks use `useMemo` but no debouncing.

## Next Files / Inputs Needed to Move Forward

| Needed Item | Why it's needed |
|-------------|-----------------|
| `context/useTheme.ts` (implementation) | Verify theme shape, persistence strategy, and ensure updates/reset/presets match the UI's expectations. |
| `utils/contrast.ts` (`checkContrastIssues` + other contrast utilities) | Confirm contrast thresholds, and whether warnings match real UI use-cases. |
| Global theme CSS (where `--color-*` values are defined) | Verify the correct DOM node and variable names; ensure preview changes apply across all components. |
| Preset seed data (built-in presets list) | Replace prefix-based built-in detection with an explicit flag or list if appropriate; avoid accidental deletion. |
| Any components using these tokens | Audit token usage, blog gradients, code blocks, and ensure that warnings cover the highest-impact combinations. |

## Recommended Next Steps (Fastest Path)

### Phase 1: Consolidation & Consistency (Immediate)
1. ✅ **Confirm CSS variable source-of-truth**: Update `handleColorChange`/`handleCancel` to use `token.cssVar` to eliminate mismatches.
2. ✅ **Share useTheme() and contrast utility**: Align the picker's token list and contrast pairs to the real theme shape.
3. ✅ **Add "unsaved changes" indicator**: Optional UX improvement - show indicator when local changes exist.
4. ✅ **Replace built-in preset detection**: Change from `id` prefixes to an explicit `preset.isBuiltIn` boolean (optional but safer).

### Phase 2: npm Package Extraction (Future)
1. **Extract core utilities**: Move contrast checking, theme types, and storage abstraction to package.
2. **Extract React components**: Move ThemeProvider, useTheme hook, and ThemePicker component.
3. **Create package structure**: Set up proper npm package structure with exports, types, and documentation.
4. **Add comprehensive tests**: TDD approach with full test coverage.
5. **Publish to npm**: Follow publishing checklist from `docs/theming/THEME_PICKER_NPM_PACKAGE_PLAN.md`.

### Phase 3: Advanced Features (Stage 3)
1. **Advanced color picker integration**: Replace HTML5 color inputs with visual color picker (e.g., `react-colorful`).
2. **Color theory presets**: Add triads, complementary colors, etc.
3. **UI/UX refinements**: Based on user feedback and accessibility improvements.
4. **Legacy token cleanup**: Remove backward compatibility tokens if any exist.

## Transition Checklist

### Pre-Extraction (Current Project)
- [x] ThemePicker component fully functional
- [x] All color tokens organized and documented
- [x] Contrast checking implemented
- [x] Preset management working
- [ ] CSS variable mapping standardized (use `token.cssVar`)
- [ ] Built-in preset detection improved (explicit flag)
- [ ] All open questions resolved
- [ ] Performance optimizations (debouncing if needed)

### Package Extraction
- [ ] Create new repository structure
- [ ] Extract core utilities (contrast, theme types)
- [ ] Extract React components (ThemeProvider, ThemePicker)
- [ ] Set up build system (TypeScript, bundling)
- [ ] Write comprehensive tests (TDD approach)
- [ ] Create package.json with proper exports
- [ ] Write package documentation
- [ ] Publish to npm

### Post-Extraction
- [ ] Update current project to use npm package
- [ ] Remove extracted code from current project
- [ ] Update documentation references
- [ ] Test integration in current project

## Related Documentation

- `docs/theming/THEME_PICKER_NPM_PACKAGE_PLAN.md` - Detailed extraction plan with TDD approach
- `docs/theming/REACT_PACKAGE_GUIDE.md` - Complete user guide for the package
- `docs/theming/COLOR_PICKER_INTEGRATION.md` - Integration reference for new projects
- `src/design/theming-goals.md` - Original theming architecture documentation
- `.cursorrules` - Current theming system status and built-in themes list

