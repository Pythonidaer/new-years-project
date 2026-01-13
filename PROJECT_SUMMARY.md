# Project Summary for Next Agent

## Overview

This is a **React + Vite + TypeScript** application that replicates Mark43's website design with a focus on a blog system. The project uses a JSON-based blog system for managing blog posts.

## Project Structure

### Core Architecture

- **React 19.2.0** + **TypeScript**
- **Vite 7.2.4** for build tooling
- **React Router DOM 7.12.0** for routing
- **CSS Modules** for component styling (pixel-accurate based on Mark43 reference)
- **Vitest** for testing (TDD approach)

### Key Features

   - Allows switching all page copy globally by selecting a topic
   - Topics registered in `src/content/topics.ts`
   - Content stored in `src/content/contentMap.ts`

2. **Blog System** (`src/data/blog/` and `src/pages/`)
   - JSON-based blog posts stored in `src/data/blog/`
   - Blog listing page (`/blog`) with filters and search
   - Individual blog post pages (`/blog/:slug`) with full template
   - Featured blog post card
   - Category filtering and search functionality

3. **Theming System** (`src/design/`, `src/context/`, `src/components/ThemePicker/`)
   - **Stage 1: ✅ Completed** - Centralized CSS token system
     - All themeable colors migrated to semantic CSS variables in `src/design/tokens.css`
     - CSS variables defined on `#root` for nested theme support
     - All components use `var(--color-*)` instead of hardcoded colors
     - Non-themeable tokens (fonts, layout) remain on `:root` for global availability
   - **Stage 2: ✅ Completed** - ThemePicker component with presets
     - Floating color picker UI (`src/components/ThemePicker/`)
     - Real-time contrast checking with WCAG AA/AAA warnings
     - 9 built-in preset themes: Default, Cedar Oak, Mark43, Sage Green, Crimson Flame, Vapor Wave, Gothic, Horror, Pride
     - Custom preset saving/loading (stored in `localStorage`)
     - Theme persistence with no-flicker loading
     - Export/import theme JSON functionality
   - **Stage 3: 🔄 Future** - Advanced color picker integration
     - Potential integration with `react-colorful` or similar library
     - Color theory presets (triads, complementary, etc.)
     - Further UI refinements

3. **Routing Structure**
   - `/` - Home page with Hero, Features, Platform Cards, etc.
   - `/blog` - Blog listing page with featured post, filters, and grid
   - `/blog/:slug` - Individual blog post template page
   - `/resources/tag/:categoryName` - Category/tag filtering page (unified handler for both categories and tags)

### Current State

✅ **Completed:**
- Full homepage with all sections
- Blog listing page (`/blog`) with filters, search, featured post, and grid
- Individual blog post template (`/blog/:slug`) with:
  - Hero section with blurred background image
  - Featured image with overlap effect
  - Full article content (HTML rendering with `html-react-parser`)
  - Code blocks with proper formatting and mobile responsiveness
  - Tags section with links
  - "About the Author" section
  - "Back to Blog" button
  - Related content section (shows next 3 posts)
- Blog post integration process documented in `docs/BLOG_POST_INTEGRATION.md`
- Header with conditional styling (light/dark based on page)
- All blog posts from all topics display on listing page
- Tags formatted as uppercase with spaces (e.g., "React", "Component Design")
- **Theming System (Stage 1 & 2 Complete)**:
  - All colors migrated to semantic CSS variables (`src/design/tokens.css`)
  - ThemeProvider with React Context (`src/context/ThemeContext.tsx`)
  - ThemePicker component with floating UI (`src/components/ThemePicker/`)
  - 9 built-in preset themes (Default, Cedar Oak, Mark43, Sage Green, Crimson Flame, Vapor Wave, Gothic, Horror, Pride)
  - Custom preset saving/loading with `localStorage`
  - Real-time WCAG contrast checking (`src/utils/contrast.ts`)
  - No-flicker theme loading (applied before React render)
  - Export/import theme JSON functionality

✅ **Category/Tag Page Implementation - COMPLETED:**
- Unified `/resources/tag/:categoryName` route implemented via `Tag.tsx` component
- Handles both categories and tags (filters by `post.category` OR `post.tags.includes()`)
- Category links working in:
  1. `src/sections/BlogGrid/index.tsx` (line 52): Uses `/resources/tag/${slugify(post.category)}`
  2. `src/pages/BlogPost.tsx` (line 101): Tag links use `/resources/tag/${slugify(tag)}`
