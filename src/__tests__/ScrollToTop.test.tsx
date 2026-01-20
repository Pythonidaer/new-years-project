import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";

describe("ScrollToTop Component", () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>;
  let querySelectorSpy: ReturnType<typeof vi.spyOn>;
  let getBoundingClientRectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.scrollTo
    scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    // Mock getBoundingClientRect
    getBoundingClientRectSpy = vi.fn(() => ({
      top: 500,
      left: 0,
      bottom: 600,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 500,
      toJSON: vi.fn(),
    }));

    // Mock document.querySelector
    querySelectorSpy = vi.spyOn(document, "querySelector").mockImplementation((selector: string) => {
      if (selector === "#test-section") {
        return {
          getBoundingClientRect: getBoundingClientRectSpy,
        } as unknown as Element;
      }
      return null;
    });

    // Mock window.scrollY
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    scrollToSpy.mockRestore();
    querySelectorSpy.mockRestore();
  });

  it("scrolls to top when there is no hash", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls to hash anchor element when hash is present", async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter initialEntries={["/#test-section"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    // Initially, scrollTo should not be called (waiting for timeout)
    expect(scrollToSpy).not.toHaveBeenCalled();

    // Fast-forward the 100ms timeout
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(querySelectorSpy).toHaveBeenCalledWith("#test-section");
    expect(getBoundingClientRectSpy).toHaveBeenCalled();
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 390, // 500 (elementPosition) + 0 (scrollY) - 110 (headerOffset)
      behavior: "smooth",
    });
  });

  it("accounts for header offset when scrolling to hash anchor", async () => {
    vi.useFakeTimers();

    // Set window.scrollY to simulate already scrolled page
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 200,
    });

    render(
      <MemoryRouter initialEntries={["/#test-section"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 590, // 500 (elementPosition) + 200 (scrollY) - 110 (headerOffset)
      behavior: "smooth",
    });
  });

  it("does not scroll if hash element is not found", async () => {
    vi.useFakeTimers();

    // Mock querySelector to return null (element not found)
    querySelectorSpy.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/#nonexistent"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(querySelectorSpy).toHaveBeenCalledWith("#nonexistent");
    // scrollTo should not be called because element was not found
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("scrolls to top when pathname changes without hash", () => {
    // Test initial render
    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockClear();
    unmount();

    // Test different pathname - new render triggers effect
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls to hash when hash changes", async () => {
    vi.useFakeTimers();

    // Test initial render without hash
    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockClear();
    unmount();

    // Test route with hash - new render triggers effect
    render(
      <MemoryRouter initialEntries={["/#test-section"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 390,
      behavior: "smooth",
    });
  });

  it("waits 100ms before scrolling to hash anchor", async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter initialEntries={["/#test-section"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    // Before timeout, scrollTo should not be called
    expect(scrollToSpy).not.toHaveBeenCalled();

    // Advance by 99ms - still should not be called
    await act(async () => {
      vi.advanceTimersByTime(99);
    });
    expect(scrollToSpy).not.toHaveBeenCalled();

    // Advance by 1ms more (total 100ms) - should be called now
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(scrollToSpy).toHaveBeenCalled();
  });

  it("uses smooth scroll behavior for hash anchors", async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter initialEntries={["/#test-section"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: "smooth",
      })
    );
  });

  it("handles multiple hash changes correctly", async () => {
    vi.useFakeTimers();

    const getBoundingClientRect1 = vi.fn(() => ({
      top: 300,
      left: 0,
      bottom: 400,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 300,
      toJSON: vi.fn(),
    }));

    const getBoundingClientRect2 = vi.fn(() => ({
      top: 800,
      left: 0,
      bottom: 900,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 800,
      toJSON: vi.fn(),
    }));

    // Test first hash
    querySelectorSpy.mockImplementation((selector: string) => {
      if (selector === "#section1") {
        return {
          getBoundingClientRect: getBoundingClientRect1,
        } as unknown as Element;
      }
      return null;
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={["/#section1"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 190, // 300 - 110
      behavior: "smooth",
    });

    scrollToSpy.mockClear();
    unmount();

    // Test second hash - new render triggers effect
    querySelectorSpy.mockImplementation((selector: string) => {
      if (selector === "#section2") {
        return {
          getBoundingClientRect: getBoundingClientRect2,
        } as unknown as Element;
      }
      return null;
    });

    render(
      <MemoryRouter initialEntries={["/#section2"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 690, // 800 - 110
      behavior: "smooth",
    });
  });

  it("returns null (renders nothing)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    // Component should render nothing (return null)
    expect(container.firstChild).toBeNull();
  });
});
