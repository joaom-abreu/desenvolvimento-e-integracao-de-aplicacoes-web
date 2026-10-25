package com.dti.drones.model;

/**
 * Um ponto da malha 2D da cidade, em quilômetros.
 * É um record: imutável, com equals/hashCode/toString prontos.
 */
public record Ponto(double x, double y) {

    /** Distância em linha reta (Pitágoras) até outro ponto. */
    public double distanciaAte(Ponto outro) {
        return Math.hypot(x - outro.x, y - outro.y);
    }
}
