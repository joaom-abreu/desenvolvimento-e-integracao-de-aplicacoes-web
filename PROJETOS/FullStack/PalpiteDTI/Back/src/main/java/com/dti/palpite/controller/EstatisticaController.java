package com.dti.palpite.controller;

import com.dti.palpite.dto.EstatisticasResponse;
import com.dti.palpite.service.EstatisticaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EstatisticaController {

    private final EstatisticaService estatisticaService;

    public EstatisticaController(EstatisticaService estatisticaService) {
        this.estatisticaService = estatisticaService;
    }

    /** GET /api/estatisticas -> indicadores e dados dos gráficos. */
    @GetMapping("/api/estatisticas")
    public EstatisticasResponse estatisticas() {
        return estatisticaService.resumo();
    }
}
