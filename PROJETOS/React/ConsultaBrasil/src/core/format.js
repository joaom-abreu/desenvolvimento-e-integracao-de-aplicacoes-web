// format.js
// Formatação em pt-BR (datas, dinheiro, telefone).

import { onlyDigits } from "./text";

const LOCALE = "pt-BR";

/** "2026-11-02" vira Date ao meio-dia local (evita o bug do fuso: 01/11 às 21h). */
export const parseIsoDate = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

export const formatDate = (iso) =>
  iso ? parseIsoDate(iso).toLocaleDateString(LOCALE) : "";

export const formatLongDate = (iso) =>
  parseIsoDate(iso).toLocaleDateString(LOCALE, { day: "numeric", month: "long" });

export const weekdayName = (date) => date.toLocaleDateString(LOCALE, { weekday: "long" });

export const monthName = (monthIndex) =>
  new Date(2000, monthIndex, 1).toLocaleDateString(LOCALE, { month: "long" });

export const formatMoney = (value) =>
  Number(value).toLocaleString(LOCALE, { style: "currency", currency: "BRL" });

export const formatNumber = (value) => Number(value).toLocaleString(LOCALE);

/** "3133195000" → "(31) 3319-5000"; "31999998888" → "(31) 99999-8888" */
export function formatPhone(value) {
  const d = onlyDigits(value);
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return value || "";
}

/** "1 dia", "5 dias" */
export const plural = (n, one, many) => `${formatNumber(n)} ${n === 1 ? one : many}`;
