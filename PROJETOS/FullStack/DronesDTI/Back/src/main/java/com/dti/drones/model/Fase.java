package com.dti.drones.model;

/**
 * Um trecho da linha do tempo de uma viagem.
 * Ex.: EM_VOO do minuto 2,0 ao 7,5, voando do km 0 ao km 5,5 do caminho.
 *
 * @param ordemParada qual parada esta fase atende (null para CARREGANDO e RETORNANDO)
 */
public record Fase(
        EstadoDrone estado,
        double inicioMin,
        double fimMin,
        double kmInicio,
        double kmFim,
        Integer ordemParada) {

    public double duracaoMin() {
        return fimMin - inicioMin;
    }
}
