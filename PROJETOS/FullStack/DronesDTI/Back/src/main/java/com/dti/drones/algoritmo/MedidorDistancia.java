package com.dti.drones.algoritmo;

import com.dti.drones.model.Ponto;

/**
 * "Como medir a distância entre dois pontos?"
 *
 * Sem obstáculos é a linha reta. Com zonas de exclusão aérea é o menor
 * desvio (MapaAereo::distancia). O caixeiro viajante não precisa saber qual
 * dos dois está usando: ele só recebe um MedidorDistancia.
 */
@FunctionalInterface
public interface MedidorDistancia {

    double distancia(Ponto a, Ponto b);

    MedidorDistancia LINHA_RETA = Ponto::distanciaAte;
}
