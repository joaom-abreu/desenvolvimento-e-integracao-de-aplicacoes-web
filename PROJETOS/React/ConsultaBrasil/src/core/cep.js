// cep.js
// Regras do CEP: 8 dígitos, mostrado como 00000-000.

import { onlyDigits } from "./text";

export const CEP_LENGTH = 8;

/** Máscara enquanto digita: "305359" → "30535-9". */
export function maskCep(value) {
  const digits = onlyDigits(value).slice(0, CEP_LENGTH);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export const isCompleteCep = (value) => onlyDigits(value).length === CEP_LENGTH;

/**
 * CEPs com todos os dígitos iguais (00000-000, 11111-111...) não existem.
 * Conferir isso antes economiza uma requisição.
 */
export function isPlausibleCep(value) {
  const digits = onlyDigits(value);
  return digits.length === CEP_LENGTH && !/^(\d)\1{7}$/.test(digits);
}

/**
 * CEP "geral" é o CEP de uma cidade inteira (cidades pequenas costumam
 * ter um só). O ViaCEP devolve a cidade, mas sem rua nem bairro.
 */
export const isCityWideCep = (address) => Boolean(address) && !address.street;
