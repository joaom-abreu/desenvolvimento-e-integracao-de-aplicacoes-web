package com.dti.drones.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Uma viagem (voo) de um drone: sai da base, entrega N pacotes e volta.
 * Guarda a rota calculada e a linha do tempo de estados (fases).
 */
@Document(collection = "viagens")
public class Viagem {

    @Id
    private String id;
    private String droneId;
    private String droneNome;
    private StatusViagem status = StatusViagem.EM_ANDAMENTO;

    /** Momento real em que a viagem começou (a duração é convertida pelo fator de tempo). */
    private Instant inicio;
    private Instant fim;

    private double duracaoMin;
    private double distanciaKm;
    private double pesoKg;
    private double capacidadeKg;
    private double bateriaNaPartida;
    private double consumoPorKm;
    /** EXATO ou VIZINHO_MAIS_PROXIMO_2OPT: qual estratégia do caixeiro viajante resolveu a rota. */
    private String algoritmo;

    private List<String> pedidoIds = new ArrayList<>();
    private List<Parada> paradas = new ArrayList<>();
    private List<Ponto> caminho = new ArrayList<>();
    private List<Fase> fases = new ArrayList<>();

    public double ocupacaoPercentual() {
        return capacidadeKg == 0 ? 0 : pesoKg / capacidadeKg * 100.0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDroneId() { return droneId; }
    public void setDroneId(String droneId) { this.droneId = droneId; }
    public String getDroneNome() { return droneNome; }
    public void setDroneNome(String droneNome) { this.droneNome = droneNome; }
    public StatusViagem getStatus() { return status; }
    public void setStatus(StatusViagem status) { this.status = status; }
    public Instant getInicio() { return inicio; }
    public void setInicio(Instant inicio) { this.inicio = inicio; }
    public Instant getFim() { return fim; }
    public void setFim(Instant fim) { this.fim = fim; }
    public double getDuracaoMin() { return duracaoMin; }
    public void setDuracaoMin(double duracaoMin) { this.duracaoMin = duracaoMin; }
    public double getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(double distanciaKm) { this.distanciaKm = distanciaKm; }
    public double getPesoKg() { return pesoKg; }
    public void setPesoKg(double pesoKg) { this.pesoKg = pesoKg; }
    public double getCapacidadeKg() { return capacidadeKg; }
    public void setCapacidadeKg(double capacidadeKg) { this.capacidadeKg = capacidadeKg; }
    public double getBateriaNaPartida() { return bateriaNaPartida; }
    public void setBateriaNaPartida(double bateriaNaPartida) { this.bateriaNaPartida = bateriaNaPartida; }
    public double getConsumoPorKm() { return consumoPorKm; }
    public void setConsumoPorKm(double consumoPorKm) { this.consumoPorKm = consumoPorKm; }
    public String getAlgoritmo() { return algoritmo; }
    public void setAlgoritmo(String algoritmo) { this.algoritmo = algoritmo; }
    public List<String> getPedidoIds() { return pedidoIds; }
    public void setPedidoIds(List<String> pedidoIds) { this.pedidoIds = pedidoIds; }
    public List<Parada> getParadas() { return paradas; }
    public void setParadas(List<Parada> paradas) { this.paradas = paradas; }
    public List<Ponto> getCaminho() { return caminho; }
    public void setCaminho(List<Ponto> caminho) { this.caminho = caminho; }
    public List<Fase> getFases() { return fases; }
    public void setFases(List<Fase> fases) { this.fases = fases; }
}
