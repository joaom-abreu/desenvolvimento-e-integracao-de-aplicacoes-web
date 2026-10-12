// POST /api/altcha  { nome, mensagem, altcha }
// (equivale ao AltchaController do Spring)

import { lerConfig } from "../_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "../_lib/http.js";
import { validarAltcha } from "../_services/altchaService.js";

export async function altcha(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = validarAltcha(lerConfig(env), form.altcha);

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : "A verificação ALTCHA falhou ou expirou. Marque a caixa de novo.");
}

// Vercel Function
export default (req, res) => altcha(req, res, process.env);
