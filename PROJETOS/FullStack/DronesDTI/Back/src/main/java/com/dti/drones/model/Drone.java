package com.dti.drones.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Um drone da frota. Fica na coleção "drones".
 *
 * Regra do case: cada drone suporta até X kg (capacidadeKg) e
 * voa até Y km por carga de bateria (alcanceKm).
 */
@Document(collection = "drones")
public class Drone {

    @Id
    private String id;
    private String nome;
    private double capacidadeKg;
    private double alcanceKm;
    private double velocidadeKmh;

    /** Bateria de 0 a 100 (%). 100% = consegue voar alcanceKm. */
    private double bateria = 100;
    private EstadoDrone estado = EstadoDrone.IDLE;
    private double x;
    private double y;
    private String viagemAtualId;
    private Instant recargaAte;

    // Estatísticas (alimentam o dashboard)
    private int entregasRealizadas;
    private int viagensRealizadas;
    private double distanciaTotalKm;
    private double pesoTotalEntregueKg;
    private double tempoVooTotalMin;

    public Drone() {
    }

    public Drone(String nome, double capacidadeKg, double alcanceKm, double velocidadeKmh, Ponto base) {
        this.nome = nome;
        this.capacidadeKg = capacidadeKg;
        this.alcanceKm = alcanceKm;
        this.velocidadeKmh = velocidadeKmh;
        this.x = base.x();
        this.y = base.y();
    }

    /** Quantos km o drone ainda consegue voar com a bateria atual. */
    public double alcanceDisponivelKm() {
        return alcanceKm * bateria / 100.0;
    }

    /** Quantos % de bateria o drone gasta por km voado. */
    public double consumoPorKm() {
        return 100.0 / alcanceKm;
    }

    public Ponto ponto() {
        return new Ponto(x, y);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public double getCapacidadeKg() { return capacidadeKg; }
    public void setCapacidadeKg(double capacidadeKg) { this.capacidadeKg = capacidadeKg; }
    public double getAlcanceKm() { return alcanceKm; }
    public void setAlcanceKm(double alcanceKm) { this.alcanceKm = alcanceKm; }
    public double getVelocidadeKmh() { return velocidadeKmh; }
    public void setVelocidadeKmh(double velocidadeKmh) { this.velocidadeKmh = velocidadeKmh; }
    public double getBateria() { return bateria; }
    public void setBateria(double bateria) { this.bateria = bateria; }
    public EstadoDrone getEstado() { return estado; }
    public void setEstado(EstadoDrone estado) { this.estado = estado; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public String getViagemAtualId() { return viagemAtualId; }
    public void setViagemAtualId(String viagemAtualId) { this.viagemAtualId = viagemAtualId; }
    public Instant getRecargaAte() { return recargaAte; }
    public void setRecargaAte(Instant recargaAte) { this.recargaAte = recargaAte; }
    public int getEntregasRealizadas() { return entregasRealizadas; }
    public void setEntregasRealizadas(int entregasRealizadas) { this.entregasRealizadas = entregasRealizadas; }
    public int getViagensRealizadas() { return viagensRealizadas; }
    public void setViagensRealizadas(int viagensRealizadas) { this.viagensRealizadas = viagensRealizadas; }
    public double getDistanciaTotalKm() { return distanciaTotalKm; }
    public void setDistanciaTotalKm(double distanciaTotalKm) { this.distanciaTotalKm = distanciaTotalKm; }
    public double getPesoTotalEntregueKg() { return pesoTotalEntregueKg; }
    public void setPesoTotalEntregueKg(double pesoTotalEntregueKg) { this.pesoTotalEntregueKg = pesoTotalEntregueKg; }
    public double getTempoVooTotalMin() { return tempoVooTotalMin; }
    public void setTempoVooTotalMin(double tempoVooTotalMin) { this.tempoVooTotalMin = tempoVooTotalMin; }
}
