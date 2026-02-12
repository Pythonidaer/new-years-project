import { describe, it, expect, beforeEach, vi } from "vitest";
import { useState } from "react";
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

function TestComponentWithImport() {
  const { theme, importTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-bg">{theme.bg}</div>
      <button onClick={() => importTheme("not valid json")}>Import Invalid</button>
    </div>
  );
}

function TestComponentWithExport() {
  const { theme, exportTheme } = useTheme();
  const [exported, setExported] = useState<string>("");
  return (
    <div>
      <div data-testid="theme-bg">{theme.bg}</div>
      <button onClick={() => setExported(exportTheme())}>Export Theme</button>
      <pre data-testid="exported">{exported}</pre>
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

    const finalCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    expect(finalCount).toBe(initialCount);
  });

  it("deletePreset returns early when preset is built-in (does not remove from list)", () => {
    function DeleteDefaultComponent() {
      const { presets, deletePreset } = useTheme();
      return (
        <div>
          <div data-testid="presets-count">{presets.length}</div>
          <button onClick={() => deletePreset("default")}>Delete Default</button>
        </div>
      );
    }
    render(
      <ThemeProvider>
        <DeleteDefaultComponent />
      </ThemeProvider>
    );
    const initialCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    fireEvent.click(screen.getByText("Delete Default"));
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

  it("falls back to built-in presets when theme-presets JSON is invalid (catch in presets initializer)", () => {
    localStorage.setItem("theme-presets", "not valid json");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const presetsCount = parseInt(screen.getByTestId("presets-count").textContent || "0");
    expect(presetsCount).toBeGreaterThanOrEqual(30);
  });

  it("handles invalid theme-presets when resolving currentPresetId (catch in currentPresetId initializer)", () => {
    localStorage.setItem("user-theme", JSON.stringify(defaultTheme));
    localStorage.setItem("theme-presets", "invalid");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
  });

  it("exportTheme returns JSON string of current theme", () => {
    render(
      <ThemeProvider>
        <TestComponentWithExport />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText("Export Theme"));
    const exported = screen.getByTestId("exported").textContent ?? "";
    expect(exported).toBeTruthy();
    const parsed = JSON.parse(exported);
    expect(parsed).toHaveProperty("bg", defaultTheme.bg);
  });

  it("importTheme catches invalid JSON and does not update theme", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ThemeProvider>
        <TestComponentWithImport />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
    fireEvent.click(screen.getByText("Import Invalid"));
    expect(screen.getByTestId("theme-bg").textContent).toBe(defaultTheme.bg);
    expect(consoleSpy).toHaveBeenCalledWith("Failed to import theme:", expect.any(Error));

    consoleSpy.mockRestore();
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
