// text.js
// O BR Code aceita só caracteres ASCII imprimíveis. Nome e cidade perdem os
// acentos ("São João" → "SAO JOAO"), como fazem os apps dos bancos.

/** Remove acentos e qualquer caractere fora do ASCII imprimível. */
export function toAscii(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Nome e cidade: sem acento, em maiúsculas e cortado no tamanho máximo. */
export function toMerchantText(text, max) {
  return toAscii(text).toUpperCase().slice(0, max).trim();
}

/** Identificador da transação: só letras e números, até 25 caracteres. */
export function toTxid(text, max) {
  return toAscii(text).replace(/[^A-Za-z0-9]/g, "").slice(0, max);
}

/** Só os dígitos de um texto. */
export function onlyDigits(text) {
  return String(text ?? "").replace(/\D/g, "");
}
