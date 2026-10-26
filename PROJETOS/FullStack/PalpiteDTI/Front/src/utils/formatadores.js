// Formatação em pt-BR, num lugar só.

const numero1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export const formatarNumero = (valor) => (valor === null || valor === undefined ? "–" : numero1.format(valor));

export const formatarPercentual = (valor) => (valor === null || valor === undefined ? "–" : `${numero1.format(valor)}%`);

/** 0 -> "0 s", 65 -> "1 min 05 s", 3600 -> "60 min 00 s" */
export function formatarDuracao(segundos) {
  if (segundos === null || segundos === undefined) return "–";
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

/** 1 -> "1 tentativa", 3 -> "3 tentativas" */
export const plural = (quantidade, singular, pluralTexto = `${singular}s`) =>
  `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;

const dataHora = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const formatarDataHora = (iso) => (iso ? dataHora.format(new Date(iso)) : "–");
