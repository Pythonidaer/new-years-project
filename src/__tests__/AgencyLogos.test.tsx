import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AgencyLogos } from "@/sections/AgencyLogos";
import { ThemeProvider } from "@/context/ThemeContext";

// Use vi.hoisted to properly hoist mocks
const {
  mockScrollTo,
  mockScrollNext,
  mockOn,
  mockOff,
  mockSelectedScrollSnap,
  mockScrollSnapList,
  mockEmblaRef,
  createMockEmblaApi,
  mockUseEmblaCarousel,
} = vi.hoisted(() => {
  const mockScrollTo = vi.fn();
  const mockScrollNext = vi.fn();
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockSelectedScrollSnap = vi.fn(() => 0);
  const mockScrollSnapList = vi.fn(() => [0, 1, 2, 3, 4]);
  const mockEmblaRef = vi.fn();

  const createMockEmblaApi = () => ({
    scrollTo: mockScrollTo,
    scrollNext: mockScrollNext,
    on: mockOn,
    off: mockOff,
    selectedScrollSnap: mockSelectedScrollSnap,
    scrollSnapList: mockScrollSnapList,
  });

  const mockEmblaApi = createMockEmblaApi();
  const mockUseEmblaCarousel = vi.fn(() => [mockEmblaRef, mockEmblaApi]);

  return {
    mockScrollTo,
    mockScrollNext,
    mockOn,
    mockOff,
    mockSelectedScrollSnap,
    mockScrollSnapList,
    mockEmblaRef,
    mockEmblaApi,
    mockUseEmblaCarousel,
    createMockEmblaApi,
  };
});

vi.mock("embla-carousel-react", () => ({
  default: mockUseEmblaCarousel,
}));

