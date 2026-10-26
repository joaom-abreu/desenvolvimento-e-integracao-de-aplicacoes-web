import { requisicao } from "./httpClient.js";

// Uma função para cada endpoint do back-end (veja a tabela no README).

export const partidaService = {
  iniciar: (jogador) => requisicao("/api/partidas", { metodo: "POST", corpo: { jogador } }),
  buscar: (id) => requisicao(`/api/partidas/${encodeURIComponent(id)}`),
  palpitar: (id, numero) =>
    requisicao(`/api/partidas/${encodeURIComponent(id)}/palpites`, { metodo: "POST", corpo: { numero } }),
  desistir: (id) => requisicao(`/api/partidas/${encodeURIComponent(id)}/desistencia`, { metodo: "POST" }),
};

export const rankingService = {
  top: (limite = 10) => requisicao(`/api/ranking?limite=${limite}`),
};

export const estatisticaService = {
  resumo: () => requisicao("/api/estatisticas"),
};

export const jogoService = {
  configuracao: () => requisicao("/api/configuracao"),
  status: () => requisicao("/api/status"),
};

export const simulacaoService = {
  gerarPartidas: (quantidade = 20) =>
    requisicao(`/api/simulacao/partidas?quantidade=${quantidade}`, { metodo: "POST" }),
};
