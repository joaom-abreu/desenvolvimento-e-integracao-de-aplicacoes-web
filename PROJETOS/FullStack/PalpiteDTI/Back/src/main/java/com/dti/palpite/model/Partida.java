package com.dti.palpite.model;

import com.dti.palpite.jogo.Intervalo;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Uma rodada do jogo, guardada na coleção "partidas" do MongoDB.
 *
 * Os palpites ficam DENTRO do documento (lista embutida): uma partida e seus
 * palpites são sempre lidos e gravados juntos, então um documento só resolve,
 * sem segunda coleção nem "join".
 *
 * O numeroSecreto mora só aqui, no servidor. A API nunca o envia enquanto a
 * partida está em andamento (veja PartidaResponse).
 */
@Document("partidas")
@CompoundIndex(name = "ranking", def = "{'status': 1, 'tentativas': 1, 'duracaoSegundos': 1, 'finalizadaEm': 1}")
public class Partida {

    @Id
    private String id;
    private String jogador;
    private int numeroSecreto;
    private int minimo;
    private int maximo;
    private StatusPartida status = StatusPartida.EM_ANDAMENTO;
    private List<Palpite> palpites = new ArrayList<>();
    /** Igual a palpites.size(); fica gravado para o ranking ordenar direto no banco. */
    private int tentativas;
    private Instant iniciadaEm;
    private Instant finalizadaEm;
    private Long duracaoSegundos;
    /** true quando a partida foi jogada por um robô (dados de exemplo). */
    private boolean simulada;

    /**
     * Controle de concorrência otimista: o Spring Data só grava se a versão no banco
     * ainda for a mesma que foi lida. Dois palpites simultâneos na mesma partida:
     * um grava, o outro recebe 409 (GlobalExceptionHandler).
     */
    @Version
    private Long versao;

    /** Usado pelo Spring Data para montar o objeto a partir do documento. */
    public Partida() {
    }

    public Partida(String jogador, int numeroSecreto, Intervalo intervalo, Instant iniciadaEm) {
        if (!intervalo.contem(numeroSecreto)) {
            throw new IllegalArgumentException("O número secreto precisa estar dentro do intervalo " + intervalo + ".");
        }
        this.jogador = jogador;
        this.numeroSecreto = numeroSecreto;
        this.minimo = intervalo.minimo();
        this.maximo = intervalo.maximo();
        this.iniciadaEm = iniciadaEm;
    }

    // ------------------------------------------------------------------ regras simples do agregado

    public boolean emAndamento() {
        return status == StatusPartida.EM_ANDAMENTO;
    }

    public boolean jaTentou(int numero) {
        return palpites.stream().anyMatch(p -> p.numero() == numero);
    }

    /** O intervalo do começo da partida, ex.: [1, 100]. */
    public Intervalo intervaloInicial() {
        return new Intervalo(minimo, maximo);
    }

    /** Onde o número ainda pode estar, considerando as respostas do juiz até agora. */
    public Intervalo intervaloAtual() {
        return intervaloInicial().depoisDe(palpites);
    }

    public void adicionar(Palpite palpite) {
        palpites.add(palpite);
        tentativas = palpites.size();
    }

    public void encerrar(StatusPartida novoStatus, Instant momento) {
        this.status = novoStatus;
        this.finalizadaEm = momento;
        this.duracaoSegundos = Duration.between(iniciadaEm, momento).toSeconds();
    }

    // ------------------------------------------------------------------ getters e setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getJogador() { return jogador; }
    public void setJogador(String jogador) { this.jogador = jogador; }
    public int getNumeroSecreto() { return numeroSecreto; }
    public int getMinimo() { return minimo; }
    public int getMaximo() { return maximo; }
    public StatusPartida getStatus() { return status; }
    public List<Palpite> getPalpites() { return palpites; }
    public int getTentativas() { return tentativas; }
    public Instant getIniciadaEm() { return iniciadaEm; }
    public Instant getFinalizadaEm() { return finalizadaEm; }
    public Long getDuracaoSegundos() { return duracaoSegundos; }
    public boolean isSimulada() { return simulada; }
    public void setSimulada(boolean simulada) { this.simulada = simulada; }
    public Long getVersao() { return versao; }
}
