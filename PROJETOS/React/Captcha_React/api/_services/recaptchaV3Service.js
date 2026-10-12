// =========================================================
// GOOGLE reCAPTCHA v3
// ---------------------------------------------------------
// O v3 não mostra desafio nenhum. O Google devolve uma
// pontuação (score) de 0.0 (robô) a 1.0 (humano) e VOCÊ
// decide a partir de quanto aceita a requisição.
//
// Além do "success", confira sempre:
//  - score  >= score mínimo configurado
//  - action == a ação usada no grecaptcha.execute(...)
//
// Campo enviado pelo formulário: g-recaptcha-response
// =========================================================

import { postFormulario } from "../_lib/http.js";

const URL_VERIFICACAO = "https://www.google.com/recaptcha/api/siteverify";

/** Devolve { valido, score, motivo }. */
export async function validarV3(config, token, acaoEsperada) {
  const { secretKey, scoreMinimo } = config.recaptchaV3;

  if (!secretKey) {
    return { valido: false, score: 0, motivo: "Configure a RECAPTCHA_V3_SECRET_KEY." };
  }
  if (!token || typeof token !== "string") {
    return { valido: false, score: 0, motivo: "Token não enviado." };
  }

  try {
    // Resposta: { "success": true, "score": 0.9, "action": "contato", ... }
    const json = await postFormulario(URL_VERIFICACAO, { secret: secretKey, response: token });

    const sucesso = json.success === true;
    const score = Number(json.score ?? 0);
    const acao = String(json.action ?? "");

    if (!sucesso) {
      return {
        valido: false,
        score,
        motivo: `Token inválido ou expirado: ${JSON.stringify(json["error-codes"] ?? [])}`,
      };
    }
    if (acao !== acaoEsperada) {
      return { valido: false, score, motivo: `Ação diferente da esperada (${acao}).` };
    }
    if (score < scoreMinimo) {
      return { valido: false, score, motivo: `Score abaixo do mínimo de ${scoreMinimo}.` };
    }
    return { valido: true, score, motivo: "OK" };
  } catch (erro) {
    console.error("Erro ao validar reCAPTCHA v3:", erro.message);
    return { valido: false, score: 0, motivo: "Erro ao falar com o Google." };
  }
}
