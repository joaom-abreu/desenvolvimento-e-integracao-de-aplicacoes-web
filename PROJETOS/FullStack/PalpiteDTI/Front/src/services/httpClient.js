import { API_CONFIG } from "../config/apiConfig.js";

/** Erro da API com o status HTTP e os campos inválidos (quando houver). */
export class ErroApi extends Error {
  constructor(mensagem, status, campos = {}) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
    this.campos = campos;
  }
}

/**
 * Faz uma requisição para o back-end e trata os erros em um só lugar.
 * O back-end sempre devolve erros no formato { mensagem, campos }.
 */
export async function requisicao(caminho, { metodo = "GET", corpo } = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_CONFIG.BASE_URL}${caminho}`, {
      method: metodo,
      headers: corpo !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi(
      "Não foi possível falar com o servidor. Confira se o back-end está rodando em " + API_CONFIG.BASE_URL + ".",
      0,
    );
  }

  if (!resposta.ok) {
    let dados = {};
    try {
      dados = await resposta.json();
    } catch {
      /* corpo vazio ou não-JSON */
    }
    throw new ErroApi(dados.mensagem || `Erro ${resposta.status} ao chamar ${caminho}.`, resposta.status, dados.campos || {});
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}
