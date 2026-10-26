package com.dti.palpite.dto;

import java.time.Instant;

/** GET /api/status: a API e o MongoDB estão de pé? */
public record StatusResponse(String api, String mongodb, String versao, Instant agora) {
}
