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
- [ ] `src/pages/BlogPost.tsx` - Featured blog post image (line 84-86) ✅ Has alt
- [ ] `src/sections/FeaturedBlogPost/index.tsx` - Featured post image (line 42) ✅ Has alt
- [ ] `src/sections/LatestBlogs/index.tsx` - Blog post thumbnails (line 32-34) ✅ Has alt
- [ ] `src/sections/BlogGrid/index.tsx` - Grid post images (line 37-39) ✅ Has alt
- [ ] `src/sections/HeroMarquee/index.tsx` - Marquee images (line 18-20) ✅ Has alt
- [ ] `src/sections/PlatformIntro/index.tsx` - Experience logos (line 59-61) ✅ Has alt
- [ ] `src/sections/AgencyLogos/index.tsx` - Technology icons (line 68-70) ✅ Has alt
- [ ] `src/sections/FeatureAccordion/index.tsx` - Accordion images (line 153-155) ✅ Has alt
- [ ] `src/sections/CampaignBanner/index.tsx` - Profile image (line 43-45) ✅ Has alt

**Note:** Most images already have alt text. Review each to ensure descriptions are descriptive and meaningful (not just "image" or generic text).

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
  - Verify color contrast ratios meet WCAG AA standards (theming system should handle this)
  - Ensure all interactive elements have proper focus states
  - Test keyboard navigation
  - Verify ARIA labels where needed

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

## Notes
- Meta tags system is fully implemented and React 19 compatible
- All pages have dynamic meta tags that update based on content
- Blog posts automatically use their featured image for social sharing
- Default fallback image should be added before final deployment
