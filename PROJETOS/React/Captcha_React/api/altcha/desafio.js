// GET /api/altcha/desafio
// O widget chama este endereço (atributo challenge) para pegar um desafio.

import { lerConfig } from "../_lib/config.js";
import { exigirMetodo, responderJson } from "../_lib/http.js";
import { criarDesafioAltcha } from "../_services/altchaService.js";

export function altchaDesafio(req, res, env) {
  if (!exigirMetodo(req, res, "GET")) return;
  responderJson(res, 200, criarDesafioAltcha(lerConfig(env)));
}

// Vercel Function
export default (req, res) => altchaDesafio(req, res, process.env);
