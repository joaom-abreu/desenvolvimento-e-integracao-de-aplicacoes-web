package com.dti.drones.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Zona de exclusão aérea (obstáculo): um retângulo onde os drones não podem voar.
 * Ex.: aeroporto, hospital com heliponto, estádio em dia de jogo.
 */
@Document(collection = "zonas")
public class ZonaExclusao {

    @Id
    private String id;
    private String nome;
    private double xMin;
    private double yMin;
    private double xMax;
    private double yMax;

    public ZonaExclusao() {
    }

    public ZonaExclusao(String nome, double xMin, double yMin, double xMax, double yMax) {
        this.nome = nome;
        this.xMin = Math.min(xMin, xMax);
        this.yMin = Math.min(yMin, yMax);
        this.xMax = Math.max(xMin, xMax);
        this.yMax = Math.max(yMin, yMax);
    }

    /** O ponto está dentro da zona (ou exatamente na borda)? */
    public boolean contem(Ponto p) {
        return p.x() >= xMin && p.x() <= xMax && p.y() >= yMin && p.y() <= yMax;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public double getXMin() { return xMin; }
    public void setXMin(double xMin) { this.xMin = xMin; }
    public double getYMin() { return yMin; }
    public void setYMin(double yMin) { this.yMin = yMin; }
    public double getXMax() { return xMax; }
    public void setXMax(double xMax) { this.xMax = xMax; }
    public double getYMax() { return yMax; }
    public void setYMax(double yMax) { this.yMax = yMax; }
}
