// Vercel Function: GET /api/canvas
// Lê CANVAS_TOKEN (e CANVAS_URL / CANVAS_COURSES) das Environment Variables da Vercel.
// A lógica fica em api/_canvas.js, que o vite.config.js também usa no npm run dev.

import { handleCanvas } from "./_canvas.js";

export default function handler(req, res) {
  return handleCanvas(req, res, process.env);
}
