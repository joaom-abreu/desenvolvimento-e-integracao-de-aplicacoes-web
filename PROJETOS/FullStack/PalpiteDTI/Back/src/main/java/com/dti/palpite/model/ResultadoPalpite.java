package com.dti.palpite.model;

/**
 * O que o juiz responde sobre um palpite, sempre comparando o PALPITE com o número sorteado:
 * MAIOR = o palpite passou do número (tente menor); MENOR = ficou abaixo (tente maior).
 */
public enum ResultadoPalpite {
    MAIOR("Maior que o sorteado"),
    MENOR("Menor que o sorteado"),
    ACERTOU("Acertou");

    private final String rotulo;

    ResultadoPalpite(String rotulo) {
        this.rotulo = rotulo;
    }

    public String rotulo() {
        return rotulo;
    }
}
