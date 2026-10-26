package com.dti.palpite.dto;

/**
 * Resposta do POST /api/partidas/{id}/palpites.
 * Ex.: { "palpite": { "numero": 50, "resultado": "MAIOR" ... },
 *        "mensagem": "50 é maior que o número sorteado. Tente um número menor.",
 *        "dica": null, "partida": { ... } }
 */
public record ResultadoPalpiteResponse(PalpiteResponse palpite, String mensagem, String dica, PartidaResponse partida) {
}
