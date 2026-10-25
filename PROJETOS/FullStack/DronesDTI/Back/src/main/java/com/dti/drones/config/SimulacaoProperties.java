package com.dti.drones.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Parâmetros da simulação (app.simulacao.*). Os valores abaixo são os padrões. */
@ConfigurationProperties(prefix = "app.simulacao")
public class SimulacaoProperties {

    /** Minutos simulados por minuto real. 60 = 1 segundo real vale 1 minuto simulado. */
    private double fatorTempo = 60;
    /** De quanto em quanto tempo (ms reais) o relógio da simulação avança. */
    private long intervaloMs = 1000;
    /** Se true, drones parados recebem viagens sozinhos a cada tick. */
    private boolean despachoAutomatico = true;
    private double tempoCarregamentoMin = 2;
    private double tempoEntregaMin = 1;
    /** Abaixo deste % de bateria o drone vai recarregar ao voltar. */
    private double limiarRecarga = 30;
    /** Quantos % de bateria a estação de recarga devolve por minuto simulado. */
    private double recargaPorMinuto = 5;
    /** A cada N minutos de espera o pedido sobe um nível de prioridade (anti-inanição). */
    private double minutosEnvelhecimento = 30;
    /** Até quantas paradas o caixeiro viajante usa o algoritmo exato. */
    private int limiteExato = 8;
    /** Máximo de entregas por viagem. */
    private int maxParadas = 10;
    /** Cria a frota e as zonas de exemplo quando o banco está vazio. */
    private boolean popularAoIniciar = true;

    public double getFatorTempo() { return fatorTempo; }
    public void setFatorTempo(double fatorTempo) { this.fatorTempo = fatorTempo; }
    public long getIntervaloMs() { return intervaloMs; }
    public void setIntervaloMs(long intervaloMs) { this.intervaloMs = intervaloMs; }
    public boolean isDespachoAutomatico() { return despachoAutomatico; }
    public void setDespachoAutomatico(boolean despachoAutomatico) { this.despachoAutomatico = despachoAutomatico; }
    public double getTempoCarregamentoMin() { return tempoCarregamentoMin; }
    public void setTempoCarregamentoMin(double tempoCarregamentoMin) { this.tempoCarregamentoMin = tempoCarregamentoMin; }
    public double getTempoEntregaMin() { return tempoEntregaMin; }
    public void setTempoEntregaMin(double tempoEntregaMin) { this.tempoEntregaMin = tempoEntregaMin; }
    public double getLimiarRecarga() { return limiarRecarga; }
    public void setLimiarRecarga(double limiarRecarga) { this.limiarRecarga = limiarRecarga; }
    public double getRecargaPorMinuto() { return recargaPorMinuto; }
    public void setRecargaPorMinuto(double recargaPorMinuto) { this.recargaPorMinuto = recargaPorMinuto; }
    public double getMinutosEnvelhecimento() { return minutosEnvelhecimento; }
    public void setMinutosEnvelhecimento(double minutosEnvelhecimento) { this.minutosEnvelhecimento = minutosEnvelhecimento; }
    public int getLimiteExato() { return limiteExato; }
    public void setLimiteExato(int limiteExato) { this.limiteExato = limiteExato; }
    public int getMaxParadas() { return maxParadas; }
    public void setMaxParadas(int maxParadas) { this.maxParadas = maxParadas; }
    public boolean isPopularAoIniciar() { return popularAoIniciar; }
    public void setPopularAoIniciar(boolean popularAoIniciar) { this.popularAoIniciar = popularAoIniciar; }
}
