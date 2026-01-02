# Scalable Workflow: Recreating Any Production Website with AI + Cursor

This document describes a **repeatable, scalable method** for recreating any modern production website using screenshots, public assets, browser inspection, and AI-driven tooling (ChatGPT + Cursor).  
The goal is to move from *zero code* to a **pixel-accurate implementation**, then iterate toward “close enough” or customized designs.

This process is framework-agnostic and can be adapted to any frontend stack.

---

## 1. Capture Visual Ground Truth (Screenshots)

**What we did:**  
We captured full-page and section-level screenshots of the target website before writing any code.

**Why this matters:**  
Screenshots define *layout intent* when code and components are unknown or proprietary. They let you visually decompose the page into sections and components even when the underlying implementation varies.

**How to do it:**
- Full-page desktop screenshot
- Individual screenshots per major section (hero, cards, footer, etc.)
- Optional: tablet/mobile breakpoints

**Result:**  
A visual checklist of sections and components to build, regardless of how the site is implemented internally.

---

## 2. Collect Public CSS as Read-Only Reference (Critical Efficiency Step)

**What we did:**  
We downloaded all publicly accessible CSS files used by the site and stored them locally as reference-only files.

**Why this matters:**  
Having CSS locally allows AI tools (and you) to:
- search selectors and patterns instantly
- understand grid systems, spacing, and overrides
- avoid relying on live URLs that may change or fail to load

These files are **never imported** into the new project. They act as a *specification*, not dependencies.

**How to do it (example using `curl`):**
```bash
mkdir -p reference/css

curl -L "https://example.com/path/to/theme.css" \
  -o "reference/css/theme.css"

curl -L "https://example.com/path/to/overrides.css" \
  -o "reference/css/brand-overrides.css"
```

Repeat for all relevant CSS URLs found in DevTools → Network → CSS.

**Result:**  
A local, searchable source of truth for layout rules, typography, colors, and components.

---

## 3. Extract Computed Styles from DevTools

**What we did:**  
We used browser DevTools to copy **Computed styles** from key elements.

**Why this matters:**  
Computed styles reveal the *actual values* used by the browser after all CSS is applied, eliminating guesswork.

**Typical elements to inspect (varies by site):**
- `body` (font family, base font size, line height)
- Primary headings (`h1`, `h2`)
- Primary buttons (default / hover / focus)
- Card or tile containers
- Section wrappers (padding, background behavior)
- Navigation containers

**Result:**  
Concrete design tokens (font sizes, spacing, colors) that can be reimplemented exactly.

---

## 4. Choose Your Stack (Deliberately)

**What we did:**  
We explicitly chose our tooling instead of trying to match the original stack.

**Why this matters:**  
You are recreating *behavior and appearance*, not the original architecture.

**Examples (choose freely):**
- Framework: React, Vue, Svelte, plain JavaScript
- Build tool: Vite, Webpack, Next.js, etc.
- Styling: CSS Modules, Tailwind, Styled Components
- Testing: Vitest, Jest, Playwright

The process works regardless of these choices.

**Result:**  
A clean, modern project tailored to your needs, not constrained by the original site.

---

## 5. Create a Single Instruction File for AI

**What we did:**  
We created **one authoritative instruction file** that tells Cursor exactly what to do and what not to do.

**Why this matters:**  
Multiple instruction sources cause AI drift. One file enforces clarity and prevents overengineering.

**File name:**  
This can be anything relevant, for example:
- `EXAMPLE_CURSOR_INSTRUCTIONS.md`
- `SITE_REBUILD_INSTRUCTIONS.md`

**Contents should include:**
- Scope (e.g., entire homepage)
- Priority (pixel-identical first, then iterate)
- Chosen stack (framework, CSS approach)
- Rules (do not import reference CSS, no redesign)
- Debugging expectations (diagnose before fixing)

**Result:**  
AI operates with clear authority and predictable behavior.

---

## 6. Use Screenshots + AI to Derive Components

**What we did:**  
We used screenshots and page structure with AI assistance to identify components.

**Why this matters:**  
Component structure varies across sites. Screenshots reveal *what exists* even when markup differs.

**Typical outcome:**
- Header / navigation
- Hero section
- Content sections
- Carousels or sliders
- Card grids
- Footer

**Result:**  
A component inventory driven by visuals, not assumptions.

---

## 7. Debug Layout Issues Systematically

**What we did:**  
We debugged layout issues by inspecting layout context instead of guessing.

**Why this matters:**  
Most layout bugs stem from:
- parent `flex` or `grid` behavior
- incorrect full-width vs constrained containers
- misplaced alignment rules

**Debug process:**
1. Screenshot the issue
2. Inspect ancestor elements in DevTools
3. Identify layout context (`flex`, `grid`, `position`)
4. Remove the root cause
5. Verify via Computed styles

**Result:**  
Stable layouts that match design intent.

---

## 8. Iterate from Pixel-Identical to “Close Enough”

**What we did:**  
We built pixel-identical first, then allowed iteration.

**Why this matters:**  
Exact replication builds accuracy. Relaxing later is easy; tightening later is costly.

**Result:**  
A faithful recreation that can evolve into a customized implementation.

---

## Summary

Using only:
- screenshots
- public CSS
- computed styles
- deliberate tooling choices
- one clear instruction file

You can recreate virtually any modern website and offload most implementation work to AI tools like Cursor—without access to private repos or design files.

This workflow is reusable, scalable, and stack-independent.
