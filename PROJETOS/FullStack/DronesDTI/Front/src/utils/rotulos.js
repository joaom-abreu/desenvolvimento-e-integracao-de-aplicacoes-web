// Textos e cores de estados, status e prioridades: um só lugar para a tela inteira.

export const ESTADOS_DRONE = {
  IDLE: { rotulo: "Parado na base", cor: "var(--estado-idle)" },
  CARREGANDO: { rotulo: "Carregando", cor: "var(--estado-carregando)" },
  EM_VOO: { rotulo: "Em voo", cor: "var(--estado-voo)" },
  ENTREGANDO: { rotulo: "Entregando", cor: "var(--estado-entregando)" },
  RETORNANDO: { rotulo: "Retornando", cor: "var(--estado-retornando)" },
  RECARREGANDO: { rotulo: "Recarregando", cor: "var(--estado-recarga)" },
};

export const STATUS_PEDIDO = {
  PENDENTE: "Na fila",
  ALOCADO: "Carregando",
  EM_ROTA: "Em rota",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const PRIORIDADES = {
  ALTA: { rotulo: "Alta", cor: "var(--laranja)" },
  MEDIA: { rotulo: "Média", cor: "var(--azul-eletrico)" },
  BAIXA: { rotulo: "Baixa", cor: "var(--cinza-medio)" },
};

export const ALGORITMOS = {
  TRIVIAL: "Entrega única",
  EXATO: "Exato (backtracking)",
  VIZINHO_MAIS_PROXIMO_2OPT: "Vizinho mais próximo + 2-opt",
};

export const rotuloEstado = (estado) => ESTADOS_DRONE[estado]?.rotulo ?? estado;
export const corEstado = (estado) => ESTADOS_DRONE[estado]?.cor ?? "var(--cinza-medio)";
