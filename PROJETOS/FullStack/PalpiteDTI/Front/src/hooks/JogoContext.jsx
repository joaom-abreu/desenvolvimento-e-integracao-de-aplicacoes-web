import { createContext, useContext } from "react";

/** Usado enquanto a API não respondeu (os mesmos valores do application.properties). */
export const CONFIGURACAO_PADRAO = { minimo: 1, maximo: 100, tentativasIdeais: 7, tamanhoRanking: 10 };

/** Limites do jogo + status da API, compartilhados por todas as páginas. */
export const JogoContext = createContext({ configuracao: CONFIGURACAO_PADRAO, online: null });

export const useJogo = () => useContext(JogoContext);
