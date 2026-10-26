package com.dti.palpite.jogo;

import com.dti.palpite.model.ResultadoPalpite;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("Juiz (maior, menor ou acertou)")
class JuizTest {

    @ParameterizedTest(name = "palpite {0} contra sorteado {1} -> {2}")
    @CsvSource({
            "50, 42, MAIOR",
            "43, 42, MAIOR",
            "41, 42, MENOR",
            "1, 100, MENOR",
            "100, 1, MAIOR",
            "42, 42, ACERTOU",
            "1, 1, ACERTOU",
            "100, 100, ACERTOU"
    })
    void julga(int palpite, int sorteado, ResultadoPalpite esperado) {
        assertEquals(esperado, Juiz.julgar(palpite, sorteado));
    }
}
