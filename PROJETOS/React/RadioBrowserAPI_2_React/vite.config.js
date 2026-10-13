import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// O navegador chama a Radio Browser API (CORS liberado) e o Supabase (Data API)
// direto, sem servidor no meio: não há pasta api/ neste projeto.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
