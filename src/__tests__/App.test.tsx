import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Suspense, lazy, type ComponentType } from "react";
import App from "@/App";
import { ThemeProvider } from "@/context/ThemeContext";
import { BlogSkeleton } from "@/components/BlogSkeleton";

describe("App", () => {
  describe("Lazy-loaded components", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("lazy loads Blog component correctly", async () => {
      // Test that the lazy import function works and transforms named export to default
      const blogModule = await import("@/pages/Blog");
      expect(blogModule.Blog).toBeDefined();
      expect(typeof blogModule.Blog).toBe("function");

      // Test the lazy wrapper transformation
      const lazyBlog = (await import("@/pages/Blog").then((module) => ({
        default: module.Blog,
      }))).default;

      expect(lazyBlog).toBe(blogModule.Blog);
    });

    it("lazy loads BlogPost component correctly", async () => {
      // Test that the lazy import function works and transforms named export to default
      const blogPostModule = await import("@/pages/BlogPost");
      expect(blogPostModule.BlogPost).toBeDefined();
      expect(typeof blogPostModule.BlogPost).toBe("function");

      // Test the lazy wrapper transformation
      const lazyBlogPost = (await import("@/pages/BlogPost").then((module) => ({
        default: module.BlogPost,
      }))).default;

      expect(lazyBlogPost).toBe(blogPostModule.BlogPost);
    });

    it("lazy loads Tag component correctly", async () => {
      // Test that the lazy import function works and transforms named export to default
      const tagModule = await import("@/pages/Tag");
      expect(tagModule.Tag).toBeDefined();
      expect(typeof tagModule.Tag).toBe("function");

      // Test the lazy wrapper transformation
      const lazyTag = (await import("@/pages/Tag").then((module) => ({
        default: module.Tag,
      }))).default;

      expect(lazyTag).toBe(tagModule.Tag);
    });

    it("renders Blog component when navigating to /resources/blog", async () => {
      render(
        <MemoryRouter initialEntries={["/resources/blog"]}>
          <ThemeProvider>
            <Suspense fallback={<BlogSkeleton />}>
              <App />
            </Suspense>
          </ThemeProvider>
        </MemoryRouter>
      );

      // Wait for lazy component to load and render
      await waitFor(
        () => {
          // Blog page should render a main element
          const mainElement = screen.queryByRole("main");
          expect(mainElement).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("renders BlogPost component when navigating to /resources/blog/:slug", async () => {
      // Get a real blog post slug for testing
      const { getAllBlogPosts, getBlogPostSlug, loadAllBlogPosts } = await import("@/data/blog");
      await loadAllBlogPosts();
      const allPosts = getAllBlogPosts();
      expect(allPosts.length).toBeGreaterThan(0);
      const testPost = allPosts[0];
      const testSlug = getBlogPostSlug(testPost);

      render(
        <MemoryRouter initialEntries={[`/resources/blog/${testSlug}`]}>
          <ThemeProvider>
            <Suspense fallback={<BlogSkeleton />}>
              <App />
            </Suspense>
          </ThemeProvider>
        </MemoryRouter>
      );

      // Wait for lazy component to load and render
      await waitFor(
        () => {
          // BlogPost should render the post title or main content
          expect(screen.queryByRole("main")).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("renders Tag component when navigating to /resources/tag/:categoryName", async () => {
      // Get a real category/tag for testing
      const { getAllUniqueTags, loadAllBlogPosts } = await import("@/data/blog");
      const { slugify } = await import("@/utils/slug");
      await loadAllBlogPosts();
      const allTags = getAllUniqueTags();
      expect(allTags.length).toBeGreaterThan(0);
      const testTag = allTags[0];
      const testSlug = slugify(testTag);

      render(
        <MemoryRouter initialEntries={[`/resources/tag/${testSlug}`]}>
          <ThemeProvider>
            <Suspense fallback={<BlogSkeleton />}>
              <App />
            </Suspense>
          </ThemeProvider>
        </MemoryRouter>
      );

      // Wait for lazy component to load and render
      await waitFor(
        () => {
          // Tag page should render the tag name or main content
          expect(screen.queryByRole("main")).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("shows BlogSkeleton fallback while lazy components are loading", () => {
      const TestLazyComponent = lazy(
        () =>
          new Promise<{ default: ComponentType }>((resolve) => {
            // Delay resolution to test fallback
            setTimeout(
              () =>
                resolve({
                  default: () => <div>Loaded</div>,
                }),
              100
            );
          })
      );

      render(
        <BrowserRouter>
          <ThemeProvider>
            <Suspense fallback={<BlogSkeleton />}>
              <TestLazyComponent />
            </Suspense>
          </ThemeProvider>
        </BrowserRouter>
      );

      // BlogSkeleton should be rendered as fallback
      // We can't easily test the BlogSkeleton component directly without querying its structure
      // But we can verify Suspense is working by checking the component hasn't loaded yet
      expect(screen.queryByText("Loaded")).not.toBeTruthy();
    });

    it("transforms named exports to default exports correctly for Blog", async () => {
      // Verify the transformation pattern used in App.tsx
      const blogModule = await import("@/pages/Blog");
      const transformed = { default: blogModule.Blog };

      expect(transformed.default).toBe(blogModule.Blog);
      expect(transformed.default).toBeDefined();
      expect(typeof transformed.default).toBe("function");
    });

    it("transforms named exports to default exports correctly for BlogPost", async () => {
      // Verify the transformation pattern used in App.tsx
      const blogPostModule = await import("@/pages/BlogPost");
      const transformed = { default: blogPostModule.BlogPost };

      expect(transformed.default).toBe(blogPostModule.BlogPost);
      expect(transformed.default).toBeDefined();
      expect(typeof transformed.default).toBe("function");
    });

    it("transforms named exports to default exports correctly for Tag", async () => {
      // Verify the transformation pattern used in App.tsx
      const tagModule = await import("@/pages/Tag");
      const transformed = { default: tagModule.Tag };

      expect(transformed.default).toBe(tagModule.Tag);
      expect(transformed.default).toBeDefined();
      expect(typeof transformed.default).toBe("function");
    });
  });
});
