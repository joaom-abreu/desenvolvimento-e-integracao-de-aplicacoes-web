package com.dti.drones.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Indicadores do relatório (GET /api/dashboard). Tempos em minutos simulados. */
public record DashboardResponse(
        long entregasRealizadas,
        long pedidosPendentes,
        long pedidosEmAndamento,
        long pedidosCancelados,
        long viagensConcluidas,
        double tempoMedioEntregaMin,
        double tempoMedioViagemMin,
        double distanciaTotalKm,
        double mediaPacotesPorViagem,
        double ocupacaoMediaPercentual,
        DroneRanking droneMaisEficiente,
        List<DroneRanking> ranking,
        Map<String, Long> entregasPorPrioridade,
        Map<String, Double> tempoMedioPorPrioridadeMin,
        List<PontoEntrega> mapaEntregas,
        List<ViagemResumo> ultimasViagens) {

    /** Eficiência = entregas por km voado (quanto mais, melhor). */
    public record DroneRanking(String id, String nome, int entregas, int viagens, double distanciaKm,
                               double pesoKg, double entregasPorKm, double kgPorKm) {
    }

    public record PontoEntrega(double x, double y, String prioridade, double tempoMin) {
    }

    public record ViagemResumo(String id, String droneNome, int pacotes, double distanciaKm,
                               double ocupacaoPercentual, double duracaoMin, String algoritmo, Instant fim) {
    }
}
