import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "example",
  resolve: {
    alias: {
      "tiny-signals-core": resolve(__dirname, "src/index.ts"),
    },
  },
});
