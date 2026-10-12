// =========================================================
// CAPTCHA MATEMÁTICO (gerado pelo próprio projeto)
// ---------------------------------------------------------
// O mais simples de todos: uma conta de somar, subtrair ou
// multiplicar. A resposta NUNCA vai para o navegador
// (senão um robô leria a resposta na página): vai só um
// desafio assinado (ver _lib/desafioAssinado.js).
//
// Bom para aprender o conceito. Contra robôs de verdade é
// fraco, porque um programa resolve a conta facilmente.
//
// Campos enviados pelo formulário: resposta + desafio
// =========================================================

import { randomInt } from "node:crypto";
import { conferirDesafio, criarDesafio } from "../_lib/desafioAssinado.js";

/** Cria uma pergunta nova: { pergunta, desafio }. */
export function gerarPergunta(config) {
  const a = 1 + randomInt(9);
  const b = 1 + randomInt(9);

  let pergunta;
  let resposta;

  switch (randomInt(3)) {
    case 0:
      pergunta = `${a} + ${b}`;
      resposta = a + b;
      break;
    case 1: {
      // Maior primeiro, para o resultado nunca ser negativo
      const maior = Math.max(a, b);
      const menor = Math.min(a, b);
      pergunta = `${maior} − ${menor}`;
      resposta = maior - menor;
      break;
    }
    default:
      pergunta = `${a} × ${b}`;
      resposta = a * b;
  }

  const { hmacKey, validadeMinutos } = config.desafio;
  return {
    pergunta: `Quanto é ${pergunta}?`,
    desafio: criarDesafio(hmacKey, String(resposta), validadeMinutos),
  };
}

/** Confere a resposta e invalida a pergunta. */
export function validarPergunta(config, desafio, respostaUsuario) {
  const texto = String(respostaUsuario ?? "").trim();
  if (!/^\d{1,3}$/.test(texto)) {
    // Mesmo inválida, a tentativa gasta o desafio
    conferirDesafio(config.desafio.hmacKey, desafio, "");
    return false;
  }
  return conferirDesafio(config.desafio.hmacKey, desafio, String(Number(texto)));
}
