package com.dti.palpite.jogo;

import com.dti.palpite.model.Palpite;
import com.dti.palpite.model.ResultadoPalpite;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Intervalo (onde o número ainda pode estar)")
class IntervaloTest {

    private final Intervalo cem = new Intervalo(1, 100);

    @Test
    @DisplayName("tamanho, meio e contem")
    void basico() {
        assertEquals(100, cem.tamanho());
        assertEquals(50, cem.meio());
        assertTrue(cem.contem(1));
        assertTrue(cem.contem(100));
        assertFalse(cem.contem(0));
        assertFalse(cem.contem(101));
    }

    @Test
    @DisplayName("MAIOR descarta o palpite e tudo acima dele")
    void maior() {
        assertEquals(new Intervalo(1, 49), cem.depoisDe(50, ResultadoPalpite.MAIOR));
    }

    @Test
    @DisplayName("MENOR descarta o palpite e tudo abaixo dele")
    void menor() {
        assertEquals(new Intervalo(51, 100), cem.depoisDe(50, ResultadoPalpite.MENOR));
    }

    @Test
    @DisplayName("ACERTOU reduz o intervalo a um número só")
    void acertou() {
        assertEquals(new Intervalo(42, 42), cem.depoisDe(42, ResultadoPalpite.ACERTOU));
    }

    @Test
    @DisplayName("palpite desperdiçado (fora da faixa) não muda o intervalo")
    void palpiteForaDaFaixa() {
        Intervalo faixa = new Intervalo(26, 49);
        assertEquals(faixa, faixa.depoisDe(70, ResultadoPalpite.MAIOR));
        assertEquals(faixa, faixa.depoisDe(10, ResultadoPalpite.MENOR));
    }

    @Test
    @DisplayName("aplica uma lista de palpites em ordem")
    void variosPalpites() {
        Instant t = Instant.parse("2026-10-26T12:00:00Z");
        List<Palpite> palpites = List.of(
                new Palpite(50, ResultadoPalpite.MAIOR, t),
                new Palpite(25, ResultadoPalpite.MENOR, t),
                new Palpite(37, ResultadoPalpite.MAIOR, t));
        assertEquals(new Intervalo(26, 36), cem.depoisDe(palpites));
    }

    @Test
    @DisplayName("meio não estoura com números perto do limite do int")
    void meioSemEstouro() {
        Intervalo enorme = new Intervalo(Integer.MAX_VALUE - 2, Integer.MAX_VALUE);
        assertEquals(Integer.MAX_VALUE - 1, enorme.meio());
    }

    @Test
    @DisplayName("mínimo maior que máximo é inválido")
    void invalido() {
        assertThrows(IllegalArgumentException.class, () -> new Intervalo(10, 9));
    }
}
