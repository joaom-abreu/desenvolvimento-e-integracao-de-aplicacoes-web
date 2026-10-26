package com.dti.palpite.jogo;

import com.dti.palpite.model.Palpite;

import java.util.Optional;

/**
 * Transforma a resposta do juiz em frases para a tela.
 * As mensagens nascem no back-end: o front só exibe (uma fonte única de verdade).
 */
public final class Narrador {

    private Narrador() {
    }

    public static String mensagem(Palpite palpite, int tentativas) {
        int n = palpite.numero();
        return switch (palpite.resultado()) {
            case MAIOR -> n + " é maior que o número sorteado. Tente um número menor.";
            case MENOR -> n + " é menor que o número sorteado. Tente um número maior.";
            case ACERTOU -> tentativas == 1
                    ? "Acertou de primeira! O número era " + n + "."
                    : "Acertou! O número era " + n + " e você precisou de " + tentativas + " tentativas.";
        };
    }

    /**
     * Avisa quando o jogador desperdiçou um palpite: chutou fora da faixa que as
     * respostas anteriores já tinham indicado. Ex.: depois de "50 é maior", chutar 70.
     */
    public static Optional<String> dica(int palpite, Intervalo antesDoPalpite) {
        if (antesDoPalpite.contem(palpite)) {
            return Optional.empty();
        }
        return Optional.of("Esse palpite não ajudou: pelas respostas anteriores, o número está entre "
                + antesDoPalpite.minimo() + " e " + antesDoPalpite.maximo() + ".");
    }
}
