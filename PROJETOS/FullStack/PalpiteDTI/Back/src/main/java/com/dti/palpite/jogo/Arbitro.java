package com.dti.palpite.jogo;

import com.dti.palpite.exception.ConflitoException;
import com.dti.palpite.exception.RegraNegocioException;
import com.dti.palpite.model.Palpite;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.ResultadoPalpite;
import com.dti.palpite.model.StatusPartida;

import java.time.Instant;

/**
 * Aplica as regras do jogo numa partida. Java puro: não conhece Spring, HTTP nem MongoDB,
 * por isso é testado sem subir nada (ArbitroTest).
 *
 * Quem usa: PartidaService (jogador de verdade) e SimulacaoService (robôs). Os dois
 * passam pelo mesmo árbitro, então a regra é uma só.
 */
public class Arbitro {

    /**
     * Registra um palpite. Ordem das verificações:
     * 1. a partida ainda está em andamento? (senão 409)
     * 2. o número está entre o mínimo e o máximo? (senão 422)
     * 3. o número ainda não foi tentado? (senão 422, e não conta como tentativa)
     */
    public Lance registrar(Partida partida, int numero, Instant momento) {
        if (!partida.emAndamento()) {
            throw new ConflitoException("Esta partida já terminou ("
                    + partida.getStatus().rotulo().toLowerCase() + "). Comece uma nova rodada para continuar jogando.");
        }
        Intervalo inicial = partida.intervaloInicial();
        if (!inicial.contem(numero)) {
            throw new RegraNegocioException("Escolha um número entre " + inicial.minimo() + " e " + inicial.maximo()
                    + ". Você enviou " + numero + ".");
        }
        if (partida.jaTentou(numero)) {
            throw new RegraNegocioException("Você já tentou o número " + numero + " nesta partida. Escolha outro.");
        }

        Intervalo antes = partida.intervaloAtual();
        ResultadoPalpite resultado = Juiz.julgar(numero, partida.getNumeroSecreto());
        Palpite palpite = new Palpite(numero, resultado, momento);
        partida.adicionar(palpite);

        if (resultado == ResultadoPalpite.ACERTOU) {
            partida.encerrar(StatusPartida.VENCIDA, momento);
        }

        int tentativa = partida.getTentativas();
        return new Lance(palpite, tentativa, Narrador.mensagem(palpite, tentativa),
                Narrador.dica(numero, antes).orElse(null));
    }

    /** O jogador desistiu: a partida termina e o número pode ser revelado. */
    public void desistir(Partida partida, Instant momento) {
        if (!partida.emAndamento()) {
            throw new ConflitoException("Esta partida já terminou. Não há do que desistir.");
        }
        partida.encerrar(StatusPartida.ABANDONADA, momento);
    }
}
