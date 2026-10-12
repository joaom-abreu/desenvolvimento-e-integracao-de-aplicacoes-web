// POST /api/recaptcha-v2-invisivel  { nome, mensagem, "g-recaptcha-response" }
// (equivale ao RecaptchaV2InvisivelController do Spring)

import { lerConfig } from "./_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "./_lib/http.js";
import { validarInvisivel } from "./_services/recaptchaV2Service.js";

export async function recaptchaV2Invisivel(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = await validarInvisivel(lerConfig(env), form["g-recaptcha-response"]);

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : "O Google não confirmou a verificação. Tente enviar de novo.");
}

// Vercel Function
export default (req, res) => recaptchaV2Invisivel(req, res, process.env);
