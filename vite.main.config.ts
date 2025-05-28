import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src', 'common'),
      "@main": path.resolve(__dirname, "src", "main"),
    },
  },
});
