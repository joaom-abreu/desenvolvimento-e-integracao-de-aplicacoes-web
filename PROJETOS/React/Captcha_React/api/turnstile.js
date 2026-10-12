// POST /api/turnstile  { nome, mensagem, "cf-turnstile-response" }
// (equivale ao TurnstileController do Spring)

import { lerConfig } from "./_lib/config.js";
import { exigirMetodo, ipDe, lerFormulario, responderResultado } from "./_lib/http.js";
import { validarTurnstile } from "./_services/turnstileService.js";

export async function turnstile(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = await validarTurnstile(lerConfig(env), form["cf-turnstile-response"], ipDe(req));

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : "A verificação da Cloudflare não foi concluída. Aguarde o selo ficar verde e envie de novo.");
}

// Vercel Function
export default (req, res) => turnstile(req, res, process.env);
