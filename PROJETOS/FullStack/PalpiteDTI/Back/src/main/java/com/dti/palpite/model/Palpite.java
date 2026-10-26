package com.dti.palpite.model;

import java.time.Instant;

/** Um palpite registrado: o número, o que o juiz respondeu e quando. Fica dentro da Partida. */
public record Palpite(int numero, ResultadoPalpite resultado, Instant momento) {
}
