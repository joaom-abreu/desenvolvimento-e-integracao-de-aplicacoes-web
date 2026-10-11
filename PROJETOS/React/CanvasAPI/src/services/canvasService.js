import CANVAS_CONFIG from "../config/canvasConfig";

// Erro com o código que o servidor mandou (ver api/_canvas.js):
//   missing_config | invalid_token | forbidden | network | timeout | rate_limit ...
export class CanvasError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Busca o painel inteiro (cursos, tarefas, entregas e eventos) em GET /api/canvas
export async function fetchCanvas() {
  let response;
  try {
    response = await fetch(CANVAS_CONFIG.API_PATH, { headers: { Accept: "application/json" } });
  } catch {
    throw new CanvasError("network", "Sem conexão com o servidor.");
  }

  // Sem a função (ex.: site estático sem /api), a rota devolve o index.html
  const isJson = response.headers.get("content-type")?.includes("application/json");
  if (!isJson) {
    throw new CanvasError(
      "no_api",
      "A rota /api/canvas não existe aqui. Rode com npm run dev ou publique na Vercel."
    );
  }

  const body = await response.json();
  if (!response.ok) {
    throw new CanvasError(body.error ?? "error", body.message ?? `HTTP ${response.status}`);
  }
  return body;
}
