# Johnny H. Portfolio Website

A modern portfolio website built with React, TypeScript, and Vite, featuring a blog system, dynamic theming, and SEO optimization.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **CSS Modules** for styling
- **Custom theming system** with CSS variables
- **Custom meta tags system** (React 19 compatible, no dependencies)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## TODO: Lighthouse 100 Score & SEO Optimization

### ✅ Completed
- [x] Custom meta tags system implemented (React 19 compatible)
- [x] Dynamic meta tags for all pages (Home, Blog, BlogPost, Tag)
- [x] Open Graph tags for social sharing
- [x] Twitter Card tags
- [x] Canonical URLs
- [x] Robots meta tags

### 📋 Remaining Tasks

#### 1. Add Default Social Sharing Image
**Location:** `public/` directory  
**Requirements:**
- Image size: **1200x630px** (recommended for Open Graph)
- Format: PNG or JPG
- Filename: `og-default.png` or `og-default.jpg`
- Content: Should represent your brand/portfolio (e.g., logo + tagline, or a professional headshot with branding)

**Implementation:**
- Add the image to `public/og-default.png`
- Update `src/pages/Home.tsx` and `src/pages/Blog.tsx` to include `image="/og-default.png"` in the `MetaTags` component
- This will be used as fallback when individual blog posts don't have images

**Example:**
```tsx
<MetaTags
  title="Johnny H. | Software Engineer & Developer"
  description="..."
  image="/og-default.png"  // Add this
  url="/"
  type="website"
/>
```

#### 2. Verify All Images Have Alt Text
**Check these components/files:**
- [x] `src/pages/BlogPost.tsx` - Featured blog post image (uses post.title as alt) ✅ Verified
- [x] `src/sections/FeaturedBlogPost/index.tsx` - Featured post image (uses post.title as alt) ✅ Verified
- [x] `src/sections/LatestBlogs/index.tsx` - Blog post thumbnails (uses post.title as alt) ✅ Verified
- [x] `src/sections/BlogGrid/index.tsx` - Grid post images (uses post.title as alt) ✅ Verified
- [x] `src/sections/HeroMarquee/index.tsx` - Marquee images (uses item.alt property) ✅ Verified
- [x] `src/sections/PlatformIntro/index.tsx` - Experience logos (uses card.alt property) ✅ Verified
- [x] `src/sections/AgencyLogos/index.tsx` - Technology icons (uses tech.name as alt) ✅ Verified
- [x] `src/sections/FeatureAccordion/index.tsx` - Accordion images (uses activeItem.imageLabel as alt) ✅ Verified
- [x] `src/sections/CampaignBanner/index.tsx` - Profile image (uses "Jonathan Hammond" as alt) ✅ Verified

**Status:** All images have meaningful alt text using descriptive content (post titles, item labels, names).

#### 3. Test Social Media Sharing
After deploying or using a public URL, test with these tools:

**Facebook & LinkedIn:**
- URL: https://developers.facebook.com/tools/debug/
- Enter your page URL
- Click "Scrape Again" to refresh cache
- Verify: Title, description, and image display correctly

**Twitter/X:**
- URL: https://cards-dev.twitter.com/validator
- Enter your page URL
- Verify: Card preview shows correct title, description, and image

**LinkedIn:**
- URL: https://www.linkedin.com/post-inspector/
- Enter your page URL
- Verify: Preview shows correct information

**Test Pages:**
- [ ] Home page (`/`)
- [ ] Blog listing (`/resources/blog`)
- [ ] Individual blog post (`/resources/blog/[slug]`)
- [ ] Tag page (`/resources/tag/[categoryName]`)

#### 4. Additional Lighthouse Optimizations
- [ ] **Performance:**
  - Optimize images (compress, use WebP format where possible)
  - Ensure lazy loading is enabled on below-the-fold images (already implemented)
  - Check Core Web Vitals (LCP, FID, CLS)

- [ ] **Accessibility:**
  - [x] Verify color contrast ratios meet WCAG AA standards (theming system handles this with real-time warnings)
  - [x] Ensure all interactive elements have proper focus states (ThemePicker and all components have focus states)
  - [ ] Test keyboard navigation
  - [ ] Verify ARIA labels where needed

