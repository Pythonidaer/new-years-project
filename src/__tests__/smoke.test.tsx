import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../App";
import { ThemeProvider } from "../context/ThemeContext";

describe("App", () => {
  it("renders the hero heading", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
    // Check for hero title - should contain "Lorem" and "dolce decorum"
    const heroTitle = screen.getByText(/dolce decorum/i);
    expect(heroTitle).toBeTruthy();
  });
});
