package com.dti.drones.dto;

/** Situação de um drone (GET /api/drones/status). */
public record DroneResponse(
        String id,
        String nome,
        double capacidadeKg,
        double alcanceKm,
        double velocidadeKmh,
        double bateria,
        String estado,
        String estadoRotulo,
        double x,
        double y,
        String viagemAtualId,
        double cargaKg,
        int pacotes,
        double progressoPercentual,
        String proximaParada,
        int entregasRealizadas,
        int viagensRealizadas,
        double distanciaTotalKm,
        double pesoTotalEntregueKg,
        double tempoVooTotalMin,
        double entregasPorKm) {
}
