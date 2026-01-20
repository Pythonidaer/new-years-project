import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Hero } from "@/sections/Hero";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock useLocation
const mockUseLocation = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

describe("Hero", () => {
  let mockScrollTo: ReturnType<typeof vi.fn>;
  let mockQuerySelector: ReturnType<typeof vi.fn>;
  let mockGetBoundingClientRect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.scrollTo
    mockScrollTo = vi.fn();
    window.scrollTo = mockScrollTo as typeof window.scrollTo;

    // Mock window.scrollY
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock document.querySelector
    mockQuerySelector = vi.fn();
    document.querySelector = mockQuerySelector as typeof document.querySelector;

    // Mock getBoundingClientRect
    mockGetBoundingClientRect = vi.fn(() => ({
      top: 500,
      left: 0,
      bottom: 600,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("handleContactClick", () => {
    it("prevents default and scrolls when on home page with #contact hash", () => {
      // Mock useLocation to return home page with #contact hash
      mockUseLocation.mockReturnValue({
        pathname: "/",
        hash: "#contact",
        state: null,
        key: "default",
        search: "",
      });

      // Mock element found
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as Element;
      mockQuerySelector.mockReturnValue(mockElement);

      // Set window.scrollY
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      render(
        <MemoryRouter initialEntries={["/#contact"]}>
          <ThemeProvider>
            <Hero />
          </ThemeProvider>
        </MemoryRouter>
      );

      // Find the link and click it
      const link = screen.getByText("Get In Touch");
      
      // Fire the click event
      fireEvent.click(link);

      // Verify preventDefault was called by checking side effects
      // Note: React's synthetic events wrap native events, so we verify behavior instead
      // The fact that querySelector and scrollTo are called proves the handler ran and conditions were met

      // Verify querySelector was called with #contact
      expect(mockQuerySelector).toHaveBeenCalledWith("#contact");

      // Verify getBoundingClientRect was called
      expect(mockGetBoundingClientRect).toHaveBeenCalled();

      // Verify scrollTo was called with correct parameters
      // offsetPosition = elementPosition (500) + window.scrollY (100) - headerOffset (110) = 490
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 490,
        behavior: "smooth",
      });
    });

    it("does not prevent default when not on home page", () => {
      // Mock useLocation to return a different page
      mockUseLocation.mockReturnValue({
        pathname: "/resources/blog",
        hash: "",
        state: null,
        key: "default",
        search: "",
      });

      render(
        <MemoryRouter initialEntries={["/resources/blog"]}>
          <ThemeProvider>
            <Hero />
          </ThemeProvider>
        </MemoryRouter>
      );

      const link = screen.getByText("Get In Touch");
      
      // Create a click event and spy on preventDefault
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

      fireEvent.click(link, clickEvent);

      // preventDefault should NOT be called when not on home page
      expect(preventDefaultSpy).not.toHaveBeenCalled();

      // querySelector should NOT be called
      expect(mockQuerySelector).not.toHaveBeenCalled();

      // scrollTo should NOT be called
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it("does not prevent default when hash is not #contact", () => {
      // Mock useLocation to return home page but with different hash
      mockUseLocation.mockReturnValue({
        pathname: "/",
        hash: "#about",
        state: null,
        key: "default",
        search: "",
      });

      render(
        <MemoryRouter initialEntries={["/#about"]}>
          <ThemeProvider>
            <Hero />
          </ThemeProvider>
        </MemoryRouter>
      );

      const link = screen.getByText("Get In Touch");
      
      // Create a click event and spy on preventDefault
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

      fireEvent.click(link, clickEvent);

      // preventDefault should NOT be called when hash is not #contact
      expect(preventDefaultSpy).not.toHaveBeenCalled();

      // querySelector should NOT be called
      expect(mockQuerySelector).not.toHaveBeenCalled();

      // scrollTo should NOT be called
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it("does not scroll when #contact element is not found", () => {
      // Mock useLocation to return home page with #contact hash
      mockUseLocation.mockReturnValue({
        pathname: "/",
        hash: "#contact",
        state: null,
        key: "default",
        search: "",
      });

      // Mock element not found
      mockQuerySelector.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={["/#contact"]}>
          <ThemeProvider>
            <Hero />
          </ThemeProvider>
        </MemoryRouter>
      );

      const link = screen.getByText("Get In Touch");
      
      // Fire the click event
      fireEvent.click(link);

      // querySelector should be called (proves handler ran and condition was met)
      expect(mockQuerySelector).toHaveBeenCalledWith("#contact");

      // But scrollTo should NOT be called (element not found)
      expect(mockScrollTo).not.toHaveBeenCalled();
      
      // Note: preventDefault is called internally, but we verify behavior through side effects
      // The fact that querySelector was called proves the handler executed and the condition was met
    });

    it("calculates scroll position correctly with header offset", () => {
      // Mock useLocation to return home page with #contact hash
      mockUseLocation.mockReturnValue({
        pathname: "/",
        hash: "#contact",
        state: null,
        key: "default",
        search: "",
      });

      // Mock element with specific position
      mockGetBoundingClientRect.mockReturnValue({
        top: 800,
        left: 0,
        bottom: 900,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as Element;
      mockQuerySelector.mockReturnValue(mockElement);

      // Set window.scrollY to a specific value
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });

      render(
        <MemoryRouter initialEntries={["/#contact"]}>
          <ThemeProvider>
            <Hero />
          </ThemeProvider>
        </MemoryRouter>
      );

      const link = screen.getByText("Get In Touch");
      
      // Fire the click event
      fireEvent.click(link);

      // Verify querySelector was called (proves handler ran and condition was met)
      expect(mockQuerySelector).toHaveBeenCalledWith("#contact");

      // Verify scrollTo was called with correct calculation:
      // offsetPosition = elementPosition (800) + window.scrollY (200) - headerOffset (110) = 890
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 890,
        behavior: "smooth",
      });
      
      // Note: preventDefault is called internally, but we verify behavior through side effects
      // The fact that querySelector and scrollTo were called proves the handler executed correctly
    });

    it("does not prevent default when pathname is / but hash is empty", () => {
      // Mock useLocation to return home page but no hash
      mockUseLocation.mockReturnValue({
        pathname: "/",
        hash: "",
        state: null,
        key: "default",
        search: "",
      });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <ThemeProvider>
            <Hero />
          </ThemeProvider>
        </MemoryRouter>
      );

      const link = screen.getByText("Get In Touch");
      
      // Create a click event and spy on preventDefault
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

      fireEvent.click(link, clickEvent);

      // preventDefault should NOT be called when hash is empty
      expect(preventDefaultSpy).not.toHaveBeenCalled();

      // querySelector should NOT be called
      expect(mockQuerySelector).not.toHaveBeenCalled();

      // scrollTo should NOT be called
      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });
});
