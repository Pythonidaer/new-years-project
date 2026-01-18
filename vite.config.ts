import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { asyncCss } from "./vite-plugin-async-css";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    asyncCss(), // Make CSS load asynchronously (non-blocking)
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
