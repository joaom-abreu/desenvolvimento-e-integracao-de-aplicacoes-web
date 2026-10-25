import { API_CONFIG } from "../config/apiConfig.js";
import { requisicao } from "./httpClient.js";

// Uma função para cada endpoint do back-end (veja a tabela no README).

export const pedidoService = {
  listar: (status) => requisicao(`/api/pedidos${status ? `?status=${status}` : ""}`),
  fila: () => requisicao("/api/pedidos/fila"),
  criar: (pedido) => requisicao("/api/pedidos", { metodo: "POST", corpo: pedido }),
  cancelar: (id) => requisicao(`/api/pedidos/${id}`, { metodo: "DELETE" }),
  rastrear: (id) => requisicao(`/api/pedidos/${id}/rastreio`),
};

export const droneService = {
  status: () => requisicao("/api/drones/status"),
  criar: (drone) => requisicao("/api/drones", { metodo: "POST", corpo: drone }),
  remover: (id) => requisicao(`/api/drones/${id}`, { metodo: "DELETE" }),
};

export const zonaService = {
  listar: () => requisicao("/api/zonas"),
  criar: (zona) => requisicao("/api/zonas", { metodo: "POST", corpo: zona }),
  remover: (id) => requisicao(`/api/zonas/${id}`, { metodo: "DELETE" }),
};

export const entregaService = {
  rotas: () => requisicao("/api/entregas/rota"),
  historico: () => requisicao("/api/entregas"),
};

export const dashboardService = {
  indicadores: () => requisicao("/api/dashboard"),
  mapaAscii: () => requisicao("/api/dashboard/mapa-ascii", { comoTexto: true }),
  urlCsv: () => `${API_CONFIG.BASE_URL}/api/dashboard/entregas.csv`,
};

export const simulacaoService = {
  status: () => requisicao("/api/simulacao/status"),
  despachar: () => requisicao("/api/simulacao/despachar", { metodo: "POST" }),
  pedidosAleatorios: (quantidade = 20) =>
    requisicao(`/api/simulacao/pedidos-aleatorios?quantidade=${quantidade}`, { metodo: "POST" }),
  reiniciar: (pedidos = 0) => requisicao(`/api/simulacao/reiniciar?pedidos=${pedidos}`, { metodo: "POST" }),
};

export const statusService = {
  verificar: () => requisicao("/api/status"),
};
