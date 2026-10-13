// Regra de negócio do gerador de legendas (sem React)
export { extractAudioChunks, loadFFmpeg } from "./audio";
export { normalizeCues, readingSpeed, splitLongCue, wrapText } from "./cues";
export {
  AudioExtractionError,
  OperationCancelledError,
  PartialResultError,
  SubtitlesApiError,
} from "./exceptions";
export { generateSubtitles, languageName } from "./service";
export { buildSrt, downloadSrt, formatClock, formatTimestamp, srtFilename } from "./srt";
