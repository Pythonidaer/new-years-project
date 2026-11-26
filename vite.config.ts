import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from 'rollup-plugin-visualizer';

// Preview serves the same headers Vercel will send, so CSP can be checked locally.
function previewHeaders(): Record<string, string> {
  const configPath = path.resolve(__dirname, "vercel.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as {
    headers?: { headers?: { key: string; value: string }[] }[];
  };
  const headers = config.headers?.[0]?.headers ?? [];
  return Object.fromEntries(headers.map((header) => [header.key, header.value]));
}

// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    headers: previewHeaders(),
  },
  plugins: [
    react(),
    // Removed asyncCss() - CSS now loads synchronously to prevent flash/FOUC
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    // Enable CSS sourcemaps in development for better debugging with CSS Modules
    // This helps DevTools show original file/line references instead of generated class names
    devSourcemap: true,
  },
  build: {
    // Disable sourcemaps in production for smaller bundles (30-50% reduction)
    // Sourcemaps are still available in development mode
    sourcemap: process.env.NODE_ENV === 'development',
    // Suppress warnings for chunks up to 1MB (default is 500kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries - change very infrequently, benefit from long-term caching
          vendor: ['react', 'react-dom'],
          // Router library - changes less frequently than app code
          router: ['react-router-dom'],
          // Icon libraries - large but stable, good for separate caching
          icons: ['react-icons', 'lucide-react'],
          // Utility libraries - separate chunk for better caching
          utils: ['html-react-parser', 'color'],
        },
      },
    },
  },
});
