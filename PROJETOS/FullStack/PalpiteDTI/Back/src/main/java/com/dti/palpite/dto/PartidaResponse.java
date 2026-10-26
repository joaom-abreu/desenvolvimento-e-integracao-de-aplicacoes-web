package com.dti.palpite.dto;

import com.dti.palpite.jogo.Classificacao;
import com.dti.palpite.jogo.Desempenho;
import com.dti.palpite.model.Palpite;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.StatusPartida;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Uma partida como a API devolve.
 *
 * Regra de segurança: numeroSecreto só aparece depois que a partida termina.
 * Enquanto ela está em andamento, o campo vai null: abrir o F12 não entrega a resposta.
 */
public record PartidaResponse(
        String id,
        String jogador,
        String status,
        String statusRotulo,
        IntervaloResponse intervalo,
        IntervaloResponse possivel,
        int tentativas,
        int tentativasIdeais,
        List<PalpiteResponse> palpites,
        Integer numeroSecreto,
        Instant iniciadaEm,
        Instant finalizadaEm,
        Long duracaoSegundos,
        String classificacao,
        String classificacaoRotulo,
        Integer posicaoRanking) {

    public static PartidaResponse de(Partida p, Integer posicaoRanking) {
        int ideais = Desempenho.tentativasIdeais(p.intervaloInicial());

        List<PalpiteResponse> palpites = new ArrayList<>();
        List<Palpite> lista = p.getPalpites();
        for (int i = 0; i < lista.size(); i++) {
            palpites.add(PalpiteResponse.de(lista.get(i), i + 1));
        }

        Classificacao classificacao = p.getStatus() == StatusPartida.VENCIDA
                ? Desempenho.classificar(p.getTentativas(), ideais)
                : null;

        return new PartidaResponse(
                p.getId(),
                p.getJogador(),
                p.getStatus().name(),
                p.getStatus().rotulo(),
                IntervaloResponse.de(p.intervaloInicial()),
                IntervaloResponse.de(p.intervaloAtual()),
                p.getTentativas(),
                ideais,
                palpites,
                p.emAndamento() ? null : p.getNumeroSecreto(),
                p.getIniciadaEm(),
                p.getFinalizadaEm(),
                p.getDuracaoSegundos(),
                classificacao == null ? null : classificacao.name(),
                classificacao == null ? null : classificacao.rotulo(),
                posicaoRanking);
    }
}
