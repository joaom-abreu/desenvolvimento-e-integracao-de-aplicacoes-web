package com.dti.palpite.jogo;

import com.dti.palpite.exception.ConflitoException;
import com.dti.palpite.exception.RegraNegocioException;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.ResultadoPalpite;
import com.dti.palpite.model.StatusPartida;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** As regras do jogo, sem Spring e sem banco: só objetos Java. */
@DisplayName("Arbitro (regras de uma partida)")
class ArbitroTest {

    private static final Instant T0 = Instant.parse("2026-10-26T12:00:00Z");

    private final Arbitro arbitro = new Arbitro();
    private Partida partida;

    @BeforeEach
    void novaPartida() {
        partida = new Partida("Ana", 42, new Intervalo(1, 100), T0);
    }

    @Test
    @DisplayName("palpite acima do sorteado -> MAIOR e a faixa encolhe")
    void maior() {
        Lance lance = arbitro.registrar(partida, 50, T0.plusSeconds(5));

        assertEquals(ResultadoPalpite.MAIOR, lance.palpite().resultado());
        assertEquals(1, lance.tentativa());
        assertEquals(new Intervalo(1, 49), partida.intervaloAtual());
        assertTrue(partida.emAndamento());
        assertNull(lance.dica());
    }

    @Test
    @DisplayName("acertar encerra a partida como VENCIDA e calcula a duração")
    void acertou() {
        arbitro.registrar(partida, 50, T0.plusSeconds(5));
        arbitro.registrar(partida, 25, T0.plusSeconds(10));
        Lance lance = arbitro.registrar(partida, 42, T0.plusSeconds(31));

        assertEquals(ResultadoPalpite.ACERTOU, lance.palpite().resultado());
        assertEquals(StatusPartida.VENCIDA, partida.getStatus());
        assertEquals(3, partida.getTentativas());
        assertEquals(31L, partida.getDuracaoSegundos());
        assertEquals("Acertou! O número era 42 e você precisou de 3 tentativas.", lance.mensagem());
    }

    @Test
    @DisplayName("número repetido -> 422 e não conta como tentativa")
    void repetido() {
        arbitro.registrar(partida, 50, T0);

        RegraNegocioException e = assertThrows(RegraNegocioException.class, () -> arbitro.registrar(partida, 50, T0));

        assertEquals("Você já tentou o número 50 nesta partida. Escolha outro.", e.getMessage());
        assertEquals(1, partida.getTentativas());
    }

    @Test
    @DisplayName("fora de 1 a 100 -> 422 com a faixa na mensagem")
    void foraDaFaixa() {
        RegraNegocioException e = assertThrows(RegraNegocioException.class, () -> arbitro.registrar(partida, 101, T0));
        assertEquals("Escolha um número entre 1 e 100. Você enviou 101.", e.getMessage());
        assertThrows(RegraNegocioException.class, () -> arbitro.registrar(partida, 0, T0));
        assertEquals(0, partida.getTentativas());
    }

    @Test
    @DisplayName("palpite em partida encerrada -> 409")
    void partidaEncerrada() {
        arbitro.registrar(partida, 42, T0);
        assertThrows(ConflitoException.class, () -> arbitro.registrar(partida, 10, T0));
    }

    @Test
    @DisplayName("palpite desperdiçado ganha uma dica")
    void dica() {
        arbitro.registrar(partida, 50, T0);                 // MAIOR -> [1, 49]
        Lance lance = arbitro.registrar(partida, 70, T0);   // 70 > 49: desperdiçado

        assertNotNull(lance.dica());
        assertTrue(lance.dica().contains("entre 1 e 49"));
    }

    @Test
    @DisplayName("desistir encerra como ABANDONADA; desistir de novo -> 409")
    void desistir() {
        arbitro.desistir(partida, T0.plusSeconds(60));

        assertEquals(StatusPartida.ABANDONADA, partida.getStatus());
        assertEquals(60L, partida.getDuracaoSegundos());
        assertThrows(ConflitoException.class, () -> arbitro.desistir(partida, T0));
    }
}
