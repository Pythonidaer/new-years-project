import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopBanner } from "@/sections/TopBanner";

describe("TopBanner", () => {
  beforeEach(() => {
    vi.stubGlobal("scrollY", 0);
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => setTimeout(cb, 0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders banner when visible", () => {
    render(<TopBanner />);
    expect(
      screen.getByText(/I am currently open to employment opportunities/i)
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /close banner/i })).toBeTruthy();
  });

  it("hides banner when close button is clicked", () => {
    render(<TopBanner />);
    const closeBtn = screen.getByRole("button", { name: /close banner/i });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByText(/I am currently open to employment opportunities/i)
    ).toBeFalsy();
  });

  it("updates when window is scrolled", async () => {
    render(<TopBanner />);
    expect(
      screen.getByText(/I am currently open to employment opportunities/i)
    ).toBeTruthy();
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    fireEvent.scroll(window, { target: document.documentElement });
    await new Promise((r) => setTimeout(r, 50));
    const banner = document.querySelector("[class*='banner']");
    expect(banner).toBeTruthy();
  });
});
