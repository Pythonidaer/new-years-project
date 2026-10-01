import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBanner } from "@/sections/TopBanner";

describe("TopBanner", () => {
  it("keeps the employment banner hidden", () => {
    render(<TopBanner />);

    expect(screen.queryByText(/open to employment opportunities/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /close banner/i })).toBeNull();
  });

  it("clears the reserved banner height", () => {
    document.documentElement.style.setProperty("--banner-height", "48px");

    render(<TopBanner />);

    expect(document.documentElement.style.getPropertyValue("--banner-height")).toBe("0px");
  });
});
