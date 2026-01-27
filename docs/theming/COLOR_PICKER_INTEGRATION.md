# Color Picker & Theming System Integration Guide

This document provides a complete guide for integrating the color picker and theming system into a new project or extracting it as an npm package.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Dependencies](#dependencies)
3. [File Structure](#file-structure)
4. [Integration Steps](#integration-steps)
5. [API Reference](#api-reference)
6. [Customization Guide](#customization-guide)
7. [NPM Package Extraction](#npm-package-extraction)

---

## Architecture Overview

The theming system follows a **clear separation of concerns** with four distinct layers:

### 1. CSS Variables Layer
- **Themeable colors** defined on `#root` element
- **Non-themeable tokens** (fonts, spacing, layout) defined on `:root`
- All components use `var(--color-*)` tokens instead of hardcoded colors
- React dynamically updates colors by modifying CSS variables on `#root`

### 2. React State Layer
- `ThemeContext` manages theme state as a JavaScript object
- `ThemeProvider` wraps the application
- `useTheme()` hook provides access to theme state and methods
- Persists theme to `localStorage` for no-flicker loading
- Handles preset management (built-in + custom presets)

### 3. UI Layer
- `ThemePicker` component provides floating color picker UI
- Fixed position (bottom-left corner by default)
- Real-time color preview with unsaved changes tracking
- Preset management (save, load, delete)
- Uses fixed colors for UI (theme-agnostic) so picker remains visible

### 4. Utility Layer
- WCAG contrast checking utilities
- Validates text readability on backgrounds and gradients
- Provides detailed accessibility warnings

**Core Principle:**
> **CSS variables do the styling. React manages the data.**

---

## Dependencies

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "color": "^4.2.3",
    "lucide-react": "^0.263.1"
  }
}
```

**Package Explanations:**
- `react` & `react-dom`: Core React framework
- `color`: Color manipulation library for contrast calculations and color format conversions
- `lucide-react`: Icon library (used for ThemePicker UI icons: Palette, Save, X, RotateCcw, Bookmark, Trash2)

### Optional Dependencies (for npm package)

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## File Structure

```
src/
├── context/
│   ├── ThemeContext.tsx          # ThemeProvider, theme state management
│   ├── ThemeContextInstance.ts   # Context instance and TypeScript types
│   ├── themeData.ts              # Re-exports types and themes from themes/
│   ├── themes/                    # Individual theme files (one per theme)
│   │   ├── types.ts              # Theme and Preset type definitions
│   │   ├── default.ts            # Default theme (Midnight Blue)
│   │   ├── noir.ts               # Noir theme
│   │   ├── king.ts               # King theme
│   │   ├── ...                   # Other theme files (one per preset)
│   │   └── index.ts              # Exports builtInPresets array
│   └── useTheme.ts               # useTheme hook
├── components/
│   └── ThemePicker/
│       ├── ThemePicker.tsx       # Main ThemePicker component
│       └── ThemePicker.module.css # Fixed-color styles (theme-agnostic)
├── utils/
│   └── contrast.ts                # WCAG contrast checking utilities
└── design/
    └── tokens.css                 # CSS variable definitions
```

---

## Integration Steps

### Step 1: Install Dependencies

```bash
npm install color lucide-react
# or
yarn add color lucide-react
```

### Step 2: Copy Core Files

Copy the following files to your project:

1. **Context Files:**
   - `src/context/ThemeContext.tsx`
   - `src/context/ThemeContextInstance.ts`
   - `src/context/useTheme.ts`

2. **Component Files:**
   - `src/components/ThemePicker/ThemePicker.tsx`
   - `src/components/ThemePicker/ThemePicker.module.css`

3. **Utility Files:**
   - `src/utils/contrast.ts`

4. **Design Files:**
   - `src/design/tokens.css` (or integrate into your existing CSS)

### Step 3: Define Your Theme Type

The `Theme` type in `ThemeContext.tsx` defines all themeable colors. Customize this to match your design system:

```typescript
export type Theme = {
  // Core colors
  bg: string;
  surface: string;
  surfaceDark: string;
  text: string;
  textDark: string;
  muted: string;
  border: string;
  
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryContrast: string;
  link: string;
  focus: string;
  
  // Add your custom colors here...
};
```

### Step 4: Update CSS Variables

In `tokens.css`, define CSS variables that match your `Theme` type:

```css
/* Non-themeable tokens (on :root) */
:root {
  --font-family: 'Your Font', sans-serif;
  --fs-body: 16px;
  /* ... other non-themeable tokens */
}

/* Themeable colors (on #root) */
#root {
  --color-bg: #ffffff;
  --color-surface: #f6f7f9;
  --color-text: #24364e;
  --color-primary: #d34120;
  /* ... match all Theme type properties */
}
```

**Important:** CSS variable names must follow the pattern: `--color-{kebabCase(themeKey)}`

For example:
- `bg` → `--color-bg`
- `primaryHover` → `--color-primary-hover`
- `surfaceDark` → `--color-surface-dark`

### Step 5: Update Theme Key to CSS Variable Mapping

The `themeKeyToCssVar()` function in `ThemeContext.tsx` converts theme keys to CSS variable names:

```typescript
function themeKeyToCssVar(key: keyof Theme): string {
  const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--color-${kebabCase}`;
}
```

This function automatically handles camelCase to kebab-case conversion. No changes needed unless you use a different naming convention.

### Step 6: Update ThemePicker Color Tokens

In `ThemePicker.tsx`, update the `colorTokens` array to match your `Theme` type:

```typescript
const colorTokens: ColorToken[] = [
  {
    key: 'bg',
    label: 'Background',
    cssVar: '--color-bg',
    category: 'core',
    usage: 'Page background, section backgrounds'
  },
  // Add all your theme colors here...
];
```

**Categories:**
- `'core'` - Foundational colors (backgrounds, text)
- `'primary'` - Brand/action colors (buttons, links)
- `'accent'` - Accent colors
- `'gradient'` - Gradient colors (pairs with `isGradient: true`)
- `'footer'` - Footer-specific colors
- `'shadows'` - Shadow colors

### Step 7: Wrap App with ThemeProvider

In your root component (e.g., `App.tsx` or `main.tsx`):

```typescript
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Step 8: Add ThemePicker Component

Add the `ThemePicker` component to your app (typically in the root layout):

```typescript
import { ThemePicker } from './components/ThemePicker/ThemePicker';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
      <ThemePicker />
    </ThemeProvider>
  );
}
```

### Step 9: Update Components to Use CSS Variables

Replace all hardcoded colors in your components with CSS variables:

**Before:**
```css
.button {
  background: #d34120;
  color: #ffffff;
}
```

**After:**
```css
.button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}
```

### Step 10: Update Contrast Checking

In `contrast.ts`, update `checkContrastIssues()` to check all color combinations used in your app:

```typescript
export function checkContrastIssues(theme: {
  bg: string;
  text: string;
  primary: string;
  // ... all theme properties
}): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  
  // Check text on background
  const textBgRatio = getContrastRatio(theme.text, theme.bg);
  if (textBgRatio < 4.5) {
    issues.push({
      pair: 'Text on Background',
      foreground: theme.text,
      background: theme.bg,
      ratio: textBgRatio,
      level: getContrastLevel(textBgRatio),
      usage: 'Body text, headings, main content areas',
    });
  }
  
  // Add checks for all color combinations in your app...
  
  return issues;
}
```

---

## API Reference

### ThemeProvider

**Props:**
```typescript
<ThemeProvider>
  {children: ReactNode}
