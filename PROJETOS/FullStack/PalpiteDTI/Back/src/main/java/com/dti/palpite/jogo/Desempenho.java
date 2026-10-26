package com.dti.palpite.jogo;

/**
 * Quantas tentativas uma estratégia perfeita precisa e como classificar o jogador.
 *
 * Com busca binária (sempre chutar o meio), cada resposta corta o intervalo pela metade.
 * Para N números, o pior caso é floor(log2 N) + 1 tentativas:
 *   N = 100 -> 2^6 = 64 <= 100 < 128 = 2^7 -> 7 tentativas.
 * Ou seja: jogando certo, ninguém precisa de mais de 7 palpites entre 1 e 100.
 */
public final class Desempenho {

    /** Até quantas tentativas além do ideal ainda é "Bom". */
    static final int FOLGA_BOM = 3;

    private Desempenho() {
    }

    /** floor(log2 N) + 1, calculado com bits: 32 menos os zeros à esquerda de N. */
    public static int tentativasIdeais(Intervalo intervalo) {
        int n = intervalo.tamanho();
        return Integer.SIZE - Integer.numberOfLeadingZeros(n);
    }

    public static Classificacao classificar(int tentativas, int tentativasIdeais) {
        if (tentativas <= 0) {
            throw new IllegalArgumentException("Uma partida vencida tem pelo menos 1 tentativa.");
        }
        if (tentativas == 1) {
            return Classificacao.DE_PRIMEIRA;
        }
        if (tentativas <= tentativasIdeais) {
            return Classificacao.EXCELENTE;
        }
        if (tentativas <= tentativasIdeais + FOLGA_BOM) {
            return Classificacao.BOM;
        }
        return Classificacao.PODE_MELHORAR;
    }
}
