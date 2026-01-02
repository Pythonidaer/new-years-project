import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { ContentProvider } from "../content/ContentProvider";

describe("App", () => {
  it("renders the hero heading", () => {
    render(
      <ContentProvider>
        <App />
      </ContentProvider>
    );
    // Check for hero title - should contain "Lorem" and "dolce decorum" (default topic)
    const heroTitle = screen.getByText(/dolce decorum/i);
    expect(heroTitle).toBeTruthy();
  });
});
