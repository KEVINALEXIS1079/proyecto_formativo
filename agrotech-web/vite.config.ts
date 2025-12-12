import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["events", "stream", "util", "buffer"],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  server: { port: 3000, host: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "#": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@heroui/react', 'framer-motion', 'lucide-react'],
          'map-vendor': ['leaflet', 'react-leaflet', 'leaflet-geosearch', '@turf/turf'],
          'utils-vendor': ['date-fns', 'axios', 'zod', 'react-hook-form'],
          'xlsx-vendor': ['xlsx', 'xlsx-js-style'],
        }
      }
    }
  }
});
