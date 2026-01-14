# Theme Picker npm Package Extraction Plan

**Project Goal:** Extract the ThemePicker component and theming system from `new-years-project` into a standalone, reusable npm package that can be used in any React application.

**Repository:** `theme-picker-package` (to be created on GitHub)

**Status:** Planning Phase

**Testing Approach:** Test-Driven Development (TDD) - Write tests first, then implement

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Testing Strategy (TDD)](#testing-strategy-tdd)
3. [Extraction Phases](#extraction-phases)
4. [Package Architecture](#package-architecture)
5. [Implementation Tasks](#implementation-tasks)
6. [API Design Decisions](#api-design-decisions)
7. [Documentation Requirements](#documentation-requirements)
8. [Publishing Checklist](#publishing-checklist)

---

## Testing Strategy (TDD)

### Test Structure

Following the existing project structure, tests will be in `src/__tests__/`:

```
src/__tests__/
├── core/
│   ├── contrast.test.ts        # Contrast utility tests
│   ├── theme.test.ts           # Theme type/merging tests
│   └── storage.test.ts         # Storage abstraction tests
├── react/
│   ├── ThemeContext.test.tsx   # ThemeProvider tests
│   ├── useTheme.test.tsx       # useTheme hook tests
│   └── ThemePicker.test.tsx    # ThemePicker component tests
└── integration/
    ├── theming.test.tsx        # Full theming flow
    └── presets.test.tsx        # Preset management flow
```

### TDD Workflow

1. **Write failing test** → Red
2. **Implement minimal code** → Green
3. **Refactor** → Clean
4. **Repeat**

### Test Coverage Goals

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** All major flows
- **E2E Tests:** Critical user paths
- **Accessibility Tests:** WCAG compliance

### Testing Tools

- **Vitest** (matches current project)
- **@testing-library/react** (component testing)
- **@testing-library/user-event** (user interactions)
- **@testing-library/jest-dom** (DOM matchers)

### Example Test Structure

```typescript
// src/__tests__/core/contrast.test.ts
import { describe, it, expect } from 'vitest';
import { getContrastRatio, getContrastLevel, checkContrastIssues } from '../../core/contrast';

describe('Contrast Utilities', () => {
  describe('getContrastRatio', () => {
    it('should return 21:1 for black on white', () => {
      expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    });
    
    it('should return 1:1 for same colors', () => {
      expect(getContrastRatio('#000000', '#000000')).toBe(1);
    });
  });
  
  // More tests...
});
```

---

## Project Overview

### Current State (Stage 2)
- ✅ Complete ThemePicker UI with accessibility features
- ✅ 20+ built-in theme presets
- ✅ WCAG contrast checking with detailed warnings
- ✅ Preset management (save, load, delete)
- ✅ Real-time color preview with unsaved changes tracking
- ✅ Gradient previews
- ✅ localStorage persistence
- ✅ TDD test structure in place

### Target State (npm Package)
- 📦 Standalone npm package
- 🔌 React-specific (v1.0)
- 🎨 Customizable Theme type
- 📚 Comprehensive documentation
- ✅ Full TypeScript support
- 🧪 Test coverage (90%+)
- 📦 CSS Modules distribution
- 🎯 TDD approach throughout

---

## Extraction Phases

### Phase 1: Repository Setup & Test Infrastructure
**Goal:** Create package repository with TDD setup

**Tasks:**
- [ ] Create `theme-picker-package` repository on GitHub
- [ ] Initialize npm package with `package.json`
- [ ] Set up TypeScript configuration
- [ ] Set up Vitest testing framework
- [ ] Configure test scripts and coverage
- [ ] Create test directory structure
- [ ] Set up CI/CD for tests
- [ ] Create initial README.md

**Deliverables:**
- Empty but properly configured npm package repository
- Test infrastructure working
- CI/CD running tests on push

---

### Phase 2: Core Tests & Extraction (TDD)
**Goal:** Write tests first, then extract core theming logic

**Tasks:**
- [ ] **Write tests** for contrast utilities
- [ ] Extract `contrast.ts` → make framework-agnostic
- [ ] **Write tests** for theme type/merging
- [ ] Extract theme type definitions
- [ ] **Write tests** for storage abstraction
- [ ] Create storage abstraction layer
- [ ] **Write tests** for CSS variable mapping
- [ ] Extract CSS variable utilities
- [ ] All tests passing

**Key Decisions:**
- Should `Theme` type be generic/extensible or fixed?
- Should localStorage be required or optional?
- How to handle CSS variable application (DOM manipulation)?

**Deliverables:**
- Core theming logic extracted and tested
- No dependencies on parent project
- TypeScript types properly exported
- 100% test coverage on core utilities

---

### Phase 3: React Context Tests & Extraction (TDD)
**Goal:** Write tests first, then extract React context

**Tasks:**
- [ ] **Write tests** for ThemeProvider
- [ ] Copy `ThemeContext.tsx` → adapt for package
- [ ] **Write tests** for useTheme hook
- [ ] Copy `useTheme.ts` → adapt for package
- [ ] **Write tests** for preset management
- [ ] Extract preset system
- [ ] **Write tests** for theme persistence
- [ ] Abstract localStorage persistence
- [ ] All tests passing

**Deliverables:**
- React context extracted and tested
- Hook working correctly
- Preset system functional
- 100% test coverage on React layer

---

### Phase 4: Component Tests & Extraction (TDD)
**Goal:** Write tests first, then extract ThemePicker component

**Tasks:**
- [ ] **Write tests** for ThemePicker rendering
- [ ] **Write tests** for color picker interactions
- [ ] **Write tests** for preset management UI
- [ ] **Write tests** for contrast warnings display
- [ ] Copy `ThemePicker.tsx` → adapt for package
- [ ] Copy `ThemePicker.module.css` → handle CSS distribution
- [ ] Make UI positioning configurable via props
- [ ] All tests passing

**Key Decisions:**
- CSS Modules vs CSS-in-JS vs separate CSS file?
- How to handle built-in presets (include or make optional)?
- Should color tokens be configurable or fixed?

**Deliverables:**
- ThemePicker component extracted and tested
- CSS properly bundled/distributed
- Component is fully configurable
- 100% test coverage on component

---

### Phase 5: Integration Tests & CSS Distribution
**Goal:** Test full integration and solve CSS distribution

**Tasks:**
- [ ] **Write integration tests** for full theming flow
- [ ] **Write integration tests** for preset save/load/delete
- [ ] **Write integration tests** for contrast checking
- [ ] Research CSS Modules in npm packages
- [ ] Implement chosen CSS solution
- [ ] Test with different bundlers (Vite, Webpack, Rollup)
- [ ] All integration tests passing

**Deliverables:**
- CSS distribution solution implemented
- Works with major bundlers
- Integration tests passing
- Clear documentation for users

---

### Phase 6: Documentation & Examples
**Goal:** Comprehensive user documentation

**Tasks:**
- [ ] Write package README.md
- [ ] Create getting started guide
- [ ] Document API reference
- [ ] Create customization guide
- [ ] Write migration guide
- [ ] Create example projects
- [ ] Add JSDoc comments to all exports
- [ ] Document TDD approach for contributors

**Deliverables:**
- Complete documentation
- Example projects
- Migration guide
- Contributor guidelines

---

### Phase 7: Publishing & Distribution
**Goal:** Publish to npm

**Tasks:**
- [ ] Choose package name (check availability)
- [ ] Set up npm account
- [ ] Configure npm publish settings
- [ ] Create changelog
- [ ] Version management strategy
- [ ] Create GitHub releases
- [ ] Set up automated publishing (CI/CD)
- [ ] Publish beta version
- [ ] Gather feedback
- [ ] Publish v1.0.0

**Deliverables:**
- Package published to npm
- Versioning strategy in place
- Automated publishing workflow

---

## Package Architecture

### Proposed Structure (with tests)

```
theme-picker-package/
├── src/
│   ├── __tests__/              # All tests (TDD structure)
│   │   ├── core/
│   │   ├── react/
│   │   └── integration/
│   ├── core/                    # Framework-agnostic core
│   │   ├── theme.ts
│   │   ├── contrast.ts
│   │   └── storage.ts
│   ├── react/                   # React-specific
│   │   ├── context/
│   │   └── components/
│   ├── config/                  # Configuration
│   │   ├── defaultPresets.ts
│   │   ├── colorTokens.ts
│   │   └── themeConfig.ts
│   └── index.ts
├── dist/                        # Built files
├── examples/                    # Example projects
├── coverage/                    # Test coverage reports
├── package.json
├── tsconfig.json
├── vitest.config.ts            # Test configuration
├── README.md
└── CHANGELOG.md
```

---

## Success Metrics

### Technical
- ✅ Package installs without errors
- ✅ Works with major bundlers
- ✅ TypeScript types work correctly
- ✅ No runtime errors
- ✅ Bundle size < 50KB (gzipped)
- ✅ **90%+ test coverage**
- ✅ **All tests passing in CI/CD**

### User Experience
- ✅ Easy to install and use
- ✅ Clear documentation
- ✅ Helpful error messages
- ✅ Good developer experience

### Quality
- ✅ TDD approach followed
- ✅ Code reviews required
- ✅ Automated testing
- ✅ Accessibility verified

---

## Timeline Estimate

- **Phase 1:** 1 week (Repository setup + test infrastructure)
- **Phase 2:** 1-2 weeks (Core tests + extraction)
- **Phase 3:** 1-2 weeks (React context tests + extraction)
- **Phase 4:** 2-3 weeks (Component tests + extraction)
- **Phase 5:** 1-2 weeks (Integration tests + CSS)
- **Phase 6:** 1 week (Documentation)
- **Phase 7:** 1 week (Publishing)

**Total:** ~8-12 weeks for complete extraction and publishing

---

**Last Updated:** January 2026  
**Testing Approach:** Test-Driven Development (TDD)  
**Related Documents:**
- `docs/REACT_PACKAGE_GUIDE.md` - Complete user guide
- `docs/COLOR_PICKER_INTEGRATION.md` - Integration reference
- `src/design/theming-goals.md` - Architecture overview

