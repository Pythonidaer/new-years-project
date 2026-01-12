import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Blog } from "../pages/Blog";

describe("Blog Page", () => {
  it("renders the blog page with header and blog grid", () => {
    render(
      <BrowserRouter>
        <Blog />
      </BrowserRouter>
    );

    // Check that TopBanner is rendered
    const topBanner = document.querySelector('[class*="banner"]');
    expect(topBanner).toBeTruthy();

    // Check that Header is rendered
    const header = document.querySelector("header");
    expect(header).toBeTruthy();

    // Check that BlogGrid is rendered
    const blogGrid = document.querySelector('[class*="grid"]');
    expect(blogGrid).toBeTruthy();
  });

  it("renders Footer component", () => {
    render(
      <BrowserRouter>
        <Blog />
      </BrowserRouter>
    );

    const footer = document.querySelector("footer");
    expect(footer).toBeTruthy();
  });
});

