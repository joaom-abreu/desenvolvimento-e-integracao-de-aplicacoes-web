package com.dti.palpite.jogo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Desempenho (tentativas ideais e classificação)")
class DesempenhoTest {

    @ParameterizedTest(name = "[{0}, {1}] -> {2} tentativas no pior caso")
    @CsvSource({
            "1, 1, 1",
            "1, 2, 2",
            "1, 3, 2",
            "1, 7, 3",
            "1, 8, 4",
            "1, 100, 7",
            "1, 127, 7",
            "1, 128, 8",
            "1, 1000, 10"
    })
    void tentativasIdeais(int minimo, int maximo, int esperado) {
        assertEquals(esperado, Desempenho.tentativasIdeais(new Intervalo(minimo, maximo)));
    }

    @Test
    @DisplayName("classifica pela distância até as 7 tentativas da busca binária")
    void classificar() {
        assertEquals(Classificacao.DE_PRIMEIRA, Desempenho.classificar(1, 7));
        assertEquals(Classificacao.EXCELENTE, Desempenho.classificar(2, 7));
        assertEquals(Classificacao.EXCELENTE, Desempenho.classificar(7, 7));
        assertEquals(Classificacao.BOM, Desempenho.classificar(8, 7));
        assertEquals(Classificacao.BOM, Desempenho.classificar(10, 7));
        assertEquals(Classificacao.PODE_MELHORAR, Desempenho.classificar(11, 7));
    }

    @Test
    @DisplayName("zero tentativas não é uma vitória")
    void zeroTentativas() {
        assertThrows(IllegalArgumentException.class, () -> Desempenho.classificar(0, 7));
    }
}
