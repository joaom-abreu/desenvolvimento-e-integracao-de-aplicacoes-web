// Busca as estatísticas do WakaTime no SERVIDOR, para a chave não ir para o navegador.
//
// Quem chama esta função:
//   • em produção, a Vercel Function api/wakatime.js  → GET /api/wakatime
//   • no npm run dev / npm run preview, o vite.config.js (mesma rota)
//
// Variáveis de ambiente (sem o prefixo VITE_, de propósito: variáveis com
// VITE_ vão para o build e qualquer visitante consegue ler):
//   WAKATIME_API_KEY   → sua chave secreta (https://wakatime.com/settings/api-key)
//   WAKATIME_USERNAME  → opcional: seu usuário, para usar o perfil PÚBLICO sem chave
//
// O nome do arquivo começa com "_" para a Vercel NÃO transformá-lo em rota.

export const WAKATIME_PATH = "/api/wakatime";

const API = "https://wakatime.com/api/v1";
const TIMEOUT_MS = 10_000;

// Períodos aceitos pela API do WakaTime (o navegador só pode pedir um destes)
export const RANGES = [
  "last_7_days",
  "last_30_days",
  "last_6_months",
  "last_year",
  "all_time",
];

// Menos de 1 minuto não aparece na tela
const MIN_SECONDS = 60;

/* =====================================================================
   Resposta HTTP (funciona igual na Vercel e no servidor do Vite)
   ===================================================================== */

function send(res, status, body, cache = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

const sendError = (res, status, error, message) =>
  send(res, status, { error, message });

/* =====================================================================
   Chamada à API do WakaTime
   ===================================================================== */

async function callWakaTime(path, key) {
  const headers = { Accept: "application/json" };

  // A API aceita a chave em Basic Auth: base64 da própria chave
  if (key) headers.Authorization = `Basic ${Buffer.from(key).toString("base64")}`;

  return fetch(`${API}${path}`, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/* =====================================================================
   Normalização: devolve só o que a tela usa (resposta bem menor)
   ===================================================================== */

const toItems = (list = [], limit = 20) =>
  list
    .filter((item) => item.total_seconds >= MIN_SECONDS)
    .slice(0, limit)
    .map(({ name, total_seconds, percent }) => ({
      name,
      seconds: Math.round(total_seconds),
      percent,
    }));

function normalize(data, today, mode) {
  return {
    mode, // "api_key" ou "public"
    username: data.username ?? null,
    range: data.range,
    humanRange: data.human_readable_range ?? null,
    start: data.start ?? null,
    totalSeconds: Math.round(
      data.total_seconds_including_other_language ?? data.total_seconds ?? 0
    ),
    dailyAverage: Math.round(
      data.daily_average_including_other_language ?? data.daily_average ?? 0
    ),
    activeDays: data.days_minus_holidays ?? null,
    bestDay: data.best_day?.date
      ? { date: data.best_day.date, seconds: Math.round(data.best_day.total_seconds) }
      : null,
    languages: toItems(data.languages),
    editors: toItems(data.editors, 6),
    operatingSystems: toItems(data.operating_systems, 5),
    categories: toItems(data.categories, 6),
    projects: toItems(data.projects, 10),
    today,
  };
}

// "Hoje" só existe com a chave (endpoint privado status_bar/today)
async function fetchToday(key) {
  try {
    const response = await callWakaTime("/users/current/status_bar/today", key);
    if (!response.ok) return null;
    const { data } = await response.json();
    const seconds = data?.grand_total?.total_seconds;
    return typeof seconds === "number" ? { seconds: Math.round(seconds) } : null;
  } catch {
    return null;
  }
}

/* =====================================================================
   Handler: GET /api/wakatime?range=last_7_days
   ===================================================================== */

export async function handleWakaTime(req, res, env = {}) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "method_not_allowed", "Use GET.");
  }

  const url = new URL(req.url, "http://localhost");
  const askedRange = url.searchParams.get("range");
  const range = RANGES.includes(askedRange) ? askedRange : "last_7_days";

  const key = String(env.WAKATIME_API_KEY ?? "").trim();
  const username = String(env.WAKATIME_USERNAME ?? "").trim();

  if (!key && !username) {
    return sendError(
      res,
      503,
      "missing_config",
      "Configure WAKATIME_API_KEY (ou WAKATIME_USERNAME) no .env.local ou na Vercel."
    );
  }

  // Com a chave: dados da própria conta ("current"), mesmo com perfil privado.
  // Sem a chave: perfil público do usuário (precisa estar público no WakaTime).
  const mode = key ? "api_key" : "public";
  const user = key ? "current" : encodeURIComponent(username);

  try {
    const [response, today] = await Promise.all([
      callWakaTime(`/users/${user}/stats/${range}`, key),
      key ? fetchToday(key) : Promise.resolve(null),
    ]);

    // 202: o WakaTime ainda está calculando esse período (tente de novo em instantes)
    if (response.status === 202) {
      return sendError(res, 202, "pending", "O WakaTime ainda está calculando as estatísticas.");
    }
    if (response.status === 401) {
      return sendError(res, 401, "invalid_key", "Chave do WakaTime inválida.");
    }
    if (response.status === 402 || response.status === 403) {
      return sendError(
        res,
        403,
        "forbidden",
        mode === "public"
          ? "Perfil privado: deixe as estatísticas públicas no WakaTime ou use a WAKATIME_API_KEY."
          : "Este período não está disponível para a sua conta do WakaTime."
      );
    }
    if (response.status === 404) {
      return sendError(res, 404, "not_found", "Usuário do WakaTime não encontrado.");
    }
    if (!response.ok) {
      return sendError(res, 502, "upstream_error", `WakaTime respondeu HTTP ${response.status}.`);
    }

    const { data } = await response.json();
    if (data?.status === "pending_update" || !Array.isArray(data?.languages)) {
      return sendError(res, 202, "pending", "O WakaTime ainda está calculando as estatísticas.");
    }

    // 10 min no cache da CDN da Vercel: a chave é usada no máximo 1x a cada 10 min por período
    return send(
      res,
      200,
      normalize(data, today, mode),
      "public, max-age=0, s-maxage=600, stale-while-revalidate=3600"
    );
  } catch (error) {
    console.error("WakaTime:", error?.message ?? error);
    return sendError(res, 504, "timeout", "Não foi possível falar com o WakaTime agora.");
  }
}
