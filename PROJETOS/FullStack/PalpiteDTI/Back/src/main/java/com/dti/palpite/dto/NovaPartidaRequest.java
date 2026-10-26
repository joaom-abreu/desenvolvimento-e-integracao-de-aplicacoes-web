package com.dti.palpite.dto;

import jakarta.validation.constraints.Size;

/**
 * Corpo (opcional) do POST /api/partidas. Ex.: { "jogador": "Ana" }
 * Sem nome, o jogador entra no ranking como "Anônimo".
 */
public record NovaPartidaRequest(
        @Size(max = 30, message = "O nome pode ter no máximo 30 caracteres.")
        String jogador) {
}
