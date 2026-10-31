import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const OLLAMA = "http://127.0.0.1:11434";
const proxy = {
  "/ollama": {
    target: OLLAMA,
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/ollama/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 5173, proxy },
});
