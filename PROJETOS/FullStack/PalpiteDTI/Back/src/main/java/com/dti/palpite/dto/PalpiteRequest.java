package com.dti.palpite.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Corpo do POST /api/partidas/{id}/palpites. Ex.: { "numero": 42 }
 *
 * Por que BigDecimal e não int? Para conseguir RECUSAR 42.5 com uma mensagem clara (400).
 * Com int, o conversor de JSON poderia truncar 42.5 para 42 sem avisar ninguém.
 * Se o número está entre 1 e 100 é regra do jogo (422), verificada no Arbitro.
 */
public record PalpiteRequest(
        @NotNull(message = "Informe o número do palpite.")
        @Digits(integer = 9, fraction = 0, message = "O palpite precisa ser um número inteiro, sem casas decimais.")
        BigDecimal numero) {

    public int numeroInteiro() {
        return numero.intValueExact();
    }
}
