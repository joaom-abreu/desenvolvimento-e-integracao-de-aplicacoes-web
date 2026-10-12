// GET /api/captcha-matematico/pergunta  →  { pergunta, desafio }

import { lerConfig } from "../_lib/config.js";
import { exigirMetodo, responderJson } from "../_lib/http.js";
import { gerarPergunta } from "../_services/captchaMatematicoService.js";

export function captchaMatematicoPergunta(req, res, env) {
  if (!exigirMetodo(req, res, "GET")) return;
  responderJson(res, 200, gerarPergunta(lerConfig(env)));
}

// Vercel Function
export default (req, res) => captchaMatematicoPergunta(req, res, process.env);
