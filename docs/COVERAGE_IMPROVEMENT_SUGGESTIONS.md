# Coverage improvement suggestions (from coverage/analysis.json)

Generated from `npm run analysis`. For each file with `uncoveredLines` or `uncoveredDecisionPoints`, one-line test ideas or code changes to improve coverage.

---

## Focus first: `src/pages/BlogPost.tsx`

| Location | Type | Suggestion |
|----------|------|------------|
| **33-34** | Uncovered lines | Test: render `BlogPost` with a valid slug and mock `loadAllBlogPosts`/`getBlogPostBySlug` so `foundPost` is set and `setPost`/`setRelatedPosts` run (effect path). |
| **51-55** | Uncovered lines | Test: same as above so the component does not early-return; assert hero section and `postSlug`/`postUrl` are present. |
| **57-194** | Uncovered lines | Test: full render with a post that has `content`, `tags`, and related posts; assert parsed content, tag links, author, back button, related grid, and grayscale/noir styling. |
| **77** (&&) | Uncovered decision point | Test: post with `post.content` truthy so the `hasContent(post) && post.content` branch and parsed content block run. |
| **114** (&&) | Uncovered decision point | Test: post with `post.tags` (e.g. non-empty array) so the `hasTags(post)` branch and tag list render. |
| **123** (&&) | Uncovered decision point | Test: post with both tags and content so the footer/terms section and content wrapper are rendered. |
| **173** (&&) | Uncovered decision point | Test: `getRelatedPosts` returns at least one post so the related-posts grid and its conditional render run. |

---

## Other files (path, line/range, one-line suggestion)

### `src/components/AudioControl/AudioControl.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 69, 79-81, 97, 109-110 | Test: trigger the path where the `if` at 97 is true (e.g. error or edge state in the control that hits line 97). |
| 97 (if) | Uncovered DP: add test that exercises the condition that leads to the `if` at line 97 (e.g. specific playback or error state). |

### `src/components/Button.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 13, 16 | Test: render with `variant="secondary"` and `variant="secondary-orange"` so `getVariantClass` returns non-primary classes. |
| 28, 35, 42 | Test: render with `showChevron={true}` and `variant="secondary"` so `shouldDisplayChevron` is false (covers the `||` at 28); with `showChevron={true}` and `chevronPosition="left"` / `"right"` so both chevron render branches run. |
| 28 (||) | Uncovered DP: call or render so `variant === "primary"` is false and `variant === "secondary-orange"` is false (e.g. `variant="secondary"`) to hit the false side of the `||`. |

### `src/components/ThemePicker/ThemePicker.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 137, 443, 631, 732-736 | Test: open picker and trigger the UI path that hits the `if` at 443 (e.g. specific preset or import flow); and the path that hits the `if` at 732 (e.g. export or copy flow). |
| 443 (if), 732 (if) | Uncovered DPs: add tests that trigger the branches containing lines 443 and 732 (inspect component for the exact conditions). |

### `src/context/ThemeContext.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 57-62, 79-83, 125, 129-137, 166 | Test: trigger theme load/save so `localStorage` getItem throws or returns invalid JSON (catch at 60); trigger applyTheme or init so the catch at 81 runs; trigger the path that hits the catch at 135 (e.g. failed write). |
| 60 (catch), 81 (catch), 135 (catch) | Uncovered DPs: mock `localStorage`/`JSON.parse` or DOM to throw so each catch block runs. |

### `src/data/blog/index.ts`
| Line(s) | Suggestion |
|---------|------------|
| 154 | Test: `getRelatedPosts` with a post that has no tag/category matches so `score > 0` filter removes all and the fallback branch (e.g. filling from `otherPosts`) runs. |

### `src/hooks/useImagePreload.ts`
| Line(s) | Suggestion |
|---------|------------|
| 29, 33, 39, 44 | Test: pass a valid image URL and simulate `onload`/`onerror` so the success and error branches and any cleanup run. |

### `src/hooks/useMetaTags.ts`
| Line(s) | Suggestion |
|---------|------------|
| 19 | Test: call with arguments that make the `if` at 19 true (e.g. a case where the condition guards an early return or different path). |
| 19 (if) | Uncovered DP: same as above; inspect the condition at 19 and add a test that satisfies it. |

### `src/pages/Blog.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 40-41 | Test: render `Blog` when `getAllBlogPosts()` returns empty or a specific length so the branch that uses lines 40-41 (e.g. setState or conditional render) runs. |

### `src/pages/Tag.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 38, 41-42, 51-54, 77-78 | Test: navigate to a tag route with no posts (empty list) so the empty-state branch runs; with posts so the list and the ternary at 78 run. |
| 38 (if), 52 (||), 53 (&&), 78 (ternary) | Uncovered DPs: test with tag that has no matching posts (38); test with mix of tag/category so the scoring branches 52-53 run; test so both sides of the ternary at 78 run. |

### `src/sections/AgencyLogos/index.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 49, 73-79, 140, 144, 146-148 | Test: render with props that trigger the `if` at 49 (e.g. no logos or empty list); with props that hit the branch at 74 (e.g. canScrollPrev/canScrollNext); trigger the branch at 140/146 (e.g. embla API callback or option). |
| 49 (if), 74 (if), 140 (if), 146 (if), 144 (??, ?.) | Uncovered DPs: provide props/callbacks so prev/next scroll and embla-related branches run; cover the nullish/optional chain at 144. |

### `src/sections/BlogGrid/index.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 30 | Test: render `BlogGrid` with props that trigger the branch at line 30 (e.g. empty list or a specific layout path). |

### `src/sections/FeatureAccordion/index.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 112-115, 160, 209 | Test: expand/collapse an item so the branch containing 112 runs; trigger the path that renders or updates at 160 and 209. |
| 112 (if) | Uncovered DP: interact with accordion so the condition at 112 is true (e.g. specific item state or index). |

### `src/sections/Header/index.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 256, 276 | Test: render Header in a state that shows mobile menu or a nav item that hits the branch at 256; trigger the branch at 276 (e.g. link or button only rendered in one viewport/state). |

### `src/sections/TopBanner/index.tsx`
| Line(s) | Suggestion |
|---------|------------|
| 34, 52, 66 | Test: render with props so the `if` at 34 is true; with props/callbacks so the branch at 52 runs (e.g. dismiss or CTA); trigger the branch at 66. |
| 34 (if), 52 (if) | Uncovered DPs: same as above; provide props that satisfy the conditions at 34 and 52. |

### `src/utils/contrast.ts`
| Line(s) | Suggestion |
|---------|------------|
| 131-132, 190, 207, 220 | Test: call the function that contains 131-132 with inputs that hit the branch (e.g. invalid or edge color format); call the function containing 190/207/220 with inputs that trigger the `if` and catch paths. |
| 190 (if), 220 (if) | Uncovered DPs: provide inputs that satisfy the conditions at 190 and 220 (e.g. specific gradient or color structure). |

---

## Summary

- **Highest impact:** `src/pages/BlogPost.tsx` — add integration tests that load a post by slug, assert content/tags/related and grayscale/noir, and cover the decision points at 77, 114, 123, 173.
- **Quick wins:** `src/components/Button.tsx` (variant and chevron branches), `src/data/blog/index.ts` (line 154 fallback), `src/hooks/useMetaTags.ts` (if at 19).
- **Require mocks or DOM:** `ThemeContext.tsx` (catch blocks), `useImagePreload` (image load/error), `contrast.ts` (edge inputs and throws).
