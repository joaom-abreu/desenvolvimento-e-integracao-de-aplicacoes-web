// holidays.js
// A BrasilAPI devolve só { date, name, type }. Aqui a lista ganha o que
// interessa para quem vai planejar a vida: dia da semana, se cai no fim de
// semana, se dá feriadão e quantos dias faltam.

import { parseIsoDate } from "./format";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Tipo de "folga" que o feriado cria:
 *  - weekend:  cai no sábado ou domingo
 *  - long:     segunda ou sexta, feriadão de 3 dias sem precisar de nada
 *  - bridge:   terça ou quinta, dá para "enforcar" a segunda ou a sexta
 *  - midweek:  quarta-feira
 */
export function breakKind(date) {
  const day = date.getDay(); // 0 = domingo
  if (day === 0 || day === 6) return "weekend";
  if (day === 1 || day === 5) return "long";
  if (day === 2 || day === 4) return "bridge";
  return "midweek";
}

export const BREAK_LABELS = {
  weekend: "Cai no fim de semana",
  long: "Feriadão de 3 dias",
  bridge: "Dá para enforcar",
  midweek: "No meio da semana",
};

export const bridgeDay = (date) => (date.getDay() === 2 ? "a segunda" : "a sexta");

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const daysBetween = (from, to) =>
  Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);

/** Junta as informações extras em cada feriado. */
export function enrichHolidays(list, today = new Date()) {
  return list
    .map((holiday) => {
      const date = parseIsoDate(holiday.date);
      const daysUntil = daysBetween(today, date);
      return {
        ...holiday,
        dateObj: date,
        month: date.getMonth(),
        kind: breakKind(date),
        daysUntil,
        isPast: daysUntil < 0,
        isToday: daysUntil === 0,
      };
    })
    .sort((a, b) => a.dateObj - b.dateObj);
}

/** Números do ano para o resumo. */
export function summarize(holidays) {
  const onWeekdays = holidays.filter((h) => h.kind !== "weekend");
  return {
    total: holidays.length,
    onWeekdays: onWeekdays.length,
    longWeekends: holidays.filter((h) => h.kind === "long").length,
    bridges: holidays.filter((h) => h.kind === "bridge").length,
    businessDays: countBusinessDays(holidays[0]?.dateObj.getFullYear(), onWeekdays),
  };
}

/** Dias úteis do ano: segunda a sexta, menos os feriados nacionais em dia útil. */
function countBusinessDays(year, weekdayHolidays) {
  if (!year) return 0;
  let count = 0;
  for (let d = new Date(year, 0, 1, 12); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count - weekdayHolidays.length;
}

/** O próximo feriado a partir de hoje (inclusive), ou null. */
export const nextHoliday = (holidays) => holidays.find((h) => h.daysUntil >= 0) ?? null;

/**
 * Arquivo .ics (iCalendar) com os feriados, para importar no Google Agenda,
 * Outlook ou no app de calendário do celular.
 */
export function buildIcs(holidays, year) {
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const escape = (text) => String(text).replace(/[,;\\]/g, (c) => `\\${c}`);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const events = holidays.map((h) => {
    const next = new Date(h.dateObj);
    next.setDate(next.getDate() + 1);
    return [
      "BEGIN:VEVENT",
      `UID:feriado-${ymd(h.dateObj)}@consulta-brasil`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(h.dateObj)}`,
      `DTEND;VALUE=DATE:${ymd(next)}`,
      `SUMMARY:${escape(h.name)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PUC Minas//Consulta Brasil//PT",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:Feriados nacionais ${year}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
