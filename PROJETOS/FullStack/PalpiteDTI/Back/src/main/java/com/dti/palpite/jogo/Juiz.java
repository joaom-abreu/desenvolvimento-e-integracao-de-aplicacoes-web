package com.dti.palpite.jogo;

import com.dti.palpite.model.ResultadoPalpite;

/**
 * Compara o palpite com o número sorteado. É a regra central do PDF:
 * "o sistema deverá informar se o número informado é maior ou menor do que o sorteado".
 *
 * Fica no back-end de propósito: o front-end nunca conhece o número sorteado.
 */
public final class Juiz {

    private Juiz() {
    }

    public static ResultadoPalpite julgar(int palpite, int numeroSorteado) {
        if (palpite > numeroSorteado) {
            return ResultadoPalpite.MAIOR;
        }
        if (palpite < numeroSorteado) {
            return ResultadoPalpite.MENOR;
        }
        return ResultadoPalpite.ACERTOU;
    }
}
