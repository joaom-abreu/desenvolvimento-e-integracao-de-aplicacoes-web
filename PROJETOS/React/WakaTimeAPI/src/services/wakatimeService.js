import WAKATIME_CONFIG from "../config/wakatimeConfig";

// Erro com o código que o servidor mandou (ver api/_wakatime.js):
//   missing_config | invalid_key | forbidden | not_found | pending | timeout ...
export class WakaTimeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Guarda cada período já buscado: trocar 7 dias → 30 dias → 7 dias não repete a chamada
const cache = new Map();

export async function fetchWakaTimeStats(range = WAKATIME_CONFIG.DEFAULT_RANGE) {
  if (cache.has(range)) return cache.get(range);

  let response;
  try {
    response = await fetch(`${WAKATIME_CONFIG.API_PATH}?range=${range}`);
  } catch {
    throw new WakaTimeError("network", "Sem conexão com o servidor.");
  }

  // Sem a função (ex.: site estático sem /api), a rota devolve o index.html
  const isJson = response.headers.get("content-type")?.includes("application/json");
  if (!isJson) {
    throw new WakaTimeError(
      "no_api",
      "A rota /api/wakatime não existe aqui. Rode com npm run dev ou publique na Vercel."
    );
  }

  const body = await response.json();

  if (response.status === 202 || body.error === "pending") {
    throw new WakaTimeError("pending", body.message);
  }
  if (!response.ok) {
    throw new WakaTimeError(body.error ?? "error", body.message ?? `HTTP ${response.status}`);
  }

  cache.set(range, body);
  return body;
}
