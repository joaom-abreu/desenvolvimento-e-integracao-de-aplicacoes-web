package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.RankingItemResponse;
import com.dti.palpite.jogo.Classificacao;
import com.dti.palpite.jogo.Desempenho;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.StatusPartida;
import com.dti.palpite.repository.PartidaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Placar (bônus do PDF): partidas vencidas, menos tentativas primeiro.
 * Desempate: menos segundos; depois, quem terminou antes.
 * A ordenação e o limite rodam no MongoDB (índice "ranking" em Partida).
 */
@Service
public class RankingService {

    static final int LIMITE_MAXIMO = 100;

    static final Sort ORDEM = Sort.by(
            Sort.Order.asc("tentativas"),
            Sort.Order.asc("duracaoSegundos"),
            Sort.Order.asc("finalizadaEm"));

    private final PartidaRepository partidaRepository;
    private final JogoProperties props;

    public RankingService(PartidaRepository partidaRepository, JogoProperties props) {
        this.partidaRepository = partidaRepository;
        this.props = props;
    }

    public List<RankingItemResponse> top(Integer limite) {
        int tamanho = limite == null ? props.getTamanhoRanking() : limite;
        if (tamanho < 1 || tamanho > LIMITE_MAXIMO) {
            throw new IllegalArgumentException("O limite do ranking deve ficar entre 1 e " + LIMITE_MAXIMO + ".");
        }
        List<Partida> partidas = partidaRepository.findByStatus(StatusPartida.VENCIDA, PageRequest.of(0, tamanho, ORDEM));

        List<RankingItemResponse> ranking = new ArrayList<>();
        for (int i = 0; i < partidas.size(); i++) {
            Partida p = partidas.get(i);
            Classificacao c = Desempenho.classificar(p.getTentativas(), Desempenho.tentativasIdeais(p.intervaloInicial()));
            ranking.add(new RankingItemResponse(i + 1, p.getId(), p.getJogador(), p.getTentativas(),
                    p.getDuracaoSegundos(), c.name(), c.rotulo(), p.getFinalizadaEm(), p.isSimulada()));
        }
        return ranking;
    }

    /** Posição de uma partida vencida = quantas estão na frente dela + 1. */
    public int posicaoDe(Partida partida) {
        StatusPartida vencida = StatusPartida.VENCIDA;
        int t = partida.getTentativas();
        Long d = partida.getDuracaoSegundos();
        long naFrente = partidaRepository.countByStatusAndTentativasLessThan(vencida, t)
                + partidaRepository.countByStatusAndTentativasAndDuracaoSegundosLessThan(vencida, t, d)
                + partidaRepository.countByStatusAndTentativasAndDuracaoSegundosAndFinalizadaEmLessThan(
                        vencida, t, d, partida.getFinalizadaEm());
        return (int) naFrente + 1;
    }
}
