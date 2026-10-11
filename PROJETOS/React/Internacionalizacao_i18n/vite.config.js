import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Projeto só de front-end: as traduções ficam em src/i18n/locales e vão no
// bundle. Não há pasta api/ nem .env.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
