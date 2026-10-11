import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // O mapbox-gl sozinho tem ~1,7 MB. Ele já fica num arquivo separado (lazy
    // no App.jsx), então o aviso de "chunk grande" pode subir.
    chunkSizeWarningLimit: 2000,
  },
});
