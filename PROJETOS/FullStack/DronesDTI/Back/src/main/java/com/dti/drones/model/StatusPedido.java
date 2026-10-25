package com.dti.drones.model;

/** Ciclo de vida de um pedido. */
public enum StatusPedido {
    /** Na fila, esperando um drone. */
    PENDENTE,
    /** Já tem drone e viagem: o pacote está sendo carregado na base. */
    ALOCADO,
    /** O drone decolou com o pacote. */
    EM_ROTA,
    /** Pacote entregue ao cliente. */
    ENTREGUE,
    /** Cancelado pelo cliente enquanto ainda estava na fila. */
    CANCELADO
}
