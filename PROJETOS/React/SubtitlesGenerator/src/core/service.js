// Fluxo completo: vídeo → áudio em trechos → Gemini → legendas pt-BR prontas.
//
// Roda no navegador com async/await (a página não trava) e pode ser cancelado
// a qualquer momento com um AbortController.

import CONFIG from "../config/subtitlesConfig";
import { transcribeChunk } from "../services/subtitlesClient";
import { extractAudioChunks } from "./audio";
import { normalizeCues } from "./cues";
import { OperationCancelledError, PartialResultError, SubtitlesApiError } from "./exceptions";
import { formatClock } from "./srt";

// Fatias da barra de progresso: extração do áudio e envio dos trechos
const EXTRACT_SHARE = 20;
const TOTAL = 100;

/** Nome do idioma a partir do código ("en" -> "Inglês") */
export function languageName(code) {
  if (!code) return "Não identificado";
  const found = CONFIG.LANGUAGES.find((l) => l.value === code);
  return found ? found.label : code.toUpperCase();
}

/** Espera `seconds` segundos, mas acorda na hora se o usuário cancelar */
function sleep(seconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, seconds * 1000);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new OperationCancelledError());
      },
      { once: true }
    );
  });
}

/** Idioma que mais apareceu nos trechos */
function mostCommon(values) {
  const counts = new Map();
  values.filter(Boolean).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

const formatSize = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

/**
 * file:    o vídeo (File) escolhido na página
 * options: { language, chunkSeconds, maxLine, sounds, onProgress, signal }
 *
 * onProgress({ message, level, current, total }) alimenta o log e a barra.
 *
 * Devolve: { fileName, duration, chunkCount, language, translated, cues, elapsed }
 */
export async function generateSubtitles(
  file,
  { language = "auto", chunkSeconds = 180, maxLine = 42, sounds = false, onProgress, signal } = {}
) {
  const started = performance.now();
  const report = (message, level = "info", current, total = TOTAL) =>
    onProgress?.({ message, level, current, total: current === undefined ? undefined : total });

  /* ---------- 1. Áudio ---------- */

  report("Carregando o ffmpeg.wasm (na primeira vez baixa ~31 MB)…");
  let lastStep = -1;
  const { duration, chunks } = await extractAudioChunks(file, {
    chunkSeconds,
    sampleRate: CONFIG.AUDIO_SAMPLE_RATE,
    bitrate: CONFIG.AUDIO_BITRATE,
    signal,
    onProgress: ({ ratio, seconds, duration: total }) => {
      // Uma linha de log a cada 25% (a barra anda sempre)
      const step = Math.floor(ratio * 4);
      const message = `Extraindo o áudio: ${formatClock(seconds)} de ${formatClock(total)}`;
      if (step !== lastStep) {
        lastStep = step;
        report(message, "info", Math.round(ratio * EXTRACT_SHARE));
      } else {
        onProgress?.({ message, silent: true, current: Math.round(ratio * EXTRACT_SHARE), total: TOTAL });
      }
    },
  });

  const audioSize = chunks.reduce((sum, c) => sum + c.size, 0);
  report(
    `Áudio extraído: ${formatClock(duration)} em ${chunks.length} trecho(s) · ${formatSize(audioSize)} no total.`,
    "success",
    EXTRACT_SHARE
  );

  /* ---------- 2. Gemini, trecho por trecho ---------- */

  const segments = [];
  const languages = [];
  let context = [];
  let hint = language;

  const buildResult = (done) => {
    const detected = language === "auto" ? mostCommon(languages) : language;
    return {
      fileName: file.name,
      fileSize: file.size,
      duration,
      chunkCount: chunks.length,
      chunksDone: done,
      language: detected,
      translated: Boolean(detected && detected !== "pt"),
      cues: normalizeCues(segments, {
        maxLine,
        maxLines: CONFIG.MAX_LINES,
        minDuration: CONFIG.MIN_DURATION,
        maxDuration: CONFIG.MAX_DURATION,
        minGap: CONFIG.MIN_GAP,
        duration,
      }),
      elapsed: (performance.now() - started) / 1000,
    };
  };

  for (const chunk of chunks) {
    const label = `Trecho ${chunk.index + 1}/${chunks.length} (${formatClock(chunk.start)}–${formatClock(chunk.end)})`;
    const chunkDuration = Math.max(chunk.end - chunk.start, 0.1);
    report(`${label}: enviando ${formatSize(chunk.size)} ao Gemini…`);

    let answer = null;
    for (let attempt = 0; !answer; attempt += 1) {
      if (signal?.aborted) throw new OperationCancelledError();
      try {
        answer = await transcribeChunk(
          { audio: chunk.base64, duration: chunkDuration, language: hint, context, sounds },
          signal
        );
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") throw new OperationCancelledError();
        const retryable = error instanceof SubtitlesApiError && error.retryable;
        if (!retryable || attempt >= CONFIG.MAX_RETRIES) {
          // Guarda o que já ficou pronto antes de desistir
          if (segments.length) throw new PartialResultError(error, buildResult(chunk.index));
          throw error;
        }
        const wait = error.retryAfter ?? CONFIG.DEFAULT_RETRY_SECONDS;
        report(`${label}: ${error.message} Nova tentativa em ${wait} s…`, "warning");
        await sleep(wait, signal);
      }
    }

    // Tempos do Gemini são relativos ao trecho: soma o início dele
    const absolute = answer.segments.map((s) => ({
      start: chunk.start + Math.min(s.start, chunkDuration),
      end: chunk.start + Math.min(s.end, chunkDuration + 0.5),
      text: s.text,
    }));
    segments.push(...absolute);
    languages.push(answer.language);

    // Detectado no 1º trecho → vira dica para os próximos (tradução mais estável)
    if (hint === "auto" && answer.language) hint = answer.language;
    context = answer.segments.slice(-CONFIG.CONTEXT_CUES).map((s) => s.text);

    const current = EXTRACT_SHARE + Math.round(((chunk.index + 1) / chunks.length) * (TOTAL - EXTRACT_SHARE));
    report(
      `${label}: ${absolute.length} legenda(s) · áudio em ${languageName(answer.language).toLowerCase()}.`,
      absolute.length ? "info" : "warning",
      current
    );
  }

  return buildResult(chunks.length);
}
