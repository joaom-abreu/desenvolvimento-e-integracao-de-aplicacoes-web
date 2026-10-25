package com.dti.drones.dto;

/** Feedback para o cliente: "Seu pacote está a 2 quadras de distância". */
public record RastreioResponse(
        String pedidoId,
        String status,
        String mensagem,
        Double distanciaKm,
        Integer quadras,
        Double previsaoMin,
        String droneNome,
        Double droneX,
        Double droneY) {
}
