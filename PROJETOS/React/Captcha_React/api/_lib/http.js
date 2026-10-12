// Funções HTTP compartilhadas pelas rotas da pasta api/.
// Funcionam igual no npm run dev (middleware do vite.config.js) e na Vercel.
//
// O nome da pasta começa com "_" para a Vercel NÃO transformá-la em rota.

const MAX_BODY = 16 * 1024; // bytes

/** Responde JSON sem cache. */
export function responderJson(res, status, dados) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(dados));
}

/** Resposta padrão de um envio de formulário: { sucesso, mensagem }. */
export function responderResultado(res, sucesso, mensagem, extras = {}) {
  responderJson(res, sucesso ? 200 : 403, { sucesso, mensagem, ...extras });
}

/** Garante o método HTTP. Devolve false (e já responde 405) se for outro. */
export function exigirMetodo(req, res, metodo) {
  if (req.method === metodo) return true;
  res.setHeader("Allow", metodo);
  responderJson(res, 405, { sucesso: false, mensagem: `Use ${metodo}.` });
  return false;
}

/** Lê o corpo JSON (a Vercel já entrega req.body; o Vite não). */
export async function lerCorpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error("Corpo grande demais.");
  }
  return JSON.parse(raw || "{}");
}

/**
 * Lê o formulário de contato (nome + mensagem) usado por todas as páginas.
 * Devolve null (e já responde 400) se faltar o nome, como o
 * @RequestParam String nome obrigatório do Spring.
 */
export async function lerFormulario(req, res) {
  let corpo;
  try {
    corpo = await lerCorpo(req);
  } catch {
    responderJson(res, 400, { sucesso: false, mensagem: "JSON inválido." });
    return null;
  }

  const nome = String(corpo?.nome ?? "").trim().slice(0, 80);
  if (!nome) {
    responderJson(res, 400, { sucesso: false, mensagem: "Preencha o nome." });
    return null;
  }
  return { ...corpo, nome };
}

/** IP do visitante (a Vercel e os proxies mandam no x-forwarded-for). */
export function ipDe(req) {
  return (
    String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

/**
 * POST application/x-www-form-urlencoded para a URL de verificação
 * (Google, hCaptcha e Cloudflare usam o mesmo formato) e devolve o JSON.
 */
export async function postFormulario(url, campos) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(campos),
    signal: AbortSignal.timeout(10_000),
  });
  return resposta.json();
}
