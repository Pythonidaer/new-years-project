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
    // Check for hero title - should contain "beautiful interfaces" (text is split across span)
    const heroTitle = screen.getByText(/beautiful interfaces/i);
    expect(heroTitle).toBeTruthy();
  });
});
