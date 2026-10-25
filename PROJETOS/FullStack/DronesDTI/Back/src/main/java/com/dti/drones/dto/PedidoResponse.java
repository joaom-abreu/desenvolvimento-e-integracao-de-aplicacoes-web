package com.dti.drones.dto;

import com.dti.drones.model.Pedido;

import java.time.Instant;

public record PedidoResponse(
        String id,
        String cliente,
        double x,
        double y,
        double pesoKg,
        String prioridade,
        String prioridadeRotulo,
        String status,
        Instant criadoEm,
        Instant alocadoEm,
        Instant saiuParaEntregaEm,
        Instant entregueEm,
        String droneId,
        String droneNome,
        String viagemId,
        Double tempoEntregaMin) {

    /** @param tempoEntregaMin minutos simulados entre o pedido e a entrega (null se não entregue) */
    public static PedidoResponse de(Pedido p, Double tempoEntregaMin) {
        return new PedidoResponse(p.getId(), p.getCliente(), p.getX(), p.getY(), p.getPesoKg(),
                p.getPrioridade().name(), p.getPrioridade().getRotulo(), p.getStatus().name(),
                p.getCriadoEm(), p.getAlocadoEm(), p.getSaiuParaEntregaEm(), p.getEntregueEm(),
                p.getDroneId(), p.getDroneNome(), p.getViagemId(),
                tempoEntregaMin == null ? null : Numeros.r1(tempoEntregaMin));
    }
}
