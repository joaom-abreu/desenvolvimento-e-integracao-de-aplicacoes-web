// Formatação usada pelo <SpotifyDashboard /> (pt-BR)

// 215000 → "3:35"
export function formatDuration(ms = 0) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Quanto tempo atrás: "agora há pouco" | "há 3 min" | "há 2 h" | "ontem" | "há 4 dias"
export function formatAgo(iso, now = Date.now()) {
  if (!iso) return "";
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "agora há pouco";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

// [{ name: "Milton Nascimento" }, { name: "Lô Borges" }] → "Milton Nascimento, Lô Borges"
export const artistNames = (track) => (track?.artists ?? []).map((a) => a.name).join(", ");
