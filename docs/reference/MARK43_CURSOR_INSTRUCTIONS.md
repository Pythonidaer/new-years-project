# Mark43 Homepage Recreation (Pixel-Identical First) — Cursor Instructions

> **Note:** This is a historical reference document from the initial project setup. The homepage has been completed. See `docs/workflow/SCALABLE_CURSOR_WEBSITE_REBUILD_WORKFLOW.md` for the general methodology used.

## Goal
Recreate the **Mark43 homepage** as a **pixel-identical** implementation first (using the provided screenshots + CSS references), then iterate to “close enough” improvements once the baseline match is achieved.

**Stack**
- Vite + React + TypeScript
- CSS Modules (component-scoped) + a small set of global tokens
- lucide-react for icons (only as a replacement when the original icon source is unavailable)

---

## How to use this repo
You will find:
- **`src/design/tokens.css`**: design tokens derived from DevTools computed styles (fonts, base sizing, button colors, etc.)
- **`src/design/globals.css`**: global resets + base typography
- **`src/components/`**: reusable UI components (Button, Icon, etc.)
- **`src/layout/`**: layout primitives (Container, Section)
- **`src/pages/Home.tsx`**: homepage composition
- **`reference/urls.md`**: canonical CSS URLs (Punch theme + Mark43 theme + Google font)
- **`reference/tokens.json`**: copied computed values and extracted color notes
- **Screenshots/PDF** (provided externally): visual ground truth for pixel matching

### Why CSS Modules (not Tailwind) for this project
- The target site is CSS-heavy (WP theme + shortcodes + sliders). CSS Modules let us:
  - replicate exact rules more directly,
  - keep styles co-located with components,
  - avoid time spent “translating” into Tailwind utilities,
  - match specific hover/animation behaviors precisely.

---

## Pixel-identical workflow (required)
### Step 1 — Lock in global typography + layout baseline
1. Ensure Archivo is loaded in `index.html`.
2. Ensure `src/design/tokens.css` defines:
   - body `font-size: 18px`
   - body `line-height: 28.8px`
   - base font family `Archivo, sans-serif`
3. Ensure global `box-sizing: border-box` and `overflow-x: hidden`.

**Pixel check**
- Body text should “sit” like the screenshots (line height and rhythm matter).
- If heading spacing looks off, fix global line-height / letter-spacing first.

### Step 2 — Build sections in this order (top-down)
Implement the full homepage in stable blocks so the pixel diffs are localized:

1. **Top banner** (red announcement bar + close button)
2. **Header / Nav** (logo left, nav center, CTA right, sticky behavior if present)
3. **Hero** (big H1 + highlighted word + subtitle + CTA)
4. **Hero image strip / continuous hover-pause carousel**
5. **“One platform…” section** (framed text block)
6. **4 product cards grid**
7. **Agency logos carousel** (dots pagination)
8. **Why Mark43 / accordion + image**
9. **Video + quote “Customer spotlights”**
10. **Latest news cards grid**
11. **Blue feature banner (SECOND TO NONE)**
12. **Footer mega menu**

For each section:
- create a folder in `src/sections/<SectionName>/`
- add:
  - `index.tsx`
  - `SectionName.module.css`
- wire into `src/pages/Home.tsx`

**Rule**
- Prefer semantic HTML + minimal wrappers. Only add wrapper divs when required for layout.

### Step 3 — Use placeholders now (text + images)
**Text**
- Use the same text content as the homepage where possible.
- If content is missing, use placeholder text with the same line breaks and approximate lengths.

**Images**
- For now, use local placeholder images or solid color blocks with the correct aspect ratios.
- Preserve the correct sizes and border radii first; swap real images later.

---

## Carousels/sliders (what components these are)
Based on your description + screenshots, there are two distinct patterns:

### A) Continuous marquee / “auto-scrolling strip” (pause on hover)
Checklist:
- [ ] horizontal list of cards/images
- [ ] continuously translating left (CSS animation or requestAnimationFrame loop)
- [ ] on hover: pause animation (or pause rAF)
- [ ] loops seamlessly (duplicate children for wrap-around)
- [ ] touch/trackpad should not feel like a “drag slider” — it’s mainly an auto-marquee

Implementation guidance:
- Use CSS keyframes if you can (simpler + smooth).
- Duplicate the image list so it wraps without visible gaps.

### B) Drag-enabled slider with dots + inertia (“grab cursor”)
Checklist:
- [ ] “grab/grabbing” cursor while interacting
- [ ] draggable track with momentum/inertia
- [ ] snaps to slides after drag
- [ ] pagination dots
- [ ] can “flick” multiple slides with strong swipe
- [ ] typically a library like Flickity/Swiper/Embla

**Strong signal from your CSS:** `ep-flickity-sliders.css`
- That likely indicates **Flickity** (or a Flickity-based implementation).

Implementation guidance:
- For pixel-identical matching quickly: use a library with momentum + snap.
  - Recommended: **Embla Carousel** (lightweight) or **Swiper** (full-featured).
- If you want to stay closest to Flickity behavior, Embla configured with dragFree + snap is usually close.

---

