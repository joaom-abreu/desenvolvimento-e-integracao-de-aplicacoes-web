package com.dti.drones.dto;

/** Um item da fila de entregas, já na ordem em que será atendido. */
public record FilaItemResponse(int posicao, int nivelEfetivo, String prioridadeEfetiva, double esperaMin,
                               PedidoResponse pedido) {
}
