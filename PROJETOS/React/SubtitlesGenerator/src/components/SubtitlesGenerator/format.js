// Formatação compartilhada pelos componentes (pt-BR)

/** 12.345 -> "12,3" */
export const formatDecimal = (value = 0, digits = 1) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

/** 1234 -> "1.234" */
export const formatInt = (value = 0) => new Intl.NumberFormat("pt-BR").format(value);

/** 52428800 -> "50,0 MB" */
export function formatBytes(bytes = 0) {
  if (bytes < 1024 * 1024) return `${formatDecimal(bytes / 1024, 0)} KB`;
  if (bytes < 1024 ** 3) return `${formatDecimal(bytes / 1024 ** 2)} MB`;
  return `${formatDecimal(bytes / 1024 ** 3, 2)} GB`;
}

/** 95 -> "1 min 35 s" */
export function formatDuration(seconds = 0) {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h} h ${m} min`;
  if (m) return s ? `${m} min ${s} s` : `${m} min`;
  return `${s} s`;
}

export const formatTime = (date = new Date()) => date.toLocaleTimeString("pt-BR");

/** "Aula 01.mp4" -> "MP4" */
export const fileExtension = (name = "") => (name.match(/\.([^.]+)$/)?.[1] ?? "").toUpperCase();
