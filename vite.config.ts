import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { asyncCss } from "./vite-plugin-async-css";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    asyncCss(), // Make CSS load asynchronously (non-blocking)
  ],
});
