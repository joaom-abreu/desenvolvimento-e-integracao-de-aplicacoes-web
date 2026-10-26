package com.dti.palpite.config;

import com.dti.palpite.jogo.Intervalo;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Regras configuráveis do jogo (app.jogo.* no application.properties).
 *
 * O PDF pede números de 1 a 100. Deixar os limites aqui, e não espalhados
 * pelo código, garante que nenhuma regra dependa de um "100" escrito à mão.
 */
@ConfigurationProperties(prefix = "app.jogo")
public class JogoProperties {

    private int minimo = 1;
    private int maximo = 100;
    private int tamanhoRanking = 10;
    private boolean popularAoIniciar = true;
    private int partidasIniciais = 30;

    /** O intervalo inicial de toda partida nova, ex.: [1, 100]. */
    public Intervalo intervaloInicial() {
        return new Intervalo(minimo, maximo);
    }

    public int getMinimo() { return minimo; }
    public void setMinimo(int minimo) { this.minimo = minimo; }
    public int getMaximo() { return maximo; }
    public void setMaximo(int maximo) { this.maximo = maximo; }
    public int getTamanhoRanking() { return tamanhoRanking; }
    public void setTamanhoRanking(int tamanhoRanking) { this.tamanhoRanking = tamanhoRanking; }
    public boolean isPopularAoIniciar() { return popularAoIniciar; }
    public void setPopularAoIniciar(boolean popularAoIniciar) { this.popularAoIniciar = popularAoIniciar; }
    public int getPartidasIniciais() { return partidasIniciais; }
    public void setPartidasIniciais(int partidasIniciais) { this.partidasIniciais = partidasIniciais; }
}
