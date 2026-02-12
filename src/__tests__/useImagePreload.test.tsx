import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useImagePreload } from "@/hooks/useImagePreload";

function TestComponent({
  imageUrl,
  isNoirTheme = false,
}: {
  imageUrl: string | undefined;
  isNoirTheme?: boolean;
}) {
  const loaded = useImagePreload(imageUrl, isNoirTheme);
  return <span data-testid="loaded">{loaded ? "yes" : "no"}</span>;
}

describe("useImagePreload", () => {
  let mockImage: {
    onload: (() => void) | null;
    onerror: (() => void) | null;
    src: string;
    complete: boolean;
    _src?: string;
  };

  beforeEach(() => {
    mockImage = {
      onload: null,
      onerror: null,
      get src() {
        return this._src ?? "";
      },
      set src(value: string) {
        this._src = value;
      },
      complete: false,
    };
    globalThis.Image = vi.fn(function ImageMock() {
      return mockImage;
    }) as unknown as typeof Image;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const links = document.head.querySelectorAll('link[rel="preload"]');
    links.forEach((l) => l.remove());
  });

  it("does not create preload link when imageUrl is undefined (early return)", () => {
    render(<TestComponent imageUrl={undefined} />);
    expect(document.head.querySelector('link[rel="preload"][as="image"]')).toBeNull();
  });

  it("sets imageLoaded to true when image onload fires", async () => {
    render(<TestComponent imageUrl="https://example.com/img.jpg" />);

    await waitFor(() => {
      expect(mockImage.src).toBeTruthy();
    });

    mockImage.onload?.();

    await waitFor(() => {
      expect(document.querySelector('[data-testid="loaded"]')?.textContent).toBe("yes");
    });
  });

  it("sets imageLoaded to true when image onerror fires", async () => {
    render(<TestComponent imageUrl="https://example.com/bad.jpg" />);

    await waitFor(() => {
      expect(mockImage.src).toBeTruthy();
    });

    mockImage.onerror?.();

    await waitFor(() => {
      expect(document.querySelector('[data-testid="loaded"]')?.textContent).toBe("yes");
    });
  });

  it("sets imageLoaded to true when img.complete is already true (cached)", async () => {
    mockImage.complete = true;
    render(<TestComponent imageUrl="https://example.com/cached.jpg" />);

    await waitFor(
      () => {
        expect(document.querySelector('[data-testid="loaded"]')?.textContent).toBe("yes");
      },
      { timeout: 100 }
    );
  });

  it("removes preload link from head on unmount when link is still in head", async () => {
    const { unmount } = render(<TestComponent imageUrl="https://example.com/img.jpg" />);

    await waitFor(() => {
      expect(document.head.querySelector('link[rel="preload"][as="image"]')).toBeTruthy();
    });

    unmount();
    expect(document.head.querySelector('link[rel="preload"][as="image"]')).toBeNull();
  });

  it("cleanup does not throw when link was already removed from head", async () => {
    const { unmount } = render(<TestComponent imageUrl="https://example.com/img.jpg" />);

    await waitFor(() => {
      const link = document.head.querySelector('link[rel="preload"][as="image"]');
      expect(link).toBeTruthy();
      link?.remove();
    });

    expect(() => unmount()).not.toThrow();
  });
});
