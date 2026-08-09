import { defineConfig } from "vite";

export default defineConfig({
  base: "/escoh/",
  build: {
    outDir: "docs",
    emptyOutDir: true
  }
});
