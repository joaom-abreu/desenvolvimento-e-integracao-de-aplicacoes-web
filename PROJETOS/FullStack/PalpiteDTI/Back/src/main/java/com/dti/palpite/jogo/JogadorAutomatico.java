package com.dti.palpite.jogo;

import java.util.random.RandomGenerator;

/**
 * Um robô que joga. Serve para criar partidas de exemplo (ranking e estatísticas)
 * e, principalmente, para PROVAR nos testes que a busca binária acerta
 * qualquer número de 1 a 100 em no máximo 7 tentativas.
 *
 * Todas as estratégias chutam dentro do intervalo ainda possível, então o robô
 * nunca repete um número nem desperdiça palpite.
 */
public class JogadorAutomatico {

    public enum Estrategia {
        /** Sempre o meio: ótimo no pior caso (7 tentativas para 100 números). */
        BUSCA_BINARIA,
        /** Perto do meio, com um desvio aleatório: parecido com uma pessoa atenta. */
        INTUITIVA,
        /** Qualquer número do intervalo possível. */
        ALEATORIA
    }

    private final Estrategia estrategia;
    private final RandomGenerator random;

    public JogadorAutomatico(Estrategia estrategia, RandomGenerator random) {
        this.estrategia = estrategia;
        this.random = random;
    }

    public Estrategia estrategia() {
        return estrategia;
    }

    public int proximoPalpite(Intervalo possivel) {
        return switch (estrategia) {
            case BUSCA_BINARIA -> possivel.meio();
            case ALEATORIA -> random.nextInt(possivel.minimo(), possivel.maximo() + 1);
            case INTUITIVA -> {
                // escolhe na metade central do intervalo: entre 1/4 e 3/4
                int quarto = possivel.tamanho() / 4;
                int de = possivel.minimo() + quarto;
                int ate = possivel.maximo() - quarto;
                yield random.nextInt(de, ate + 1);
            }
        };
    }
}
