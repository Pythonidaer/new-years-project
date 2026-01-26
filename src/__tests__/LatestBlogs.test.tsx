import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

  it("renders up to 3 most recent blog posts", async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for blog posts to load
    await waitFor(() => {
      const articles = document.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    // Should render blog post cards (up to 3)
    const articles = document.querySelectorAll('article');
    expect(articles.length).toBeLessThanOrEqual(3);
  });

  it("displays blog post titles", async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for blog posts to load
    await waitFor(() => {
      const titleLinks = document.querySelectorAll('a[href*="/resources/blog/"]');
      expect(titleLinks.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it("displays blog post dates", async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for blog posts to load
    await waitFor(() => {
      const timeElements = document.querySelectorAll('time');
      expect(timeElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it("renders blog post images with proper alt text", async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for blog posts to load
    await waitFor(() => {
      const images = document.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    const images = document.querySelectorAll('img');
    // Each image should have alt text
    images.forEach((img) => {
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });

  it("renders blog post images as links", async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LatestBlogs />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for blog posts to load
    await waitFor(() => {
      const imageLinks = document.querySelectorAll('a[href*="/resources/blog/"] img');
      expect(imageLinks.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});
