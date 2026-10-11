import CANVAS_CONFIG from "../../config/canvasConfig";

// Regras do painel (situação de cada tarefa, nomes curtos dos cursos) e
// formatação de datas no fuso de CANVAS_CONFIG.TIMEZONE.

const { TIMEZONE, LOCALE, COURSE_LABELS, COURSE_COLORS } = CANVAS_CONFIG;

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/* =====================================================================
   Datas
   ===================================================================== */

const fmt = (options) => new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, ...options });
const weekdayFmt = fmt({ weekday: "short" });
const dayMonthFmt = fmt({ day: "2-digit", month: "2-digit" });
const monthFmt = fmt({ month: "short" });
const dayFmt = fmt({ day: "numeric" });
const timeFmt = fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const longFmt = fmt({ weekday: "long", day: "numeric", month: "long" });
const isoDayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE });

export const toMs = (iso) => (iso ? Date.parse(iso) : null);
export const formatTime = (ms) => timeFmt.format(ms);
export const formatLongDate = (ms) => longFmt.format(ms);
export const formatDayMonth = (ms) => dayMonthFmt.format(ms);
export const formatWeekday = (ms) => weekdayFmt.format(ms).replace(".", "");
export const formatMonth = (ms) => monthFmt.format(ms).replace(".", "");
export const formatDayNumber = (ms) => dayFmt.format(ms);

// "2026-10-11" no fuso configurado (para agrupar por dia)
export const dayKey = (ms) => isoDayFmt.format(ms);

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

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// "faltam 3 dias", "faltam 5 h e 12 min", "venceu há 2 dias"
export function formatCountdown(ms, now = Date.now()) {
  const diff = ms - now;
  const { days, hours, minutes } = timeParts(Math.abs(diff));
  let text;
  if (days >= 3 || (days >= 1 && hours === 0)) text = plural(days, "dia", "dias");
  else if (days >= 1) text = `${plural(days, "dia", "dias")} e ${hours} h`;
  else if (hours >= 1) text = `${hours} h e ${minutes} min`;
  else text = `${Math.max(1, minutes)} min`;
  return diff >= 0 ? `faltam ${text}` : `venceu há ${text}`;
}

export const formatNumber = (value) => new Intl.NumberFormat(LOCALE).format(value ?? 0);
export const formatPercent = (value) =>
  new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 0 }).format(value ?? 0);

/* =====================================================================
   Cursos: nome curto e cor
   ===================================================================== */

const STOPWORDS = new Set(["de", "da", "do", "das", "dos", "e", "em", "para", "a", "o", "com", "no", "na", "à"]);

// "Desenvolvimento e Integração de Aplicações Web" → "DIAW"
function initials(text) {
  const words = text
    .replace(/[()[\]:]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()) && !/^\d+$/.test(w));
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

// O Canvas da PUC chama o curso de "Disciplina - Curso - Campus - ... - Turno - 2026/2":
// cada pedaço entre " - " ajuda a diferenciar duas turmas da mesma disciplina
const segments = (name) => name.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);

export function decorateCourses(courses) {
  const base = courses.map((course) => ({
    ...course,
    title: segments(course.name)[0] ?? course.name,
    label: COURSE_LABELS[course.id] ?? initials(segments(course.name)[0] ?? course.name),
  }));

  // Mesmo nome curto em dois cursos: junta o primeiro pedaço do nome que muda
  const groups = Object.groupBy
    ? Object.groupBy(base, (c) => c.label)
    : base.reduce((acc, c) => ((acc[c.label] ??= []).push(c), acc), {});

  for (const group of Object.values(groups)) {
    if (group.length < 2 || group.some((c) => COURSE_LABELS[c.id])) continue;
    const parts = group.map((c) => segments(c.name));
    const index = parts[0].findIndex((_, i) => new Set(parts.map((p) => p[i])).size > 1);
    group.forEach((course, n) => {
      const extra = index > 0 ? parts[n][index] : null;
      if (extra && extra.length <= 14) course.label = `${course.label} · ${extra}`;
    });
    // Ainda repetido (ex.: duas turmas da manhã): numera
    const total = {};
    group.forEach((c) => (total[c.label] = (total[c.label] ?? 0) + 1));
    const seen = {};
    group.forEach((c) => {
      if (total[c.label] < 2) return;
      seen[c.label] = (seen[c.label] ?? 0) + 1;
      c.label = `${c.label} ${seen[c.label]}`;
    });
  }

  return base.map((course, i) => ({ ...course, color: COURSE_COLORS[i % COURSE_COLORS.length] }));
}

/* =====================================================================
   Situação de uma tarefa
   ===================================================================== */

const NO_ONLINE = ["none", "on_paper", "not_graded", "external_tool"];
export const isOnline = (assignment) => !assignment.types.every((t) => NO_ONLINE.includes(t));

// Aluno: { key, label } da sua entrega
export function studentStatus(assignment, now = Date.now()) {
  const s = assignment.submission;
  const due = toMs(assignment.dueAt);
  if (!s) return null;
  if (s.excused) return { key: "excused", label: "Dispensado" };
  if (s.state === "graded" && s.score !== null) {
    const pts = assignment.points ? `${formatNumber(s.score)}/${formatNumber(assignment.points)}` : formatNumber(s.score);
    return { key: "graded", label: `Corrigida · ${pts}` };
  }
  if (s.submitted) return s.late ? { key: "late", label: "Entregue com atraso" } : { key: "done", label: "Entregue" };
  if (!isOnline(assignment)) return { key: "offline", label: "Sem entrega online" };
  if (s.missing || (due && due < now)) return { key: "missing", label: "Atrasada" };
  return { key: "pending", label: "Pendente" };
}

// Professor: contagem de entregas (vem do submission_summary)
export function teacherSummary(assignment) {
  const s = assignment.summary;
  if (!s) return null;
  const total = s.graded + s.ungraded + s.notSubmitted;
  const submitted = s.graded + s.ungraded;
  return { ...s, total, submitted, rate: total ? submitted / total : 0 };
}

// Separa as tarefas em: pela frente, vencidas (recentes) e sem prazo
export function splitAssignments(assignments, now = Date.now()) {
  const overdueLimit = now - CANVAS_CONFIG.OVERDUE_DAYS * DAY;
  const upcoming = [];
  const overdue = [];
  const noDate = [];
  for (const a of assignments) {
    const due = toMs(a.dueAt);
    if (due === null) noDate.push(a);
    else if (due >= now) upcoming.push(a);
    else if (due >= overdueLimit) overdue.push(a);
  }
  upcoming.sort((a, b) => toMs(a.dueAt) - toMs(b.dueAt));
  overdue.sort((a, b) => toMs(b.dueAt) - toMs(a.dueAt));
  return { upcoming, overdue, noDate };
}
