// Vercel Function: GET /api/github?resource=profile|repos|contributions&username=...
// Lê GITHUB_TOKEN das Environment Variables da Vercel (opcional, mas recomendado).
// A lógica fica em api/_github.js, que o vite.config.js também usa no npm run dev.

import { handleGitHub } from "./_github.js";

export default function handler(req, res) {
  return handleGitHub(req, res, process.env);
}
