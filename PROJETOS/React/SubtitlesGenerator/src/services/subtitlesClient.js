import SUBTITLES_CONFIG from "../config/subtitlesConfig";
import { SubtitlesApiError } from "../core/exceptions";

// Conversa com a rota /api/subtitles do próprio site (ver api/_subtitles.js).
// A chave do Gemini fica no servidor; daqui só sai o áudio de cada trecho.

async function request(options, signal) {
  let response;
  try {
    response = await fetch(SUBTITLES_CONFIG.API_PATH, { ...options, signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new SubtitlesApiError("network", "Sem conexão com o servidor.");
  }

  const type = response.headers.get("content-type") ?? "";

  // Sem a função (ex.: site estático sem /api), a rota devolve o index.html
  if (type.includes("text/html")) {
    throw new SubtitlesApiError(
      "no_api",
      "A rota /api/subtitles não existe aqui. Rode com npm run dev ou publique na Vercel."
    );
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const retryAfter = Number(response.headers.get("Retry-After")) || null;
    throw new SubtitlesApiError(body.error ?? "error", body.message ?? `HTTP ${response.status}`, retryAfter);
  }
  return body;
}

/** O servidor tem GEMINI_API_KEY? → { hasKey, model } */
export function fetchStatus(signal) {
  return request({ method: "GET" }, signal);
}

/**
 * Manda um trecho de áudio e recebe as legendas dele (tempos relativos ao trecho).
 * → { language, segments: [{ start, end, text }] }
 */
export function transcribeChunk({ audio, duration, language, context, sounds }, signal) {
  return request(
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audio,
        mimeType: SUBTITLES_CONFIG.AUDIO_MIME_TYPE,
        duration,
        language,
        context,
        sounds,
      }),
    },
    signal
  );
}
