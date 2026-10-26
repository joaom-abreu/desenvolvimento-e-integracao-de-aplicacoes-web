package com.dti.palpite.jogo;

import com.dti.palpite.model.Palpite;
import com.dti.palpite.model.ResultadoPalpite;

import java.util.List;

/**
 * Faixa fechada [minimo, maximo] onde o número sorteado ainda pode estar.
 *
 * Começa em [1, 100] e encolhe a cada resposta do juiz:
 *   palpite 50 -> MAIOR  => [1, 49]
 *   palpite 25 -> MENOR  => [26, 49]
 *
 * É a mesma ideia da busca binária: cada resposta descarta um lado.
 */
public record Intervalo(int minimo, int maximo) {

    public Intervalo {
        if (minimo > maximo) {
            throw new IllegalArgumentException("Intervalo inválido: mínimo " + minimo + " maior que máximo " + maximo + ".");
        }
    }

    public boolean contem(int numero) {
        return numero >= minimo && numero <= maximo;
    }

    /** Quantos números cabem no intervalo. [1, 100] tem 100. */
    public int tamanho() {
        return maximo - minimo + 1;
    }

    /**
     * O meio do intervalo, o palpite da busca binária.
     * ">>> 1" (e não "(min + max) / 2") é o jeito clássico de evitar estouro de int
     * quando min + max passa de 2.147.483.647, o famoso bug da busca binária do JDK (2006).
     */
    public int meio() {
        return (minimo + maximo) >>> 1;
    }

    /** O intervalo depois de uma resposta do juiz. */
    public Intervalo depoisDe(int palpite, ResultadoPalpite resultado) {
        return switch (resultado) {
            case MAIOR -> new Intervalo(minimo, Math.max(minimo, Math.min(maximo, palpite - 1)));
            case MENOR -> new Intervalo(Math.min(maximo, Math.max(minimo, palpite + 1)), maximo);
            case ACERTOU -> new Intervalo(palpite, palpite);
        };
    }

    /** O intervalo depois de todos os palpites, na ordem em que foram feitos. */
    public Intervalo depoisDe(List<Palpite> palpites) {
        Intervalo atual = this;
        for (Palpite p : palpites) {
            atual = atual.depoisDe(p.numero(), p.resultado());
        }
        return atual;
    }

    @Override
    public String toString() {
        return "[" + minimo + ", " + maximo + "]";
    }
}
