package com.dti.palpite.jogo;

import com.dti.palpite.model.Palpite;
import com.dti.palpite.model.ResultadoPalpite;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Narrador (mensagens para a tela)")
class NarradorTest {

    private static final Instant T = Instant.parse("2026-10-26T12:00:00Z");

    @Test
    void maiorEMenor() {
        assertEquals("50 é maior que o número sorteado. Tente um número menor.",
                Narrador.mensagem(new Palpite(50, ResultadoPalpite.MAIOR, T), 1));
        assertEquals("25 é menor que o número sorteado. Tente um número maior.",
                Narrador.mensagem(new Palpite(25, ResultadoPalpite.MENOR, T), 2));
    }

    @Test
    void acertou() {
        assertEquals("Acertou de primeira! O número era 42.",
                Narrador.mensagem(new Palpite(42, ResultadoPalpite.ACERTOU, T), 1));
        assertEquals("Acertou! O número era 42 e você precisou de 5 tentativas.",
                Narrador.mensagem(new Palpite(42, ResultadoPalpite.ACERTOU, T), 5));
    }

    @Test
    @DisplayName("dica só aparece quando o palpite foi desperdiçado")
    void dica() {
        Intervalo faixa = new Intervalo(26, 49);
        assertTrue(Narrador.dica(30, faixa).isEmpty());
        assertEquals("Esse palpite não ajudou: pelas respostas anteriores, o número está entre 26 e 49.",
                Narrador.dica(70, faixa).orElseThrow());
    }
}
