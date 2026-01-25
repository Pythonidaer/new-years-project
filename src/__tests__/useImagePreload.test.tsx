import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useImagePreload } from "@/hooks/useImagePreload";

describe("useImagePreload", () => {
  let mockImage: any;

  beforeEach(() => {
    // Create a fresh mock image for each test
    mockImage = {
      onload: null,
      onerror: null,
      get src() {
        return this._src || '';
      },
      set src(value) {
        this._src = value;
      },
      complete: false,
    };

    // Mock Image constructor - return the mock object when called with 'new'
    globalThis.Image = vi.fn(function() {
      return mockImage;
    }) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    const links = document.head.querySelectorAll('link[rel="preload"]');
    links.forEach(link => link.remove());
  });

  it("should create preload link when imageUrl is provided", async () => {
    const imageUrl = "https://picsum.photos/367/197?random=39";
    
    renderHook(() => useImagePreload(imageUrl, false));

    // Wait for effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Check that link was created - wait for it to appear
    // Use a simpler selector first, then verify attributes
    const link = await waitFor(() => {
      const foundLink = document.head.querySelector('link[rel="preload"]');
      if (!foundLink) {
        throw new Error('Preload link not found');
      }
      return foundLink;
    }, { timeout: 1000 });

    // Verify link attributes
    expect(link.getAttribute('as')).toBe('image');
    expect(link.getAttribute('href')).toBe(imageUrl);
    expect(link.getAttribute('fetchPriority')).toBe('high');
  });

  it("should not create link when imageUrl is undefined", async () => {
    renderHook(() => useImagePreload(undefined, false));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    const link = document.head.querySelector('link[rel="preload"][as="image"]');
    expect(link).toBeNull();
  });
});
