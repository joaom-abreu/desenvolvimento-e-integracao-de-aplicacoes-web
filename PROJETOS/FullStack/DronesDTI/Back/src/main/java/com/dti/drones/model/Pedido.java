package com.dti.drones.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Um pedido de entrega. Fica na coleção "pedidos" do MongoDB. */
@Document(collection = "pedidos")
public class Pedido {

    @Id
    private String id;
    private String cliente;
    private double x;
    private double y;
    private double pesoKg;
    private Prioridade prioridade;
    private StatusPedido status = StatusPedido.PENDENTE;

    private Instant criadoEm;
    private Instant alocadoEm;
    private Instant saiuParaEntregaEm;
    private Instant entregueEm;

    private String droneId;
    private String droneNome;
    private String viagemId;

    public Pedido() {
    }

    public Pedido(String cliente, double x, double y, double pesoKg, Prioridade prioridade, Instant criadoEm) {
        this.cliente = cliente;
        this.x = x;
        this.y = y;
        this.pesoKg = pesoKg;
        this.prioridade = prioridade;
        this.criadoEm = criadoEm;
        this.status = StatusPedido.PENDENTE;
    }

    public Ponto ponto() {
        return new Ponto(x, y);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public double getPesoKg() { return pesoKg; }
    public void setPesoKg(double pesoKg) { this.pesoKg = pesoKg; }
    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }
    public StatusPedido getStatus() { return status; }
    public void setStatus(StatusPedido status) { this.status = status; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getAlocadoEm() { return alocadoEm; }
    public void setAlocadoEm(Instant alocadoEm) { this.alocadoEm = alocadoEm; }
    public Instant getSaiuParaEntregaEm() { return saiuParaEntregaEm; }
    public void setSaiuParaEntregaEm(Instant saiuParaEntregaEm) { this.saiuParaEntregaEm = saiuParaEntregaEm; }
    public Instant getEntregueEm() { return entregueEm; }
    public void setEntregueEm(Instant entregueEm) { this.entregueEm = entregueEm; }
    public String getDroneId() { return droneId; }
    public void setDroneId(String droneId) { this.droneId = droneId; }
    public String getDroneNome() { return droneNome; }
    public void setDroneNome(String droneNome) { this.droneNome = droneNome; }
    public String getViagemId() { return viagemId; }
    public void setViagemId(String viagemId) { this.viagemId = viagemId; }
}
