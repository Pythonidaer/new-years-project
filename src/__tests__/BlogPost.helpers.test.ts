import { describe, it, expect } from "vitest";
import {
  getAuthorName,
  getMetaDescription,
  hasTags,
  hasContent,
} from "../pages/BlogPost.helpers";
import type { BlogPost } from "@/data/blog";

describe("BlogPost.helpers", () => {
  describe("getAuthorName", () => {
    it("should return author name when present", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        author: "John Doe",
        excerpt: "Test excerpt",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(getAuthorName(post)).toBe("John Doe");
    });

    it("should return fallback when author is missing", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(getAuthorName(post)).toBe("LLM Writer");
    });

    it("should return fallback when author is empty string", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        author: "",
        excerpt: "Test excerpt",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(getAuthorName(post)).toBe("LLM Writer");
    });
  });

  describe("getMetaDescription", () => {
    it("should return excerpt when present", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test Post",
        date: "2024-01-01",
        excerpt: "This is a test excerpt",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(getMetaDescription(post)).toBe("This is a test excerpt");
    });

    it("should return fallback when excerpt is missing", () => {
      const post = {
        id: 1,
        title: "Test Post",
        date: "2024-01-01",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      } as unknown as BlogPost;
      const result = getMetaDescription(post);
      expect(result).toContain("Test Post");
      expect(result).toContain("Johnny H.'s technical blog");
    });

    it("should return fallback when excerpt is empty string", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test Post",
        date: "2024-01-01",
        excerpt: "",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      const result = getMetaDescription(post);
      expect(result).toContain("Test Post");
    });
  });

  describe("hasTags", () => {
    it("should return true when tags array has items", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "Test content",
        tags: ["React", "TypeScript"],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(hasTags(post)).toBe(true);
    });

    it("should return false when tags array is empty", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "Test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(hasTags(post)).toBe(false);
    });

    it("should return false when tags is undefined", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "Test content",
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(hasTags(post)).toBe(false);
    });

    it("should return false when tags is null", () => {
      const post = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "Test content",
        tags: null,
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      } as unknown as BlogPost;
      expect(hasTags(post)).toBe(false);
    });
  });

  describe("hasContent", () => {
    it("should return true when content is present", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "This is test content",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(hasContent(post)).toBe(true);
    });

    it("should return false when content is missing", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(hasContent(post)).toBe(false);
    });

    it("should return false when content is empty string", () => {
      const post: BlogPost = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: "",
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      };
      expect(hasContent(post)).toBe(false);
    });

    it("should return false when content is null", () => {
      const post = {
        id: 1,
        title: "Test",
        date: "2024-01-01",
        excerpt: "Test excerpt",
        content: null,
        tags: [],
        category: "Frontend",
        image: "test.jpg",
        link: "/resources/blog/test",
        slug: "test",
      } as unknown as BlogPost;
      expect(hasContent(post)).toBe(false);
    });
  });
});
