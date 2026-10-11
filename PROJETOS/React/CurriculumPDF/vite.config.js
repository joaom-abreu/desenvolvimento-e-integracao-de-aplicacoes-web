import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // O PDF.js sozinho tem ~600 kB. Ele já fica num arquivo separado (lazy no
    // App.jsx), então o aviso de "chunk grande" pode subir um pouco.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      onwarn(warning, warn) {
        // O react-pdf começa com 'use client' (diretiva do Next.js). No Vite ela
        // não faz diferença, então o aviso é só ruído no npm run build.
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
