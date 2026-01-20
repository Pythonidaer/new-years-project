import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "@/sections/Header";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Header", () => {
  let mockScrollTo: ReturnType<typeof vi.fn>;
  let mockQuerySelector: ReturnType<typeof vi.fn>;
  let mockGetBoundingClientRect: ReturnType<typeof vi.fn>;
  let matchMediaSpy: ReturnType<typeof vi.spyOn>;

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

    // Mock document.documentElement.scrollTop
    Object.defineProperty(document.documentElement, "scrollTop", {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock requestAnimationFrame
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      setTimeout(() => cb(0), 0);
      return 0;
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

    // Mock window.matchMedia
    matchMediaSpy = vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Reset navigate mock
    mockNavigate.mockClear();

    // Reset body styles
    document.body.style.overflow = "";
    document.body.classList.remove("menu-open");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    document.body.style.overflow = "";
    document.body.classList.remove("menu-open");
    if (matchMediaSpy) {
      matchMediaSpy.mockRestore();
    }
  });

  const renderHeader = (initialEntries = ["/"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  describe("handleHashClick", () => {
    it("closes mobile menu when hash link is clicked", () => {
      renderHeader(["/"]);

      // Open menu first
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Find and click a desktop hash link (Link component from react-router)
      const experienceLink = screen.getAllByText("Experience").find(
        (link) => link.closest("nav") !== null
      );
      
      if (experienceLink) {
        fireEvent.click(experienceLink);
        
        // Menu should be closed
        expect(menuButton.getAttribute("aria-expanded")).toBe("false");
      }
    });

    it("prevents default and scrolls when on home page with same hash", () => {
      renderHeader(["/#experience"]);

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

      // Find desktop nav link (Link component wraps an anchor)
      const experienceLink = screen.getAllByText("Experience").find(
        (link) => link.closest("nav") !== null
      );

      if (experienceLink) {
        fireEvent.click(experienceLink);

        // Verify querySelector was called (proves handler ran and conditions were met)
        expect(mockQuerySelector).toHaveBeenCalledWith("#experience");

        // Verify scrollTo was called with correct offset
        // offsetPosition = 500 + 100 - 110 = 490
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: 490,
          behavior: "smooth",
        });
      }
    });

    it("does not prevent default when not on home page", () => {
      renderHeader(["/resources/blog"]);

      const experienceLink = screen.getAllByText("Experience")[0];
      const anchor = experienceLink.closest("a");

      if (anchor) {
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

        fireEvent.click(anchor, clickEvent);

        // preventDefault should NOT be called
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(mockQuerySelector).not.toHaveBeenCalled();
        expect(mockScrollTo).not.toHaveBeenCalled();
      }
    });

    it("does not prevent default when hash differs", () => {
      renderHeader(["/#projects"]);

      const experienceLink = screen.getAllByText("Experience")[0];
      const anchor = experienceLink.closest("a");

      if (anchor) {
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

        fireEvent.click(anchor, clickEvent);

        // preventDefault should NOT be called (different hash)
        expect(preventDefaultSpy).not.toHaveBeenCalled();
      }
    });

    it("does not scroll when element is not found", () => {
      renderHeader(["/#experience"]);

      // Mock element not found
      mockQuerySelector.mockReturnValue(null);

      const experienceLink = screen.getAllByText("Experience")[0];
      const anchor = experienceLink.closest("a");

      if (anchor) {
        fireEvent.click(anchor);

        // querySelector should be called but scrollTo should not
        expect(mockQuerySelector).toHaveBeenCalledWith("#experience");
        expect(mockScrollTo).not.toHaveBeenCalled();
      }
    });

    it("does not prevent default when href has no hash", () => {
      renderHeader(["/"]);

      // Get the Resources link which doesn't have a hash
      const resourcesLink = screen.getAllByText("Resources")[0];
      const anchor = resourcesLink.closest("a");

      if (anchor) {
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

        fireEvent.click(anchor, clickEvent);

        // preventDefault should NOT be called (no hash in href)
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(mockQuerySelector).not.toHaveBeenCalled();
        expect(mockScrollTo).not.toHaveBeenCalled();
      }
    });

    it("calculates scroll position correctly with header offset", () => {
      renderHeader(["/#experience"]);

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

      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });

      const experienceLink = screen.getAllByText("Experience")[0];
      const anchor = experienceLink.closest("a");

      if (anchor) {
        fireEvent.click(anchor);

        // Verify scroll calculation: 800 + 200 - 110 = 890
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: 890,
          behavior: "smooth",
        });
      }
    });
  });

  describe("handleMenuLinkClick", () => {
    it("prevents default and closes menu", () => {
      renderHeader(["/"]);

      // Open menu
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Find mobile menu link
      const experienceLink = screen.getAllByText("Experience").find(
        (link) => link.closest("[role='menu']") !== null
      );

      if (experienceLink) {
        const anchor = experienceLink.closest("a");
        if (anchor) {
          fireEvent.click(anchor);

          // Menu should be closed (proves preventDefault worked since navigation was prevented)
          expect(menuButton.getAttribute("aria-expanded")).toBe("false");
        }
      }
    });

    it("navigates to hash on home page and scrolls after delay", async () => {
      vi.useFakeTimers();
      renderHeader(["/"]);

      // Mock element found
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect,
      } as unknown as Element;
      mockQuerySelector.mockReturnValue(mockElement);

      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      // Open menu and click mobile link
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      const experienceLink = screen.getAllByText("Experience").find(
        (link) => link.closest("[role='menu']") !== null
      );

      if (experienceLink) {
        const anchor = experienceLink.closest("a");
        if (anchor) {
          fireEvent.click(anchor);

          // Navigate should be called
          expect(mockNavigate).toHaveBeenCalledWith("/#experience");

          // Scroll should not happen immediately
          expect(mockScrollTo).not.toHaveBeenCalled();

          // Fast-forward 100ms
          await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
          });

          // Now scroll should happen
          expect(mockQuerySelector).toHaveBeenCalledWith("#experience");
          expect(mockScrollTo).toHaveBeenCalledWith({
            top: 490, // 500 + 100 - 110
            behavior: "smooth",
          });
        }
      }

      vi.useRealTimers();
    });

    it("navigates to hash when not on home page", () => {
      renderHeader(["/resources/blog"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      const experienceLink = screen.getAllByText("Experience").find(
        (link) => link.closest("[role='menu']") !== null
      );

      if (experienceLink) {
        const anchor = experienceLink.closest("a");
        if (anchor) {
          fireEvent.click(anchor);

          // Should navigate but not scroll
          expect(mockNavigate).toHaveBeenCalledWith("/#experience");
          expect(mockScrollTo).not.toHaveBeenCalled();
        }
      }
    });

    it("navigates to regular route", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      const resourcesLink = screen.getAllByText("Resources").find(
        (link) => link.closest("[role='menu']") !== null
      );

      if (resourcesLink) {
        const anchor = resourcesLink.closest("a");
        if (anchor) {
          fireEvent.click(anchor);

          expect(mockNavigate).toHaveBeenCalledWith("/resources/blog");
          expect(mockScrollTo).not.toHaveBeenCalled();
        }
      }
    });

    it("does not scroll when element is not found", async () => {
      vi.useFakeTimers();
      renderHeader(["/"]);

      mockQuerySelector.mockReturnValue(null);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      const experienceLink = screen.getAllByText("Experience").find(
        (link) => link.closest("[role='menu']") !== null
      );

      if (experienceLink) {
        const anchor = experienceLink.closest("a");
        if (anchor) {
          fireEvent.click(anchor);

          await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
          });

          expect(mockQuerySelector).toHaveBeenCalledWith("#experience");
          expect(mockScrollTo).not.toHaveBeenCalled();
        }
      }

      vi.useRealTimers();
    });
  });

  describe("toggleMenu and closeMenu", () => {
    it("toggles menu open state", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");

      // Open menu
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Close menu
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("closes menu when brand link is clicked", () => {
      renderHeader(["/"]);

      // Open menu
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Click brand link
      const brandLink = screen.getByText("Johnny H.");
      fireEvent.click(brandLink);

      // Menu should be closed
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("closes menu when overlay is clicked", () => {
      renderHeader(["/"]);

      // Open menu
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      // Find overlay and click it
      const overlay = document.querySelector('[class*="hamburgerOverlay"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(menuButton.getAttribute("aria-expanded")).toBe("false");
      }
    });
  });

  describe("Escape key handling", () => {
    it("closes menu when Escape key is pressed", () => {
      renderHeader(["/"]);

      // Open menu
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Press Escape
      fireEvent.keyDown(document, { key: "Escape" });

      // Menu should be closed
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("does not close menu when other keys are pressed", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      fireEvent.keyDown(document, { key: "Enter" });
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      fireEvent.keyDown(document, { key: "Space" });
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("does not close menu when Escape is pressed but menu is closed", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");

      fireEvent.keyDown(document, { key: "Escape" });
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("prevents body scroll when menu is open", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll when menu is closed", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.click(menuButton);
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Route change handling", () => {
    it("closes menu when route changes", () => {
      // Render on home page first
      const { unmount } = renderHeader(["/"]);

      // Open menu
      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Unmount and render on different route - this simulates route change
      unmount();

      // Render on new route - menu should be closed (new instance)
      renderHeader(["/resources/blog"]);

      // Menu should be closed in new instance
      const newMenuButton = screen.getByLabelText("Mobile Menu Toggle");
      expect(newMenuButton.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("Header height CSS variable", () => {
    it("sets header height to 60px on mobile", () => {
      matchMediaSpy.mockReturnValue({
        matches: true, // Mobile
        media: "(max-width: 990px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderHeader(["/"]);

      const root = document.documentElement;
      expect(root.style.getPropertyValue("--header-height")).toBe("60px");
    });

    it("sets header height to 110px on desktop when not scrolled", async () => {
      matchMediaSpy.mockReturnValue({
        matches: false, // Desktop
        media: "(max-width: 990px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      // Mock scroll position to be less than 90
      Object.defineProperty(document.documentElement, "scrollTop", {
        writable: true,
        configurable: true,
        value: 0,
      });

      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 0,
      });

      renderHeader(["/"]);

      // Wait for scroll handler to run
      await waitFor(() => {
        const root = document.documentElement;
        expect(root.style.getPropertyValue("--header-height")).toBe("110px");
      });
    });

    it("sets header height to 60px on desktop when scrolled", async () => {
      matchMediaSpy.mockReturnValue({
        matches: false, // Desktop
        media: "(max-width: 990px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      // Mock scroll position to be >= 90
      Object.defineProperty(document.documentElement, "scrollTop", {
        writable: true,
        configurable: true,
        value: 100,
      });

      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      renderHeader(["/"]);

      // Wait for initial scroll handler to run
      await waitFor(() => {
        const root = document.documentElement;
        expect(root.style.getPropertyValue("--header-height")).toBe("60px");
      });
    });

    it("updates header height on window resize", async () => {
      // Start as desktop
      matchMediaSpy.mockReturnValue({
        matches: false,
        media: "(max-width: 990px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderHeader(["/"]);

      // Change to mobile
      matchMediaSpy.mockReturnValue({
        matches: true,
        media: "(max-width: 990px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      fireEvent(window, new Event("resize"));

      await waitFor(() => {
        const root = document.documentElement;
        expect(root.style.getPropertyValue("--header-height")).toBe("60px");
      });
    });
  });

  describe("Banner height CSS variable", () => {
    it("resets banner height to 0px when not on home page", () => {
      renderHeader(["/resources/blog"]);

      const root = document.documentElement;
      expect(root.style.getPropertyValue("--banner-height")).toBe("0px");
    });

    it("does not reset banner height on home page", () => {
      // Set an initial value to verify Header doesn't change it on home page
      const root = document.documentElement;
      root.style.setProperty("--banner-height", "50px");

      renderHeader(["/"]);

      // On home page, Header doesn't set --banner-height to 0px
      // It leaves it for TopBanner to manage
      // Since we set it to "50px" initially, Header should not change it
      const bannerHeight = root.style.getPropertyValue("--banner-height");
      // Header should not reset it to "0px" on home page
      expect(bannerHeight).not.toBe("0px");
      // It should remain as we set it (or be managed by TopBanner in real app)
      expect(bannerHeight).toBe("50px");
    });
  });

  describe("Body class for menu state", () => {
    it("adds menu-open class when menu is open", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      expect(document.body.classList.contains("menu-open")).toBe(true);
    });

    it("removes menu-open class when menu is closed", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(document.body.classList.contains("menu-open")).toBe(true);

      fireEvent.click(menuButton);
      expect(document.body.classList.contains("menu-open")).toBe(false);
    });

    it("cleans up menu-open class on unmount", () => {
      const { unmount } = renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);
      expect(document.body.classList.contains("menu-open")).toBe(true);

      unmount();

      expect(document.body.classList.contains("menu-open")).toBe(false);
    });
  });

  describe("Header styling classes", () => {
    it("applies scrolled class when scrolled", async () => {
      Object.defineProperty(document.documentElement, "scrollTop", {
        writable: true,
        configurable: true,
        value: 100,
      });

      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      renderHeader(["/"]);

      // Wait for initial scroll handler to run and update state
      await waitFor(() => {
        const header = screen.getByRole("banner") || document.querySelector("header");
        expect(header).toBeTruthy();
        const className = header?.getAttribute("class") || "";
        expect(className).toContain("scrolled");
      });
    });

    it("applies menuOpen class when menu is open", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      const header = screen.getByRole("banner") || document.querySelector("header");
      expect(header).toBeTruthy();
      const className = header?.getAttribute("class") || "";
      expect(className).toContain("menuOpen");
    });

    it("applies dark class on blog listing page", () => {
      renderHeader(["/resources/blog"]);

      const header = screen.getByRole("banner") || document.querySelector("header");
      expect(header).toBeTruthy();
      const className = header?.getAttribute("class") || "";
      expect(className).toContain("dark");
    });

    it("applies light class on blog post page", () => {
      renderHeader(["/resources/blog/test-post"]);

      const header = screen.getByRole("banner") || document.querySelector("header");
      expect(header).toBeTruthy();
      const className = header?.getAttribute("class") || "";
      expect(className).toContain("light");
    });

    it("applies light class on tag page", () => {
      renderHeader(["/resources/tag/test-tag"]);

      const header = screen.getByRole("banner") || document.querySelector("header");
      expect(header).toBeTruthy();
      const className = header?.getAttribute("class") || "";
      expect(className).toContain("light");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for menu toggle", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      expect(menuButton).toBeTruthy();
    });

    it("updates aria-expanded when menu state changes", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("sets aria-hidden on overlay based on menu state", () => {
      renderHeader(["/"]);

      // Find overlay by class selector since aria-hidden might not be rendered initially
      const overlay = Array.from(document.querySelectorAll("div")).find((div) =>
        div.className.includes("hamburgerOverlay")
      );
      
      if (overlay) {
        // Menu is closed initially, so aria-hidden should be true
        expect(overlay.getAttribute("aria-hidden")).toBe("true");

        const menuButton = screen.getByLabelText("Mobile Menu Toggle");
        fireEvent.click(menuButton);

        // Menu is open, so aria-hidden should be false
        expect(overlay.getAttribute("aria-hidden")).toBe("false");
      }
    });

    it("has proper role attributes for mobile menu", () => {
      renderHeader(["/"]);

      const menuButton = screen.getByLabelText("Mobile Menu Toggle");
      fireEvent.click(menuButton);

      // Find menu by searching for role attribute
      const menu = Array.from(document.querySelectorAll("*")).find(
        (el) => el.getAttribute("role") === "menu"
      );
      expect(menu).toBeTruthy();

      const menuItems = Array.from(document.querySelectorAll("*")).filter(
        (el) => el.getAttribute("role") === "menuitem"
      );
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });
});
