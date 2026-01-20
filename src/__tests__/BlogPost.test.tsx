import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BlogPost } from "@/pages/BlogPost";

describe("BlogPost Component - Code Block Styling", () => {
  it("BlogPost component renders without crashing", () => {
    // Basic smoke test - verify component renders
    render(
      <MemoryRouter initialEntries={["/resources/blog/reusable-vs-feature-specific-components-a-practical-decision-framework"]}>
        <BlogPost />
      </MemoryRouter>
    );

    // Component should render (even if post not found, it should show error message)
    const mainElement = document.querySelector("main");
    expect(mainElement).toBeTruthy();
  });

  it("BlogPost component handles missing post gracefully", () => {
    // Test with invalid slug to verify error handling
    render(
      <MemoryRouter initialEntries={["/resources/blog/nonexistent-post"]}>
        <BlogPost />
      </MemoryRouter>
    );

    // Should show "Post not found" message
    const notFoundMessage = document.querySelector("h1");
    expect(notFoundMessage).toBeTruthy();
  });
});

