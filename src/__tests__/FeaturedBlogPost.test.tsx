import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeaturedBlogPost } from "@/sections/FeaturedBlogPost";
import type { BlogPost } from "@/data/blog/types";

const mockPost: BlogPost = {
  id: 1,
  title: "Test Post",
  date: "January 1, 2026",
  excerpt: "Excerpt",
  category: "Testing",
  image: "https://example.com/image.jpg",
  link: "/resources/blog/test-post",
  slug: "test-post",
};

describe("FeaturedBlogPost", () => {
  it("renders placeholder when post is null", () => {
    render(
      <MemoryRouter>
        <FeaturedBlogPost post={null} />
      </MemoryRouter>
    );
    expect(screen.getByText("Featured Blog Post")).toBeTruthy();
    expect(screen.queryByText("READ THE BLOG")).toBeFalsy();
    const img = screen.getByAltText("Featured Blog Post");
    expect(img).toBeTruthy();
    expect(img.tagName).toBe("IMG");
  });

  it("renders post link and CTA when post is provided", () => {
    render(
      <MemoryRouter>
        <FeaturedBlogPost post={mockPost} />
      </MemoryRouter>
    );
    const links = screen.getAllByRole("link", { name: /test post/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute("href")).toBe("/resources/blog/test-post");
    expect(screen.getByText("READ THE BLOG")).toBeTruthy();
    const imgLink = screen.getByRole("link", { name: /read test post/i });
    expect(imgLink).toBeTruthy();
    expect(screen.getByAltText("Test Post")).toBeTruthy();
  });
});
