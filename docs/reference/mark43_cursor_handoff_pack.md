# Mark43 Homepage Recreation — Cursor Handoff Pack (React + TypeScript)

> **Note:** This is a historical reference document from the initial project setup. The homepage has been completed. See `docs/workflow/SCALABLE_CURSOR_WEBSITE_REBUILD_WORKFLOW.md` for the general methodology used.

## Recommendation: CSS Modules (with tokens) over Tailwind
For this project, **CSS Modules** is the most efficient path to a faithful recreation because:

- You already have the site’s styling expressed as **real CSS files** (Punch theme CSS + Mark43 `main.css`), which maps directly to “inspect → copy values → implement rules.”
- Many of the “feel” details (spacing presets, breakpoints, hover/focus states, component-specific rules) are easier to reproduce **verbatim** in CSS than to translate into Tailwind utilities.
- You can still stay scalable: put the “system” in **CSS variables + a few layout primitives**, and keep section styling scoped via Modules.

If you’re already very fast with Tailwind: Tailwind is viable, but expect extra time **translating** (not copying) rules like gradients/overlays/arc decorations, complex components (mega menu, marquees, carousels), and specific type/spacing scales.

**Best hybrid:**  
- Use **CSS Modules + CSS variables** as the core.  
- Optional: use Tailwind only for quick layout scaffolding *after* tokens are finalized (but don’t mix heavily unless you’re disciplined).

---

## What you already have (primary sources)
### Theme + site CSS (from view-source)
The site loads Punch framework CSS and Mark43’s site CSS (`main.css`). fileciteturn0file0L43-L63 fileciteturn0file0L80-L82

### Fonts
Primary font is **Archivo** via Google Fonts. fileciteturn0file0L79-L81

### Icon fonts
The page defines icon-font faces for `fa-fontello` (theme) and `mark43-icons` (custom). fileciteturn0file0L332-L349  
**Plan:** use SVG icons (Lucide) instead of trying to replicate glyph fonts.

### Breakpoint hint
Custom CSS uses a breakpoint around **990px** (desktop/mobile boundary). fileciteturn0file0L163-L167 fileciteturn0file0L254-L266

---

## Cursor Handoff Pack: required folder + files
Create a `reference/` folder at the repo root:

```
reference/
  view-source/
    Mark43WebpageViewsource.pdf
  urls.md
  tokens.json
  notes.md
  screenshots/
    01-hero.png
    02-marquee.png
    03-platform-intro.png
    04-platform-cards.png
    05-trusted-by-carousel.png
    06-why-mark43-tabs.png
    07-ai-feature.png
    08-customer-spotlight.png
    09-latest-news.png
    10-campaign-banner.png
    11-footer.png
```

### 1) `reference/urls.md`
Paste **all URLs** you collected (exactly as you did). Group them:

- Homepage URL
- Punch theme CSS URLs
- Mark43 `main.css` URL
- Google Font URL (Archivo)
- Any carousel library you detect (e.g., Flickity/Embla/Swiper)
- Any video provider links (Vimeo embed page/iframe src)

### 2) `reference/tokens.json` (the single source of truth)
Populate from DevTools **Computed** values for:
- `:root` / `html` (variables if present)
- `body` (font stack, base size, line-height, text color)
- `h1` (hero), `h2` (section headers)
- primary button (default/hover/focus)
- card container (border, radius, shadow)
- section spacing (padding top/bottom)

Suggested structure:

```json
{
  "font": {
    "family": "Archivo, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "baseSize": "16px",
    "baseLineHeight": "24px"
  },
  "colors": {
    "textPrimary": "#...",
    "textMuted": "#...",
    "bgPage": "#...",
    "bgSectionAlt": "#...",
    "brandOrange": "#...",
    "brandBlue": "#...",
    "borderSubtle": "#..."
  },
  "radii": {
    "card": "12px",
    "button": "4px"
  },
  "shadows": {
    "card": "0 10px 30px rgba(0,0,0,0.12)"
  },
  "layout": {
    "containerMax": "1200px",
    "containerPadMobile": "16px",
    "containerPadDesktop": "24px",
    "navBreakpoint": "990px",
    "sectionPadYSm": "64px",
    "sectionPadYMd": "96px",
    "sectionPadYLg": "128px"
  }
}
```

