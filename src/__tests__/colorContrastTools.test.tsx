import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ColorPairing } from "@/components/blog-tools/color-contrast/ColorPairing";
import { ContrastComparison } from "@/components/blog-tools/color-contrast/ContrastComparison";
import { ContrastGenerator } from "@/components/blog-tools/color-contrast/ContrastGenerator";

function termValue(term: string): string {
  const label = screen.getAllByText(term).find((node) => node.tagName === "DT");
  return label?.parentElement?.querySelector("dd")?.textContent ?? "";
}

function ratioFrom(): number {
  return Number(termValue("Contrast ratio").replace(":1", ""));
}

describe("ContrastComparison", () => {
  it("changes mode once per click and keeps the sample in range", () => {
    render(<ContrastComparison />);
    const low = screen.getByRole("radio", { name: "Low contrast" });
    const high = screen.getByRole("radio", { name: "High contrast" });
    expect(low).toBeChecked();
    expect(ratioFrom()).toBeLessThan(3);

    fireEvent.click(high);
    expect(high).toBeChecked();
    expect(low).not.toBeChecked();
    expect(ratioFrom()).toBeGreaterThanOrEqual(7);

    fireEvent.click(high);
    expect(high).toBeChecked();
    expect(low).not.toBeChecked();
  });

  it("keeps separate state for two instances", () => {
    render(
      <>
        <ContrastComparison />
        <ContrastComparison />
      </>,
    );
    const lows = screen.getAllByRole("radio", { name: "Low contrast" });
    const highs = screen.getAllByRole("radio", { name: "High contrast" });
    fireEvent.click(highs[1]);
    expect(highs[1]).toBeChecked();
    expect(lows[0]).toBeChecked();
    expect(highs[0]).not.toBeChecked();
  });

  it("leaves focus on the generate button", () => {
    render(<ContrastComparison />);
    const button = screen.getByRole("button", { name: "Generate example" });
    button.focus();
    fireEvent.click(button);
    expect(document.activeElement).toBe(button);
    expect(ratioFrom()).toBeLessThan(3);
  });
});

describe("ContrastGenerator", () => {
  it("generates only from its button and leaves the document background alone", () => {
    document.body.style.backgroundColor = "rgb(1, 2, 3)";
    render(
      <div>
        <p>Article text</p>
        <ContrastGenerator />
      </div>,
    );
    const before = termValue("Foreground");
    fireEvent.click(screen.getByText("Article text"));
    fireEvent.click(document.body);
    const afterClick = termValue("Foreground");
    expect(afterClick).toBe(before);
    expect(document.body.style.backgroundColor).toBe("rgb(1, 2, 3)");

    const button = screen.getByRole("button", { name: "Generate pair" });
    button.focus();
    fireEvent.click(button);
    expect(document.activeElement).toBe(button);
    expect(ratioFrom()).toBeGreaterThanOrEqual(7);
    expect(document.body.style.backgroundColor).toBe("rgb(1, 2, 3)");
  });
});

describe("ColorPairing", () => {
  it("shows invalid input and an impossible AAA pairing without changing the base color", () => {
    render(<ColorPairing />);
    const hex = screen.getByLabelText("Hex color");
    const picker = screen.getByLabelText("Color picker");
    fireEvent.change(picker, { target: { value: "#336699" } });
    expect(hex).toHaveValue("#336699");

    fireEvent.change(hex, { target: { value: "zzzz" } });
    expect(screen.getByText(/Use #RGB or #RRGGBB/)).toBeInTheDocument();
    expect(hex).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(screen.getByRole("button", { name: "Generate matching color" }));
    expect(screen.getAllByText(/Use #RGB or #RRGGBB/).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("contrast-preview")).not.toBeInTheDocument();

    fireEvent.change(hex, { target: { value: "#777777" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate matching color" }));
    expect(hex).toHaveValue("#777777");
    expect(hex).not.toHaveAttribute("aria-invalid");
    expect(screen.getAllByText(/cannot reach 7.00:1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/left unchanged/).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("contrast-preview")).not.toBeInTheDocument();
  });

  it("preserves the base color for a possible AA pair and can generate again", () => {
    render(<ColorPairing />);
    const hex = screen.getByLabelText("Hex color");
    fireEvent.change(hex, { target: { value: "#abc" } });
    fireEvent.blur(hex);
    expect(hex).toHaveValue("#AABBCC");
    expect(screen.getByLabelText("Color picker")).toHaveValue("#aabbcc");

    fireEvent.change(screen.getByLabelText("Use this color as"), { target: { value: "background" } });
    fireEvent.change(screen.getByLabelText("Contrast target"), { target: { value: "4.5" } });
    const button = screen.getByRole("button", { name: "Generate matching color" });
    button.focus();
    fireEvent.click(button);
    expect(document.activeElement).toBe(button);
    expect(termValue("Background")).toBe("#AABBCC");
    expect(ratioFrom()).toBeGreaterThanOrEqual(4.5);

    fireEvent.click(button);
    expect(termValue("Background")).toBe("#AABBCC");
    expect(ratioFrom()).toBeGreaterThanOrEqual(4.5);
  });
});
