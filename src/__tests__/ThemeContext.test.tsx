import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { defaultTheme } from "@/context/themeData";
import { useTheme } from "@/context/useTheme";

// Test component that uses useTheme
function TestComponent() {
  const { theme, updateTheme, resetTheme, presets, savePreset, loadPreset, deletePreset, currentPresetId } = useTheme();
  return (
    <div>
      <div data-testid="current-preset">{currentPresetId || "none"}</div>
      <div data-testid="theme-bg">{theme.bg}</div>
      <div data-testid="presets-count">{presets.length}</div>
      <button onClick={() => updateTheme({ bg: "#FF0000" })}>Update Theme</button>
      <button onClick={() => resetTheme()}>Reset Theme</button>
      <button onClick={() => savePreset("Test Preset")}>Save Preset</button>
      <button onClick={() => loadPreset("default")}>Load Default</button>
      <button onClick={() => deletePreset("custom-123")}>Delete Preset</button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides default theme when no saved theme exists", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
  });

  it("loads theme from localStorage on mount", () => {
    const savedTheme = { ...defaultTheme, bg: "#123456" };
    localStorage.setItem("user-theme", JSON.stringify(savedTheme));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-bg").textContent).toBe("#123456");
  });

  it("updates theme and saves to localStorage", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const updateButton = screen.getByText("Update Theme");
    fireEvent.click(updateButton);

    expect(screen.getByTestId("theme-bg").textContent).toBe("#FF0000");
    const saved = JSON.parse(localStorage.getItem("user-theme") || "{}");
    expect(saved.bg).toBe("#FF0000");
  });

  it("resets theme to default", () => {
    // Set a custom theme first
    localStorage.setItem("user-theme", JSON.stringify({ ...defaultTheme, bg: "#123456" }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-bg").textContent).toBe("#123456");

    const resetButton = screen.getByText("Reset Theme");
    fireEvent.click(resetButton);

    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
    expect(localStorage.getItem("user-theme")).toBeNull();
  });

  it("saves custom preset", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const saveButton = screen.getByText("Save Preset");
    fireEvent.click(saveButton);

    // Should have built-in presets + 1 custom preset
    const presetsCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    expect(presetsCount).toBeGreaterThan(30); // Built-in presets + custom
  });

  it("loads preset and updates theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const loadButton = screen.getByText("Load Default");
    fireEvent.click(loadButton);

    expect(screen.getByTestId("current-preset").textContent).toBe("default");
    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
  });

  it("does not delete built-in presets", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const initialCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    
    const deleteButton = screen.getByText("Delete Preset");
    fireEvent.click(deleteButton);

    // Count should remain the same (built-in presets can't be deleted)
    const finalCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    expect(finalCount).toBe(initialCount);
  });

  it("provides all built-in presets", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const presetsCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    expect(presetsCount).toBeGreaterThanOrEqual(30); // At least 30 built-in presets
  });

  it("handles invalid localStorage gracefully", () => {
    localStorage.setItem("user-theme", "invalid json");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should fall back to default theme
    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
  });

  it("applies theme to DOM on mount", () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const rootElement = document.getElementById("root");
    expect(rootElement?.style.getPropertyValue("--color-bg")).toBe(defaultTheme.bg);
    
    document.body.removeChild(root);
  });
});

describe("useTheme hook", () => {
  it("throws error when used outside ThemeProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTheme must be used within ThemeProvider");

    consoleSpy.mockRestore();
  });
});
