import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src/ui-app"),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve(__dirname, "dist/ui"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/ui-config": "http://localhost:8787",
      "/oauth": "http://localhost:8787",
    },
  },
});
