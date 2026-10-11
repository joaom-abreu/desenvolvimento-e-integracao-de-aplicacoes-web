import ESPN_CONFIG from "../../config/espnConfig";

// Datas, horas e contagem regressiva no fuso de ESPN_CONFIG.TIMEZONE (pt-BR)

const { TIMEZONE, LOCALE } = ESPN_CONFIG;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const formatter = (options) => new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, ...options });

const weekdayFmt = formatter({ weekday: "short" });
const dayMonthFmt = formatter({ day: "2-digit", month: "2-digit" });
const timeFmt = formatter({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const longFmt = formatter({ weekday: "long", day: "numeric", month: "long" });
const isoDayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }); // 2026-10-11

export const formatTime = (ms) => timeFmt.format(ms);
export const formatLongDate = (ms) => longFmt.format(ms);
export const formatWeekday = (ms) => weekdayFmt.format(ms).replace(".", "");
export const formatDayMonth = (ms) => dayMonthFmt.format(ms);

// Quantos dias do calendário (no fuso configurado) separam hoje do jogo
export function daysUntil(ms, now = Date.now()) {
  const utc = (value) => {
    const [y, m, d] = isoDayFmt.format(value).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(ms) - utc(now)) / DAY);
}

// "hoje", "amanhã", "ontem" ou "qua · 14/10"
export function formatDay(ms, now = Date.now()) {
  const days = daysUntil(ms, now);
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days === -1) return "ontem";
  return `${formatWeekday(ms)} · ${formatDayMonth(ms)}`;
}

export const timeParts = (ms) => ({
  days: Math.floor(ms / DAY),
  hours: Math.floor((ms % DAY) / HOUR),
  minutes: Math.floor((ms % HOUR) / MINUTE),
  seconds: Math.floor((ms % MINUTE) / 1000),
});

// "em 5 dias", "em 1 dia e 4 h", "em 3 h e 12 min", "em 12 min"
export function formatUntil(game, now = Date.now()) {
  if (game.state === "in") return "ao vivo";
  const ms = game.date - now;
  if (ms <= 0) return "começando";
  if (!game.timeValid) {
    const days = daysUntil(game.date, now);
    if (days === 0) return "hoje, horário a definir";
    return `em ${days} ${days === 1 ? "dia" : "dias"}`;
  }
  const { days, hours, minutes } = timeParts(ms);
  if (days >= 7 || (days >= 1 && hours === 0)) return `em ${days} ${days === 1 ? "dia" : "dias"}`;
  if (days >= 1) return `em ${days} ${days === 1 ? "dia" : "dias"} e ${hours} h`;
  if (hours >= 1) return `em ${hours} h e ${minutes} min`;
  return `em ${Math.max(1, minutes)} min`;
}

export const formatNumber = (value) => new Intl.NumberFormat(LOCALE).format(value ?? 0);

export const formatPercent = (value) =>
  new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 1 }).format(value ?? 0);

// +5 / 0 / -3
export const formatSigned = (value) => (value > 0 ? `+${value}` : String(value ?? 0));
