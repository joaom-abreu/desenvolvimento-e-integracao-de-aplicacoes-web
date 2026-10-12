// =========================================================
// ALTCHA (prova de trabalho / proof-of-work)
// ---------------------------------------------------------
// Em vez de mostrar imagens, o navegador precisa "gastar"
// um pouco de processamento para achar um número secreto.
// Para uma pessoa leva menos de um segundo; para um robô
// enviando milhares de formulários fica caro.
//
// Não depende de nenhuma empresa: o desafio é criado e
// conferido aqui mesmo, só com o node:crypto.
//
// Como funciona:
//  1. O servidor sorteia um "salt" e um número secreto N
//  2. Envia: challenge = SHA-256(salt + N)  (sem o N!)
//     e uma assinatura HMAC do challenge
//  3. O navegador testa 0, 1, 2, ... até achar o N que
//     gera o mesmo hash
//  4. O servidor confere o hash, a assinatura e o prazo
//
// Usa o formato de desafio "v1" do ALTCHA, que o widget
// (pacote npm altcha) continua aceitando.
//
// Campo enviado pelo formulário: altcha (texto em Base64)
// =========================================================

import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import { iguais } from "../_lib/desafioAssinado.js";

const ALGORITMO = "SHA-256";

/**
 * Desafios já usados, para ninguém reenviar a mesma solução.
 * Fica na memória (na Vercel, vale por instância da função).
 * Em produção, troque por um cache com expiração (ex.: Redis / Upstash).
 */
const desafiosUsados = new Map(); // challenge → expira (segundos)

const sha256 = (texto) => createHash("sha256").update(texto).digest("hex");
const hmacSha256 = (chave, texto) => createHmac("sha256", chave).update(texto).digest("hex");
const agora = () => Math.floor(Date.now() / 1000);

/** Cria o desafio que o widget busca em /api/altcha/desafio. */
export function criarDesafioAltcha(config) {
  const { hmacKey, maxNumber, validadeMinutos } = config.altcha;

  const expira = agora() + validadeMinutos * 60;

  // O prazo vai dentro do salt, então também fica protegido pela assinatura
  const salt = `${randomBytes(12).toString("hex")}?expires=${expira}`;
  const numeroSecreto = randomInt(maxNumber + 1);

  const challenge = sha256(salt + numeroSecreto);

  return {
    algorithm: ALGORITMO,
    challenge,
    maxnumber: maxNumber,
    salt,
    signature: hmacSha256(hmacKey, challenge),
  };
}

/** Confere a solução que o widget colocou no campo "altcha". */
export function validarAltcha(config, payloadBase64) {
  if (!payloadBase64 || typeof payloadBase64 !== "string") return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf8"));

    const { algorithm, challenge, salt, signature } = payload;
    const numero = Number(payload.number);

    if (algorithm !== ALGORITMO || !Number.isInteger(numero) || numero < 0) return false;
    if (typeof challenge !== "string" || typeof salt !== "string" || typeof signature !== "string") {
      return false;
    }

    // 1. O prazo não pode ter passado
    const expira = prazoDoSalt(salt);
    if (!expira || agora() > expira) return false;

    // 2. O número encontrado precisa gerar o mesmo hash
    if (!iguais(sha256(salt + numero), challenge)) return false;

    // 3. A assinatura prova que fomos NÓS que criamos o desafio
    if (!iguais(hmacSha256(config.altcha.hmacKey, challenge), signature)) return false;

    // 4. Cada desafio só pode ser usado uma vez
    for (const [usado, prazo] of desafiosUsados) if (agora() > prazo) desafiosUsados.delete(usado);
    if (desafiosUsados.has(challenge)) return false;
    desafiosUsados.set(challenge, expira);
    return true;
  } catch (erro) {
    console.error("Erro ao validar ALTCHA:", erro.message);
    return false;
  }
}

function prazoDoSalt(salt) {
  const consulta = salt.split("?")[1];
  if (!consulta) return null;
  const expira = Number(new URLSearchParams(consulta).get("expires"));
  return Number.isInteger(expira) ? expira : null;
}
