package com.dti.drones.dto;

import com.dti.drones.algoritmo.LinhaDoTempo;
import com.dti.drones.model.Fase;
import com.dti.drones.model.Parada;
import com.dti.drones.model.Ponto;
import com.dti.drones.model.Viagem;

import java.time.Instant;
import java.util.List;

/**
 * Uma viagem com a rota completa (para desenhar no mapa).
 * status: EM_ANDAMENTO, CONCLUIDA ou PREVIA (planejamento que ainda não saiu da base).
 */
public record ViagemResponse(
        String id,
        String droneId,
        String droneNome,
        String status,
        Instant inicio,
        Instant fim,
        double duracaoMin,
        double distanciaKm,
        double pesoKg,
        double capacidadeKg,
        double ocupacaoPercentual,
        String algoritmo,
        List<Parada> paradas,
        List<Ponto> caminho,
        List<Fase> fases,
        double progressoMin,
        String estadoAtual) {

    public static ViagemResponse de(Viagem v, double progressoMin, String estadoAtual) {
        return new ViagemResponse(v.getId(), v.getDroneId(), v.getDroneNome(), v.getStatus().name(),
                v.getInicio(), v.getFim(), Numeros.r1(v.getDuracaoMin()), Numeros.r2(v.getDistanciaKm()),
                Numeros.r2(v.getPesoKg()), v.getCapacidadeKg(), Numeros.r1(v.ocupacaoPercentual()),
                v.getAlgoritmo(), v.getParadas(), v.getCaminho(), v.getFases(),
                Numeros.r1(progressoMin), estadoAtual);
    }

    /** Viagem planejada (prévia), ainda sem id e sem horário. */
    public static ViagemResponse previa(String droneId, String droneNome, double capacidadeKg, double pesoKg,
                                        String algoritmo, LinhaDoTempo linha) {
        double ocupacao = capacidadeKg == 0 ? 0 : pesoKg / capacidadeKg * 100.0;
        return new ViagemResponse(null, droneId, droneNome, "PREVIA", null, null,
                Numeros.r1(linha.duracaoMin()), Numeros.r2(linha.distanciaKm()), Numeros.r2(pesoKg), capacidadeKg,
                Numeros.r1(ocupacao), algoritmo, linha.paradas(), linha.caminho(), linha.fases(), 0, "IDLE");
    }
}
