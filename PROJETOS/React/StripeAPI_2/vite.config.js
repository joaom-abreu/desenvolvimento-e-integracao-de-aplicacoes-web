import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { handleStripe, STRIPE_PATH } from "./api/_stripe.js";

// No npm run dev (e no npm run preview), a rota /api/stripe é atendida por
// este middleware. Em produção, quem atende é a Vercel Function api/stripe.js.
// Assim a STRIPE_SECRET_KEY fica só no servidor e nunca vai para o navegador.
function stripeApi(env) {
  const middleware = (req, res, next) => {
    if (new URL(req.url, "http://localhost").pathname !== STRIPE_PATH) return next();
    handleStripe(req, res, env).catch(next);
  };

  return {
    name: "stripe-api",
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
    plugins: [react(), stripeApi(env)],
  };
});
