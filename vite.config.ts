import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { cpSync } from "node:fs";
import { scopeModuleCss } from "./scripts/scope-module-css.mjs";

export default defineConfig({
  plugins: [react(), {
    name: "booking-prototype-refresh",
    configureServer(server) {
      const source = fileURLToPath(new URL("./src/modules/bookings/booking-redesign.html", import.meta.url));
      const output = fileURLToPath(new URL("./public/booking/index.html", import.meta.url));
      server.watcher.add(source);
      server.watcher.on("change", (file) => {
        if (file !== source) return;
        cpSync(source, output);
        server.ws.send({ type: "full-reload" });
      });
    },
  }],
  css: { postcss: { plugins: [scopeModuleCss()] } },
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
