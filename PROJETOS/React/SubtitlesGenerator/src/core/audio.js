// Extrai o áudio do vídeo NO NAVEGADOR, com o ffmpeg.wasm (o FFmpeg compilado
// para WebAssembly), e o divide em trechos de poucos minutos.
//
//   vídeo (mp4, avi, mkv, mov...) ──ffmpeg.wasm──▶ chunk_000.mp3, chunk_001.mp3, ...
//                                                  mono · 16 kHz · 32 kbps
//
// O vídeo não é enviado a lugar nenhum: só os trechos de áudio (bem menores)
// vão para a rota /api/subtitles.
//
// O arquivo é "montado" com o WORKERFS: o ffmpeg lê direto do disco, sem
// copiar o vídeo inteiro para a memória (funciona com vídeos de vários GB).

import { FFmpeg } from "@ffmpeg/ffmpeg";
// O Vite copia o núcleo do ffmpeg.wasm (~31 MB) para o build e devolve a URL
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";
import { AudioExtractionError, OperationCancelledError } from "./exceptions";

const INPUT_DIR = "/input";
const SEGMENT_LIST = "chunks.csv";

let instance = null; // um ffmpeg só para a página toda (carregar é a parte demorada)
let loading = null;

/** Carrega o ffmpeg.wasm uma vez (na primeira legenda gerada). */
export async function loadFFmpeg() {
  if (instance?.loaded) return instance;
  if (!loading) {
    const ffmpeg = new FFmpeg();
    loading = ffmpeg
      .load({ coreURL, wasmURL })
      .then(() => {
        instance = ffmpeg;
        return ffmpeg;
      })
      .finally(() => {
        loading = null;
      });
  }
  return loading;
}

/** Cancelar = encerrar o worker do ffmpeg (a próxima execução carrega de novo). */
function terminate() {
  instance?.terminate();
  instance = null;
}

// "00:01:23.45" -> 83.45
const toSeconds = (h, m, s) => Number(h) * 3600 + Number(m) * 60 + Number(s);

async function blobToBase64(blob) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return String(dataUrl).split(",")[1] ?? "";
}

/**
 * Extrai o áudio de `file` em trechos de `chunkSeconds`.
 *
 * Devolve { duration, chunks: [{ index, start, end, base64, size }] }
 * onProgress({ ratio, seconds, duration }) acompanha a extração.
 */
export async function extractAudioChunks(
  file,
  { chunkSeconds = 180, sampleRate = 16000, bitrate = "32k", onProgress, signal } = {}
) {
  if (signal?.aborted) throw new OperationCancelledError();
  const ffmpeg = await loadFFmpeg();
  if (signal?.aborted) throw new OperationCancelledError();

  let duration = 0;
  const logLines = [];
  const onLog = ({ message }) => {
    logLines.push(message);
    if (logLines.length > 60) logLines.shift();

    const total = message.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (total) duration = toSeconds(total[1], total[2], total[3]);

    const time = message.match(/time=\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (time && duration) {
      const seconds = toSeconds(time[1], time[2], time[3]);
      onProgress?.({ ratio: Math.min(seconds / duration, 1), seconds, duration });
    }
  };

  const onAbort = () => terminate();
  signal?.addEventListener("abort", onAbort, { once: true });
  ffmpeg.on("log", onLog);

  let mounted = false;
  try {
    await ffmpeg.createDir(INPUT_DIR).catch(() => {});
    await ffmpeg.mount("WORKERFS", { files: [file] }, INPUT_DIR);
    mounted = true;

    const exitCode = await ffmpeg.exec([
      "-hide_banner",
      "-i", `${INPUT_DIR}/${file.name}`,
      "-map", "0:a:0", // primeira faixa de áudio
      "-vn",
      "-ac", "1",
      "-ar", String(sampleRate),
      "-c:a", "libmp3lame",
      "-b:a", bitrate,
      "-f", "segment",
      "-segment_time", String(chunkSeconds),
      "-reset_timestamps", "1",
      "-segment_list", SEGMENT_LIST,
      "-segment_list_type", "csv",
      "chunk_%03d.mp3",
    ]);

    if (exitCode !== 0) {
      const log = logLines.join("\n");
      if (/matches no streams|does not contain any stream/i.test(log)) {
        throw new AudioExtractionError("O arquivo não tem faixa de áudio: não há o que legendar.");
      }
      if (/Invalid data found|could not find codec|Unknown format/i.test(log)) {
        throw new AudioExtractionError("O ffmpeg não reconheceu o arquivo como vídeo ou áudio.");
      }
      throw new AudioExtractionError(`O ffmpeg terminou com erro (código ${exitCode}).`);
    }

    // chunks.csv: "chunk_000.mp3,0.000000,180.000000"
    const list = new TextDecoder().decode(await ffmpeg.readFile(SEGMENT_LIST));
    const rows = list
      .split(/\r?\n/)
      .map((line) => line.split(","))
      .filter((cols) => cols.length >= 3 && cols[0]);

    const chunks = [];
    for (const [index, [name, start, end]] of rows.entries()) {
      const data = await ffmpeg.readFile(name);
      const blob = new Blob([data], { type: "audio/mpeg" });
      chunks.push({
        index,
        start: Number(start),
        end: Number(end),
        size: blob.size,
        base64: await blobToBase64(blob),
      });
      await ffmpeg.deleteFile(name).catch(() => {});
    }
    await ffmpeg.deleteFile(SEGMENT_LIST).catch(() => {});

    if (!chunks.length) {
      throw new AudioExtractionError("Nenhum áudio foi extraído do arquivo.");
    }
    if (!duration) duration = chunks.at(-1).end;
    onProgress?.({ ratio: 1, seconds: duration, duration });
    return { duration, chunks };
  } catch (error) {
    if (signal?.aborted) throw new OperationCancelledError();
    if (error instanceof AudioExtractionError) throw error;
    throw new AudioExtractionError(`Falha ao ler o arquivo: ${error?.message ?? error}`);
  } finally {
    signal?.removeEventListener("abort", onAbort);
    if (instance === ffmpeg) {
      ffmpeg.off("log", onLog);
      if (mounted) await ffmpeg.unmount(INPUT_DIR).catch(() => {});
    }
  }
}
