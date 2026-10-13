// Formatos de legenda: SRT (o arquivo baixado) e tempos legíveis

/** 83.5 -> "00:01:23,500" (SRT usa vírgula; WebVTT usa ponto) */
export function formatTimestamp(seconds, separator = ",") {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  const pad = (n, size = 2) => String(n).padStart(size, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}${separator}${pad(ms, 3)}`;
}

/** 83.5 -> "01:23" (ou "1:01:23" acima de uma hora): para a tela */
export function formatClock(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const s = String(total % 60).padStart(2, "0");
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${String(m).padStart(2, "0")}:${s}`;
}

/**
 * cues: [{ start, end, text }] (text pode ter "\n" entre as linhas)
 *
 *   1
 *   00:00:01,200 --> 00:00:03,900
 *   Olá, pessoal! Bem-vindos
 *   à primeira aula de React.
 */
export function buildSrt(cues) {
  return cues
    .map((cue, i) => {
      const text = cue.text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\r\n");
      return `${i + 1}\r\n${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}\r\n${text}\r\n`;
    })
    .join("\r\n");
}

/** "Aula 01.mp4" -> "Aula 01.pt-BR.srt" (mesmo nome do vídeo: o VLC carrega sozinho) */
export function srtFilename(videoName, suffix = ".pt-BR.srt") {
  const base = String(videoName || "legenda").replace(/\.[^./\\]+$/, "");
  return `${base}${suffix}`;
}

/** Baixa o .srt pelo navegador e devolve o nome do arquivo */
export function downloadSrt(cues, filename, { bom = true } = {}) {
  const content = (bom ? "\uFEFF" : "") + buildSrt(cues);
  const blob = new Blob([content], { type: "application/x-subrip;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}
