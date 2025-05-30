import { defineConfig } from "vite";
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src', 'common'),
      "@renderer": path.resolve(__dirname, "src", "renderer"),
    },
  },
});