- Displays page heading with category/tag name
- Uses existing `BlogGrid` component for filtered posts
- Case-insensitive matching with slug-based routing

## Important Files to Read

### For Blog Integration Process:
1. **`docs/BLOG_POST_INTEGRATION.md`** - Complete guide for integrating new blog post JSON files
   - Explains JSON structure requirements
   - Step-by-step integration process
   - Tag formatting rules (uppercase, spaces not dashes)
   - Code block formatting guidelines
   - Category registration steps

2. **`src/data/blog/types.ts`** - TypeScript interface for `BlogPost`
   - Shows required and optional fields
   - `id`, `title`, `date`, `excerpt`, `category`, `image`, `link`, `slug?`, `author?`, `content?`, `tags?`

3. **`src/data/blog/index.ts`** - Blog data utilities
   - `getAllBlogPosts()` - Gets all posts from all topics
   - `getBlogPostBySlug(slug)` - Finds post by slug
   - `getRelatedPosts(postId, limit)` - Gets related posts
   - `getBlogPostSlug(post)` - Gets or generates slug

4. **`src/content/topics.ts`** - Topic registry
   - Lists all available topics
   - Each topic corresponds to a JSON file in `src/data/blog/`

5. **`src/sections/BlogFilters/index.tsx`** - Category filter component
   - Contains `ALL_CATEGORIES` array (line 12-29)
   - Categories must be added here for filtering to work

### For Theming System:
1. **`src/design/theming-goals.md`** - Original theming architecture documentation
   - Explains semantic tokens, CSS variables, React ThemeProvider
   - Theme override strategy for nested components
   - User customization flow

2. **`src/design/tokens.css`** - CSS variable definitions
   - Themeable colors on `#root` (supports nested overrides)
   - Non-themeable tokens (fonts, layout) on `:root`
   - All semantic color tokens (core, primary, accent, gradients, footer, shadows, code)

3. **`src/context/ThemeContext.tsx`** - Theme state management
   - `Theme` type definition
   - `ThemeProvider` component with `useTheme` hook
   - Built-in preset themes (9 themes)
   - Custom preset saving/loading
   - Export/import theme JSON
   - `localStorage` persistence

4. **`src/components/ThemePicker/ThemePicker.tsx`** - Color picker UI
   - Floating palette button (bottom-right)
   - Color token organization by category
   - Real-time contrast checking integration
   - Preset management UI

5. **`src/utils/contrast.ts`** - WCAG contrast checking
   - `getContrastRatio()` - Calculate contrast ratio between two colors
   - `checkContrastIssues()` - Identify problematic color pairs
   - Handles semi-transparent colors (blends with backgrounds)
   - Gradient contrast checking (checks both start and end)

### For Category Page Task:
1. **`src/App.tsx`** - Route definitions (currently only has `/`, `/blog`, `/blog/:slug`)
2. **`src/pages/Blog.tsx`** - Blog listing page structure (reference for category page)
3. **`src/sections/BlogGrid/index.tsx`** - Reusable grid component for blog cards
4. **`src/pages/BlogPost.tsx`** - See tag links (line 94-107) that need to work
5. **`src/sections/BlogGrid/index.tsx`** - See category link (line 51-53) that needs to work

## Blog Post JSON Format

Example blog post structure (see `src/data/blog/interview_reusable_vs_feature_specific_components_a_practical_decision_framework.json`):

```json
[
  {
    "id": 1,
    "title": "Post Title",
    "date": "January 10, 2026",
    "excerpt": "Post excerpt...",
    "category": "Frontend Architecture",
    "image": "https://picsum.photos/367/197?random=37",
    "link": "/blog/post-slug",
    "slug": "post-slug",
    "author": "LLM Writer",
    "tags": ["React", "Component Design", "Frontend Architecture"],
    "content": "<h2>Heading</h2><p>Content in HTML format...</p><pre><code>Code blocks with proper line breaks</code></pre>"
  }
]
```

**Key Requirements:**
- `id` must be a **number** (not string)
- `date` format: "January 10, 2026" (human-readable, not ISO)
- `image`: Use `https://picsum.photos/367/197?random=N` format
- `content`: Must be **HTML** (not Markdown)
- `tags`: Uppercase with spaces (e.g., "React", "Component Design")
- Code blocks: Format with line breaks for readability

