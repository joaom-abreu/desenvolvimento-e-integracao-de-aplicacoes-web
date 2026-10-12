// POST /api/captcha-imagem  { nome, mensagem, captcha, desafio }
// (equivale ao CaptchaImagemController do Spring)

import { lerConfig } from "../_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "../_lib/http.js";
import { validarCaptchaImagem } from "../_services/captchaImagemService.js";

export async function captchaImagem(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = validarCaptchaImagem(lerConfig(env), form.desafio, form.captcha);

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : "O texto não confere com a imagem. Uma nova imagem foi gerada.");
}

// Vercel Function
export default (req, res) => captchaImagem(req, res, process.env);