</ThemeProvider>
```

**Responsibilities:**
- Manages theme state
- Persists theme to `localStorage` (key: `'user-theme'`)
- Manages presets (key: `'theme-presets'`)
- Applies theme to DOM via CSS variables on `#root`

### useTheme Hook

**Returns:**
```typescript
{
  theme: Theme;                    // Current theme object
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
  exportTheme: () => string;       // Returns JSON string
  importTheme: (themeJson: string) => void;
  presets: Preset[];               // Built-in + custom presets
  savePreset: (name: string, themeToSave?: Theme) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
}
```

**Usage:**
```typescript
import { useTheme } from './context/useTheme';

function MyComponent() {
  const { theme, updateTheme } = useTheme();
  
  const handleColorChange = () => {
    updateTheme({ primary: '#ff0000' });
  };
  
  return <div style={{ color: theme.text }}>Content</div>;
}
```

### ThemePicker Component

**Props:**
```typescript
<ThemePicker />
```

**Features:**
- Floating UI (fixed position, bottom-left)
- Real-time color preview
- Unsaved changes tracking
- Preset management (save, load, delete)
- Contrast warnings
- Gradient previews

**Positioning:**
- Default: `bottom: 24px; left: 24px;`
- Customize in `ThemePicker.module.css`:

```css
.trigger {
  position: fixed;
  bottom: 24px;  /* Change this */
  left: 24px;   /* Change this */
}
```

