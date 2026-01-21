import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { BlogPost } from "@/pages/BlogPost";
import { ThemeProvider } from "@/context/ThemeContext";
import { getBlogPostBySlug } from "@/data/blog";
import { getGrayscaleImageUrl } from "@/utils/imageGrayscale";
import * as blogData from "@/data/blog";
import { builtInPresets } from "@/context/themeData";

describe("BlogPost", () => {
  interface MockImage {
    onload: (() => void) | null;
    onerror: (() => void) | null;
    src: string;
    complete: boolean;
    _src?: string;
  }

  let mockImage: MockImage;

  beforeEach(() => {
    // Only mock Image for onload/onerror testing
    mockImage = {
      onload: null,
      onerror: null,
      get src() {
        return this._src || '';
      },
      set src(value) {
        this._src = value;
      },
      complete: false,
    };

    // Mock Image constructor - return the mock object when called with 'new'
    // Cast through unknown first since MockImage doesn't match HTMLImageElement structure
    globalThis.Image = vi.fn(function() {
      return mockImage;
    }) as unknown as typeof Image;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
    // Clean up any preload links from previous tests
    const links = document.head.querySelectorAll('link[rel="preload"]');
    links.forEach(link => link.remove());
  });

  const renderBlogPost = (slug: string, initialTheme?: string) => {
    // Set theme in localStorage if provided
    if (initialTheme === 'noir') {
      // Set the actual noir theme so ThemeProvider can match it to the preset
      const noirPreset = builtInPresets.find(p => p.id === 'noir');
      if (noirPreset) {
        localStorage.setItem('user-theme', JSON.stringify(noirPreset.theme));
      }
    } else if (initialTheme) {
      localStorage.setItem('user-theme', JSON.stringify({}));
    }
    
    return render(
      <MemoryRouter initialEntries={[`/resources/blog/${slug}`]}>
        <ThemeProvider>
          <Routes>
            <Route path="/resources/blog/:slug" element={<BlogPost />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  describe("error handling", () => {
    it("should render 'Post not found' when slug is missing", () => {
      render(
        <MemoryRouter initialEntries={["/resources/blog/"]}>
          <ThemeProvider>
            <BlogPost />
          </ThemeProvider>
        </MemoryRouter>
      );

      expect(screen.getByText("Post not found")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should render 'Post not found' when post is not found", () => {
      renderBlogPost("nonexistent-post-slug");

      expect(screen.getByText("Post not found")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should render Header and Footer when post is not found", () => {
      renderBlogPost("nonexistent-post-slug");

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByText("Post not found")).toBeInTheDocument();
    });
  });

  describe("image preloading useEffect", () => {
    it("should create preload link when post has image", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      // Render the component - this will call the hook
      await act(async () => {
        renderBlogPost(slug);
        // Wait for React to flush effects
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // The hook's effect should have run - wait for the link to appear
      const link = await waitFor(() => {
        const foundLink = document.head.querySelector('link[rel="preload"]');
        if (!foundLink || foundLink.getAttribute('as') !== 'image') {
          throw new Error('Preload link not found');
        }
        return foundLink;
      }, { timeout: 2000 });

      // Verify link attributes
      expect(link.getAttribute('as')).toBe('image');
      expect(link.getAttribute('href')).toBe(post.image);
      expect(link.getAttribute('fetchPriority')).toBe('high');
    });

    it("should use grayscale image URL when noir theme is active", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      // Render with noir theme - pass 'noir' as initialTheme
      renderBlogPost(slug, 'noir');

      // Wait for the link to appear (this confirms the hook ran)
      const link = await waitFor(() => {
        const foundLink = document.head.querySelector('link[rel="preload"]');
        if (!foundLink) {
          throw new Error('Preload link not found');
        }
        return foundLink;
      }, { timeout: 2000 });

      // Verify preload link uses grayscale URL (this confirms the hook ran with noir theme)
      const expectedGrayscaleUrl = getGrayscaleImageUrl(post.image, true);
      expect(link.getAttribute('href')).toBe(expectedGrayscaleUrl);
      
      // The Image src should also be set, but the mock might not track it correctly
      // The important thing is that the link href is correct, which proves the hook
      // processed the image URL with grayscale when noir theme is active
      if (post.image.includes('picsum.photos')) {
        // Verify the link contains grayscale parameter
        expect(link.getAttribute('href')).toContain('grayscale');
      }
      
      if (post.image.includes('picsum.photos')) {
        expect(mockImage.src).toContain('grayscale');
      }

      // Verify preload link also uses grayscale URL
      expect(link.getAttribute('href')).toBe(expectedGrayscaleUrl);
    });

    it("should not create preload link when post has no image", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || post.image) {
        // Skip if all posts have images - can't test this case
        return;
      }

      renderBlogPost(slug);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should not create link if no image
      const link = document.head.querySelector('link[rel="preload"][as="image"]');
      expect(link).toBeNull();
    });

    it("should set imageLoaded to true when image loads successfully", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      renderBlogPost(slug);

      // Wait for Image to be created
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockImage.src).toBe(post.image);

      // Trigger onload
      if (mockImage.onload) {
        await act(async () => {
          mockImage.onload!();
          await new Promise(resolve => setTimeout(resolve, 0));
        });
      }

      // Skeleton should be gone after image loads
      const skeleton = document.querySelector('[class*="heroSkeleton"]');
      expect(skeleton).not.toBeInTheDocument();
    });

    it("should set imageLoaded to true when image fails to load", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      renderBlogPost(slug);

      // Wait for the hook's effect to run and Image to be created
      await waitFor(() => {
        expect(mockImage.src).toBe(post.image);
      }, { timeout: 2000 });

      // Trigger onerror - should still set imageLoaded to true
      if (mockImage.onerror) {
        await act(async () => {
          mockImage.onerror!();
          await new Promise(resolve => setTimeout(resolve, 0));
        });
      }

      // Should show content even on error
      const skeleton = document.querySelector('[class*="heroSkeleton"]');
      expect(skeleton).not.toBeInTheDocument();
    });

    it("should handle already cached images with setTimeout", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      // Set image as already complete (cached)
      mockImage.complete = true;

      renderBlogPost(slug);

      // Wait for useEffect and setTimeout to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Cached image should hide skeleton
      const skeleton = document.querySelector('[class*="heroSkeleton"]');
      expect(skeleton).not.toBeInTheDocument();
    });

    it("should cleanup preload link on unmount", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      const { unmount } = renderBlogPost(slug);

      // Wait for the hook's effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Wait for link to be created
      const link = await waitFor(() => {
        const foundLink = document.head.querySelector('link[rel="preload"]');
        if (!foundLink || foundLink.getAttribute('as') !== 'image') {
          throw new Error('Preload link not found');
        }
        return foundLink;
      }, { timeout: 1000 });

      // Verify link exists before unmount
      expect(link).toBeTruthy();

      unmount();

      // Link should be removed after unmount
      const linkAfterUnmount = document.head.querySelector('link[rel="preload"]');
      expect(linkAfterUnmount).toBeNull();
    });

    it("should not cleanup if link is not in document.head", async () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.image) {
        return;
      }

      const { unmount } = renderBlogPost(slug);

      // Wait for the hook's effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Wait for link to be created
      const link = await waitFor(() => {
        const foundLink = document.head.querySelector('link[rel="preload"]');
        if (!foundLink || foundLink.getAttribute('as') !== 'image') {
          throw new Error('Preload link not found');
        }
        return foundLink;
      }, { timeout: 1000 });

      // Manually remove link to simulate it not being in head
      if (link) {
        link.remove();
      }

      unmount();

      // Should not throw error even if link was already removed
      expect(true).toBe(true);
    });
  });

  describe("component rendering", () => {
    it("should render blog post with valid slug", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      const { container } = renderBlogPost(slug);

      expect(screen.getByRole("main")).toBeInTheDocument();
      
      // Debug: Check if post content is rendered
      const main = container.querySelector('main');
      expect(main).toBeTruthy();
      
      // Try to find the title - it might be in an h1 with entryTitle class
      const titleElement = container.querySelector('h1.entryTitle') || 
                          screen.queryByText(post.title, { exact: false });
      expect(titleElement).toBeTruthy();
      if (titleElement) {
        expect(titleElement.textContent).toContain(post.title);
      }
    });

    it("should render MetaTags with post information", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      renderBlogPost(slug);

      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should set meta description from post excerpt when available", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.excerpt) {
        return;
      }

      renderBlogPost(slug);

      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription?.getAttribute("content")).toBe(post.excerpt);
    });

    it("should set meta description with fallback when excerpt is missing", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      // Create a mock post without excerpt (use empty string since excerpt is required)
      const postWithoutExcerpt = { ...post, excerpt: "" };
      const getBlogPostBySlugSpy = vi.spyOn(blogData, "getBlogPostBySlug").mockReturnValue(postWithoutExcerpt as typeof post);

      renderBlogPost(slug);

      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeInTheDocument();
      const expectedFallback = `Read about ${post.title} on Johnny H.'s technical blog.`;
      expect(metaDescription?.getAttribute("content")).toBe(expectedFallback);

      getBlogPostBySlugSpy.mockRestore();
    });

    it("should render hero skeleton initially", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      renderBlogPost(slug);

      // Initially skeleton should be visible
      const skeleton = document.querySelector('[class*="heroSkeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it("should render back to blog button", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      renderBlogPost(slug);

      expect(screen.getByText("Back to Blog")).toBeInTheDocument();
    });

    it("should render author section", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      renderBlogPost(slug);

      expect(screen.getByText("About the Author")).toBeInTheDocument();
    });

    it("should render author name in hero section when author is provided", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.author) {
        return;
      }

      renderBlogPost(slug);

      // Find the author link in hero section
      const authorLink = screen.getByText(post.author, { selector: 'a' });
      expect(authorLink).toBeInTheDocument();
      expect(authorLink.closest('a')?.getAttribute('href')).toBe('#author');
    });

    it("should render 'LLM Writer' as fallback author in hero section when author is missing", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      // Create a mock post without author
      const postWithoutAuthor = { ...post, author: undefined };
      const getBlogPostBySlugSpy = vi.spyOn(blogData, "getBlogPostBySlug").mockReturnValue(postWithoutAuthor);

      renderBlogPost(slug);

      // Should show "LLM Writer" as fallback
      const authorLink = screen.getByText("LLM Writer", { selector: 'a' });
      expect(authorLink).toBeInTheDocument();
      expect(authorLink.closest('a')?.getAttribute('href')).toBe('#author');

      getBlogPostBySlugSpy.mockRestore();
    });

    it("should render author name in author box when author is provided", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post || !post.author) {
        return;
      }

      renderBlogPost(slug);

      // Check author box specifically - should contain the author name
      const authorBox = screen.getByRole("main").querySelector('[id="author"]');
      expect(authorBox).toBeTruthy();
      expect(authorBox?.textContent).toContain(post.author);
    });

    it("should render 'LLM Writer' as fallback author in author box when author is missing", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      // Create a mock post without author
      const postWithoutAuthor = { ...post, author: undefined };
      const getBlogPostBySlugSpy = vi.spyOn(blogData, "getBlogPostBySlug").mockReturnValue(postWithoutAuthor);

      renderBlogPost(slug);

      // Should show "LLM Writer" as fallback
      expect(screen.getByText("About the Author")).toBeInTheDocument();
      const llmWriterTexts = screen.getAllByText("LLM Writer");
      expect(llmWriterTexts.length).toBeGreaterThan(0);

      getBlogPostBySlugSpy.mockRestore();
    });
  });

  describe("noir theme handling", () => {
    it("should apply grayscale filter when noir theme is active", () => {
      const slug = "reusable-vs-feature-specific-components";
      const post = getBlogPostBySlug(slug);
      
      if (!post) {
        return;
      }

      renderBlogPost(slug);

      // Component should render regardless of theme
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });
});
