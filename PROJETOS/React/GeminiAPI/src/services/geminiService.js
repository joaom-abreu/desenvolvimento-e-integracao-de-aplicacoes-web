import GEMINI_CONFIG from "../config/geminiConfig";

// Erro com o código que o servidor mandou (ver api/_gemini.js):
//   missing_key | invalid_key | rate_limited | quota | too_long | timeout ...
export class GeminiError extends Error {
  constructor(code, message, retryAfter = null) {
    super(message);
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

/**
 * Manda a pergunta para /api/gemini e lê a resposta em streaming.
 * onChunk(textoAteAgora) é chamado a cada pedaço que chega.
 *
 * history: [{ role: "user" | "model", text }]
 */
export async function askGemini(message, { history = [], signal, onChunk } = {}) {
  let response;
  try {
    response = await fetch(GEMINI_CONFIG.API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(-GEMINI_CONFIG.MAX_HISTORY) }),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new GeminiError("network", "Sem conexão com o servidor.");
  }

  const type = response.headers.get("content-type") ?? "";

  // Sem a função (ex.: site estático sem /api), a rota devolve o index.html
  if (type.includes("text/html")) {
    throw new GeminiError(
      "no_api",
      "A rota /api/gemini não existe aqui. Rode com npm run dev ou publique na Vercel."
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const retryAfter = Number(response.headers.get("Retry-After")) || null;
    throw new GeminiError(body.error ?? "error", body.message ?? `HTTP ${response.status}`, retryAfter);
  }

  // Lê o corpo aos pedaços: o texto vai aparecendo enquanto o Gemini escreve
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk?.(text);
  }
  text = (text + decoder.decode()).trim();
  if (!text) throw new GeminiError("empty", "O Gemini não devolveu nenhum texto.");
  onChunk?.(text);
  return text;
}
