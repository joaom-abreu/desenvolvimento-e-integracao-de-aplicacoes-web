package com.dti.drones.model;

/**
 * Estados do drone (veja o diagrama de estados no README):
 *
 * IDLE -> CARREGANDO -> EM_VOO -> ENTREGANDO -> (EM_VOO -> ENTREGANDO)* -> RETORNANDO -> IDLE
 *                                                                          \-> RECARREGANDO -> IDLE
 */
public enum EstadoDrone {
    IDLE("Parado na base"),
    CARREGANDO("Carregando pacotes"),
    EM_VOO("Em voo"),
    ENTREGANDO("Entregando"),
    RETORNANDO("Retornando à base"),
    RECARREGANDO("Recarregando bateria");

    private final String rotulo;

    EstadoDrone(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }

    /** Estados em que o drone está fora da base (no ar ou entregando). */
    public boolean emOperacao() {
        return this == EM_VOO || this == ENTREGANDO || this == RETORNANDO;
    }
}
