import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",

  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        zodiac: resolve(import.meta.dirname, "zodiac.html")
      }
    }
  }
});