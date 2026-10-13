import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// O navegador fala direto com o Supabase (Data API), sem servidor no meio:
// não há pasta api/ neste projeto. Na Vercel, o vercel.json manda qualquer
// caminho (/Ab3xYz, /meu-alias...) para o index.html, e o React Router decide.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
