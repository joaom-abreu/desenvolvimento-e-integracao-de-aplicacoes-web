// POST /api/hcaptcha  { nome, mensagem, "h-captcha-response" }
// (equivale ao HCaptchaController do Spring)

import { lerConfig } from "./_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "./_lib/http.js";
import { validarHCaptcha } from "./_services/hcaptchaService.js";

export async function hcaptcha(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = await validarHCaptcha(lerConfig(env), form["h-captcha-response"]);

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : "Resolva o hCaptcha antes de enviar.");
}

// Vercel Function
export default (req, res) => hcaptcha(req, res, process.env);
