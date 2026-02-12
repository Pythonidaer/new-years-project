import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { useMetaTags } from "@/hooks/useMetaTags";

function TestComponent(props: { title?: string; url?: string; image?: string }) {
  useMetaTags({
    title: props.title,
    description: "Test description",
    url: props.url,
    image: props.image,
  });
  return null;
}

describe("useMetaTags", () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = originalTitle;
  });

  afterEach(() => {
    document.title = originalTitle;
    const meta = document.head.querySelectorAll("meta[name], meta[property], link[rel='canonical']");
    meta.forEach((el) => el.remove());
  });

  it("uses baseUrl when url is undefined (resolveUrl early return)", () => {
    render(<TestComponent title="No URL" />);
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).toBeTruthy();
    expect(canonical.href).toBe(window.location.origin + "/");
  });

  it("uses baseUrl when url is empty string", () => {
    render(<TestComponent title="Empty URL" url="" />);
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).toBeTruthy();
    expect(canonical.href).toBe(window.location.origin + "/");
  });

  it("resolves relative url with baseUrl", () => {
    render(<TestComponent title="Relative" url="/blog/post-1" />);
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).toBeTruthy();
    expect(canonical.href).toBe(window.location.origin + "/blog/post-1");
  });

  it("leaves absolute url unchanged", () => {
    const absolute = "https://example.com/page";
    render(<TestComponent title="Absolute" url={absolute} />);
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).toBeTruthy();
    expect(canonical.href).toBe(absolute);
  });

  it("omits image when image is undefined (resolveImageUrl returns undefined)", () => {
    render(<TestComponent title="No Image" />);
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute("content")).toBeFalsy();
  });

  it("resolves relative image URL with baseUrl", () => {
    render(<TestComponent title="Relative Image" image="/img/hero.jpg" />);
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    expect(ogImage).toBeTruthy();
    expect(ogImage.content).toBe(window.location.origin + "/img/hero.jpg");
  });

  it("leaves absolute image URL unchanged", () => {
    const absoluteImage = "https://cdn.example.com/og.png";
    render(<TestComponent title="Absolute Image" image={absoluteImage} />);
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    expect(ogImage?.content).toBe(absoluteImage);
  });

  it("sets robots to noindex, nofollow when noindex and nofollow are true", () => {
    function NoIndexNoFollow() {
      useMetaTags({ title: "No Index", noindex: true, nofollow: true });
      return null;
    }
    render(<NoIndexNoFollow />);
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    expect(robots?.content).toBe("noindex, nofollow");
  });

  it("sets robots to index, follow when noindex and nofollow are false", () => {
    render(<TestComponent title="Indexed" />);
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    expect(robots?.content).toBe("index, follow");
  });

  it("sets robots to noindex, follow when only noindex is true", () => {
    function NoIndexOnly() {
      useMetaTags({ title: "No Index Only", noindex: true, nofollow: false });
      return null;
    }
    render(<NoIndexOnly />);
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    expect(robots?.content).toBe("noindex, follow");
  });

  it("sets robots to index, nofollow when only nofollow is true", () => {
    function NoFollowOnly() {
      useMetaTags({ title: "No Follow Only", noindex: false, nofollow: true });
      return null;
    }
    render(<NoFollowOnly />);
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    expect(robots?.content).toBe("index, nofollow");
  });

  it("updates existing meta element when already in head (setMetaTag update path)", () => {
    const existing = document.createElement("meta");
    existing.setAttribute("name", "description");
    existing.setAttribute("content", "old");
    document.head.appendChild(existing);

    render(<TestComponent title="Update Meta" />);
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(meta?.content).toBe("Test description");
    expect(document.querySelectorAll('meta[name="description"]').length).toBe(1);
  });

  it("omits optional meta when description is undefined (setConditionalMetaTags skip path)", () => {
    function NoDescription() {
      useMetaTags({ title: "No Desc", url: "/page" });
      return null;
    }
    render(<NoDescription />);
    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute("content")).toBeFalsy();
  });

});
