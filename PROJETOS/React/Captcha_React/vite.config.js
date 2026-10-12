import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { ROTAS } from "./api/_rotas.js";

// No npm run dev (e no npm run preview), as rotas /api/... são atendidas por
// este middleware. Em produção, quem atende são as Vercel Functions da pasta api/.
// Assim as SECRET KEYS ficam só no servidor e nunca vão para o navegador.
function captchaApi(env) {
  const middleware = (req, res, next) => {
    const rota = ROTAS[new URL(req.url, "http://localhost").pathname];
    if (!rota) return next();
    Promise.resolve(rota(req, res, env)).catch(next);
  };

  return {
    name: "captcha-api",
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
    plugins: [react(), captchaApi(env)],
  };
});
