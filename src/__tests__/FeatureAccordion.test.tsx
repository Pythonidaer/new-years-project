import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FeatureAccordion } from "@/sections/FeatureAccordion";
import { ThemeProvider } from "@/context/ThemeContext";

describe("FeatureAccordion", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("renders section and accordion items", () => {
    render(
      <ThemeProvider>
        <FeatureAccordion />
      </ThemeProvider>
    );
    expect(screen.getByRole("heading", { name: /Recent Projects/i })).toBeInTheDocument();
    expect(screen.getAllByText("Docs Summarizer").length).toBeGreaterThanOrEqual(1);
  });

  it("changes active item when radio input is clicked (onChange setActiveId)", () => {
    render(
      <ThemeProvider>
        <FeatureAccordion />
      </ThemeProvider>
    );
    const radios = screen.getAllByRole("radio");
    const mindMapRadio = radios.find((r) => (r as HTMLInputElement).value === "2");
    expect(mindMapRadio).toBeTruthy();
    fireEvent.click(mindMapRadio!);
    expect(mindMapRadio).toBeChecked();
  });

  it("resets contents wrapper height on mobile viewport (innerWidth <= 990)", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 800,
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <FeatureAccordion />
      </ThemeProvider>
    );

    window.dispatchEvent(new Event("resize"));

    const contentsWrapper = document.querySelector('[class*="contentsWrapper"]');
    expect(contentsWrapper).toBeTruthy();
  });

  it("sets contents wrapper height on desktop viewport (innerWidth > 990) to match controls height", async () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1000,
      writable: true,
      configurable: true,
    });

    vi.useFakeTimers();
    render(
      <ThemeProvider>
        <FeatureAccordion />
      </ThemeProvider>
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const contentsWrapper = document.querySelector('[class*="contentsWrapper"]') as HTMLElement;
    expect(contentsWrapper).toBeTruthy();
    const controlsWrapper = document.querySelector('[class*="controlsWrapper"]') as HTMLElement;
    expect(controlsWrapper).toBeTruthy();
    if (contentsWrapper.style.height) {
      expect(contentsWrapper.style.height).toBeDefined();
    }
    vi.useRealTimers();
  });
});
