// Vercel Function: GET /api/subtitles (status) · POST /api/subtitles { audio, ... }
// Lê GEMINI_API_KEY (e, opcionalmente, GEMINI_MODEL) das Environment Variables da Vercel.
// A lógica fica em api/_subtitles.js, que o vite.config.js também usa no npm run dev.
// O tempo máximo da função (maxDuration) está no vercel.json.

import { handleSubtitles } from "./_subtitles.js";

export default function handler(req, res) {
  return handleSubtitles(req, res, process.env);
}
