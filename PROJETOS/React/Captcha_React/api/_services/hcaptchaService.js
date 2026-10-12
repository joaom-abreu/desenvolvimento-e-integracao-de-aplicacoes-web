// =========================================================
// hCAPTCHA
// ---------------------------------------------------------
// Alternativa ao reCAPTCHA v2 com foco em privacidade.
// A validação é praticamente igual à do Google, mudando
// só a URL e o nome do campo.
//
// Campo enviado pelo formulário: h-captcha-response
// =========================================================

import { postFormulario } from "../_lib/http.js";

const URL_VERIFICACAO = "https://api.hcaptcha.com/siteverify";

export async function validarHCaptcha(config, token) {
  if (!token || typeof token !== "string") return false;

  const { secretKey, siteKey } = config.hcaptcha;

  try {
    // O "sitekey" é opcional, mas garante que o token veio do SEU widget
    const json = await postFormulario(URL_VERIFICACAO, {
      secret: secretKey,
      response: token,
      sitekey: siteKey,
    });
    return json.success === true;
  } catch (erro) {
    console.error("Erro ao validar hCaptcha:", erro.message);
    return false;
  }
}
