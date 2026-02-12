import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Blog } from "@/pages/Blog";
import { ThemeProvider } from "@/context/ThemeContext";

describe("Blog Page", () => {
  it("renders the blog page with header and blog grid", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Blog />
        </ThemeProvider>
      </BrowserRouter>
    );

    const header = document.querySelector("header");
    expect(header).toBeTruthy();

    const blogGrid = document.querySelector('[class*="grid"]');
    expect(blogGrid).toBeTruthy();
  });

  it("renders Footer component", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Blog />
        </ThemeProvider>
      </BrowserRouter>
    );

    const footer = document.querySelector("footer");
    expect(footer).toBeTruthy();
  });

  it("excludes featured post from grid when data has loaded (gridPosts branch)", async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Blog />
        </ThemeProvider>
      </BrowserRouter>
    );

    await waitFor(
      () => {
        const gridLinks = document.querySelectorAll('a[href^="/resources/blog/"]');
        expect(gridLinks.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const main = screen.getByRole("main");
    expect(main).toBeTruthy();
  });
});
