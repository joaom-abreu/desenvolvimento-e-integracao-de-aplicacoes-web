// =========================================================
// GOOGLE reCAPTCHA v2 (CHECKBOX e INVISÍVEL)
// ---------------------------------------------------------
// As duas versões do v2 são validadas do mesmo jeito no
// servidor. A única diferença é o par de chaves.
//
// Se o seu projeto usa só uma delas, apague a função e a
// chave da outra.
//
// Campo enviado pelo formulário: g-recaptcha-response
// =========================================================

import { postFormulario } from "../_lib/http.js";

const URL_VERIFICACAO = "https://www.google.com/recaptcha/api/siteverify";

export function validarCheckbox(config, token) {
  return validar(token, config.recaptchaV2Checkbox.secretKey);
}

export function validarInvisivel(config, token) {
  return validar(token, config.recaptchaV2Invisivel.secretKey);
}

async function validar(token, secretKey) {
  // O usuário não resolveu o captcha
  if (!token || typeof token !== "string") return false;

  try {
    // Resposta do Google: { "success": true, "hostname": "...", ... }
    const json = await postFormulario(URL_VERIFICACAO, { secret: secretKey, response: token });
    return json.success === true;
  } catch (erro) {
    console.error("Erro ao validar reCAPTCHA v2:", erro.message);
    return false;
  }
}
