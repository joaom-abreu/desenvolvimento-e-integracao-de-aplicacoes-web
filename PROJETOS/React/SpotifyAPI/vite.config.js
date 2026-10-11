import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import {
  CALLBACK_PATH,
  LOGIN_PATH,
  SPOTIFY_PATH,
  handleCallback,
  handleLogin,
  handleSpotify,
} from "./api/_spotify.js";

// Rotas da API atendidas pelo próprio Vite. Em produção, quem atende /api/spotify
// é a Vercel Function api/spotify.js. Assim as chaves ficam só no servidor.
const API_ROUTES = { [SPOTIFY_PATH]: handleSpotify };

// Login para gerar o SPOTIFY_REFRESH_TOKEN: só no npm run dev (nunca na Vercel)
const DEV_ROUTES = { [LOGIN_PATH]: handleLogin, [CALLBACK_PATH]: handleCallback };

function spotifyApi(env) {
  const middleware = (routes) => (req, res, next) => {
    const handler = routes[new URL(req.url, "http://localhost").pathname];
    if (!handler) return next();
    Promise.resolve(handler(req, res, env)).catch(next);
  };

  return {
    name: "spotify-api",
    // Chaves { } de propósito: se a função devolver algo, o Vite o executa depois
    configureServer(server) {
      server.middlewares.use(middleware({ ...API_ROUTES, ...DEV_ROUTES }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(API_ROUTES));
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Prefixo "" lê TODAS as variáveis do .env.local, inclusive as sem VITE_.
  // Isso não as expõe: para o navegador continuam indo só as VITE_*.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), spotifyApi(env)],
    // O Spotify só aceita 127.0.0.1 (e não "localhost") no Redirect URI do login:
    // o servidor escuta nesse endereço para http://127.0.0.1:5173 funcionar
    server: { host: "127.0.0.1" },
    preview: { host: "127.0.0.1" },
  };
});
