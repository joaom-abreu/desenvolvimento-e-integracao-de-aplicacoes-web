// Vercel Function: POST /api/gemini  { message, history }
// Lê GEMINI_API_KEY (e, opcionalmente, GEMINI_MODEL) das Environment Variables da Vercel.
// A lógica fica em api/_gemini.js, que o vite.config.js também usa no npm run dev.
// O tempo máximo da função (maxDuration) está no vercel.json.

import { handleGemini } from "./_gemini.js";

export default function handler(req, res) {
  return handleGemini(req, res, process.env);
}
