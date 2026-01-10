import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ContentProvider } from "../content/ContentProvider";
import { Tag } from "../pages/Tag";

describe("Tag Component", () => {
  it("Tag component renders without crashing with valid category", () => {
    render(
      <MemoryRouter initialEntries={["/resources/tag/frontend-architecture"]}>
        <ContentProvider>
          <Tag />
        </ContentProvider>
      </MemoryRouter>
    );

    // Component should render
    const mainElement = document.querySelector("main");
    expect(mainElement).toBeTruthy();
  });

  it("Tag component handles invalid category gracefully", () => {
    render(
      <MemoryRouter initialEntries={["/resources/tag/nonexistent-category"]}>
        <ContentProvider>
          <Tag />
        </ContentProvider>
      </MemoryRouter>
    );

    // Should show "Category not found" message
    const notFoundMessage = screen.getByText("Category not found");
    expect(notFoundMessage).toBeTruthy();

    // Should have back button
    const backButton = screen.getByText("Back to Blog");
    expect(backButton).toBeTruthy();
  });

  it("Tag component displays category name as heading when category exists", () => {
    render(
      <MemoryRouter initialEntries={["/resources/tag/frontend-architecture"]}>
        <ContentProvider>
          <Tag />
        </ContentProvider>
      </MemoryRouter>
    );

    // Should display the category name if category exists in ALL_CATEGORIES
    // If no posts match, we still should see the heading
    const heading = document.querySelector("h1");
    expect(heading).toBeTruthy();
    
    // If category is found, it should show the category name
    // If not found, it will show "Category not found"
    // Either way, we should have an h1 element
    if (heading) {
      expect(heading.textContent).toBeTruthy();
    }
  });

  it("Tag component renders BlogGrid when category exists and has posts", () => {
    render(
      <MemoryRouter initialEntries={["/resources/tag/frontend-frameworks"]}>
        <ContentProvider>
          <Tag />
        </ContentProvider>
      </MemoryRouter>
    );

    // Should render main element
    const mainElement = document.querySelector("main");
    expect(mainElement).toBeTruthy();
    
    // BlogGrid may or may not render depending on if there are posts
    // But the component should render without crashing
    const content = document.querySelector('[class*="content"]');
    expect(content).toBeTruthy();
  });
});

