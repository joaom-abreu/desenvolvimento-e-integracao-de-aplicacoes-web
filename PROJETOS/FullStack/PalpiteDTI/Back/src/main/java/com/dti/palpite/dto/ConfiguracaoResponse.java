package com.dti.palpite.dto;

/** GET /api/configuracao: o front desenha o tabuleiro com estes limites (nada fica fixo no React). */
public record ConfiguracaoResponse(int minimo, int maximo, int tentativasIdeais, int tamanhoRanking) {
}