### Contrast Utilities

**Functions:**
```typescript
// Calculate contrast ratio (1-21)
getContrastRatio(color1: string, color2: string): number

// Get WCAG level ('AAA' | 'AA' | 'Fail')
getContrastLevel(ratio: number): 'AAA' | 'AA' | 'Fail'

// Check all contrast issues in a theme
checkContrastIssues(theme: Theme): ContrastIssue[]
```

**Usage:**
```typescript
import { getContrastRatio, getContrastLevel } from './utils/contrast';

const ratio = getContrastRatio('#ffffff', '#000000'); // 21:1
const level = getContrastLevel(ratio); // 'AAA'
```

---

## Customization Guide

### Customizing Built-in Presets

Edit the `builtInPresets` array in `ThemeContext.tsx`:

```typescript
const builtInPresets: Preset[] = [
  {
    id: 'default',
    name: 'Default',
    theme: defaultTheme,
  },
  {
    id: 'my-custom-preset',
    name: 'My Custom Preset',
    theme: {
      ...defaultTheme,
      primary: '#ff0000',
      // ... override colors
    },
  },
];
```

### Customizing ThemePicker UI

**Position:**
Edit `ThemePicker.module.css`:

```css
.trigger {
  bottom: 24px;  /* Change position */
  left: 24px;
  /* Or use right/top */
}
```

**Colors (Fixed):**
The ThemePicker uses fixed colors so it remains visible regardless of theme. To change these, edit `ThemePicker.module.css`:

```css
.trigger {
  background: #d34120; /* Fixed primary color */
  color: #ffffff;      /* Fixed white */
}

.popup {
  background: #ffffff;  /* Fixed white background */
  border: 1px solid rgba(36, 54, 78, 0.25); /* Fixed border */
}
```

### Customizing Color Categories

In `ThemePicker.tsx`, update the `categoryLabels` object:

```typescript
const categoryLabels: Record<ColorToken['category'], string> = {
  core: 'Core Colors',
  primary: 'Primary Colors',
  accent: 'Accent Colors',
  gradient: 'Gradients',
  footer: 'Footer',
  shadows: 'Shadows',
  // Add custom categories
};
```

### Adding Custom Color Tokens

1. Add to `Theme` type in `ThemeContext.tsx`
2. Add to `defaultTheme` object
3. Add CSS variable in `tokens.css`
4. Add to `colorTokens` array in `ThemePicker.tsx`
5. Update contrast checks in `contrast.ts` if needed

---

## NPM Package Extraction

### Package Structure

