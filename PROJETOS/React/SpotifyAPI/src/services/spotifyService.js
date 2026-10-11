import SPOTIFY_CONFIG from "../config/spotifyConfig";

// Erro com o código que o servidor mandou (ver api/_spotify.js):
//   missing_config | invalid_refresh_token | invalid_client | forbidden | rate_limit ...
export class SpotifyError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function getJson(params) {
  let response;
  try {
    response = await fetch(`${SPOTIFY_CONFIG.API_PATH}?${new URLSearchParams(params)}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new SpotifyError("network", "Sem conexão com o servidor.");
  }

  // Sem a função (ex.: site estático sem /api), a rota devolve o index.html
  const isJson = response.headers.get("content-type")?.includes("application/json");
  if (!isJson) {
    throw new SpotifyError(
      "no_api",
      "A rota /api/spotify não existe aqui. Rode com npm run dev ou publique na Vercel."
    );
  }

  const body = await response.json();
  if (!response.ok) throw new SpotifyError(body.error ?? "error", body.message ?? `HTTP ${response.status}`);
  return body;
}

// Guarda cada período já buscado: trocar 4 semanas → 6 meses → 4 semanas não repete a chamada
const statsCache = new Map();

export function fetchSpotifyStats(range = SPOTIFY_CONFIG.DEFAULT_RANGE) {
  if (!statsCache.has(range)) {
    statsCache.set(
      range,
      getJson({ resource: "stats", range }).catch((error) => {
        statsCache.delete(range);
        throw error;
      })
    );
  }
  return statsCache.get(range);
}

// "Tocando agora": sem cache no navegador (o componente pergunta de tempos em tempos)
export const fetchNowPlaying = () => getJson({ resource: "now" });
