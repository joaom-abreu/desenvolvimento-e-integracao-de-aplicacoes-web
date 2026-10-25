package com.dti.drones.dto;

import com.dti.drones.model.Ponto;

import java.time.Instant;

/** Configuração e relógio da simulação (o front usa para desenhar o mapa). */
public record SimulacaoStatusResponse(
        Instant agora,
        double fatorTempo,
        boolean despachoAutomatico,
        double larguraKm,
        double alturaKm,
        Ponto base,
        double metrosPorQuadra,
        long drones,
        long pedidosPendentes,
        long viagensEmAndamento) {
}
