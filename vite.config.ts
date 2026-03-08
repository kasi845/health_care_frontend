import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Docs: forward to backend (backend serves /api/docs and /api/openapi.json)
      "/api/docs": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api/redoc": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: () => "/redoc",
      },
      "/api/openapi.json": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // When Swagger is at /docs (backend direct), it fetches /openapi.json
      "/openapi.json": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // All other /api/* -> backend (keep /api so backend routes match)
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Connection", "keep-alive");
          });
        },
        timeout: 120000,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
