// keys.js
// Validação e formato oficial das chaves Pix, do jeito que elas vão no BR Code:
//
//   CPF        12345678909                (só dígitos)
//   CNPJ       12ABC34501DE35             (14 caracteres; letras desde jul/2026)
//   E-mail     fulano@exemplo.com.br      (minúsculas, até 77 caracteres)
//   Celular    +5531999999999             (+55 + DDD + número)
//   Aleatória  123e4567-e12b-12d1-a456-426655440000  (UUID, minúsculas)

import { PixValidationError } from "./exceptions";
import { onlyDigits } from "./text";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/* ---------------------------------------------------------------
   CPF: 9 dígitos + 2 dígitos verificadores (módulo 11)
   --------------------------------------------------------------- */

export function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (size) => {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

/* ---------------------------------------------------------------
   CNPJ: 12 caracteres + 2 dígitos verificadores (módulo 11).
   Desde julho de 2026 a Receita emite CNPJ alfanumérico: cada
   caractere vale (código ASCII − 48), então "0"–"9" continuam
   valendo 0–9 e "A" vale 17, "B" 18... O CNPJ só com números
   continua válido do mesmo jeito.
   --------------------------------------------------------------- */

export function normalizeCnpj(value) {
  return String(value ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function isValidCnpj(value) {
  const cnpj = normalizeCnpj(value);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;

  const digit = (size) => {
    let sum = 0;
    let weight = size - 7; // 5 para o 1º dígito, 6 para o 2º
    for (let i = 0; i < size; i++) {
      sum += (cnpj.charCodeAt(i) - 48) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return digit(12) === Number(cnpj[12]) && digit(13) === Number(cnpj[13]);
}

/* ---------------------------------------------------------------
   Formatação para mostrar na tela
   --------------------------------------------------------------- */

export function formatCpf(cpf) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function formatCnpj(cnpj) {
  return cnpj.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone) {
  return phone.replace(/^\+55(\d{2})(\d{5})(\d{4})$/, "+55 ($1) $2-$3");
}

/* ---------------------------------------------------------------
   normalizeKey: confere a chave e devolve no formato do BR Code
   --------------------------------------------------------------- */

/**
 * normalizeKey("phone", "(31) 99999-9999") → "+5531999999999"
 * @throws {PixValidationError} quando a chave não é válida para o tipo
 */
export function normalizeKey(type, raw) {
  const text = String(raw ?? "").trim();
  const fail = (message) => {
    throw new PixValidationError("key", message);
  };

  if (!text) fail("Informe a chave Pix.");

  switch (type) {
    case "cpf": {
      const cpf = onlyDigits(text);
      if (cpf.length !== 11) fail("O CPF tem 11 dígitos.");
      if (!isValidCpf(cpf)) fail("CPF inválido: confira os dígitos verificadores.");
      return cpf;
    }

    case "cnpj": {
      const cnpj = normalizeCnpj(text);
      if (cnpj.length !== 14) fail("O CNPJ tem 14 caracteres.");
      if (!isValidCnpj(cnpj)) fail("CNPJ inválido: confira os dígitos verificadores.");
      return cnpj;
    }

    case "email": {
      const email = text.toLowerCase();
      if (email.length > 77) fail("O e-mail pode ter no máximo 77 caracteres.");
      if (!EMAIL.test(email)) fail("E-mail inválido.");
      return email;
    }

    case "phone": {
      let digits = onlyDigits(text);
      if (digits.length === 13 && digits.startsWith("55")) digits = digits.slice(2);
      if (digits.length !== 11) fail("Use DDD + número com 9 dígitos, por exemplo (31) 99999-9999.");
      if (digits[2] !== "9") fail("A chave Pix de telefone é um celular: o número começa com 9.");
      if (Number(digits.slice(0, 2)) < 11) fail("DDD inválido.");
      return `+55${digits}`;
    }

    case "random": {
      const uuid = text.toLowerCase();
      if (!UUID.test(uuid)) fail("A chave aleatória tem 36 caracteres, no formato 8-4-4-4-12.");
      return uuid;
    }

    default:
      fail("Escolha o tipo da chave.");
  }
}

/**
 * Descobre o tipo de uma chave que já está no formato do BR Code
 * (usado no leitor de códigos).
 */
export function detectKeyType(key) {
  if (UUID.test(key)) return "random";
  if (/^\+55\d{10,11}$/.test(key)) return "phone";
  if (key.includes("@")) return "email";
  if (/^\d{11}$/.test(key) && isValidCpf(key)) return "cpf";
  if (/^[0-9A-Z]{12}\d{2}$/.test(key) && isValidCnpj(key)) return "cnpj";
  return "unknown";
}

/** Chave formatada para leitura humana. */
export function formatKey(type, key) {
  if (type === "cpf") return formatCpf(key);
  if (type === "cnpj") return formatCnpj(key);
  if (type === "phone") return formatPhone(key);
  return key;
}
