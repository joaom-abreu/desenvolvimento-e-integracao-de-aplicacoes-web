package com.dti.palpite.jogo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("SorteadorAleatorio")
class SorteadorAleatorioTest {

    @Test
    @DisplayName("sorteia só dentro de 1 a 100 e consegue sortear as duas pontas")
    void dentroDoIntervaloComAsPontas() {
        Sorteador sorteador = new SorteadorAleatorio(new SecureRandom());
        Intervalo cem = new Intervalo(1, 100);
        boolean saiu1 = false;
        boolean saiu100 = false;
        for (int i = 0; i < 20_000; i++) {
            int n = sorteador.sortear(cem);
            assertTrue(cem.contem(n), "sorteou " + n);
            saiu1 |= n == 1;
            saiu100 |= n == 100;
        }
        // a chance de não sair o 1 em 20 mil sorteios é (99/100)^20000: praticamente zero
        assertTrue(saiu1 && saiu100, "as pontas (1 e 100) também precisam ser sorteáveis");
    }
}
