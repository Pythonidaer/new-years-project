# React + CSS Modules Theming Gameplan

## High-level Summary
This document outlines a **proper React theming architecture** for a Vite + React project using **CSS Modules only**, with:
- Centralized, semantic CSS tokens
- User-customizable themes (saved locally)
- Future-proof **theme overrides** for sub-apps or embedded widgets
- Zero database required

The core principle:
> **CSS variables do the styling. React manages the data.**

---

## Core Goals
- Change site-wide colors from a single place
- Avoid hard-coded colors in components
- Support user-controlled themes (via color picker)
- Allow future sections of the app to override styles safely
- Keep components dumb and reusable

---

## Key Architectural Decisions

### 1. Semantic Tokens (not raw colors)
Do **not** theme using color names like `blue-500`.

Instead, define **meaning-based tokens**:
- `--color-bg`
- `--color-surface`
- `--color-text`
- `--color-muted`
- `--color-border`
- `--color-primary`
- `--color-primary-contrast`
- `--color-link`
- `--color-focus`

These tokens form the **contract** between design and implementation.

---

### 2. CSS Variables as the Styling Layer
All actual styling happens via CSS variables.

**tokens.css**
```css
#root {
  --color-bg: #ffffff;
  --color-surface: #f6f7f9;
  --color-text: #111111;
  --color-muted: #555555;
  --color-border: #dddddd;

  --color-primary: #2563eb;
  --color-primary-contrast: #ffffff;
  --color-link: #2563eb;
  --color-focus: #93c5fd;
}
```

**CSS Modules**
```css
.button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: 1px solid var(--color-border);
}
```

After refactor, **most CSS files should contain zero hex values**.

---

## React Theme System

### 3. Theme Data Model
Themes are plain objects in React.

```ts
type Theme = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryContrast: string;
  link: string;
  focus: string;
};
```

---

### 4. ThemeProvider Responsibilities
The ThemeProvider:
- Owns the current theme state
- Loads/saves theme to `localStorage`
- Applies CSS variables to the DOM
- Supports **nested overrides**

**Key rule**
- Global provider → user-controlled + persisted
- Override provider → developer-controlled + non-persistent

---

### 5. Applying Theme to the DOM
Instead of `:root`, apply variables to `#root`.

Why:
- Safer
- Supports nested overrides
- Future embedding-friendly

```ts
document.getElementById("root")!.style.setProperty("--color-bg", theme.bg);
```

---

## Theme Override Strategy (Future-proofing)

### 6. Nested ThemeProviders
You can override styles for a subtree without affecting the rest of the site.

```tsx
<ThemeProvider
  scope="override"
  target="wrapper"
  overrides={{ bg: "#0b0b0c", text: "#f5f5f6" }}
>
  <Widget />
</ThemeProvider>
```

This enables:
- Embedded apps
- Special sections
- Experiments
- Brand variations

---

## User Theme Customization

### 7. Color Picker Flow
- User selects a color
- React updates theme state
- ThemeProvider updates CSS variables
- Theme saved to `localStorage`
- UI updates instantly

```tsx
updateTheme({ primary: "#ff6600" });
```

No props drilling. No rerenders for style logic.

---

## CSS Refactor Checklist

### 8. What to Search For
- `#`, `rgb(`, `hsl(`
- `box-shadow`
- `border`, `outline`
- Inline styles
- SVG `fill` / `stroke`

### 9. Common Gotchas
- SVGs with hardcoded colors → use `currentColor`
- Shadows need tokens too
- Focus rings often forgotten
- Gradients contain multiple colors

---

## What “Good” Looks Like
- Components never import colors
- CSS Modules only reference `var(--token)`
- One global theme provider
- Optional nested overrides
- One place to change branding

---

## Optional Enhancements
- Theme presets
- Auto contrast calculation
- Light/dark mode toggle
- Export/import theme JSON

---

## Mental Model (TL;DR)
- **CSS variables = rendering**
- **React context = state**
- **Semantic tokens = scalability**
- **Overrides = future-proofing**

This architecture scales cleanly from a blog to a complex app.
