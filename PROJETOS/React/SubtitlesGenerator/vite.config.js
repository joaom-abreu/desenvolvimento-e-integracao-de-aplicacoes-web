import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { handleSubtitles, SUBTITLES_PATH } from "./api/_subtitles.js";

// No npm run dev (e no npm run preview), a rota /api/subtitles é atendida por
// este middleware. Em produção, quem atende é a Vercel Function api/subtitles.js.
// Assim a GEMINI_API_KEY fica só no servidor e nunca vai para o navegador.
function subtitlesApi(env) {
  const middleware = (req, res, next) => {
    if (new URL(req.url, "http://localhost").pathname !== SUBTITLES_PATH) return next();
    handleSubtitles(req, res, env).catch(next);
  };

  return {
    name: "subtitles-api",
    // Chaves { } de propósito: se a função devolver algo, o Vite o executa depois
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Prefixo "" lê TODAS as variáveis do .env.local, inclusive as sem VITE_.
  // Isso não as expõe: para o navegador continuam indo só as VITE_*.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), subtitlesApi(env)],

    // O ffmpeg.wasm cria um Web Worker próprio: o pré-empacotamento do Vite
    // quebraria o caminho desse worker, então ele fica de fora.
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg"],
    },
    worker: {
      format: "es",
    },
  };
});
