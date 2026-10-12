// =========================================================
// CLOUDFLARE TURNSTILE
// ---------------------------------------------------------
// Na maioria das vezes o usuário não precisa fazer nada:
// o widget verifica o navegador sozinho. É gratuito e não
// exige que o site use a Cloudflare.
//
// Campo enviado pelo formulário: cf-turnstile-response
// =========================================================

import { postFormulario } from "../_lib/http.js";

const URL_VERIFICACAO = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function validarTurnstile(config, token, ipDoUsuario) {
  if (!token || typeof token !== "string") return false;

  try {
    // "remoteip" é opcional e ajuda a Cloudflare a detectar abuso
    const campos = { secret: config.turnstile.secretKey, response: token };
    if (ipDoUsuario) campos.remoteip = ipDoUsuario;

    const json = await postFormulario(URL_VERIFICACAO, campos);
    return json.success === true;
  } catch (erro) {
    console.error("Erro ao validar Turnstile:", erro.message);
    return false;
  }
}
