// cnpj.js
// Máscara e dígitos verificadores do CNPJ, inclusive o CNPJ alfanumérico
// (a Receita Federal emite CNPJ com letras nas 12 primeiras posições desde julho de 2026).

export const CNPJ_LENGTH = 14;

/** Letras e números, em maiúsculas: "12.abc.345/01de-35" → "12ABC34501DE35". */
export const cleanCnpj = (value = "") =>
  String(value).toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, CNPJ_LENGTH);

/** Máscara enquanto digita: 00.000.000/0000-00 */
export function maskCnpj(value) {
  const c = cleanCnpj(value);
  let out = c.slice(0, 2);
  if (c.length > 2) out += `.${c.slice(2, 5)}`;
  if (c.length > 5) out += `.${c.slice(5, 8)}`;
  if (c.length > 8) out += `/${c.slice(8, 12)}`;
  if (c.length > 12) out += `-${c.slice(12, 14)}`;
  return out;
}

export const isAlphanumericCnpj = (value) => /[A-Z]/.test(cleanCnpj(value));

// Cada caractere vale "código ASCII − 48": "0".."9" valem 0..9, "A" vale 17...
const charValue = (char) => char.charCodeAt(0) - 48;

function checkDigit(base) {
  // Pesos 2, 3, ..., 9, 2, 3... da direita para a esquerda (módulo 11)
  let sum = 0;
  let weight = 2;
  for (let i = base.length - 1; i >= 0; i--) {
    sum += charValue(base[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/**
 * Confere o CNPJ.
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateCnpj(value) {
  const c = cleanCnpj(value);

  if (c.length < CNPJ_LENGTH) return { valid: false, reason: "incomplete" };
  if (!/^[0-9A-Z]{12}\d{2}$/.test(c)) {
    return { valid: false, reason: "Os dois últimos caracteres (dígitos verificadores) são sempre números." };
  }
  if (/^(\d)\1{13}$/.test(c)) {
    return { valid: false, reason: "CNPJ com todos os dígitos iguais não existe." };
  }

  const first = checkDigit(c.slice(0, 12));
  const second = checkDigit(c.slice(0, 12) + first);
  if (`${first}${second}` !== c.slice(12)) {
    return {
      valid: false,
      reason: `Dígitos verificadores não conferem: o certo seria ${first}${second}.`,
    };
  }
  return { valid: true };
}
