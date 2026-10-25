package com.dti.drones.model;

import java.text.Normalizer;

/** Prioridade da entrega. O "nivel" é usado para ordenar a fila (3 = mais urgente). */
public enum Prioridade {
    BAIXA(1, "Baixa"),
    MEDIA(2, "Média"),
    ALTA(3, "Alta");

    private final int nivel;
    private final String rotulo;

    Prioridade(int nivel, String rotulo) {
        this.nivel = nivel;
        this.rotulo = rotulo;
    }

    public int getNivel() {
        return nivel;
    }

    public String getRotulo() {
        return rotulo;
    }

    /**
     * Converte o texto vindo do front ("alta", "Média", "MEDIA"...) para o enum.
     * Ignora maiúsculas/minúsculas e acentos.
     */
    public static Prioridade de(String texto) {
        if (texto == null) {
            throw new IllegalArgumentException("Informe a prioridade: baixa, media ou alta.");
        }
        String normalizado = Normalizer.normalize(texto.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase();
        for (Prioridade p : values()) {
            if (p.name().equals(normalizado)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Prioridade \"" + texto + "\" inválida. Use baixa, media ou alta.");
    }

    /** Converte um nível (1 a 3) de volta para o enum, limitando aos extremos. */
    public static Prioridade doNivel(int nivel) {
        if (nivel >= 3) return ALTA;
        if (nivel == 2) return MEDIA;
        return BAIXA;
    }
}
