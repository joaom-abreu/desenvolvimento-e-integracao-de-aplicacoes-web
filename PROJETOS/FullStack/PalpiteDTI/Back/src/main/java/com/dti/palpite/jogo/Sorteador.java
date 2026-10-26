package com.dti.palpite.jogo;

/**
 * Quem escolhe o número secreto (padrão Strategy).
 * Produção: SorteadorAleatorio. Testes: uma lambda que devolve um número fixo,
 * ex.: {@code Sorteador viciado = intervalo -> 42;}
 */
@FunctionalInterface
public interface Sorteador {

    int sortear(Intervalo intervalo);
}
