import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LatestNews } from "@/sections/LatestNews";

describe("LatestNews Component", () => {
  it("renders the Latest Blogs heading", () => {
    render(
      <BrowserRouter>
        <LatestNews />
      </BrowserRouter>
    );

    const heading = screen.getByText("Latest Blogs");
    expect(heading).toBeTruthy();
  });

  it("renders up to 3 most recent blog posts", () => {
    render(
      <BrowserRouter>
        <LatestNews />
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
        <LatestNews />
      </BrowserRouter>
    );

    // Should have at least one blog post title link
    const titleLinks = document.querySelectorAll('a[href*="/resources/blog/"]');
    expect(titleLinks.length).toBeGreaterThan(0);
  });

  it("displays blog post dates", () => {
    render(
      <BrowserRouter>
        <LatestNews />
      </BrowserRouter>
    );

    // Should have time elements for dates
    const timeElements = document.querySelectorAll('time');
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("renders blog post images with proper alt text", () => {
    render(
      <BrowserRouter>
        <LatestNews />
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
        <LatestNews />
      </BrowserRouter>
    );

    // Images should be wrapped in links
    const imageLinks = document.querySelectorAll('a[href*="/resources/blog/"] img');
    expect(imageLinks.length).toBeGreaterThan(0);
  });
});
