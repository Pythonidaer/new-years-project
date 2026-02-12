import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BlogPost } from "@/data/blog/types";

const singlePost: BlogPost = {
  id: 1,
  title: "Only Post",
  date: "Jan 1, 2026",
  excerpt: "Only",
  category: "Cat",
  image: "/only.jpg",
  link: "/blog/only",
  slug: "only-post",
  tags: ["Tag"],
};

vi.mock("@/data/blog/index", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/blog/index")>();
  return {
    ...actual,
    getAllBlogPosts: () => [singlePost],
  };
});

describe("getRelatedPosts early return (otherPosts.length === 0)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns empty array when getAllBlogPosts returns only the current post", async () => {
    const { getRelatedPosts } = await import("@/data/blog/index");
    const related = getRelatedPosts(singlePost, 3);
    expect(related).toEqual([]);
  });
});
