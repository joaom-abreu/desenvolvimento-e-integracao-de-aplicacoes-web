package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.NovaPartidaRequest;
import com.dti.palpite.dto.PalpiteRequest;
import com.dti.palpite.dto.PalpiteResponse;
import com.dti.palpite.dto.PartidaResponse;
import com.dti.palpite.dto.ResultadoPalpiteResponse;
import com.dti.palpite.exception.RecursoNaoEncontradoException;
import com.dti.palpite.jogo.Arbitro;
import com.dti.palpite.jogo.Intervalo;
import com.dti.palpite.jogo.Lance;
import com.dti.palpite.jogo.Sorteador;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.StatusPartida;
import com.dti.palpite.repository.PartidaRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

/**
 * Orquestra uma partida: sorteia, carrega do banco, chama o Arbitro e grava.
 * A regra em si (maior, menor, acertou, repetido, fora da faixa) mora no pacote jogo.
 */
@Service
public class PartidaService {

    static final String JOGADOR_ANONIMO = "Anônimo";

    private final PartidaRepository partidaRepository;
    private final RankingService rankingService;
    private final Arbitro arbitro;
    private final Sorteador sorteador;
    private final JogoProperties props;
    private final Clock clock;

    public PartidaService(PartidaRepository partidaRepository, RankingService rankingService, Arbitro arbitro,
                          Sorteador sorteador, JogoProperties props, Clock clock) {
        this.partidaRepository = partidaRepository;
        this.rankingService = rankingService;
        this.arbitro = arbitro;
        this.sorteador = sorteador;
        this.props = props;
        this.clock = clock;
    }

    /** Nova rodada: sorteia um número novo e grava a partida. */
    public PartidaResponse iniciar(NovaPartidaRequest request) {
        Intervalo intervalo = props.intervaloInicial();
        String jogador = normalizarNome(request == null ? null : request.jogador());
        Partida partida = new Partida(jogador, sorteador.sortear(intervalo), intervalo, Instant.now(clock));
        return PartidaResponse.de(partidaRepository.save(partida), null);
    }

    public PartidaResponse buscar(String id) {
        return responder(carregar(id));
    }

    /** Registra um palpite. Toda a comparação acontece aqui no back-end (pedido do PDF). */
    public ResultadoPalpiteResponse palpitar(String id, PalpiteRequest request) {
        Partida partida = carregar(id);
        Lance lance = arbitro.registrar(partida, request.numeroInteiro(), Instant.now(clock));
        Partida salva = partidaRepository.save(partida);
        return new ResultadoPalpiteResponse(
                PalpiteResponse.de(lance.palpite(), lance.tentativa()),
                lance.mensagem(),
                lance.dica(),
                responder(salva));
    }

    public List<PalpiteResponse> palpites(String id) {
        return responder(carregar(id)).palpites();
    }

    /** Desistir encerra a partida e revela o número. */
    public PartidaResponse desistir(String id) {
        Partida partida = carregar(id);
        arbitro.desistir(partida, Instant.now(clock));
        return responder(partidaRepository.save(partida));
    }

    // ------------------------------------------------------------------ apoio

    private Partida carregar(String id) {
        return partidaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Partida", id));
    }

    private PartidaResponse responder(Partida partida) {
        Integer posicao = partida.getStatus() == StatusPartida.VENCIDA ? rankingService.posicaoDe(partida) : null;
        return PartidaResponse.de(partida, posicao);
    }

    /** "  ana   maria " -> "ana maria"; vazio -> "Anônimo". */
    static String normalizarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return JOGADOR_ANONIMO;
        }
        return nome.trim().replaceAll("\\s+", " ");
    }
}
