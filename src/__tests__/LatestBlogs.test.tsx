import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LatestBlogs } from "@/sections/LatestBlogs";
import { ThemeProvider } from "@/context/ThemeContext";

describe("LatestBlogs Component", () => {
  it("renders the Latest Blogs heading", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    const heading = screen.getByText("Latest Blogs");
    expect(heading).toBeTruthy();
  });

  it("renders up to 3 most recent blog posts", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Should render blog post cards (up to 3)
    const articles = document.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
    expect(articles.length).toBeLessThanOrEqual(3);
  });

  it("displays blog post titles", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Should have at least one blog post title link
    const titleLinks = document.querySelectorAll('a[href*="/resources/blog/"]');
    expect(titleLinks.length).toBeGreaterThan(0);
  });

  it("displays blog post dates", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Should have time elements for dates
    const timeElements = document.querySelectorAll('time');
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("renders blog post images with proper alt text", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    const images = document.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    
    // Each image should have alt text
    images.forEach((img) => {
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });

  it("renders blog post images as links", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Images should be wrapped in links
    const imageLinks = document.querySelectorAll('a[href*="/resources/blog/"] img');
    expect(imageLinks.length).toBeGreaterThan(0);
  });
});
