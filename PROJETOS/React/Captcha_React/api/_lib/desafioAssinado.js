// =========================================================
// DESAFIO ASSINADO (substitui a HttpSession do Spring)
// ---------------------------------------------------------
// No Spring, a resposta certa do captcha de imagem e do
// matemático ficava guardada na SESSÃO do usuário. Aqui não
// existe sessão: na Vercel cada requisição pode cair em uma
// instância diferente da função.
//
// Solução: o servidor devolve ao navegador um "desafio"
// assinado com HMAC. Ele NÃO contém a resposta, só uma
// assinatura dela:
//
//   desafio = id . expira . HMAC(chave, "id|expira|resposta")
//
// No envio, o navegador devolve o desafio + o que a pessoa
// digitou. O servidor recalcula o HMAC com a resposta digitada
// e compara. Sem a chave secreta ninguém consegue:
//   • descobrir a resposta a partir do desafio;
//   • criar um desafio novo com uma resposta escolhida.
//
// Cada desafio vale uma vez só e expira em alguns minutos.
// =========================================================

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Ids já usados, para ninguém reenviar o mesmo desafio.
 * Fica na memória: no npm run dev funciona sempre; na Vercel vale por
 * instância da função. Em produção, troque por um cache com expiração
 * (ex.: Redis / Upstash), assim como no ALTCHA.
 */
const usados = new Map(); // id → expira (segundos)

const agora = () => Math.floor(Date.now() / 1000);

function assinar(chave, id, expira, resposta) {
  return createHmac("sha256", chave).update(`${id}|${expira}|${resposta}`).digest("hex");
}

/** Comparação em tempo constante, para não vazar informação pelo tempo. */
export function iguais(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Cria o desafio para a resposta certa (já normalizada). */
export function criarDesafio(chave, resposta, validadeMinutos = 10) {
  const id = randomBytes(12).toString("hex");
  const expira = agora() + validadeMinutos * 60;
  return `${id}.${expira}.${assinar(chave, id, expira, resposta)}`;
}

/** Confere a resposta digitada (já normalizada) e invalida o desafio. */
export function conferirDesafio(chave, desafio, resposta) {
  const [id, expiraTexto, assinatura] = String(desafio ?? "").split(".");
  const expira = Number(expiraTexto);

  if (!id || !assinatura || !Number.isInteger(expira)) return false;

  // 1. O prazo não pode ter passado
  if (agora() > expira) return false;

  // 2. Cada desafio só pode ser usado uma vez (errou ou acertou)
  for (const [usado, prazo] of usados) if (agora() > prazo) usados.delete(usado);
  if (usados.has(id)) return false;
  usados.set(id, expira);

  // 3. A resposta digitada precisa gerar a mesma assinatura
  return iguais(assinar(chave, id, expira, resposta), assinatura);
}
