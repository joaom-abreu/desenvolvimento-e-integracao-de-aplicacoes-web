import { requisicao } from "./httpClient";

/**
 * Pergunta ao back-end se ele está no ar e se consegue falar com o MongoDB.
 * Nunca lança erro: sempre devolve um objeto com o estado de cada parte.
 *
 * @returns {Promise<{ backend: "online" | "offline", mongodb: "online" | "offline" | "desconhecido" }>}
 */
export async function verificarStatus() {
  try {
    const resposta = await requisicao("/api/status");

    return {
      backend: "online",
      mongodb: resposta?.mongodb === "online" ? "online" : "offline",
    };
  } catch {
    // Se o back-end não respondeu, não dá para saber nada sobre o MongoDB
    return { backend: "offline", mongodb: "desconhecido" };
  }
}
