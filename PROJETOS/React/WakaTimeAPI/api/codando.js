// Vercel Function: GET /api/codando
// Em que projeto você está mexendo no editor agora (heartbeats do WakaTime).
// Lê WAKATIME_API_KEY das Environment Variables da Vercel.
// A lógica fica em api/_codando.js, que o vite.config.js também usa no npm run dev.

import { handleCodando } from "./_codando.js";

export default function handler(req, res) {
  return handleCodando(req, res, process.env);
}
