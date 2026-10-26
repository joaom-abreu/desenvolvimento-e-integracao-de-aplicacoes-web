package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.SimulacaoResponse;
import com.dti.palpite.jogo.Arbitro;
import com.dti.palpite.jogo.Intervalo;
import com.dti.palpite.jogo.JogadorAutomatico;
import com.dti.palpite.jogo.JogadorAutomatico.Estrategia;
import com.dti.palpite.jogo.Sorteador;
import com.dti.palpite.model.Partida;
import com.dti.palpite.repository.PartidaRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Cria partidas jogadas por robôs (JogadorAutomatico), passando pelo mesmo Arbitro
 * das partidas de verdade. Usado nos dados iniciais, na demonstração e nos testes de carga.
 */
@Service
public class SimulacaoService {

    static final int MAXIMO_POR_VEZ = 500;

    private static final List<String> NOMES = List.of(
            "Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabi", "Heitor", "Iara", "João",
            "Kátia", "Léo", "Marina", "Nina", "Otávio", "Paula", "Rafa", "Sofia", "Tiago", "Vitória");

    private final PartidaRepository partidaRepository;
    private final Arbitro arbitro;
    private final Sorteador sorteador;
    private final JogoProperties props;
    private final Clock clock;
    private final Random random = new Random();

    public SimulacaoService(PartidaRepository partidaRepository, Arbitro arbitro, Sorteador sorteador,
                            JogoProperties props, Clock clock) {
        this.partidaRepository = partidaRepository;
        this.arbitro = arbitro;
        this.sorteador = sorteador;
        this.props = props;
        this.clock = clock;
    }

    public SimulacaoResponse gerarPartidas(int quantidade) {
        if (quantidade < 1 || quantidade > MAXIMO_POR_VEZ) {
            throw new IllegalArgumentException("A quantidade deve ficar entre 1 e " + MAXIMO_POR_VEZ + ".");
        }
        Intervalo intervalo = props.intervaloInicial();
        Instant agora = Instant.now(clock);
        List<Partida> partidas = new ArrayList<>();
        for (int i = 0; i < quantidade; i++) {
            // espalha as partidas pelos últimos 3 dias, para o ranking ter datas variadas
            Instant inicio = agora.minus(Duration.ofMinutes(random.nextInt(3 * 24 * 60)));
            partidas.add(jogar(NOMES.get(random.nextInt(NOMES.size())), sortearEstrategia(), intervalo, inicio));
        }
        partidaRepository.saveAll(partidas);
        return new SimulacaoResponse(quantidade, quantidade + " partidas jogadas por robôs foram criadas.");
    }

    /** Apaga tudo e, se pedido, recria partidas de exemplo. */
    public SimulacaoResponse reiniciar(int partidas) {
        if (partidas < 0 || partidas > MAXIMO_POR_VEZ) {
            throw new IllegalArgumentException("A quantidade deve ficar entre 0 e " + MAXIMO_POR_VEZ + ".");
        }
        partidaRepository.deleteAll();
        if (partidas == 0) {
            return new SimulacaoResponse(0, "Banco limpo.");
        }
        return gerarPartidas(partidas);
    }

    /** Uma partida inteira, do sorteio ao acerto, com palpites espaçados de 3 a 15 segundos. */
    Partida jogar(String nome, Estrategia estrategia, Intervalo intervalo, Instant inicio) {
        JogadorAutomatico robo = new JogadorAutomatico(estrategia, random);
        Partida partida = new Partida(nome, sorteador.sortear(intervalo), intervalo, inicio);
        partida.setSimulada(true);
        Instant momento = inicio;
        while (partida.emAndamento()) {
            momento = momento.plusSeconds(3 + random.nextInt(13));
            arbitro.registrar(partida, robo.proximoPalpite(partida.intervaloAtual()), momento);
        }
        return partida;
    }

    /** 20% jogam busca binária perfeita, 50% "intuitiva", 30% aleatória. */
    private Estrategia sortearEstrategia() {
        int sorte = random.nextInt(10);
        if (sorte < 2) {
            return Estrategia.BUSCA_BINARIA;
        }
        return sorte < 7 ? Estrategia.INTUITIVA : Estrategia.ALEATORIA;
    }
}
