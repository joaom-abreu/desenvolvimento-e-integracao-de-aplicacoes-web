import { createContext, useContext } from "react";

/** Configuração da cidade + status da API, compartilhados por todas as páginas. */
export const SimulacaoContext = createContext({
  cidade: { larguraKm: 20, alturaKm: 20, base: { x: 10, y: 10 }, metrosPorQuadra: 100 },
  online: null,
  agora: null,
  fatorTempo: 60,
});

export const useSimulacao = () => useContext(SimulacaoContext);