### 3) `reference/notes.md` (component + behavior spec)
Use this format:

- **Header**
  - transparent → solid on scroll? (yes/no)
  - mega menu open: hover/click, close: outside/esc
  - CTA button styles
- **Hero**
  - background overlay (gradient, blur, arcs)
  - marquee strip (auto-scroll, pause on hover)
- **Trusted By**
  - carousel type: drag + inertia + dots
- **Why Mark43**
  - tab/accordion behavior, transitions
- **AI Feature**
  - device mock + floating cards (static/animated)
- **Customer Spotlight**
  - Vimeo embed + quote slider sync
- **Latest News**
  - hover effects, responsive columns
- **Campaign Banner**
  - split banner + overlay callout card
- **Footer**
  - columns, CTA, social icons

### 4) `reference/screenshots/`
You already captured the key sections—keep naming consistent so Cursor can follow “01…11” order.

---

## React project layout (recommended)
```
src/
  design/
    tokens.css            // CSS variables generated from tokens.json
    globals.css           // reset + base typography
  layout/
    Container.tsx
    Section.tsx
    Stack.tsx
    Grid.tsx
  components/
    header/
      Header.tsx
      MegaMenu.tsx
      MobileMenu.tsx
    Hero.tsx
    MarqueeGallery.tsx
    PlatformIntroCard.tsx
    PlatformCards.tsx
    TrustedByCarousel.tsx
    WhyMark43Tabs.tsx
    FeatureSplitAI.tsx
    CustomerSpotlight.tsx
    LatestNews.tsx
    CampaignBanner.tsx
    Footer.tsx
  pages/
    Home.tsx
```

---

## Carousel components: implementation recommendation
You described 3 distinct patterns:

1) **Marquee / ticker** (auto-scroll, pause on hover)  
   - Implement with CSS animation + duplicated items for infinite effect.

2) **Drag + inertia + dots** (trusted-by carousel)  
   - Use **Embla Carousel** (recommended) for the “fling” feel.

3) **Arrows / slider** (customer spotlight quote/video)  
   - Embla again, possibly with “selected index” controlling quote/video.

If you prefer matching their stack, Punch includes Flickity styling. fileciteturn0file0L49-L61  
But in React, Embla is typically faster + cleaner.

---

## Icon strategy (Lucide)
Use Lucide for all icons:
- Create `src/components/Icon.tsx` wrapper so you can standardize size/color/stroke and swap sets later.
- Replace font icons (`fa-fontello`, `mark43-icons`) with Lucide equivalents.

Lucide: https://lucide.dev/icons/

---

## Cursor prompt template (copy/paste)
Paste this as your “build instructions” in Cursor:

> Build a React + TypeScript homepage that visually matches the Mark43 screenshots in `reference/screenshots/`.
> Use design tokens from `reference/tokens.json` and implement them as CSS variables in `src/design/tokens.css`.
> Use CSS Modules for component styling (one module per component).
> Implement these components: Header (mega menu + mobile menu), Hero (background overlay + marquee gallery), Platform section (intro card + 4 cards), TrustedByCarousel (drag + inertia + dots), WhyMark43Tabs (tabs/accordion on mobile), AI Feature split section, CustomerSpotlight (Vimeo embed + quote slider), LatestNews grid, CampaignBanner split, Footer.
> Use Lucide icons via a shared Icon wrapper.
> For carousels: implement marquee with CSS animation; implement drag/inertia carousels with Embla.
> Match spacing, typography, border radii, shadows, and hover/focus states per tokens and screenshots.

---

## “10-minute repeatable extraction” checklist (for future sites)
1) Save view-source HTML/PDF
2) Network tab: export CSS/JS URLs list (stylesheets + carousel libs)
3) Compute tokens from 6 elements: `:root`, `body`, `h1`, `h2`, primary button, card
4) Capture breakpoints (nav switch, grid changes)
5) Screenshot each section (numbered)
6) Write notes for: menus, carousels, embeds, hover/focus, responsive behavior
7) Drop everything into `reference/` using the same structure

---

## What I still need from you (to finalize tokens guidance)
Paste these (as plain text) after you generate them from DevTools:
- Computed values for: `body`, `h1`, primary button (default/hover/focus), a card container, and a section wrapper (padding).
- Container max-width (from inspecting the main wrapper).
