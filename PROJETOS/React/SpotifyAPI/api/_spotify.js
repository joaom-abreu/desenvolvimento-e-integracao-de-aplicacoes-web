// Fala com a Web API do Spotify no SERVIDOR, para as chaves não irem para o navegador.
//
// Quem chama estas funções:
//   • em produção, a Vercel Function api/spotify.js  → GET /api/spotify
//   • no npm run dev / npm run preview, o vite.config.js (mesma rota)
//
// Variáveis de ambiente (sem o prefixo VITE_, de propósito: variáveis com
// VITE_ vão para o build e qualquer visitante consegue ler):
//   SPOTIFY_CLIENT_ID      → do app em developer.spotify.com/dashboard
//   SPOTIFY_CLIENT_SECRET  → idem (Settings → "View client secret")
//   SPOTIFY_REFRESH_TOKEN  → gerado uma vez em /api/spotify/login (só no npm run dev)
//
// Como o painel mostra a SUA música (e não a de quem visita), o login é feito
// uma vez só, por você. O refresh token não expira: com ele o servidor pede um
// access token novo (vale 1 hora) sempre que precisa.
//
// O nome do arquivo começa com "_" para a Vercel NÃO transformá-lo em rota.

import { randomBytes } from "node:crypto";

export const SPOTIFY_PATH = "/api/spotify";
export const LOGIN_PATH = "/api/spotify/login";
export const CALLBACK_PATH = "/api/spotify/callback";

const ACCOUNTS = "https://accounts.spotify.com";
const API = "https://api.spotify.com/v1";
const TIMEOUT_MS = 10_000;

// Permissões pedidas no login (só leitura)
const SCOPES = ["user-read-currently-playing", "user-read-recently-played", "user-top-read"];

// Períodos aceitos pelo /me/top: ~4 semanas, ~6 meses, ~1 ano
const RANGES = ["short_term", "medium_term", "long_term"];
const TOP_LIMIT = 10;
const RECENT_LIMIT = 10;

/* =====================================================================
   Resposta HTTP (funciona igual na Vercel e no servidor do Vite)
   ===================================================================== */

