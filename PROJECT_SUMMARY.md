# Project Summary for Next Agent

## Overview

This is a **React + Vite + TypeScript** application that replicates Mark43's website design with a focus on a blog system. The project uses a centralized content system for topic-based content switching and a JSON-based blog system for managing blog posts.

## Project Structure

### Core Architecture

- **React 19.2.0** + **TypeScript**
- **Vite 7.2.4** for build tooling
- **React Router DOM 7.12.0** for routing
- **CSS Modules** for component styling (pixel-accurate based on Mark43 reference)
- **Vitest** for testing (TDD approach)

### Key Features

1. **Centralized Content System** (`src/content/`)
   - Topic-based content switching via `ContentProvider` and `useContent` hook
   - Allows switching all page copy globally by selecting a topic
   - Topics registered in `src/content/topics.ts`
   - Content stored in `src/content/contentMap.ts`

2. **Blog System** (`src/data/blog/` and `src/pages/`)
   - JSON-based blog posts stored in `src/data/blog/`
   - Blog listing page (`/blog`) with filters and search
   - Individual blog post pages (`/blog/:slug`) with full template
   - Featured blog post card
   - Category filtering and search functionality

3. **Routing Structure**
   - `/` - Home page with Hero, Features, Platform Cards, etc.
   - `/blog` - Blog listing page with featured post, filters, and grid
   - `/blog/:slug` - Individual blog post template page
   - `/blog/category/:category-name` - **TODO: Category page (see task below)**

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

❌ **TODO - Category Page Implementation:**
- Category links currently broken/incomplete
- Need to create `/blog/category/:category-name` route
- Category links exist in two places:
  1. `src/sections/BlogGrid/index.tsx` (line 51-53): Category link in blog cards
  2. `src/pages/BlogPost.tsx` (line 94-107): Tags section (postTerms)
- Category page should display:
  - Page heading with category name (e.g., "Frontend Architecture")
  - Filtered blog grid showing only posts matching that category
  - Reuse existing `BlogGrid` component
  - Similar structure to `/blog` but without featured post

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
    "author": "Senior Engineer",
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

## Testing

- **Vitest** for unit tests
- Test files in `src/__tests__/`
- TDD approach preferred
- All tests currently passing (10 tests)

## Current Task: Category Page Implementation

**Goal**: Create `/blog/category/:category-name` route that displays filtered blog posts

**Requirements:**
1. Add route to `src/App.tsx`: `/blog/category/:categoryName`
2. Create `src/pages/Category.tsx` component
3. Filter posts by category (match category name from URL param)
4. Display page heading with category name (e.g., "Frontend Architecture")
5. Use existing `BlogGrid` component to display filtered posts
6. Structure similar to `/blog` page but:
   - No featured post
   - No filters/search (or minimal filters)
   - Just heading + filtered grid
7. Update category links:
   - `src/sections/BlogGrid/index.tsx` line 51: Change from `<a href={...}>` to `<Link to={...}>` pointing to `/blog/category/:category-slug`
   - `src/pages/BlogPost.tsx` line 100: Change from `/blog?category=...` to `/blog/category/:category-slug`
   - Generate category slug from category name (similar to `slugify` function)

**Notes:**
- Category names have spaces (e.g., "Frontend Architecture")
- Need to create slug from category name for URL (e.g., "frontend-architecture")
- Use existing `slugify` utility from `src/utils/slug.ts`
- Category matching should be case-insensitive or exact match
- See `src/data/blog/types.ts` for `category` field structure

## Next Steps

1. Read `docs/BLOG_POST_INTEGRATION.md` for blog integration process
2. Review existing page structures (`src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`)
3. Implement category page following requirements above
4. Update category links in `BlogGrid` and `BlogPost` components
5. Test category filtering and routing
6. Ensure all tests pass

