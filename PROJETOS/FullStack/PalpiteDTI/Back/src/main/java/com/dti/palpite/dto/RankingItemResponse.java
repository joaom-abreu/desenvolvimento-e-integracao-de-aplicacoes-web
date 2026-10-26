package com.dti.palpite.dto;

import java.time.Instant;

/** Uma linha do ranking: menos tentativas primeiro; empate, menos tempo; empate, quem terminou antes. */
public record RankingItemResponse(
        int posicao,
        String partidaId,
        String jogador,
        int tentativas,
        Long duracaoSegundos,
        String classificacao,
        String classificacaoRotulo,
        Instant finalizadaEm,
        boolean robo) {
}