function send(res, status, body, cache = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const basicAuth = (env) =>
  `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID.trim()}:${env.SPOTIFY_CLIENT_SECRET.trim()}`).toString("base64")}`;

/* =====================================================================
   Access token: trocado pelo refresh token e guardado até vencer
   ===================================================================== */

let accessToken = null; // { value, expiresAt }

async function getAccessToken(env) {
  if (accessToken && Date.now() < accessToken.expiresAt) return accessToken.value;

  let response;
  try {
    response = await fetch(`${ACCOUNTS}/api/token`, {
      method: "POST",
      headers: {
        Authorization: basicAuth(env),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: env.SPOTIFY_REFRESH_TOKEN.trim(),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new HttpError(502, "network", "Sem resposta do Spotify.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (body.error === "invalid_client") {
      throw new HttpError(401, "invalid_client", "SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET incorretos.");
    }
    throw new HttpError(
      401,
      "invalid_refresh_token",
      "O Spotify recusou o SPOTIFY_REFRESH_TOKEN. Gere outro em /api/spotify/login."
    );
  }

  // Um minuto de folga antes de vencer
  accessToken = { value: body.access_token, expiresAt: Date.now() + (body.expires_in - 60) * 1000 };
  return accessToken.value;
}

async function callSpotify(path, env) {
  const token = await getAccessToken(env);
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new HttpError(502, "network", "Sem resposta do Spotify.");
  }

  if (response.status === 204) return null; // nada tocando
  if (response.ok) return response.json();

  if (response.status === 401) {
    accessToken = null;
    throw new HttpError(401, "expired", "Access token vencido. Tente de novo.");
  }
  if (response.status === 403) {
    throw new HttpError(
      403,
      "forbidden",
      "O Spotify recusou o acesso (403). Em Development Mode, o dono do app precisa de conta Premium e a sua conta precisa estar em Settings → User Management."
    );
  }
  if (response.status === 429) {
    throw new HttpError(429, "rate_limit", "Limite de chamadas do Spotify. Tente de novo em instantes.");
  }
  throw new HttpError(502, "spotify_error", `O Spotify respondeu ${response.status}.`);
}

/* =====================================================================
   Normalização: devolve só o que a tela usa
   ===================================================================== */

// A capa vem em 3 tamanhos (640, 300, 64): fica a de ~300 px
const pickImage = (images = [], target = 300) =>
  [...images].sort((a, b) => Math.abs((a.width ?? 0) - target) - Math.abs((b.width ?? 0) - target))[0]?.url ?? null;

function normalizeTrack(track) {
  if (!track) return null;
  return {
    id: track.id,
    name: track.name,
    url: track.external_urls?.spotify ?? null,
    durationMs: track.duration_ms ?? 0,
    explicit: Boolean(track.explicit),
    artists: (track.artists ?? []).map((a) => ({ name: a.name, url: a.external_urls?.spotify ?? null })),
    album: {
      name: track.album?.name ?? "",
      image: pickImage(track.album?.images),
      url: track.album?.external_urls?.spotify ?? null,
      year: track.album?.release_date?.slice(0, 4) ?? null,
    },
  };
}

function normalizeArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    url: artist.external_urls?.spotify ?? null,
    image: pickImage(artist.images),
    // "genres" ainda vem, mas pode sumir como "popularity" e "followers" (fev/2026)
    genres: (artist.genres ?? []).slice(0, 2),
  };
}

/* =====================================================================
   Recursos
   ===================================================================== */

// "now": o que está tocando agora (ou a última música, se nada estiver tocando)
async function loadNow(env) {
  const current = await callSpotify("/me/player/currently-playing", env);

  if (current?.item && current.currently_playing_type === "track") {
    return {
      playing: Boolean(current.is_playing),
      progressMs: current.progress_ms ?? 0,
      track: normalizeTrack(current.item),
      playedAt: null,
      fetchedAt: Date.now(),
    };
  }

  const recent = await callSpotify("/me/player/recently-played?limit=1", env);
  const last = recent?.items?.[0];
  return {
    playing: false,
    progressMs: 0,
    track: normalizeTrack(last?.track),
    playedAt: last?.played_at ?? null,
    fetchedAt: Date.now(),
  };
}

// "stats": perfil, top músicas, top artistas e tocadas recentemente
async function loadStats(env, range) {
  const [me, tracks, artists, recent] = await Promise.all([
    callSpotify("/me", env),
    callSpotify(`/me/top/tracks?time_range=${range}&limit=${TOP_LIMIT}`, env),
    callSpotify(`/me/top/artists?time_range=${range}&limit=${TOP_LIMIT}`, env),
    callSpotify(`/me/player/recently-played?limit=${RECENT_LIMIT}`, env),
  ]);

  return {
    range,
    profile: {
      name: me?.display_name ?? me?.id ?? "",
      image: pickImage(me?.images, 120),
      url: me?.external_urls?.spotify ?? null,
    },
    topTracks: (tracks?.items ?? []).map(normalizeTrack),
    topArtists: (artists?.items ?? []).map(normalizeArtist),
    recent: (recent?.items ?? []).map((item) => ({
      playedAt: item.played_at,
      track: normalizeTrack(item.track),
    })),
  };
}

/* =====================================================================
   GET /api/spotify?resource=now|stats&range=short_term
   ===================================================================== */

const memory = new Map(); // chave → { at, body }
const MEMORY_MS = { now: 15_000, stats: 300_000 };
const CDN_CACHE = {
  now: "public, max-age=0, s-maxage=15, stale-while-revalidate=30",
  stats: "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
};

const missingConfig = (env) =>
  ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN"].filter((key) => !env[key]?.trim());

export async function handleSpotify(req, res, env = {}) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "method_not_allowed", message: "Use GET." });
  }

  const missing = missingConfig(env);
  if (missing.length) {
    return send(res, 503, {
      error: "missing_config",
      message: `Configure ${missing.join(", ")} no .env.local (npm run dev) ou nas Environment Variables da Vercel.`,
      missing,
    });
  }

  const url = new URL(req.url, "http://localhost");
  const resource = url.searchParams.get("resource") ?? "stats";
  const range = url.searchParams.get("range") ?? "short_term";

  if (!["now", "stats"].includes(resource)) {
    return send(res, 400, { error: "invalid_resource", message: "Use resource=now ou resource=stats." });
  }
  if (!RANGES.includes(range)) {
    return send(res, 400, { error: "invalid_range", message: `Use range=${RANGES.join(" | ")}.` });
  }

  const key = resource === "now" ? "now" : `stats:${range}`;
  try {
    const hit = memory.get(key);
    if (!hit || Date.now() - hit.at > MEMORY_MS[resource]) {
      const body = resource === "now" ? await loadNow(env) : await loadStats(env, range);
      memory.set(key, { at: Date.now(), body });
    }
    return send(res, 200, memory.get(key).body, CDN_CACHE[resource]);
  } catch (error) {
    if (error instanceof HttpError) {
      return send(res, error.status, { error: error.code, message: error.message });
    }
    console.error("[spotify]", error);
    return send(res, 500, { error: "server_error", message: "Erro inesperado ao falar com o Spotify." });
  }
}

/* =====================================================================
   Login (SÓ no npm run dev): gera o SPOTIFY_REFRESH_TOKEN uma vez
   ===================================================================== */

// O Spotify não aceita "localhost" no Redirect URI: tem que ser 127.0.0.1
const redirectUriFor = (req) => {
  const port = (req.headers.host ?? "").split(":")[1] ?? "5173";
  return `http://127.0.0.1:${port}${CALLBACK_PATH}`;
};