## Icons: `fa-fontello` or `mark43-icons` — what it means
### What those identifiers usually indicate
- **`fa-fontello`** often indicates a **Fontello**-generated icon font (or Font Awesome + Fontello styles).
- **`mark43-icons`** often indicates a **custom icon font** (generated from SVGs and served as `woff/woff2`), or custom CSS mapping like `.icon-x:before { content: "\e900"; }`.

### What to do for this project
Pixel-identical icons require the **same icon font files** or **same SVG assets**.
If those files are not easily available, do this:

1. For the pixel-identical pass:
   - Replace missing icons with **lucide-react** equivalents,
   - match size, stroke weight, and color to the screenshot,
   - keep the same layout spacing so pixels match overall.

2. If you later find the icon font URLs in DevTools:
   - download the `woff2/woff` files,
   - add them to `src/assets/fonts/`,
   - define them via `@font-face` in `tokens.css` or `globals.css`,
   - keep `lucide-react` only as fallback.

---

## Punch Theme vs Mark43 theme CSS URLs — should we copy into files?
### Short answer
**URLs alone are not enough for Cursor** unless Cursor is explicitly fetching remote content in your environment.  
For reliability and pixel-identical matching, **download the CSS and store it in `reference/`**.

### Recommended approach (best for Cursor)
1. Keep the URLs in `reference/urls.md` (already done)
2. **Download each CSS file** into `reference/css/` and commit it.
3. In Cursor, instruct: “Use reference/css as ground truth for style rules.”

### Why
- Cursor works best when the full CSS content is available locally for:
  - searching selectors,
  - extracting variables,
  - mapping to component modules,
  - avoiding network or auth/caching issues.

---

## Download the CSS locally (commands)
Run these from the repo root:

```bash
mkdir -p reference/css
```

Then download (example pattern — repeat for all URLs):

```bash
curl -L "https://mark43.com/wp-content/themes/punch/assets/css/grid.css?ver=1.0.97-alpha" -o "reference/css/punch-grid.css"
curl -L "https://mark43.com/wp-content/themes/punch/assets/css/base.css?ver=1.0.97-alpha" -o "reference/css/punch-base.css"
curl -L "https://mark43.com/wp-content/themes/punch/assets/css/layout.css?ver=1.0.97-alpha" -o "reference/css/punch-layout.css"
curl -L "https://mark43.com/wp-content/themes/punch/assets/css/ep-flickity-sliders.css?ver=1.0.94" -o "reference/css/punch-ep-flickity-sliders.css"
curl -L "https://mark43.com/wp-content/themes/mark43/assets/css/main.css?ver=20.87" -o "reference/css/mark43-main.css"
curl -L "https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" -o "reference/css/google-archivo.css"
```

**After downloading:**
- Search for:
  - CSS variables (`--something`)
  - repeated colors (primary blue, orange, dark navy)
  - typography scale (h1/h2/h3 sizes)
  - spacing utilities / grid system

---

## Mapping WP theme CSS to React components
Do **not** port everything. Port only what’s needed for the homepage.

### Process per section
1. Inspect the section in DevTools, identify:
   - the top-level wrapper class
   - the key layout class (grid/flex)
   - the key typographic class (heading/text)
2. Find those selectors in `reference/css/*.css`
3. Copy the minimal set of rules into:
   - `tokens.css` if it’s a global primitive (color, font-size scale, spacing scale)
   - the section’s `.module.css` if it’s section-specific layout or styling

**Rule of thumb**
- If a value appears 3+ times across sections -> make it a token.

---

## “Close enough” phase (after pixel baseline)
Once each section matches the screenshots:
- replace placeholder images with real assets
- replace placeholder copy with exact copy
- remove unused CSS rules
- consolidate repeated styles into reusable components (Card, Carousel, Tabs)

---

## Acceptance checklist (pixel-identical)
- [ ] Body: Archivo 18px / 28.8px line-height
- [ ] H1: ~83px size, ~94.62px line-height, bold weight (from computed styles)
- [ ] Primary button:
  - bg: rgb(211, 65, 32)
  - hover bg: rgb(224, 121, 98)
  - radius: 2px
  - uppercase + letter-spacing: 1.6px
  - padding ~ 13px top / 12px bottom / 15px left-right
- [ ] Major section widths align (container max widths match screenshot)
- [ ] Carousels behave correctly (hover pause, drag inertia, dots)
- [ ] Footer layout matches columns + spacing

---

## Cursor prompt (paste this into Cursor)
> You are recreating the Mark43 homepage pixel-identically using React + TypeScript + Vite.  
> Use CSS Modules for each section in `src/sections/*` and global tokens in `src/design/tokens.css`.  
> Treat `reference/css/*` (downloaded from the URLs in `reference/urls.md`) as the ground truth for selectors, colors, typography, spacing, and slider behaviors.  
> Implement the homepage sections in the exact order defined in this document.  
> Use placeholder images and placeholder copy only when exact assets are missing, but preserve sizing, spacing, and layout.  
> For sliders: implement (A) a continuous marquee that pauses on hover and loops seamlessly, and (B) a drag slider with inertia + snap + dots (Flickity-like).  
> Use lucide-react icons as temporary replacements if the original icon font cannot be reproduced.  
> Start by ensuring the global typography and tokens match computed styles, then build each section with a matching layout and spacing.
> All text should be lorem ipsum/placeholder

