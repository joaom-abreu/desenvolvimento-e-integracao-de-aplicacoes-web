// POST /api/recaptcha-v3  { nome, mensagem, "g-recaptcha-response" }
// (equivale ao RecaptchaV3Controller do Spring)

import { lerConfig } from "./_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "./_lib/http.js";
import { validarV3 } from "./_services/recaptchaV3Service.js";

// Precisa ser IGUAL à action usada no grecaptcha.execute(...) do front
// (RECAPTCHA_V3_ACTION em src/config/captchaConfig.js)
const ACAO = "contato";

export async function recaptchaV3(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const { valido, score, motivo } = await validarV3(lerConfig(env), form["g-recaptcha-response"], ACAO);

  responderResultado(res, valido, valido
    ? `Captcha validado com score ${score}. Mensagem de ${form.nome} recebida.`
    : `Requisição bloqueada (score ${score}). ${motivo}`, { score });
}

// Vercel Function
export default (req, res) => recaptchaV3(req, res, process.env);
