// POST /api/captcha-matematico  { nome, mensagem, resposta, desafio }
// (equivale ao CaptchaMatematicoController do Spring)

import { lerConfig } from "../_lib/config.js";
import { exigirMetodo, lerFormulario, responderResultado } from "../_lib/http.js";
import { validarPergunta } from "../_services/captchaMatematicoService.js";

export async function captchaMatematico(req, res, env) {
  if (!exigirMetodo(req, res, "POST")) return;
  const form = await lerFormulario(req, res);
  if (!form) return;

  const valido = validarPergunta(lerConfig(env), form.desafio, form.resposta);

  responderResultado(res, valido, valido
    ? `Captcha validado. Mensagem de ${form.nome} recebida.`
    : "Resposta errada. Uma nova conta foi gerada.");
}

// Vercel Function
export default (req, res) => captchaMatematico(req, res, process.env);