```
your-theme-picker-package/
├── src/
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   ├── ThemeContextInstance.ts
│   │   └── useTheme.ts
│   ├── components/
│   │   └── ThemePicker/
│   │       ├── ThemePicker.tsx
│   │       └── ThemePicker.module.css
│   ├── utils/
│   │   └── contrast.ts
│   └── index.ts              # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

### package.json

```json
{
  "name": "your-theme-picker-package",
  "version": "1.0.0",
  "description": "React theming system with color picker and WCAG contrast checking",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "color": "^4.2.3",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### index.ts (Main Export)

```typescript
// Context
export { ThemeProvider, type Theme, type Preset } from './context/ThemeContext';
export { useTheme } from './context/useTheme';
export type { ThemeContextType } from './context/ThemeContextInstance';

// Components
export { ThemePicker } from './components/ThemePicker/ThemePicker';

// Utilities
export {
  getContrastRatio,
  getContrastLevel,
  checkContrastIssues,
  type ContrastIssue,
} from './utils/contrast';

// CSS (users will need to import this separately)
// export './components/ThemePicker/ThemePicker.module.css';
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### CSS Module Handling

For CSS Modules in an npm package, you have two options:

**Option 1: Include CSS in package**
- Users import: `import 'your-package/dist/ThemePicker.module.css'`
- Requires CSS bundler configuration

**Option 2: Provide CSS as separate file**
- Users copy CSS file manually
- More flexible for different build systems

**Option 3: Use CSS-in-JS (styled-components, emotion)**
- Convert CSS Modules to CSS-in-JS
- No separate CSS file needed

### Usage in Consumer Project

```typescript
// Install
npm install your-theme-picker-package

// Import
import { ThemeProvider, ThemePicker, useTheme } from 'your-theme-picker-package';
import 'your-theme-picker-package/dist/ThemePicker.module.css';

// Use
function App() {
  return (
    <ThemeProvider>
      <YourApp />
      <ThemePicker />
    </ThemeProvider>
  );
}
```

---

## Key Implementation Details

### CSS Variable Application

The theme is applied to the DOM by setting CSS variables on the `#root` element:

```typescript
function applyThemeToDom(theme: Theme) {
  const root = document.getElementById('root');
  if (!root) return;

  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = themeKeyToCssVar(key as keyof Theme);
    root.style.setProperty(cssVar, value);
  });
}
```

**Why `#root` instead of `:root`?**
- Allows nested theme overrides in the future
- Safer for embedding in other applications
- Supports scoped theming

### Theme Persistence

Themes are persisted to `localStorage` with two keys:

- `'user-theme'`: Current active theme
- `'theme-presets'`: Custom presets (built-in presets are not stored)

**Loading on mount:**
```typescript
const [theme, setTheme] = useState<Theme>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user-theme');
    if (saved) {
      try {
        return { ...defaultTheme, ...JSON.parse(saved) };
      } catch {
        return defaultTheme;
      }
    }
  }
  return defaultTheme;
});
```

This prevents flicker by loading the theme before React renders.

### Contrast Checking

The contrast checker:
1. Blends semi-transparent colors with backgrounds
2. Checks both start and end colors for gradients
3. Validates against WCAG AA standard (4.5:1 minimum)
4. Provides detailed warnings with usage context

**Gradient handling:**
```typescript
// Check both gradient start and end
const startRatio = getContrastRatio(text, gradientStart);
const endRatio = getContrastRatio(text, gradientEnd);
if (startRatio < 4.5 || endRatio < 4.5) {
  // Warn if either fails
}
```

### Unsaved Changes Tracking

The ThemePicker tracks unsaved changes separately from the saved theme:

```typescript
const [localChanges, setLocalChanges] = useState<Partial<Theme>>({});

// Apply temporarily for preview
const handleColorChange = (key: keyof Theme, value: string) => {
  setLocalChanges((prev) => ({ ...prev, [key]: value }));
  // Apply to DOM immediately for preview
  root.style.setProperty(cssVar, value);
};

// Save all changes
const handleSave = () => {
  if (Object.keys(localChanges).length > 0) {
    updateTheme(localChanges); // Persists to localStorage
    setLocalChanges({});
  }
};
```

---

## Troubleshooting

### Theme Not Applying

**Check:**
1. Is `ThemeProvider` wrapping your app?
2. Does `#root` element exist in your HTML?
3. Are CSS variable names matching? (check `themeKeyToCssVar()`)
4. Are you using `var(--color-*)` in your CSS?

### Colors Not Updating

**Check:**
1. Are you using CSS variables (`var(--color-*)`) or hardcoded colors?
2. Is the CSS variable name correct? (kebab-case conversion)
3. Check browser DevTools → Elements → `#root` → Computed styles

### Contrast Warnings Not Showing

**Check:**
1. Is `checkContrastIssues()` updated with all your color combinations?
2. Are gradient colors being blended correctly?
3. Check console for errors in contrast calculation

### Presets Not Persisting

**Check:**
1. Is `localStorage` available? (check for private browsing mode)
2. Are custom presets being filtered correctly? (built-in presets shouldn't be saved)
3. Check `localStorage.getItem('theme-presets')` in DevTools

---

## Best Practices

1. **Always use CSS variables** - Never hardcode colors in components
2. **Semantic naming** - Use `--color-primary` not `--color-orange`
3. **Test contrast** - Run contrast checks for all color combinations
4. **Provide defaults** - Always have a fallback theme
5. **Document usage** - Document where each color is used in your app
6. **Version themes** - Consider versioning theme structure for breaking changes

---

## Example: Complete Integration

See the main project files for a complete working example:
- `src/context/ThemeContext.tsx` - Full ThemeProvider implementation
- `src/components/ThemePicker/ThemePicker.tsx` - Complete ThemePicker component
- `src/utils/contrast.ts` - Full contrast checking implementation
- `src/design/tokens.css` - Complete CSS variable definitions

---

**Last Updated:** Based on implementation in `new-years-project` repository  
**Version:** 1.0.0

