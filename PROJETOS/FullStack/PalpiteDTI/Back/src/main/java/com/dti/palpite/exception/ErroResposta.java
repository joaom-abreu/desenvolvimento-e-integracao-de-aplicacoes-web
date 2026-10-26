package com.dti.palpite.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Corpo JSON de todo erro da API. Ex.:
 * { "status": 422, "erro": "Unprocessable Entity",
 *   "mensagem": "Escolha um número entre 1 e 100. Você enviou 150.",
 *   "caminho": "/api/partidas/abc/palpites", "timestamp": "...", "campos": {} }
 */
public record ErroResposta(int status, String erro, String mensagem, String caminho, Instant timestamp,
                           Map<String, String> campos) {
}
