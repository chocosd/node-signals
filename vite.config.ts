import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "example",
  resolve: {
    alias: {
      "node-signals/dom": resolve(__dirname, "src/dom.ts"),
      "node-signals": resolve(__dirname, "src/index.ts"),
    },
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },
});
