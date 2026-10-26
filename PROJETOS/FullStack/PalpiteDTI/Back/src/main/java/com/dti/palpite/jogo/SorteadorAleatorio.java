package com.dti.palpite.jogo;

import java.util.random.RandomGenerator;

/** Sorteia um número inteiro, com a mesma chance para cada valor do intervalo (inclusive as pontas). */
public class SorteadorAleatorio implements Sorteador {

    private final RandomGenerator random;

    public SorteadorAleatorio(RandomGenerator random) {
        this.random = random;
    }

    @Override
    public int sortear(Intervalo intervalo) {
        // nextInt(origem, limite) exclui o limite, por isso o "+ 1"
        return random.nextInt(intervalo.minimo(), intervalo.maximo() + 1);
    }
}
