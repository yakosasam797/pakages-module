import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@paryatech/design-system": fileURLToPath(new URL("./node_modules/@paryatech/ui", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port: 4180,
    strictPort: true,
    allowedHosts: ["terminal.local"],
  },
});
