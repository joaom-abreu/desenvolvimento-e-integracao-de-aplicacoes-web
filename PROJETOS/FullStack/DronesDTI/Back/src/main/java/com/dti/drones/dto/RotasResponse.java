package com.dti.drones.dto;

import com.dti.drones.model.Ponto;

import java.util.List;

/**
 * GET /api/entregas/rota
 *
 * @param emAndamento          viagens voando agora
 * @param previa               como a fila atual seria dividida em viagens (sem salvar nada)
 * @param minimoTeoricoViagens limite inferior só pelo peso: ceil(peso total / maior capacidade)
 * @param naoAlocaveis         pedidos que nenhum drone consegue levar hoje
 */
public record RotasResponse(
        Ponto base,
        List<ViagemResponse> emAndamento,
        List<ViagemResponse> previa,
        int pedidosPendentes,
        int viagensPrevistas,
        int minimoTeoricoViagens,
        List<PedidoResponse> naoAlocaveis) {
}
