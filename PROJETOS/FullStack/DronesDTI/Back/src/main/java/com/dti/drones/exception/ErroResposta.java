package com.dti.drones.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Corpo JSON de todo erro da API. Ex.:
 * { "status": 422, "erro": "Unprocessable Entity",
 *   "mensagem": "O pacote de 12 kg excede a capacidade máxima da frota (10 kg).",
 *   "caminho": "/api/pedidos", "timestamp": "...", "campos": {} }
 */
public record ErroResposta(int status, String erro, String mensagem, String caminho, Instant timestamp,
                           Map<String, String> campos) {
}
