package com.dti.palpite.jogo;

import com.dti.palpite.jogo.JogadorAutomatico.Estrategia;
import com.dti.palpite.model.Partida;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.time.Instant;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Prova, por força bruta, a afirmação central do README:
 * jogando busca binária, qualquer número de 1 a 100 sai em no máximo 7 tentativas.
 */
@DisplayName("JogadorAutomatico (busca binária e carga)")
class JogadorAutomaticoTest {

    private static final Instant T0 = Instant.parse("2026-10-26T12:00:00Z");
    private static final Intervalo CEM = new Intervalo(1, 100);

    private final Arbitro arbitro = new Arbitro();

    private Partida jogar(int secreto, JogadorAutomatico robo) {
        Partida partida = new Partida("robô", secreto, CEM, T0);
        while (partida.emAndamento()) {
            arbitro.registrar(partida, robo.proximoPalpite(partida.intervaloAtual()), T0);
        }
        return partida;
    }

    @Test
    @DisplayName("busca binária acerta TODOS os números de 1 a 100 em no máximo 7 tentativas")
    void buscaBinariaNoMaximoSete() {
        JogadorAutomatico robo = new JogadorAutomatico(Estrategia.BUSCA_BINARIA, new Random(1));
        int pior = 0;
        for (int secreto = 1; secreto <= 100; secreto++) {
            pior = Math.max(pior, jogar(secreto, robo).getTentativas());
        }
        assertEquals(Desempenho.tentativasIdeais(CEM), pior);   // 7: o limite é atingido, não só respeitado
    }

    @Test
    @DisplayName("busca binária acerta o 50 de primeira (é o primeiro meio)")
    void cinquentaDePrimeira() {
        JogadorAutomatico robo = new JogadorAutomatico(Estrategia.BUSCA_BINARIA, new Random(1));
        assertEquals(1, jogar(50, robo).getTentativas());
    }

    @ParameterizedTest
    @EnumSource(Estrategia.class)
    @DisplayName("toda estratégia termina, sem repetir número, em no máximo 100 tentativas")
    void todaEstrategiaTermina(Estrategia estrategia) {
        JogadorAutomatico robo = new JogadorAutomatico(estrategia, new Random(7));
        for (int secreto = 1; secreto <= 100; secreto++) {
            int tentativas = jogar(secreto, robo).getTentativas();
            assertTrue(tentativas >= 1 && tentativas <= 100);
        }
    }

    @Test
    @DisplayName("carga: 100.000 partidas inteiras em poucos segundos")
    void carga() {
        Random random = new Random(42);
        SorteadorAleatorio sorteador = new SorteadorAleatorio(random);
        JogadorAutomatico robo = new JogadorAutomatico(Estrategia.INTUITIVA, random);
        long inicio = System.nanoTime();
        long somaTentativas = 0;
        int total = 100_000;
        for (int i = 0; i < total; i++) {
            somaTentativas += jogar(sorteador.sortear(CEM), robo).getTentativas();
        }
        double segundos = (System.nanoTime() - inicio) / 1e9;
        System.out.printf("%d partidas em %.2f s (média de %.2f tentativas)%n",
                total, segundos, somaTentativas / (double) total);
        assertTrue(segundos < 10, "100 mil partidas deveriam rodar em menos de 10 s");
    }
}
