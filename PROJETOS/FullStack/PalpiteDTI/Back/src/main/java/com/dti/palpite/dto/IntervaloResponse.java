package com.dti.palpite.dto;

import com.dti.palpite.jogo.Intervalo;

/** Faixa onde o número ainda pode estar, ex.: { "minimo": 26, "maximo": 49, "tamanho": 24 }. */
public record IntervaloResponse(int minimo, int maximo, int tamanho) {

    public static IntervaloResponse de(Intervalo intervalo) {
        return new IntervaloResponse(intervalo.minimo(), intervalo.maximo(), intervalo.tamanho());
    }
}
