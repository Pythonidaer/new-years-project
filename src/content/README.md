# Content System

Centralized placeholder content system for topic-based content switching.

## Overview

This system allows you to switch all page copy (headings, paragraphs, CTAs) globally by selecting a "topic" from a dev UI dropdown. Content is stored in a centralized registry and accessed via a simple `t(key)` function.

## Architecture

- **`types.ts`**: TypeScript types for topics, content keys, and content sets
- **`topics.ts`**: Registry of available topics with metadata
- **`contentMap.ts`**: Actual content strings organized by topic
- **`ContentProvider.tsx`**: React context provider and `useContent` hook
- **`TopicSwitcher`**: Dev UI component for switching topics (in `src/components/dev/`)

## Usage in Components

```tsx
import { useContent } from "../../content/ContentProvider";

export function MyComponent() {
  const { t } = useContent();
  
  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
      <button>{t("hero.ctaLabel")}</button>
    </div>
  );
}
```

## Adding a New Topic

### Step 1: Add Topic Metadata

Edit `topics.ts` and add a new entry to the `topics` array:

```ts
{
  id: "interview_http",
  label: "Interview: HTTP",
  description: "Content about HTTP protocols",
}
```

### Step 2: Add Content Set

Edit `contentMap.ts` and add a new entry to `contentByTopic`:

```ts
interview_http: {
  "hero.title": "Understanding HTTP",
  "hero.titleAccent": "protocols",
  "hero.titleSuffix": "basics",
  "hero.subtitle": "Learn about HTTP protocols...",
  "hero.ctaLabel": "Learn More",
  // ... provide all other content keys
},
```

**Important**: You should provide all content keys for a complete topic. Missing keys will fall back to the default topic, then show a placeholder.

## Adding a New Content Key

### Step 1: Add to Types

Edit `types.ts` and add the new key to the `ContentKey` union:

```ts
export type ContentKey = 
  | "hero.title"
  | "hero.subtitle"
  // ... existing keys
  | "newSection.heading"  // Add your new key here
  | "newSection.text";
```

### Step 2: Add to All Topics

Edit `contentMap.ts` and add the new key to all topic content sets:

```ts
default: {
  // ... existing content
  "newSection.heading": "Default Heading",
  "newSection.text": "Default text...",
},
interview_http: {
  // ... existing content
  "newSection.heading": "HTTP Heading",
  "newSection.text": "HTTP text...",
},
```

### Step 3: Use in Components

```tsx
const { t } = useContent();
<h2>{t("newSection.heading")}</h2>
```

## Content Key Naming Convention

Use dot notation: `section.element`

- `hero.title` - Hero section title
- `hero.subtitle` - Hero section subtitle
- `cta.primaryLabel` - Primary CTA button label
- `featureAccordion.item1.title` - FeatureAccordion section, first item title

Keep keys:
- Human-readable
- Stable (don't rename frequently)
- Hierarchical (group by section)

## Fallback Behavior

The system uses a three-tier fallback:

1. **Current topic**: Tries to get content from the active topic
2. **Default topic**: Falls back to the `default` topic if key is missing
3. **Placeholder**: Shows `[[missing: key.name]]` if key doesn't exist anywhere

This ensures the app never crashes due to missing content.

## Topic Switcher

The `TopicSwitcher` component appears as a fixed dropdown in the bottom-left corner (dev mode). It's automatically included in the app via `App.tsx`.

To hide it in production, conditionally render it:

```tsx
{process.env.NODE_ENV === 'development' && <TopicSwitcher />}
```

## Best Practices

1. **Complete content sets**: Always provide all keys for a topic to avoid fallbacks
2. **Type safety**: Use the `ContentKey` type to ensure keys are valid
3. **Consistent structure**: Keep content keys organized by section
4. **Documentation**: Add comments in `contentMap.ts` for complex content structures
5. **Testing**: Test topic switching to ensure all content displays correctly

## Future Tasks (Saturday, January 10th)

- [ ] **Create blog template for each blog**: Similar to [Mark43's blog post template](https://mark43.com/resources/blog/lifting-up-lgbtq-voices-in-public-safety/) as an example
- [ ] **Category tag pages**: Make clicking on each grid card link to a URL page view like `/tag/data-driven-decisions/`. For example, clicking on a card with category "Culture" should go to `/tag/culture/` that displays the heading "Culture" with all blog cards matching that filter
- [ ] **Color system with root variables**: Lift up all styles and create a color picker so that colors can be dynamically changed for everything at once (e.g., banner color, header color, card color, etc.) and begin using CSS root variables
- [ ] **Save/reset color settings**: Add a save icon so users can save their color settings. When they revisit the page, their saved colors should persist. Also add ability to reset to default colors (current colors)
- [ ] **Mobile responsiveness**: Make website fully mobile responsive
- [ ] **Add more interview questions**: Add more interview questions for blog content blocks
- [ ] **Change favicon**: Update the favicon
- [ ] **Code cleanup**: Clean up and refactor code

