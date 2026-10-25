package com.dti.drones.model;

/**
 * Uma parada (entrega) dentro de uma viagem, já na ordem calculada pelo
 * algoritmo do caixeiro viajante.
 *
 * @param ordem         1 = primeira entrega da viagem
 * @param kmAcumulado   quantos km o drone voou desde a base até chegar aqui
 * @param minutoChegada minuto simulado (contado do início da viagem) em que o drone chega
 * @param minutoEntrega minuto simulado em que o pacote é entregue (chegada + tempo de entrega)
 */
public record Parada(
        String pedidoId,
        String cliente,
        int ordem,
        double x,
        double y,
        double pesoKg,
        Prioridade prioridade,
        double kmAcumulado,
        double minutoChegada,
        double minutoEntrega) {

    public Ponto ponto() {
        return new Ponto(x, y);
    }
}
