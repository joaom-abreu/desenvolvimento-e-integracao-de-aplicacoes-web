package com.dti.drones.config;

import com.dti.drones.model.Ponto;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** A malha 2D da cidade (app.cidade.*), em quilômetros. */
@ConfigurationProperties(prefix = "app.cidade")
public class CidadeProperties {

    private double larguraKm = 20;
    private double alturaKm = 20;
    private double baseX = 10;
    private double baseY = 10;
    private double metrosPorQuadra = 100;

    public Ponto base() {
        return new Ponto(baseX, baseY);
    }

    /** O ponto está dentro dos limites da cidade? */
    public boolean dentroDaCidade(double x, double y) {
        return x >= 0 && y >= 0 && x <= larguraKm && y <= alturaKm;
    }

    public double getLarguraKm() { return larguraKm; }
    public void setLarguraKm(double larguraKm) { this.larguraKm = larguraKm; }
    public double getAlturaKm() { return alturaKm; }
    public void setAlturaKm(double alturaKm) { this.alturaKm = alturaKm; }
    public double getBaseX() { return baseX; }
    public void setBaseX(double baseX) { this.baseX = baseX; }
    public double getBaseY() { return baseY; }
    public void setBaseY(double baseY) { this.baseY = baseY; }
    public double getMetrosPorQuadra() { return metrosPorQuadra; }
    public void setMetrosPorQuadra(double metrosPorQuadra) { this.metrosPorQuadra = metrosPorQuadra; }
}
