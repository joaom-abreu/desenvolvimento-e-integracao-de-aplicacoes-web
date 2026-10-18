import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Porta fixa do front-end. O back-end (Spring Boot) libera
    // exatamente esta origem no CORS: http://localhost:5173
    port: 5173,
    strictPort: true,
  },
});
