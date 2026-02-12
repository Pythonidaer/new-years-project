import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { Tag } from "@/pages/Tag";
import * as blogData from "@/data/blog";
import type { BlogPost } from "@/data/blog";

vi.mock("@/data/blog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/blog")>();
  return {
    ...actual,
    loadAllBlogPosts: vi.fn((...args: unknown[]) =>
      actual.loadAllBlogPosts(...(args as Parameters<typeof actual.loadAllBlogPosts>)),
    ),
    getAllBlogPosts: vi.fn((...args: unknown[]) =>
      actual.getAllBlogPosts(...(args as Parameters<typeof actual.getAllBlogPosts>)),
    ),
    getAllUniqueTags: vi.fn((...args: unknown[]) =>
      actual.getAllUniqueTags(...(args as Parameters<typeof actual.getAllUniqueTags>)),
    ),
  };
});

const renderTag = (categoryName: string) =>
  render(
    <MemoryRouter initialEntries={[`/resources/tag/${categoryName}`]}>
      <ThemeProvider>
        <Routes>
          <Route path="/resources/tag/:categoryName" element={<Tag />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );

const renderTagWithPath = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <Routes>
          <Route path="/resources/tag/:categoryName?" element={<Tag />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );

describe("Tag Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Tag component renders without crashing with valid category", () => {
    renderTag("frontend-architecture");
    const mainElement = document.querySelector("main");
    expect(mainElement).toBeTruthy();
  });

  it("Tag component handles invalid category gracefully", () => {
    renderTag("nonexistent-category");
    expect(screen.getByText("Category not found")).toBeTruthy();
    expect(screen.getByText("Back to Blog")).toBeTruthy();
  });

  it("Tag component displays category name as heading when category exists", () => {
    renderTag("frontend-architecture");
    const heading = document.querySelector("h1");
    expect(heading).toBeTruthy();
    if (heading) {
      expect(heading.textContent).toBeTruthy();
    }
  });

  it("Tag component renders BlogGrid when category exists and has posts", () => {
    renderTag("frontend-frameworks");
    const mainElement = document.querySelector("main");
    expect(mainElement).toBeTruthy();
    const content = document.querySelector('[class*="content"]');
    expect(content).toBeTruthy();
  });

  it("uses 'article' in description when exactly one post matches (branch: filteredPosts.length === 1)", async () => {
    const onePost: BlogPost = {
      id: 1,
      title: "One Post",
      date: "Jan 1, 2026",
      excerpt: "Excerpt",
      category: "Frontend Architecture",
      image: "https://example.com/1.jpg",
      link: "/blog/one",
      slug: "one-post",
    };
    vi.mocked(blogData.loadAllBlogPosts).mockResolvedValueOnce(undefined);
    vi.mocked(blogData.getAllBlogPosts).mockReturnValueOnce([onePost]);
    vi.mocked(blogData.getAllUniqueTags).mockReturnValueOnce(["Frontend Architecture"]);

    renderTag("frontend-architecture");

    await waitFor(
      () => {
        const meta = document.querySelector('meta[name="description"]');
        expect(meta?.getAttribute("content")).toMatch(/1 article about Frontend Architecture/);
      },
      { timeout: 2000 }
    );
  });

  it("uses 'articles' in description when zero or multiple posts match (branch: filteredPosts.length !== 1)", async () => {
    const twoPosts: BlogPost[] = [
      {
        id: 1,
        title: "Post One",
        date: "Jan 1, 2026",
        excerpt: "E1",
        category: "Frontend Architecture",
        image: "https://example.com/1.jpg",
        link: "/blog/one",
        slug: "one",
      },
      {
        id: 2,
        title: "Post Two",
        date: "Jan 2, 2026",
        excerpt: "E2",
        category: "Frontend Architecture",
        image: "https://example.com/2.jpg",
        link: "/blog/two",
        slug: "two",
      },
    ];
    vi.mocked(blogData.loadAllBlogPosts).mockResolvedValueOnce(undefined);
    vi.mocked(blogData.getAllBlogPosts).mockReturnValueOnce(twoPosts);
    vi.mocked(blogData.getAllUniqueTags).mockReturnValueOnce(["Frontend Architecture"]);

    renderTag("frontend-architecture");

    await waitFor(
      () => {
        const meta = document.querySelector('meta[name="description"]');
        expect(meta?.getAttribute("content")).toMatch(/2 articles about Frontend Architecture/);
      },
      { timeout: 2000 }
    );
  });

  it("resolves tagName from allTags when not in ALL_CATEGORIES (useMemo tagMatch path)", async () => {
    const postWithCustomTag: BlogPost = {
      id: 1,
      title: "Custom Tag Post",
      date: "Jan 1, 2026",
      excerpt: "E",
      category: "Other",
      image: "https://example.com/1.jpg",
      link: "/blog/a",
      slug: "custom-tag-post",
      tags: ["CustomTopic"],
    };
    vi.mocked(blogData.loadAllBlogPosts).mockResolvedValueOnce(undefined);
    vi.mocked(blogData.getAllBlogPosts).mockReturnValueOnce([postWithCustomTag]);
    vi.mocked(blogData.getAllUniqueTags).mockReturnValueOnce(["CustomTopic", "Other"]);

    renderTag("customtopic");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "CustomTopic" })).toBeInTheDocument();
    });
    expect(screen.getByText("Custom Tag Post")).toBeInTheDocument();
  });

  it("shows Category not found when categoryName param is missing (useMemo return null)", async () => {
    vi.mocked(blogData.loadAllBlogPosts).mockResolvedValueOnce(undefined);
    vi.mocked(blogData.getAllBlogPosts).mockReturnValueOnce([]);
    vi.mocked(blogData.getAllUniqueTags).mockReturnValueOnce([]);

    renderTagWithPath("/resources/tag");

    await waitFor(() => {
      expect(screen.getByText("Category not found")).toBeInTheDocument();
    });
  });

  it("filters posts by category match and by tags include (post.tags && post.tags.includes)", async () => {
    const postByCategory: BlogPost = {
      id: 1,
      title: "By Category",
      date: "Jan 1, 2026",
      excerpt: "E",
      category: "Frontend Architecture",
      image: "https://example.com/1.jpg",
      link: "/blog/a",
      slug: "by-category",
    };
    const postByTag: BlogPost = {
      id: 2,
      title: "By Tag",
      date: "Jan 2, 2026",
      excerpt: "E",
      category: "Other",
      image: "https://example.com/2.jpg",
      link: "/blog/b",
      slug: "by-tag",
      tags: ["Frontend Architecture"],
    };
    vi.mocked(blogData.loadAllBlogPosts).mockResolvedValueOnce(undefined);
    vi.mocked(blogData.getAllBlogPosts).mockReturnValueOnce([postByCategory, postByTag]);
    vi.mocked(blogData.getAllUniqueTags).mockReturnValueOnce(["Frontend Architecture", "Other"]);

    renderTag("frontend-architecture");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Frontend Architecture" })).toBeInTheDocument();
    });

    expect(screen.getByText("By Category")).toBeInTheDocument();
    expect(screen.getByText("By Tag")).toBeInTheDocument();
  });
});

