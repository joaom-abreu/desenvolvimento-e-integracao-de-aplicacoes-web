// Vercel Function: GET /api/spotify?resource=now|stats&range=short_term
// Lê SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET e SPOTIFY_REFRESH_TOKEN das
// Environment Variables da Vercel.
// A lógica fica em api/_spotify.js, que o vite.config.js também usa no npm run dev.
//
// O login (/api/spotify/login e /api/spotify/callback) NÃO existe na Vercel:
// ele só serve para gerar o refresh token uma vez, no npm run dev.

import { handleSpotify } from "./_spotify.js";

export default function handler(req, res) {
  return handleSpotify(req, res, process.env);
}
