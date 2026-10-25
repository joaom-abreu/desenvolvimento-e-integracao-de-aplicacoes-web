package com.dti.drones.controller;

import com.dti.drones.dto.DashboardResponse;
import com.dti.drones.service.DashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse indicadores() {
        return dashboardService.calcular();
    }

    /** GET /api/dashboard/mapa-ascii: o mapa em texto puro (bom para o terminal: curl). */
    @GetMapping(value = "/mapa-ascii", produces = MediaType.TEXT_PLAIN_VALUE)
    public String mapaAscii() {
        return dashboardService.mapaAscii();
    }

    /** GET /api/dashboard/entregas.csv: baixa as entregas em CSV (Excel, Flourish, Tableau). */
    @GetMapping("/entregas.csv")
    public ResponseEntity<String> csv() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"entregas-DronesDTI.csv\"")
                .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
                .body(dashboardService.csvEntregas());
    }
}
