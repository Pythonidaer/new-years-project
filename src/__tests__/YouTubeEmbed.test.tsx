import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed/YouTubeEmbed";

describe("YouTubeEmbed", () => {
  it("renders an iframe with the correct embed URL for the given video ID", () => {
    render(<YouTubeEmbed videoId="dQw4w9WgXcQ" />);
    const iframe = screen.getByTitle("YouTube video");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("uses default title when title prop is not provided", () => {
    render(<YouTubeEmbed videoId="abc123" />);
    const iframe = screen.getByTitle("YouTube video");
    expect(iframe).toBeInTheDocument();
  });

  it("uses custom title when title prop is provided", () => {
    render(<YouTubeEmbed videoId="abc123" title="My Custom Video Title" />);
    const iframe = screen.getByTitle("My Custom Video Title");
    expect(iframe).toBeInTheDocument();
  });

  it("wraps iframe in a div with youtube-embed-wrapper class", () => {
    const { container } = render(<YouTubeEmbed videoId="xyz" />);
    const wrapper = container.querySelector(".youtube-embed-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector("iframe")).toBeInTheDocument();
  });

  it("sets allow and referrerPolicy on iframe for embed behavior", () => {
    render(<YouTubeEmbed videoId="test" />);
    const iframe = screen.getByTitle("YouTube video");
    expect(iframe).toHaveAttribute("allow");
    expect(iframe).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  });
});