const states = new Set(); // proteção contra CSRF no callback

export function handleLogin(req, res, env = {}) {
  const host = req.headers.host ?? "";
  // Aberto em localhost: manda para 127.0.0.1 (o cookie/estado tem que ser do mesmo endereço)
  if (host.startsWith("localhost")) {
    res.statusCode = 302;
    res.setHeader("Location", `http://127.0.0.1:${host.split(":")[1] ?? "5173"}${LOGIN_PATH}`);
    return res.end();
  }
  if (!env.SPOTIFY_CLIENT_ID?.trim() || !env.SPOTIFY_CLIENT_SECRET?.trim()) {
    return sendHtml(res, 503, page("Faltam as chaves", "<p>Preencha <code>SPOTIFY_CLIENT_ID</code> e <code>SPOTIFY_CLIENT_SECRET</code> no <code>.env.local</code> e reinicie o <code>npm run dev</code>.</p>"));
  }

  const state = randomBytes(16).toString("hex");
  states.add(state);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID.trim(),
    scope: SCOPES.join(" "),
    redirect_uri: redirectUriFor(req),
    state,
  });
  res.statusCode = 302;
  res.setHeader("Location", `${ACCOUNTS}/authorize?${params}`);
  res.end();
}

export async function handleCallback(req, res, env = {}) {
  const url = new URL(req.url, "http://127.0.0.1");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return sendHtml(res, 400, page("Login cancelado", `<p>O Spotify respondeu: <code>${escapeHtml(error)}</code>.</p>`));
  if (!code || !states.has(state)) {
    return sendHtml(res, 400, page("Link inválido", `<p>Comece de novo em <a href="${LOGIN_PATH}">${LOGIN_PATH}</a>.</p>`));
  }
  states.delete(state);

  const response = await fetch(`${ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { Authorization: basicAuth(env), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUriFor(req) }),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.refresh_token) {
    return sendHtml(res, 400, page("Não deu certo", `<p>O Spotify respondeu: <code>${escapeHtml(body.error_description ?? body.error ?? response.status)}</code>.</p><p>Confira se o Redirect URI do app é exatamente <code>${escapeHtml(redirectUriFor(req))}</code>.</p>`));
  }

  return sendHtml(
    res,
    200,
    page(
      "Pronto! Copie o seu refresh token",
      `<p>Cole a linha abaixo no <code>.env.local</code> (e nas Environment Variables da Vercel) e reinicie o <code>npm run dev</code>:</p>
       <textarea readonly rows="4" onclick="this.select()">SPOTIFY_REFRESH_TOKEN=${escapeHtml(body.refresh_token)}</textarea>
       <p class="warn">⚠️ Ele é secreto: dá acesso à sua conta (só leitura, nas permissões ${SCOPES.map((s) => `<code>${s}</code>`).join(", ")}). Nunca coloque no código nem no GitHub.</p>
       <p><a href="/">Voltar para o painel</a></p>`
    )
  );
}

function sendHtml(res, status, html) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(html);
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const page = (title, content) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Spotify API</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem;font-family:Montserrat,system-ui,sans-serif;background:#f8fafc;color:#171717}
  main{width:min(640px,100%);background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 24px 56px -12px rgba(0,51,79,.25)}
  header{padding:1.25rem 1.5rem;color:#fff;background:linear-gradient(145deg,#00334f,#005380);font-weight:600}
  section{padding:1.5rem}
  textarea{width:100%;box-sizing:border-box;padding:.75rem;font:0.85rem ui-monospace,Menlo,monospace;border:1px solid #e2e8f0;border-radius:8px;background:#f1f5f9;resize:none}
  code{background:#f1f5f9;padding:.1rem .35rem;border-radius:4px}
  .warn{color:#92400e;background:#fffbeb;border:1px solid #fde68a;padding:.6rem .8rem;border-radius:8px}
  a{color:#005380}
</style></head>
<body><main><header>${title}</header><section>${content}</section></main></body></html>`;