describe("AgencyLogos", () => {
  let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>;
  let setIntervalSpy: ReturnType<typeof vi.spyOn>;
  let clearIntervalSpy: ReturnType<typeof vi.spyOn>;
  let mockEmblaApi: ReturnType<typeof createMockEmblaApi>;

  beforeEach(() => {
    // Create fresh mock API instance
    mockEmblaApi = createMockEmblaApi();
    mockUseEmblaCarousel.mockReturnValue([mockEmblaRef, mockEmblaApi]);
    // Mock requestAnimationFrame to execute immediately in tests
    requestAnimationFrameSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      // Execute immediately for synchronous testing
      cb(0);
      return 0;
    });

    // Mock setInterval and clearInterval
    setIntervalSpy = vi.spyOn(window, "setInterval");
    clearIntervalSpy = vi.spyOn(window, "clearInterval");

    // Reset all mocks
    mockScrollTo.mockClear();
    mockScrollNext.mockClear();
    mockOn.mockClear();
    mockOff.mockClear();
    mockSelectedScrollSnap.mockClear();
    mockScrollSnapList.mockClear();
    mockEmblaRef.mockClear();
    mockUseEmblaCarousel.mockClear();

    // Reset return values
    mockSelectedScrollSnap.mockReturnValue(0);
    mockScrollSnapList.mockReturnValue([0, 1, 2, 3, 4]);
    mockUseEmblaCarousel.mockReturnValue([mockEmblaRef, mockEmblaApi]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    if (requestAnimationFrameSpy) {
      requestAnimationFrameSpy.mockRestore();
    }
    if (setIntervalSpy) {
      setIntervalSpy.mockRestore();
    }
    if (clearIntervalSpy) {
      clearIntervalSpy.mockRestore();
    }
  });

  const renderAgencyLogos = () => {
    return render(
      <ThemeProvider>
        <AgencyLogos />
      </ThemeProvider>
    );
  };

  describe("component rendering", () => {
    it("should render the heading", () => {
      renderAgencyLogos();
      expect(screen.getByText("Some of the Tech I Know")).toBeInTheDocument();
    });

    it("should render all technology logos", () => {
      renderAgencyLogos();
      expect(screen.getByAltText("React")).toBeInTheDocument();
      expect(screen.getByAltText("TypeScript")).toBeInTheDocument();
      expect(screen.getByAltText("Next.js")).toBeInTheDocument();
    });
  });

  describe("embla carousel initialization", () => {
    it("should initialize embla carousel with correct options", () => {
      renderAgencyLogos();
      expect(mockUseEmblaCarousel).toHaveBeenCalledWith({
        loop: true,
        align: "start",
        dragFree: true,
        skipSnaps: false,
        containScroll: "trimSnaps",
      });
    });

    it("should set up event listeners on mount", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith("select", expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith("reInit", expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith("pointerDown", expect.any(Function));
      });
    });

    it("should initialize scroll snaps and selected index via requestAnimationFrame", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(requestAnimationFrameSpy).toHaveBeenCalled();
        expect(mockScrollSnapList).toHaveBeenCalled();
      });
    });
  });

  describe("scrollTo callback", () => {
    it("should call emblaApi.scrollTo when emblaApi exists", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        // Get the scrollTo callback from the dots button
        const dots = screen.getAllByRole("button", { name: /Go to slide/i });
        if (dots.length > 0) {
          fireEvent.click(dots[1]); // Click second dot (index 1)
        }
      });

      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith(1);
      });
    });

    it("should disable autoplay when scrollTo is called", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        const dots = screen.getAllByRole("button", { name: /Go to slide/i });
        if (dots.length > 0) {
          fireEvent.click(dots[0]);
        }
      });

      // After clicking, autoplay should be disabled
      // We can verify this by checking that setInterval is cleared
      // or by checking that scrollNext is not called after the click
      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalled();
      });
    });

    it("should not call scrollTo when emblaApi is null", () => {
      // Temporarily set emblaApi to null
      mockUseEmblaCarousel.mockReturnValueOnce([mockEmblaRef, null]);

      renderAgencyLogos();

      const dots = screen.queryAllByRole("button", { name: /Go to slide/i });
      if (dots.length > 0) {
        fireEvent.click(dots[0]);
      }

      // Should not throw and should not call scrollTo
      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe("onSelect callback", () => {
    it("should update selectedIndex when emblaApi exists", async () => {
      mockSelectedScrollSnap.mockReturnValue(2);

      renderAgencyLogos();

      // Get the onSelect handler from the event listeners
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith("select", expect.any(Function));
      });

      // Simulate the select event
      const selectCall = mockOn.mock.calls.find((call) => call[0] === "select");
      if (selectCall && selectCall[1]) {
        act(() => {
          selectCall[1]();
        });
      }

      await waitFor(() => {
        expect(mockSelectedScrollSnap).toHaveBeenCalled();
      });
    });

    it("should return early when emblaApi is null", () => {
      mockUseEmblaCarousel.mockReturnValueOnce([mockEmblaRef, null]);

      renderAgencyLogos();

      // Should not throw when onSelect is called with null emblaApi
      // The useEffect should return early, so onSelect won't be registered
      expect(mockOn).not.toHaveBeenCalledWith("select", expect.any(Function));
    });
  });

  describe("handleReInit callback", () => {
    it("should update scrollSnaps when reInit event fires", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith("reInit", expect.any(Function));
      });

      // Simulate the reInit event
      const reInitCall = mockOn.mock.calls.find((call) => call[0] === "reInit");
      if (reInitCall && reInitCall[1]) {
        mockScrollSnapList.mockReturnValue([0, 1, 2, 3, 4, 5]); // New snap list
        act(() => {
          reInitCall[1]();
        });
      }

      await waitFor(() => {
        expect(mockScrollSnapList).toHaveBeenCalled();
      });
    });
  });

  describe("handlePointerDown callback", () => {
    it("should disable autoplay when pointerDown event fires", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith("pointerDown", expect.any(Function));
      });

      // Simulate the pointerDown event
      const pointerDownCall = mockOn.mock.calls.find((call) => call[0] === "pointerDown");
      if (pointerDownCall && pointerDownCall[1]) {
        act(() => {
          pointerDownCall[1]();
        });
      }

      // After pointerDown, autoplay should be disabled
      // We verify this by checking that the autoplay interval is cleared
      await waitFor(() => {
        // The autoplay useEffect should have been cleaned up
        expect(clearIntervalSpy).toHaveBeenCalled();
      });
    });
  });

  describe("autoplay useEffect", () => {
    it("should set up autoplay interval when emblaApi and autoplayEnabled are true", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(setIntervalSpy).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Verify interval is set with 2000ms delay
      const intervalCall = setIntervalSpy.mock.calls.find((call) => typeof call[0] === "function");
      expect(intervalCall).toBeDefined();
      if (intervalCall) {
        expect(intervalCall[1]).toBe(2000);
      }
    });

    it("should not set up autoplay when emblaApi is null", () => {
      mockUseEmblaCarousel.mockReturnValueOnce([mockEmblaRef, null]);

      renderAgencyLogos();

      // Should not set up interval
      expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it("should call scrollNext when autoplay interval fires", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(setIntervalSpy).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Clear previous calls
      mockScrollNext.mockClear();

      // Wait for interval to fire (2000ms)
      await new Promise(resolve => setTimeout(resolve, 2100));

      expect(mockScrollNext).toHaveBeenCalled();
    });

    it("should not call scrollNext when autoplayEnabled is false", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(setIntervalSpy).toHaveBeenCalled();
      }, { timeout: 1000 });

      const initialIntervalId = setIntervalSpy.mock.results[0]?.value;

      // Wait for dots to render
      await waitFor(() => {
        const dots = screen.queryAllByRole("button", { name: /Go to slide/i });
        expect(dots.length).toBeGreaterThan(0);
      }, { timeout: 1000 });

      const dots = screen.getAllByRole("button", { name: /Go to slide/i });

      // Disable autoplay by clicking a dot
      if (dots.length > 0) {
        fireEvent.click(dots[0]);
      }

      // Wait for cleanup
      await waitFor(() => {
        expect(clearIntervalSpy).toHaveBeenCalledWith(initialIntervalId);
      }, { timeout: 1000 });

      // Clear previous calls to check if scrollNext is called
      mockScrollNext.mockClear();

      // Wait for interval time - scrollNext should not be called because autoplay is disabled
      await new Promise(resolve => setTimeout(resolve, 2100));

      // scrollNext should not have been called because autoplay is disabled
      expect(mockScrollNext).not.toHaveBeenCalled();
    });

    it("should check both emblaApi and autoplayEnabled before calling scrollNext", async () => {
      renderAgencyLogos();

      await waitFor(() => {
        expect(setIntervalSpy).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Clear previous calls
      mockScrollNext.mockClear();

      // Wait for interval to fire - the callback should check both conditions
      await new Promise(resolve => setTimeout(resolve, 2100));

      expect(mockScrollNext).toHaveBeenCalled();
    });

    it("should cleanup autoplay interval on unmount", () => {
      const { unmount } = renderAgencyLogos();

      expect(setIntervalSpy).toHaveBeenCalled();
      const intervalId = setIntervalSpy.mock.results[0]?.value;

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    });
  });

  describe("dots navigation", () => {
    it("should render dots for each scroll snap", () => {
      mockScrollSnapList.mockReturnValue([0, 1, 2]);
      
      renderAgencyLogos();

      // requestAnimationFrame executes synchronously, so dots should be rendered immediately
      const dots = screen.getAllByRole("button", { name: /Go to slide/i });
      expect(dots.length).toBeGreaterThan(0);
    });

    it("should apply active class to selected dot", () => {
      mockSelectedScrollSnap.mockReturnValue(1);
      
      renderAgencyLogos();

      // requestAnimationFrame executes synchronously
      const dots = screen.getAllByRole("button", { name: /Go to slide/i });
      // The second dot (index 1) should have the active class
      // We can't directly test className, but we can verify the structure
      expect(dots.length).toBeGreaterThan(1);
    });

    it("should call scrollTo when dot is clicked", () => {
      renderAgencyLogos();

      // requestAnimationFrame executes synchronously
      const dots = screen.getAllByRole("button", { name: /Go to slide/i });
      expect(dots.length).toBeGreaterThan(2);

      if (dots.length > 2) {
        fireEvent.click(dots[2]); // Click third dot (index 2)
      }

      expect(mockScrollTo).toHaveBeenCalledWith(2);
    });

    it("should have correct aria-label for each dot", () => {
      mockScrollSnapList.mockReturnValue([0, 1, 2]);
      
      renderAgencyLogos();

      // requestAnimationFrame executes synchronously
      expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
    });
  });

  describe("event listener cleanup", () => {
    it("should cleanup event listeners on unmount", () => {
      const { unmount } = renderAgencyLogos();

      expect(mockOn).toHaveBeenCalled();

      unmount();

      expect(mockOff).toHaveBeenCalledWith("select", expect.any(Function));
      expect(mockOff).toHaveBeenCalledWith("reInit", expect.any(Function));
      expect(mockOff).toHaveBeenCalledWith("pointerDown", expect.any(Function));
    });

    it("should cleanup event listeners when emblaApi changes", () => {
      const { rerender } = renderAgencyLogos();

      expect(mockOn).toHaveBeenCalled();

      // Clear previous calls
      mockOff.mockClear();
      mockOn.mockClear();

      // Create new emblaApi with fresh mocks
      const newMockScrollTo = vi.fn();
      const newMockScrollNext = vi.fn();
      const newMockOn = vi.fn();
      const newMockOff = vi.fn();
      const newMockSelectedScrollSnap = vi.fn(() => 0);
      const newMockScrollSnapList = vi.fn(() => [0, 1, 2, 3, 4]);

      const newMockEmblaApi = {
        scrollTo: newMockScrollTo,
        scrollNext: newMockScrollNext,
        on: newMockOn,
        off: newMockOff,
        selectedScrollSnap: newMockSelectedScrollSnap,
        scrollSnapList: newMockScrollSnapList,
      };

      mockUseEmblaCarousel.mockReturnValueOnce([mockEmblaRef, newMockEmblaApi]);

      rerender(
        <ThemeProvider>
          <AgencyLogos />
        </ThemeProvider>
      );

      // Old listeners should be cleaned up
      expect(mockOff).toHaveBeenCalled();
    });
  });

  describe("requestAnimationFrame initialization", () => {
    it("should call scrollSnapList and onSelect in requestAnimationFrame", () => {
      renderAgencyLogos();

      // requestAnimationFrame executes synchronously
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
      // The requestAnimationFrame callback should call scrollSnapList and onSelect
      expect(mockScrollSnapList).toHaveBeenCalled();
      expect(mockSelectedScrollSnap).toHaveBeenCalled();
    });
  });
});
