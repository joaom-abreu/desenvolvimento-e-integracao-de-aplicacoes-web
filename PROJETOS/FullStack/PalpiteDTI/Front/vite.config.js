import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// SCSS (pré-processador): o Vite compila os .scss sozinho, basta o pacote "sass" instalado.
// Autoprefixer (pós-processador): configurado em postcss.config.js.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // a porta fica fixa: o CORS do back-end libera exatamente http://localhost:5173
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
});
