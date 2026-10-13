// Erros do gerador de legendas (a página mostra cada um de um jeito)

/** O usuário clicou em Cancelar (ou apertou Esc). */
export class OperationCancelledError extends Error {
  constructor(message = "Operação cancelada.") {
    super(message);
    this.name = "OperationCancelledError";
  }
}

/** O ffmpeg.wasm não conseguiu ler o vídeo ou extrair o áudio. */
export class AudioExtractionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AudioExtractionError";
  }
}

/**
 * Erro devolvido pela rota /api/subtitles (ver api/_subtitles.js):
 *   missing_key | invalid_key | rate_limited | quota | too_large | timeout |
 *   upstream_busy | model_not_found | bad_response | empty | network | no_api ...
 * retryAfter: segundos sugeridos pelo servidor antes de tentar de novo.
 */
export class SubtitlesApiError extends Error {
  constructor(code, message, retryAfter = null) {
    super(message);
    this.name = "SubtitlesApiError";
    this.code = code;
    this.retryAfter = retryAfter;
  }

  /** Vale a pena tentar de novo? (cota, instabilidade, tempo esgotado) */
  get retryable() {
    return ["rate_limited", "quota", "upstream_busy", "timeout", "network"].includes(this.code);
  }
}

/** Um trecho falhou: guarda as legendas que já estavam prontas. */
export class PartialResultError extends Error {
  constructor(cause, partial) {
    super(cause.message);
    this.name = "PartialResultError";
    this.cause = cause;
    this.partial = partial;
  }
}
