import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from 'rollup-plugin-visualizer';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
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
