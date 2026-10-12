// GET /api/captcha-imagem/imagem  →  { imagem, desafio }
// Cada chamada sorteia um texto novo.

import { lerConfig } from "../_lib/config.js";
import { exigirMetodo, responderJson } from "../_lib/http.js";
import { gerarCaptchaImagem } from "../_services/captchaImagemService.js";

export function captchaImagemNova(req, res, env) {
  if (!exigirMetodo(req, res, "GET")) return;
  // responderJson já manda Cache-Control: no-store (nada de imagem antiga do cache)
  responderJson(res, 200, gerarCaptchaImagem(lerConfig(env)));
}

// Vercel Function
export default (req, res) => captchaImagemNova(req, res, process.env);
