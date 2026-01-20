import { describe, it, expect } from "vitest";
import {
  getGrayscaleImageUrl,
  getGrayscaleFilter,
} from "@/utils/imageGrayscale";

describe("imageGrayscale utilities", () => {
  describe("getGrayscaleImageUrl", () => {
    describe("when Noir theme is not active", () => {
      it("returns URL as-is for picsum.photos URLs", () => {
        const url = "https://picsum.photos/367/197?random=1";
        const result = getGrayscaleImageUrl(url, false);
        expect(result).toBe(url);
      });

      it("returns URL as-is for non-picsum URLs", () => {
        const url = "https://example.com/image.jpg";
        const result = getGrayscaleImageUrl(url, false);
        expect(result).toBe(url);
      });

      it("returns URL as-is for picsum.photos URLs without query params", () => {
        const url = "https://picsum.photos/367/197";
        const result = getGrayscaleImageUrl(url, false);
        expect(result).toBe(url);
      });
    });

    describe("when Noir theme is active", () => {
      it("adds ?grayscale to picsum.photos URLs without query parameters", () => {
        const url = "https://picsum.photos/367/197";
        const result = getGrayscaleImageUrl(url, true);
        expect(result).toBe("https://picsum.photos/367/197?grayscale");
      });

      it("adds &grayscale to picsum.photos URLs with existing query parameters", () => {
        const url = "https://picsum.photos/367/197?random=1";
        const result = getGrayscaleImageUrl(url, true);
        expect(result).toBe("https://picsum.photos/367/197?random=1&grayscale");
      });

      it("adds &grayscale to picsum.photos URLs with multiple query parameters", () => {
        const url = "https://picsum.photos/367/197?random=1&blur=2";
        const result = getGrayscaleImageUrl(url, true);
        expect(result).toBe(
          "https://picsum.photos/367/197?random=1&blur=2&grayscale"
        );
      });

      it("returns non-picsum URLs as-is (will use CSS filter instead)", () => {
        const url = "https://example.com/image.jpg";
        const result = getGrayscaleImageUrl(url, true);
        expect(result).toBe(url);
      });

      it("handles URLs with different protocols", () => {
        const url = "http://picsum.photos/367/197";
        const result = getGrayscaleImageUrl(url, true);
        expect(result).toBe("http://picsum.photos/367/197?grayscale");
      });

      it("handles URLs with paths containing 'picsum.photos' in the path", () => {
        const url = "https://example.com/picsum.photos/image.jpg";
        const result = getGrayscaleImageUrl(url, true);
        // Function uses includes() so it matches 'picsum.photos' anywhere in URL
        expect(result).toBe("https://example.com/picsum.photos/image.jpg?grayscale");
      });

      it("handles URLs with 'picsum.photos' in query parameters", () => {
        const url = "https://example.com/image.jpg?source=picsum.photos";
        const result = getGrayscaleImageUrl(url, true);
        // Function uses includes() so it matches 'picsum.photos' anywhere in URL
        expect(result).toBe("https://example.com/image.jpg?source=picsum.photos&grayscale");
      });

      it("handles empty string URL", () => {
        const url = "";
        const result = getGrayscaleImageUrl(url, true);
        expect(result).toBe("");
      });
    });
  });

  describe("getGrayscaleFilter", () => {
    it("returns 'grayscale(100%)' when Noir theme is active", () => {
      const result = getGrayscaleFilter(true);
      expect(result).toBe("grayscale(100%)");
    });

    it("returns undefined when Noir theme is not active", () => {
      const result = getGrayscaleFilter(false);
      expect(result).toBeUndefined();
    });
  });
});
