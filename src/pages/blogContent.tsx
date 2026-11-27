import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed/YouTubeEmbed";

const ContrastComparison = lazy(() => import("@/components/blog-tools/color-contrast/ContrastComparison").then((module) => ({
  default: module.ContrastComparison,
})));

const ContrastGenerator = lazy(() => import("@/components/blog-tools/color-contrast/ContrastGenerator").then((module) => ({
  default: module.ContrastGenerator,
})));

const ColorPairing = lazy(() => import("@/components/blog-tools/color-contrast/ColorPairing").then((module) => ({
  default: module.ColorPairing,
})));

const BLOG_TOOL_COMPONENTS = {
  "contrast-comparison": ContrastComparison,
  "contrast-generator": ContrastGenerator,
  "color-pairing": ColorPairing,
} as const;

type BlogToolName = keyof typeof BLOG_TOOL_COMPONENTS;

type BlogDomNode = {
  type?: string;
  name?: string;
  attribs?: Record<string, string>;
};

function readYouTubeFromIframe(attribs: Record<string, string>): { videoId: string; title: string } | null {
  if (!attribs.src) return null;
  const match = /youtube\.com\/embed\/([^/?]+)/.exec(attribs.src);
  if (!match) return null;
  return { videoId: match[1], title: attribs.title ?? "YouTube video" };
}

function readYouTubeEmbed(domNode: BlogDomNode): { videoId: string; title?: string } | null {
  if (domNode.type !== "tag" || !domNode.attribs) return null;
  const { name, attribs } = domNode;
  if (name === "div" && attribs.class?.includes("youtube-embed")) {
    const videoId = attribs["data-video-id"];
    if (videoId) return { videoId, title: attribs["data-title"] };
  }
  if (name === "iframe") return readYouTubeFromIframe(attribs);
  return null;
}

function knownToolName(value: string | undefined): BlogToolName | null {
  if (value === "contrast-comparison") return "contrast-comparison";
  if (value === "contrast-generator") return "contrast-generator";
  if (value === "color-pairing") return "color-pairing";
  return null;
}

function readBlogToolName(domNode: BlogDomNode): BlogToolName | null {
  if (domNode.type !== "tag" || domNode.name !== "div" || !domNode.attribs) return null;
  return knownToolName(domNode.attribs["data-blog-tool"]);
}

export function replaceBlogContent(domNode: BlogDomNode): ReactElement | undefined {
  const youtube = readYouTubeEmbed(domNode);
  if (youtube) return <YouTubeEmbed videoId={youtube.videoId} title={youtube.title} />;
  const toolName = readBlogToolName(domNode);
  if (!toolName) return undefined;
  const Tool = BLOG_TOOL_COMPONENTS[toolName];
  return (
    <Suspense fallback={<div data-blog-tool-root>Loading interactive example.</div>}>
      <Tool />
    </Suspense>
  );
}