## Integration Process Overview

When a new blog post JSON file is provided:

1. **Fix JSON structure**:
   - Ensure `id` is number (use next available number across all topics)
   - Format `date` as "Month Day, Year"
   - Update `image` to `https://picsum.photos/367/197?random=N`
   - Convert `content` to HTML if needed
   - Format `tags` as uppercase with spaces

2. **Register in system**:
   - Add category to `ALL_CATEGORIES` in `src/sections/BlogFilters/index.tsx` if new
   - Add topic to `src/content/topics.ts`
   - Import JSON in `src/data/blog/index.ts`
   - Add to `blogPostsByTopic` object in `src/data/blog/index.ts`

3. **Verify**:
   - Build succeeds
   - Tests pass
   - Post appears in `/blog` listing
   - Post accessible at `/blog/:slug`

Full process documented in `docs/BLOG_POST_INTEGRATION.md`.

## Styling Approach

- **CSS Modules** for all component styles
- Pixel-accurate styling based on Mark43 reference computed styles
- Reference files in `reference/` directory
- Follow `SCALABLE_CURSOR_WEBSITE_REBUILD_WORKFLOW.md` methodology
- Header has conditional styling:
  - `.dark` - Dark blue background (blog listing page)
  - `.light` - White background (blog post pages with hero section)

### Theming Architecture

- **Semantic CSS Tokens** (`src/design/tokens.css`):
  - Themeable colors defined on `#root` (supports nested overrides)
  - Non-themeable tokens (fonts, layout) on `:root` (global availability)
  - All components use `var(--color-*)` instead of hardcoded colors
  - Comprehensive token set: core colors, primary/accent, gradients, footer, shadows, code colors

- **ThemeProvider** (`src/context/ThemeContext.tsx`):
  - React Context for theme state management
  - `localStorage` persistence with no-flicker loading
  - Built-in preset themes (9 themes)
  - Custom preset saving/loading
  - Export/import theme JSON

- **ThemePicker Component** (`src/components/ThemePicker/`):
  - Floating palette button (bottom-right corner)
  - Color picker UI with organized categories (Core, Primary, Accent, Gradients, Footer, Shadows)
  - Real-time contrast warnings with WCAG AA/AAA compliance
  - Preset selection and management
  - Save custom themes as presets
  - Individual color cancel/reset functionality

- **Contrast Checking** (`src/utils/contrast.ts`):
  - WCAG contrast ratio calculations using `color` library
  - Checks all critical color combinations
  - Handles semi-transparent colors (blends with backgrounds)
  - Gradient contrast checking (checks both start and end colors)
  - Detailed usage context for each warning

## Testing

- **Vitest** for unit tests
- Test files in `src/__tests__/`
- TDD approach preferred
- All tests currently passing (10 tests)

## Theming System Status

**Current Stage: Stage 2 Complete, Stage 3 Pending**

### Stage 1: ✅ Completed
- All themeable colors migrated to semantic CSS variables
- CSS variables defined on `#root` for nested theme support
- All components refactored to use `var(--color-*)` tokens
- Visual regression testing completed (manual comparison)

### Stage 2: ✅ Completed
- ThemePicker component with floating UI
- Real-time contrast checking with WCAG warnings
- 9 built-in preset themes (all meet WCAG AA requirements)
- Custom preset saving/loading
- Theme persistence with no-flicker loading
- Export/import theme JSON

### Stage 3: 🔄 Future Enhancements
- Advanced color picker library integration (e.g., `react-colorful`)
- Color theory presets (triads, complementary colors, etc.)
- Further UI/UX refinements based on user feedback
- Legacy token cleanup (remove backward compatibility tokens)

**Key Files:**
- `src/design/tokens.css` - CSS variable definitions
- `src/context/ThemeContext.tsx` - Theme state management
- `src/components/ThemePicker/` - Color picker UI component
- `src/utils/contrast.ts` - WCAG contrast checking utilities
- `src/design/theming-goals.md` - Original theming architecture documentation

## Next Steps

1. Read `docs/BLOG_POST_INTEGRATION.md` for blog integration process
2. Review existing page structures (`src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`)
3. Implement category page following requirements above
4. Update category links in `BlogGrid` and `BlogPost` components
5. Test category filtering and routing
6. Ensure all tests pass

