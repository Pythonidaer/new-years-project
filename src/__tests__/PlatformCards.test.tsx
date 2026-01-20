import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlatformCards } from "@/sections/PlatformCards";
import { ThemeProvider } from "@/context/ThemeContext";

describe("PlatformCards Component", () => {
  it("renders all 4 platform cards", () => {
    render(
      <ThemeProvider>
        <PlatformCards />
      </ThemeProvider>
    );

    // Should render 4 cards
    const cards = document.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it("displays all card titles", () => {
    render(
      <ThemeProvider>
        <PlatformCards />
      </ThemeProvider>
    );

    expect(screen.getByText("Commonwealth Financial Network")).toBeTruthy();
    expect(screen.getByText("Boston Children's Hospital")).toBeTruthy();
    expect(screen.getByText("WordPress Development")).toBeTruthy();
    expect(screen.getByText("Carrot")).toBeTruthy();
  });

  it("displays all card descriptions", () => {
    render(
      <ThemeProvider>
        <PlatformCards />
      </ThemeProvider>
    );

    expect(screen.getByText(/Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua/i)).toBeTruthy();
    expect(screen.getByText(/Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris/i)).toBeTruthy();
    expect(screen.getByText(/Duis aute irure dolor in reprehenderit in voluptate velit esse/i)).toBeTruthy();
    expect(screen.getByText(/Excepteur sint occaecat cupidatat non proident, sunt in culpa/i)).toBeTruthy();
  });

  it("renders placeholder text for card images", () => {
    render(
      <ThemeProvider>
        <PlatformCards />
      </ThemeProvider>
    );

    // Should have 4 placeholder text elements
    const placeholders = screen.getAllByText("Image");
    expect(placeholders.length).toBe(4);
  });

  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <PlatformCards />
      </ThemeProvider>
    );

    // Component should render
    const section = document.querySelector('section');
    expect(section).toBeTruthy();
  });
});
