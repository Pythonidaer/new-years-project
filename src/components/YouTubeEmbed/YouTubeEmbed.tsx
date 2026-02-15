type YouTubeEmbedProps = {
  videoId: string;
  title?: string;
};

/**
 * Responsive YouTube embed (16:9) for blog content.
 * Use in post HTML as: <div class="youtube-embed" data-video-id="VIDEO_ID"></div>
 */
export function YouTubeEmbed({ videoId, title = "YouTube video" }: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  return (
    <div className="youtube-embed-wrapper">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