- [ ] **Best Practices:**
  - Ensure HTTPS is enabled (production)
  - Verify no console errors
  - Check for deprecated APIs

- [ ] **SEO:**
  - Verify structured data (JSON-LD) if needed for blog posts
  - Ensure proper heading hierarchy (h1 → h2 → h3)
  - Check mobile-friendliness
  - Verify sitemap.xml (if needed)

#### 5. Production Checklist
Before going live:
- [ ] Update `index.html` default title/description if needed
- [ ] Set production base URL in meta tags (if using absolute URLs)
- [ ] Test all meta tags on actual deployed URL (not localhost)
- [ ] Verify social sharing images are publicly accessible
- [ ] Run full Lighthouse audit on production build
- [ ] Test on multiple devices/browsers

---

## ✅ Mobile Responsiveness - COMPLETED

### Goal
Make the website fully mobile responsive based on Mark43's CSS and design patterns. This involved implementing responsive breakpoints, mobile-optimized layouts, and touch-friendly interactions.

### Approach
- **Reference Source:** Mark43 website computed styles and responsive design patterns
- **Method:** Human-in-the-loop communication to gather computed styles, breakpoints, and mobile-specific CSS
- **Implementation:** Updated existing CSS Modules with responsive media queries and mobile-first adjustments

### ✅ Completed Components

#### Core Layout Components
- [x] **Header/Navigation** - Mobile hamburger menu with slide-in menu, header positioning, border line, button styling
- [x] **Hero Section** - Mobile font sizes (40px heading), padding adjustments (3.5% container), button styling
- [x] **TopBanner** - Mobile single-line horizontal scroll, edge-to-edge behavior, hidden navigation buttons
- [x] **Footer** - Tablet layout (4-column grid on tablet 768px-990px), mobile stacking and spacing

#### Blog System Components
- [x] **BlogPost Page** - Tablet image overlap (768px-990px), list item typography (18px), iPad landscape related content grid, back button line-height
- [x] **Blog Page** - Mobile/iPad content padding, heading font sizes (61px iPad, 40px mobile), width adjustments (85% on mobile)
- [x] **BlogHeading** - Responsive font sizes and line heights (61px/1.14 iPad, 40px/1.2 mobile), margin adjustments
- [x] **FeaturedBlogPost** - Mobile/iPad layout (image on top, then title, then content), padding adjustments (25px 0 mobile), font sizes (20px mobile, 23px iPad), margin adjustments
- [x] **BlogFilters** - Full-width select and search containers on mobile/iPad, ChevronDown icon replacement, accessibility improvements (name attribute)
- [x] **BlogGrid** - iPad landscape single-column layout (1024px), responsive gap adjustments
- [x] **LatestBlogs/LatestNews** - Mobile card layout improvements, date positioning, removed "Read More" links, hidden excerpts, descriptive link text (aria-label)

#### Other Components
- [x] **FeatureAccordion** - Mobile responsive styling and layout adjustments
- [x] **AgencyLogos Carousel** - Edge-to-edge mobile layout, consistent card sizing, improved touch targets (44px minimum), spacing adjustments for iPad Mini
- [x] **ThemePicker** - Presets accordion defaults to closed, updated text ("Choose a theme")

### Responsive Breakpoints Implemented
- **Mobile:** `max-width: 767px`
- **Tablet:** `768px - 990px`
- **iPad Landscape:** `768px - 1024px`
- **Desktop:** `> 990px` or `> 1024px`

### Accessibility & SEO Improvements
- [x] Touch targets meet minimum 44px size (AgencyLogos carousel dots)
- [x] Descriptive link text with aria-labels (LatestBlogs/LatestNews)
- [x] Form field name attributes (BlogFilters search input)
- [x] Valid robots.txt file created

### Reference Documentation
- See `docs/workflow/SCALABLE_CURSOR_WEBSITE_REBUILD_WORKFLOW.md` for methodology
- See `docs/reference/` for historical Mark43 reference materials

---

## Notes
- Meta tags system is fully implemented and React 19 compatible
- All pages have dynamic meta tags that update based on content
- Blog posts automatically use their featured image for social sharing
- Default fallback image should be added before final deployment
