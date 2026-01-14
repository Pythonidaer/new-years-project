# React Theme Picker Package - Complete Guide

**Package Name:** `@your-org/react-theme-picker` (or your chosen name)

**Version:** 1.0.0

**Description:** A complete React theming system with visual color picker, WCAG contrast checking, preset management, and full customization support.

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Quick Start](#quick-start)
3. [Prerequisites](#prerequisites)
4. [Token Creation & Theme Definition](#token-creation--theme-definition)
5. [Adding Theme Presets](#adding-theme-presets)
6. [Adding Accessibility Checks](#adding-accessibility-checks)
7. [Creating Themes from Images](#creating-themes-from-images)
8. [Customization Guide](#customization-guide)
9. [Adapting to Existing Codebases](#adapting-to-existing-codebases)
10. [Cursor Rules & AI Prompts](#cursor-rules--ai-prompts)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### Install Package

```bash
npm install @your-org/react-theme-picker color lucide-react
# or
yarn add @your-org/react-theme-picker color lucide-react
```

### Required Dependencies

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `color` ^4.2.3 (for contrast calculations)
- `lucide-react` ^0.263.1 (for icons)

---

## Quick Start

### 1. Set Up CSS Variables

Create or update your CSS file (e.g., `tokens.css`):

```css
/* Non-themeable tokens (fonts, spacing, etc.) */
:root {
  --font-family: 'Your Font', sans-serif;
  --spacing-unit: 8px;
  /* ... other non-themeable tokens */
}

/* Themeable colors (on #root, not :root) */
#root {
  --color-bg: #ffffff;
  --color-surface: #f6f7f9;
  --color-text: #24364e;
  --color-primary: #d34120;
  /* ... all your theme colors */
}
```

**Important:** Themeable colors must be on `#root`, not `:root`. This allows for nested theme overrides in the future.

### 2. Import CSS

In your main entry file (e.g., `main.tsx` or `index.tsx`):

```typescript
import '@your-org/react-theme-picker/dist/ThemePicker.module.css';
import './tokens.css'; // Your CSS variables
```

### 3. Wrap App with ThemeProvider

```typescript
import { ThemeProvider } from '@your-org/react-theme-picker';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

### 4. Add ThemePicker Component

```typescript
import { ThemePicker } from '@your-org/react-theme-picker';

function App() {
  return (
    <>
      {/* Your app content */}
      <ThemePicker />
    </>
  );
}
```

### 5. Use CSS Variables in Your Components

```css
/* YourComponent.module.css */
.button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: 1px solid var(--color-border);
}
```

---

## Prerequisites

### Required Setup

1. **HTML Structure:** Your app must have a `#root` element:
   ```html
   <div id="root"></div>
   ```

2. **CSS Variables:** All themeable colors must use CSS variables on `#root`

3. **ThemeProvider:** Must wrap your entire app

4. **CSS Import:** Must import the ThemePicker CSS file

### Architecture Requirements

The package assumes:
- CSS variables are defined on `#root` element
- ThemeProvider manages theme state and applies to DOM
- Components use `var(--color-*)` instead of hardcoded colors
- localStorage is available (for theme persistence)

---

## Token Creation & Theme Definition

### Step 1: Define Your Theme Type

Create a `Theme` type that matches your design system:

```typescript
// src/types/theme.ts
export type Theme = {
  // Core colors
  bg: string;                    // Page background
  surface: string;               // Card backgrounds
  surfaceDark: string;           // Dark surfaces
  text: string;                  // Body text
  textDark: string;              // Dark text (headings)
  muted: string;                 // Secondary text
  border: string;                // Borders
  
  // Primary colors
  primary: string;               // Buttons, CTAs
  primaryHover: string;          // Button hover
  primaryContrast: string;       // Text on primary
  link: string;                  // Links
  focus: string;                // Focus rings
  
  // Add your custom colors...
  accent: string;
  footerBg: string;
  // ... etc
};
```

### Step 2: Create Default Theme

```typescript
// src/config/defaultTheme.ts
import type { Theme } from '../types/theme';

export const defaultTheme: Theme = {
  bg: '#ffffff',
  surface: '#f6f7f9',
  surfaceDark: '#1a2332',
  text: '#24364e',
  textDark: '#0b1f33',
  muted: '#555555',
  border: 'rgba(36, 54, 78, 0.25)',
  primary: '#d34120',
  primaryHover: '#e07962',
  primaryContrast: '#ffffff',
  link: '#d34120',
  focus: '#93c5fd',
  accent: '#f5b027',
  footerBg: '#0a1a2a',
  // ... all your colors
};
```

### Step 3: Map Theme Keys to CSS Variables

The package automatically converts camelCase to kebab-case:

- `bg` → `--color-bg`
- `primaryHover` → `--color-primary-hover`
- `surfaceDark` → `--color-surface-dark`

**Custom Mapping (if needed):**

If you need custom CSS variable names, you can override the mapping function:

```typescript
// In your ThemeProvider configuration
const customCssVarMapping = (key: string): string => {
  // Custom logic here
  return `--custom-${key}`;
};
```

### Step 4: Define Color Tokens for ThemePicker

```typescript
// src/config/colorTokens.ts
import type { Theme } from '../types/theme';

type ColorToken = {
  key: keyof Theme;
  label: string;
  cssVar: string;
  category: 'core' | 'primary' | 'accent' | 'gradient' | 'footer' | 'shadows';
  usage?: string;
  isGradient?: boolean;
  gradientPartner?: string;
};

export const colorTokens: ColorToken[] = [
  {
    key: 'bg',
    label: 'Background',
    cssVar: '--color-bg',
    category: 'core',
    usage: 'Page background, section backgrounds'
  },
  {
    key: 'primary',
    label: 'Primary',
    cssVar: '--color-primary',
    category: 'primary',
    usage: 'Buttons, CTAs, main actions'
  },
  // ... add all your theme colors
];
```

---

## Adding Theme Presets

### Method 1: Built-in Presets (Recommended)

Add presets to your ThemeProvider configuration:

```typescript
// src/config/presets.ts
import type { Theme } from '../types/theme';
import { defaultTheme } from './defaultTheme';

export const builtInPresets = [
  {
    id: 'default',
    name: 'Default',
    theme: defaultTheme,
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    theme: {
      ...defaultTheme,
      bg: '#0a0e1a',
      surface: '#141b2d',
      text: '#e8ecf0',
      primary: '#2d6bb8',
      // ... override colors
    },
  },
  {
    id: 'light',
    name: 'Light Mode',
    theme: {
      ...defaultTheme,
      bg: '#ffffff',
      surface: '#f6f7f9',
      text: '#24364e',
      // ... override colors
    },
  },
  // Add more presets...
];
```

### Method 2: Programmatically Add Presets

```typescript
import { useTheme } from '@your-org/react-theme-picker';

function MyComponent() {
  const { savePreset } = useTheme();
  
  const handleSaveCustomPreset = () => {
    const customTheme: Theme = {
      // ... your theme colors
    };
    
    savePreset('my-custom-preset', customTheme);
  };
  
  return <button onClick={handleSaveCustomPreset}>Save Preset</button>;
}
```

### Method 3: Load Presets from API

```typescript
import { useTheme } from '@your-org/react-theme-picker';
import { useEffect } from 'react';

function PresetLoader() {
  const { savePreset } = useTheme();
  
  useEffect(() => {
    // Load presets from your API
    fetch('/api/themes')
      .then(res => res.json())
      .then(presets => {
        presets.forEach((preset: { id: string; name: string; theme: Theme }) => {
          savePreset(preset.name, preset.theme);
        });
      });
  }, [savePreset]);
  
  return null;
}
```

---

## Adding Accessibility Checks

### Understanding Contrast Checks

The package includes WCAG contrast checking. You need to configure which color combinations to check based on your app's usage.

### Step 1: Update Contrast Check Function

```typescript
// src/utils/contrast.ts (or your custom file)
import { 
  getContrastRatio, 
  getContrastLevel, 
  blendColor 
} from '@your-org/react-theme-picker';
import Color from 'color';
import type { Theme } from '../types/theme';

export type ContrastIssue = {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  usage: string;
};

export function checkContrastIssues(theme: Theme): ContrastIssue[] {
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
  
  // Check primary button text
  const primaryContrastRatio = getContrastRatio(theme.primaryContrast, theme.primary);
  if (primaryContrastRatio < 4.5) {
    issues.push({
      pair: 'Primary Contrast on Primary',
      foreground: theme.primaryContrast,
      background: theme.primary,
      ratio: primaryContrastRatio,
      level: getContrastLevel(primaryContrastRatio),
      usage: 'Primary buttons, CTAs, main action buttons',
    });
  }
  
  // Check link on background
  const linkBgRatio = getContrastRatio(theme.link, theme.bg);
  if (linkBgRatio < 4.5) {
    issues.push({
      pair: 'Link on Background',
      foreground: theme.link,
      background: theme.bg,
      ratio: linkBgRatio,
      level: getContrastLevel(linkBgRatio),
      usage: 'Hyperlinks on page background, navigation links',
    });
  }
  
  // Add checks for YOUR specific color combinations
  // Example: Check card text on card background
  const cardTextRatio = getContrastRatio(theme.text, theme.surface);
  if (cardTextRatio < 4.5) {
    issues.push({
      pair: 'Card Text on Card Background',
      foreground: theme.text,
      background: theme.surface,
      ratio: cardTextRatio,
      level: getContrastLevel(cardTextRatio),
      usage: 'Text on card components, feature cards',
    });
  }
  
  // Check semi-transparent colors (blend first)
  const mutedTextWithOpacity = Color(theme.muted).alpha(0.75).hexa();
  const blendedMuted = blendColor(mutedTextWithOpacity, theme.bg);
  const mutedRatio = getContrastRatio(blendedMuted, theme.bg);
  if (mutedRatio < 4.5) {
    issues.push({
      pair: 'Muted Text (75% opacity) on Background',
      foreground: mutedTextWithOpacity,
      background: theme.bg,
      ratio: mutedRatio,
      level: getContrastLevel(mutedRatio),
      usage: 'Secondary text with opacity, placeholder text',
    });
  }
  
  // Check gradients (check both start and end)
  const gradientStartRatio = getContrastRatio(theme.text, theme.heroStart);
  const gradientEndRatio = getContrastRatio(theme.text, theme.heroEnd);
  if (gradientStartRatio < 4.5 || gradientEndRatio < 4.5) {
    issues.push({
      pair: 'Text on Hero Gradient',
      foreground: theme.text,
      background: `gradient(${theme.heroStart} → ${theme.heroEnd})`,
      ratio: Math.min(gradientStartRatio, gradientEndRatio),
      level: getContrastLevel(Math.min(gradientStartRatio, gradientEndRatio)),
      usage: 'Hero section text, homepage headings',
    });
  }
  
  return issues;
}
```

### Step 2: Document Your Color Usage

Create a document mapping colors to usage:

```markdown
# Color Usage Map

## Core Colors
- `bg`: Page background, section backgrounds
- `surface`: Card backgrounds, elevated surfaces
- `text`: Body text, paragraphs
- `textDark`: Headings, emphasized text

## Primary Colors
- `primary`: Primary buttons, main CTAs
- `primaryContrast`: Text on primary buttons (usually white)
- `link`: Hyperlinks, navigation links

## Your Custom Colors
- `cardBg`: Blog card backgrounds
- `cardText`: Text on blog cards
- `headerBg`: Header background when scrolled
```

### Step 3: AI Prompt for Adding Checks (Non-Cursor Users)

If you're not using Cursor/ChatGPT, use this prompt with any AI assistant:

```
I need to add a contrast check for [COLOR_COMBINATION] in my React theme picker.

Context:
- I'm using @your-org/react-theme-picker
- My Theme type has these colors: [LIST YOUR COLORS]
- I need to check if [FOREGROUND_COLOR] on [BACKGROUND_COLOR] meets WCAG AA (4.5:1)

The color combination is used in: [DESCRIBE WHERE IT'S USED]

Please provide:
1. The contrast check code
2. The usage description
3. Any special handling needed (opacity, gradients, etc.)
```

### Step 4: Common Contrast Check Patterns

**Pattern 1: Simple Color on Color**
```typescript
const ratio = getContrastRatio(theme.text, theme.bg);
if (ratio < 4.5) {
  issues.push({
    pair: 'Text on Background',
    foreground: theme.text,
    background: theme.bg,
    ratio,
    level: getContrastLevel(ratio),
    usage: 'Body text on page background',
  });
}
```

**Pattern 2: Semi-Transparent Color**
```typescript
const textWithOpacity = Color(theme.text).alpha(0.75).hexa();
const blended = blendColor(textWithOpacity, theme.bg);
const ratio = getContrastRatio(blended, theme.bg);
if (ratio < 4.5) {
  issues.push({
    pair: 'Text (75% opacity) on Background',
    foreground: textWithOpacity,
    background: theme.bg,
    ratio,
    level: getContrastLevel(ratio),
    usage: 'Secondary text with opacity',
  });
}
```

**Pattern 3: Gradient**
```typescript
const startRatio = getContrastRatio(theme.text, theme.heroStart);
const endRatio = getContrastRatio(theme.text, theme.heroEnd);
if (startRatio < 4.5 || endRatio < 4.5) {
  issues.push({
    pair: 'Text on Hero Gradient',
    foreground: theme.text,
    background: `gradient(${theme.heroStart} → ${theme.heroEnd})`,
    ratio: Math.min(startRatio, endRatio),
    level: getContrastLevel(Math.min(startRatio, endRatio)),
    usage: 'Text on gradient backgrounds',
  });
}
```

---

## Creating Themes from Images

### Step-by-Step Process

1. **Analyze the Image**
   - Identify dominant colors
   - Note color relationships (light/dark, warm/cool)
   - Identify accent colors
   - Note mood/aesthetic

2. **Map Colors to Theme Properties**
   - Background colors → `bg`, `surface`
   - Text colors → `text`, `textDark`
   - Accent colors → `primary`, `accent`
   - Dark areas → `surfaceDark`, `footerBg`

3. **Extract Color Values**
   - Use color picker tool
   - Note hex codes
   - Consider opacity/transparency

4. **Create Theme Object**

```typescript
const imageTheme: Theme = {
  // Background (lightest area in image)
  bg: '#F5F1E8',              // Extracted from image
  surface: '#E8DFD0',         // Slightly darker
  surfaceDark: '#6B4423',     // Dark areas
  
  // Text (darkest areas, readable)
  text: '#2D1B0E',            // Dark brown/black
  textDark: '#1A0F07',        // Very dark
  
  // Primary (main accent color)
  primary: '#8B5A3C',         // Warm brown
  primaryContrast: '#FFFFFF', // White (for contrast)
  
  // Links (slightly different from primary)
  link: '#5A3518',            // Darker brown
  blogLink: '#3D2514',        // Very dark for gradients
  
  // Accents (secondary colors from image)
  accent: '#B8865B',          // Tan
  accentAlt: '#D4A574',       // Light tan
  
  // Footer (darkest areas)
  footerBg: '#3D2514',        // Very dark brown
  
  // ... continue mapping all colors
};
```

5. **Test Contrast Ratios**

```typescript
import { checkContrastIssues } from './utils/contrast';

const issues = checkContrastIssues(imageTheme);
if (issues.length > 0) {
  console.warn('Contrast issues found:', issues);
  // Adjust colors to meet WCAG AA (≥4.5:1)
}
```

6. **Adjust for Accessibility**

If contrast fails, darken light colors or lighten dark colors:

```typescript
// Before: primary: '#FF8C5A' (contrast: 2.13:1 ❌)
// After:  primary: '#B85C2A' (contrast: 4.5:1 ✅)

// Before: link: '#D9774A' (contrast: 3.61:1 ❌)
// After:  link: '#A84F1F' (contrast: 4.5:1 ✅)
```

### AI Prompt for Image-Based Themes

Use this prompt with any AI assistant:

```
I want to create a theme based on this image: [DESCRIBE IMAGE OR PROVIDE IMAGE]

Please:
1. Analyze the color palette
2. Map colors to theme properties (bg, surface, text, primary, etc.)
3. Provide a complete Theme object with hex codes
4. Check contrast ratios and suggest adjustments if needed
5. Name the theme appropriately

My Theme type includes: [LIST YOUR THEME PROPERTIES]
```

### Example: Creating "Sunrise" Theme

**Image Analysis:**
- Sky: Light blue at top, purple in middle, orange at horizon
- Ocean: Deep teal with white foam
- Overall: Coastal sunrise, warm and cool tones

**Theme Mapping:**
```typescript
{
  id: 'sunrise',
  name: 'Sunrise',
  theme: {
    bg: '#E0F4FF',        // Light blue (sky top)
    surface: '#E6D9F0',   // Light purple (sky mid)
    surfaceDark: '#2D5F7A', // Deep teal (ocean)
    text: '#1A3A4A',      // Dark teal (readable)
    primary: '#B85C2A',   // Dark orange (sunset, adjusted for contrast)
    link: '#A84F1F',      // Darker orange (links)
    accent: '#7FB8D4',    // Teal (ocean)
    accentAlt: '#9B7BB8', // Purple (sky)
    // ... etc
  }
}
```

---

## Customization Guide

### Customizing ThemePicker Button Color

The ThemePicker uses fixed colors so it remains visible. To customize:

```css
/* Override in your CSS */
.theme-picker-trigger {
  background: #your-color !important;
  color: #your-text-color !important;
}
```

Or modify the package's `ThemePicker.module.css`:

```css
.trigger {
  background: #d34120; /* Your brand color */
  color: #ffffff;
}
```

### Customizing Color Categories

```typescript
// In your colorTokens configuration
const categoryLabels = {
  core: 'Your Core Colors Label',
  primary: 'Your Primary Colors Label',
  accent: 'Your Accent Colors Label',
  // Add custom categories
  custom: 'Your Custom Category',
};
```

### Customizing CSS Variable Names

If you need different CSS variable naming:

```typescript
// Override the mapping function
function customThemeKeyToCssVar(key: string): string {
  // Your custom logic
  return `--your-prefix-${key}`;
}
```

### Customizing Accessibility Tracking

The contrast checks are fully customizable. See [Adding Accessibility Checks](#adding-accessibility-checks) section.

### Customizing Variable Names

The default mapping is:
- `bg` → `--color-bg`
- `primaryHover` → `--color-primary-hover`

To customize, override the mapping function in your ThemeProvider configuration.

---

## Adapting to Existing Codebases

### Scenario 1: You Already Have CSS Variables

**Step 1:** Map your existing variables to Theme type:

```typescript
// Your existing CSS
:root {
  --background: #ffffff;
  --text-color: #000000;
  --primary: #d34120;
}

// Map to Theme type
const existingTheme: Theme = {
  bg: 'var(--background)',
  text: 'var(--text-color)',
  primary: 'var(--primary)',
  // ... map all
};
```

**Step 2:** Update your CSS to use the new variable names, or create an adapter:

```css
/* Adapter: Map old to new */
#root {
  --color-bg: var(--background);
  --color-text: var(--text-color);
  --color-primary: var(--primary);
}
```

### Scenario 2: You Have a Different Theme System

**Option A:** Create an adapter layer:

```typescript
function adaptYourThemeToPackage(yourTheme: YourThemeType): Theme {
  return {
    bg: yourTheme.background,
    text: yourTheme.textColor,
    primary: yourTheme.primaryColor,
    // ... map all properties
  };
}
```

**Option B:** Extend the Theme type:

```typescript
type YourExtendedTheme = Theme & {
  yourCustomColor: string;
  anotherCustom: string;
};
```

### Scenario 3: You're Using CSS-in-JS

If you're using styled-components, emotion, etc.:

```typescript
// Extract theme values
const { theme } = useTheme();

// Use in styled-components
const Button = styled.button`
  background: ${theme.primary};
  color: ${theme.primaryContrast};
`;
```

Or use CSS variables (recommended):

```typescript
// Apply theme to CSS variables, then use in styled-components
const Button = styled.button`
  background: var(--color-primary);
  color: var(--color-primary-contrast);
`;
```

### Scenario 4: Migrating from Another Theming Library

**From Theme UI:**
```typescript
// Old
import { ThemeProvider as ThemeUIProvider } from 'theme-ui';

// New
import { ThemeProvider } from '@your-org/react-theme-picker';
```

**From Material-UI:**
```typescript
// Old
import { ThemeProvider as MUIProvider } from '@mui/material';

// New
import { ThemeProvider } from '@your-org/react-theme-picker';
// Keep MUI for components, use this for colors
```

---

## Cursor Rules & AI Prompts

### Cursor Rules File

Create `.cursorrules` in your project root:

```markdown
# Theme Picker Integration Rules

## Theme System Architecture

1. **CSS Variables Layer:**
   - Themeable colors defined on `#root` (not `:root`)
   - Format: `--color-{kebab-case-key}`
   - Example: `primaryHover` → `--color-primary-hover`

2. **React State Layer:**
   - ThemeProvider manages theme state
   - useTheme() hook for access
   - localStorage persistence (key: 'user-theme')

3. **Component Usage:**
   - Always use `var(--color-*)` in CSS
   - Never hardcode colors
   - Check contrast ratios for new color combinations

## Adding New Colors

When adding a new color to the theme:
1. Add to Theme type
2. Add to defaultTheme
3. Add CSS variable to tokens.css
4. Add to colorTokens array
5. Add contrast checks if needed
6. Update documentation

## Accessibility

- All color combinations must meet WCAG AA (4.5:1)
- Check both gradient start and end colors
- Blend semi-transparent colors before checking
- Document where each color is used

## Theme Presets

- Built-in presets in ThemeContext.tsx
- Custom presets saved to localStorage
- Presets must include all Theme properties
```

### AI Prompts for Common Tasks

**Adding a New Color:**
```
I need to add a new color "[COLOR_NAME]" to my theme system.

Current Theme type: [PASTE YOUR THEME TYPE]
Current defaultTheme: [PASTE YOUR DEFAULT THEME]

The color will be used for: [DESCRIBE USAGE]
CSS variable name should be: --color-[kebab-case]

Please:
1. Update the Theme type
2. Add to defaultTheme
3. Add CSS variable definition
4. Add to colorTokens array
5. Add contrast check if needed
```

**Fixing Contrast Issues:**
```
I have a contrast issue: [DESCRIBE THE ISSUE]

Current colors:
- Foreground: [COLOR]
- Background: [COLOR]
- Current ratio: [RATIO]
- Required: ≥4.5:1

Please suggest a fix that:
1. Maintains the aesthetic
2. Meets WCAG AA
3. Provides the adjusted color values
```

**Creating a Theme from Image:**
```
Create a theme based on this image: [DESCRIBE IMAGE]

My Theme type: [PASTE YOUR THEME TYPE]

Please:
1. Analyze the color palette
2. Map colors to theme properties
3. Provide complete Theme object
4. Check contrast and adjust if needed
5. Suggest a theme name
```

---

## API Reference

### ThemeProvider

```typescript
<ThemeProvider
  defaultTheme?: Theme
  storageKey?: string
  presets?: Preset[]
>
  {children}
</ThemeProvider>
```

**Props:**
- `defaultTheme?: Theme` - Initial theme (optional)
- `storageKey?: string` - localStorage key (default: 'user-theme')
- `presets?: Preset[]` - Custom presets (optional)

### useTheme Hook

```typescript
const {
  theme,           // Current theme object
  updateTheme,     // (updates: Partial<Theme>) => void
  resetTheme,      // () => void
  exportTheme,     // () => string (JSON)
  importTheme,     // (json: string) => void
  presets,         // Preset[]
  savePreset,      // (name: string, theme?: Theme) => void
  loadPreset,      // (id: string) => void
  deletePreset,    // (id: string) => void
} = useTheme();
```

### ThemePicker Component

```typescript
<ThemePicker
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  customColorTokens?: ColorToken[]
  customCategoryLabels?: Record<string, string>
/>
```

**Props:**
- `position?: string` - Picker button position
- `customColorTokens?: ColorToken[]` - Override default tokens
- `customCategoryLabels?: Record<string, string>` - Override category labels

### Contrast Utilities

```typescript
import {
  getContrastRatio,
  getContrastLevel,
  checkContrastIssues,
  blendColor,
} from '@your-org/react-theme-picker';

// Calculate contrast ratio (1-21)
const ratio = getContrastRatio('#000000', '#ffffff'); // 21:1

// Get WCAG level
const level = getContrastLevel(ratio); // 'AAA' | 'AA' | 'Fail'

// Check all issues
const issues = checkContrastIssues(theme);

// Blend semi-transparent color
const blended = blendColor('rgba(0,0,0,0.5)', '#ffffff');
```

---

## Troubleshooting

### Theme Not Applying

**Check:**
1. Is `ThemeProvider` wrapping your app?
2. Does `#root` element exist?
3. Are CSS variables defined on `#root`?
4. Are you using `var(--color-*)` in CSS?

### Colors Not Updating

**Check:**
1. Are you using CSS variables or hardcoded colors?
2. Is the CSS variable name correct?
3. Check browser DevTools → Elements → `#root` → Computed styles

### Contrast Warnings Not Showing

**Check:**
1. Is `checkContrastIssues()` configured?
2. Are all color combinations checked?
3. Check console for errors

### Presets Not Persisting

**Check:**
1. Is localStorage available?
2. Check `localStorage.getItem('theme-presets')`
3. Are custom presets being saved correctly?

---

## Additional Resources

- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [React Context API](https://react.dev/reference/react/useContext)

---

**Package Version:** 1.0.0  
**Last Updated:** January 2026  
**Maintained by:** [Your Name/Org]  
**Related Documentation:**
- `docs/THEME_PICKER_NPM_PACKAGE_PLAN.md` - Extraction plan
- `docs/COLOR_PICKER_INTEGRATION.md` - Integration reference
- `src/design/theming-goals.md` - Architecture overview

