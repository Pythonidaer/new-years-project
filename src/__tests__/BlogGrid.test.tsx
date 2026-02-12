import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { BlogGrid } from "@/sections/BlogGrid";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock blog data
const mockBlogPosts = [
  {
    id: 1,
    title: "Test Blog Post 1",
    date: "January 15, 2024",
    excerpt: "This is a test excerpt for blog post 1",
    category: "Blog",
    image: "/test-image.jpg",
    link: "/resources/blog/test-1",
  },
  {
    id: 2,
    title: "Test Blog Post 2",
    date: "January 10, 2024",
    excerpt: "This is a test excerpt for blog post 2",
    category: "Blog",
    image: "/test-image.jpg",
    link: "/resources/blog/test-2",
  },
];

describe("BlogGrid Component", () => {
  it("renders blog posts from provided data", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <BlogGrid posts={mockBlogPosts} />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("Test Blog Post 1")).toBeTruthy();
    expect(screen.getByText("Test Blog Post 2")).toBeTruthy();
  });

  it("displays blog post dates", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <BlogGrid posts={mockBlogPosts} />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("January 15, 2024")).toBeTruthy();
    expect(screen.getByText("January 10, 2024")).toBeTruthy();
  });

  // Excerpts removed from blog cards to match reference design
  // it("displays blog post excerpts", () => {
  //   render(
  //     <BrowserRouter>
  //       <ContentProvider>
  //         <BlogGrid posts={mockBlogPosts} />
  //       </ContentProvider>
  //     </BrowserRouter>
  //   );

  //   expect(screen.getByText("This is a test excerpt for blog post 1")).toBeTruthy();
  //   expect(screen.getByText("This is a test excerpt for blog post 2")).toBeTruthy();
  // });

  it("displays category tags", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <BlogGrid posts={mockBlogPosts} />
        </ThemeProvider>
      </BrowserRouter>
    );

    const categoryTags = screen.getAllByText("Blog");
    expect(categoryTags.length).toBeGreaterThan(0);
  });

  it("renders Load More button when there are more posts", () => {
    const manyPosts = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      date: "January 1, 2024",
      excerpt: "Test excerpt",
      category: "Blog",
      image: "/test.jpg",
      link: `/resources/blog/post-${i + 1}`,
    }));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <BlogGrid posts={manyPosts} />
        </ThemeProvider>
      </BrowserRouter>
    );

    const loadMoreButton = screen.queryByText(/load more/i);
    // Load More button should be present if we have more than 9 posts
    if (manyPosts.length > 9) {
      expect(loadMoreButton).toBeTruthy();
    }
  });

  it("renders exactly 9 posts initially", () => {
    const manyPosts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      date: "January 1, 2024",
      excerpt: "Test excerpt",
      category: "Blog",
      image: "/test.jpg",
      link: `/resources/blog/post-${i + 1}`,
    }));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <BlogGrid posts={manyPosts} />
        </ThemeProvider>
      </BrowserRouter>
    );

    const postTitles = screen.getAllByText(/Post \d+/);
    expect(postTitles.length).toBe(9);
  });

  it("handleLoadMore increases visible posts when LOAD MORE is clicked", () => {
    const manyPosts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      date: "January 1, 2024",
      excerpt: "Test excerpt",
      category: "Blog",
      image: "/test.jpg",
      link: `/resources/blog/post-${i + 1}`,
    }));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <BlogGrid posts={manyPosts} />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Post \d+/).length).toBe(9);
    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    fireEvent.click(loadMoreButton);
    expect(screen.getAllByText(/Post \d+/).length).toBe(15);
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });
});
