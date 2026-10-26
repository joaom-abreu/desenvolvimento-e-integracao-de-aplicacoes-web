package com.dti.palpite.dto;

import java.util.List;

/** GET /api/estatisticas: os números da página Estatísticas. */
public record EstatisticasResponse(
        long totalPartidas,
        long vencidas,
        long abandonadas,
        long emAndamento,
        double taxaVitoria,
        Double mediaTentativas,
        Integer melhorTentativas,
        int tentativasIdeais,
        double percentualNoIdeal,
        Double duracaoMediaSegundos,
        List<Barra> distribuicaoTentativas,
        List<Barra> primeirosPalpites,
        List<Barra> sorteiosPorFaixa) {

    /** Uma barra de gráfico: rótulo e valor. */
    public record Barra(String rotulo, long valor) {
    }
}
