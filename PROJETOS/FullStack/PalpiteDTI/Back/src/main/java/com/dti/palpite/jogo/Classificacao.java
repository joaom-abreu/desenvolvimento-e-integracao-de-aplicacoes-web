package com.dti.palpite.jogo;

/** Como foi o desempenho numa partida vencida, comparando com a busca binária. */
public enum Classificacao {
    DE_PRIMEIRA("De primeira!"),
    EXCELENTE("Excelente"),
    BOM("Bom"),
    PODE_MELHORAR("Pode melhorar");

    private final String rotulo;

    Classificacao(String rotulo) {
        this.rotulo = rotulo;
    }

    public String rotulo() {
        return rotulo;
    }
}
