// Formatação compartilhada pelos componentes (pt-BR)

/** 1234 -> "1.234"; com signed: +1.234 / -1.234 */
export function formatInt(value = 0, signed = false) {
  const text = new Intl.NumberFormat("pt-BR").format(Math.abs(value));
  if (value < 0) return `-${text}`;
  return signed ? `+${text}` : text;
}

/** 12.345 -> "12,3" */
export const formatDecimal = (value = 0, digits = 1) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const formatTime = (date = new Date()) => date.toLocaleTimeString("pt-BR");
