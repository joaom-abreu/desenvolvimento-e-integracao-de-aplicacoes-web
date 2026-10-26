package com.dti.palpite.dto;

/** Resposta das rotas de simulação (partidas jogadas por robôs). */
public record SimulacaoResponse(int criadas, String mensagem) {
}
