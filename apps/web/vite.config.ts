import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "FlowForge",
        short_name: "FlowForge",
        description: "Personal productivity super-app",
        theme_color: "#0f0f13",
        background_color: "#0f0f13",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/pwa-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/pwa-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        // Cache-first shell (default precache) + a short-lived
        // network-first cache for the read-mostly views CLAUDE.md calls out
        // for offline support (today view, notes list/detail) so they still
        // render something when the API is unreachable.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === "/api/views/today" || url.pathname.startsWith("/api/notes"),
            handler: "NetworkFirst",
            options: {
              cacheName: "flowforge-offline-read",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/socket.io": { target: "http://localhost:4000", ws: true },
    },
  },
});
