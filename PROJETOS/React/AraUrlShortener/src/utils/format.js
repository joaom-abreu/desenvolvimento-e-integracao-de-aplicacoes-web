// format.js
// Formatação de datas e números em pt-BR.

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const numero = new Intl.NumberFormat("pt-BR");

/** 12/10/2026, 18:30 */
export function formatDateTime(data) {
  return dataHora.format(data);
}

/** "1 clique", "1.234 cliques" */
export function formatClicks(clicks) {
  return `${numero.format(clicks)} ${clicks === 1 ? "clique" : "cliques"}`;
}

/** Tira o protocolo para exibir: https://araurl.vercel.app/Ab3 -> araurl.vercel.app/Ab3 */
export function withoutProtocol(url) {
  return url.replace(/^https?:\/\//i, "");
}

/** Valor mínimo do <input type="datetime-local">: agora, no fuso do navegador. */
export function nowForDateTimeLocal() {
  const agora = new Date();
  agora.setSeconds(0, 0);
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
