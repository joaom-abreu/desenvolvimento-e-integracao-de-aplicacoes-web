package com.dti.palpite.model;

/** Ciclo de vida de uma partida (veja o diagrama de estados no README). */
public enum StatusPartida {
    EM_ANDAMENTO("Em andamento"),
    VENCIDA("Vencida"),
    ABANDONADA("Abandonada");

    private final String rotulo;

    StatusPartida(String rotulo) {
        this.rotulo = rotulo;
    }

    public String rotulo() {
        return rotulo;
    }
}
