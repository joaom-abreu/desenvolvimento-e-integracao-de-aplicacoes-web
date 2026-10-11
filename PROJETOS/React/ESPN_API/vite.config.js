import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// A API pública da ESPN não pede chave e libera CORS: o navegador chama a ESPN
// direto, sem servidor no meio (não há pasta api/ nem .env neste projeto).
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
