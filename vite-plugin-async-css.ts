import type { Plugin } from 'vite';

/**
 * Vite plugin to make CSS load asynchronously (non-blocking)
 * Uses the "print media trick" to load CSS without blocking render
 */
export function asyncCss(): Plugin {
  return {
    name: 'async-css',
    transformIndexHtml(html) {
      // Replace blocking stylesheet links with async loading
      return html.replace(
        /<link\s+rel="stylesheet"[^>]*>/g,
        (match) => {
          // Extract all attributes except rel (we'll add it back)
          const attributes = match
            .replace(/rel="stylesheet"/, '')
            .trim()
            .replace(/^<link\s+/, '')
            .replace(/>$/, '');
          
          // Use print media trick: load as print media, then switch to all
          // This makes the CSS non-blocking while still loading it
          // Preserve all original attributes (crossorigin, etc.)
          return `<link rel="stylesheet" ${attributes} media="print" onload="this.media='all'">
    <noscript>${match}</noscript>`;
        }
      );
    },
  };
}

