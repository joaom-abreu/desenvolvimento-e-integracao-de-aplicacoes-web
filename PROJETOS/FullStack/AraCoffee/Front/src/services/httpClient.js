import API_CONFIG from "../config/apiConfig";

/**
 * Faz uma requisição HTTP para o back-end e devolve o JSON da resposta.
 *
 * Centraliza o tratamento de erro em um só lugar:
 * - Back-end desligado / URL errada / CORS bloqueado → fetch lança TypeError
 * - Back-end respondeu com erro (400, 404, 503...) → lemos o campo "mensagem"
 *   que o GlobalExceptionHandler do Spring Boot devolve
 *
 * @param {string} caminho Caminho da API, ex.: "/api/produtos"
 * @param {RequestInit} opcoes Método, corpo etc. (mesmas opções do fetch)
 */
export async function requisicao(caminho, opcoes = {}) {
  const url = `${API_CONFIG.BASE_URL}${caminho}`;

  // Só enviamos Content-Type quando existe corpo (POST / PUT)
  const headers = opcoes.body ? { "Content-Type": "application/json" } : {};

  let resposta;

  try {
    resposta = await fetch(url, { ...opcoes, headers });
  } catch {
    throw new Error(
      `Não foi possível falar com o back-end em ${API_CONFIG.BASE_URL}. ` +
        "Confira se o Spring Boot está rodando e se o CORS libera este endereço.",
    );
  }

  // 204 No Content (ex.: DELETE) não tem corpo
  if (resposta.status === 204) {
    return null;
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(corpo?.mensagem || `O back-end respondeu com erro ${resposta.status}.`);
  }

  return corpo;
}
