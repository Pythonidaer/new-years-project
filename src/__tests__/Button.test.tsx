import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/Button";

describe("Button", () => {
  it("renders with default primary variant", () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole("button", { name: /click/i });
    expect(btn).toBeTruthy();
    expect(btn.className).toContain("primary");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button", { name: /secondary/i });
    expect(btn.className).toContain("secondary");
  });

  it("renders with secondary-orange variant", () => {
    render(<Button variant="secondary-orange">Orange</Button>);
    const btn = screen.getByRole("button", { name: /orange/i });
    expect(btn.className).toContain("secondaryOrange");
  });

  it("does not show chevron when showChevron is false", () => {
    const { container } = render(<Button showChevron={false}>Text</Button>);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("shows right chevron when showChevron true and chevronPosition right (default)", () => {
    const { container } = render(<Button showChevron>Text</Button>);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(1);
    expect(container.querySelector("button")?.querySelector("svg")).toBeTruthy();
  });

  it("shows left chevron when showChevron true and chevronPosition left", () => {
    const { container } = render(
      <Button showChevron chevronPosition="left">
        Text
      </Button>
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(1);
    expect(container.querySelector("button")?.querySelector("svg")).toBeTruthy();
  });

  it("does not show chevron when showChevron true but variant is secondary", () => {
    const { container } = render(
      <Button showChevron variant="secondary">
        Text
      </Button>
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("shows chevron when showChevron true and variant is secondary-orange", () => {
    const { container } = render(
      <Button showChevron variant="secondary-orange">
        Text
      </Button>
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(1);
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click</Button>);
    const btn = screen.getByRole("button", { name: /click/i });
    expect(btn.className).toContain("custom-class");
  });

  it("merges variant class and className", () => {
    render(
      <Button variant="secondary" className="my-class">
        Click
      </Button>
    );
    const btn = screen.getByRole("button", { name: /click/i });
    expect(btn.className).toContain("secondary");
    expect(btn.className).toContain("my-class");
  });
});
