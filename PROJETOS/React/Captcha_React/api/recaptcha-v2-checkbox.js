// POST /api/recaptcha-v2-checkbox  { nome, mensagem, "g-recaptcha-response" }
// (equivale ao RecaptchaV2CheckboxController do Spring)

import { lerConfig } from "./_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "./_lib/http.js";
import { validarCheckbox } from "./_services/recaptchaV2Service.js";

export async function recaptchaV2Checkbox(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = await validarCheckbox(lerConfig(env), form["g-recaptcha-response"]);

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : 'Marque a caixa "Não sou um robô" antes de enviar.');
}

// Vercel Function
export default (req, res) => recaptchaV2Checkbox(req, res, process.env);
