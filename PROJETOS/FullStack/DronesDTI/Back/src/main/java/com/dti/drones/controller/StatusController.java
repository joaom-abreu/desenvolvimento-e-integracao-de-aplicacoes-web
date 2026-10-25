package com.dti.drones.controller;

import com.dti.drones.dto.StatusResponse;
import com.dti.drones.service.StatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    /** GET /api/status: { "api": "online", "mongodb": "online" } */
    @GetMapping("/api/status")
    public StatusResponse status() {
        return statusService.verificar();
    }

    /** GET / : página inicial da API, só para não dar 404 ao abrir no navegador. */
    @GetMapping("/")
    public Map<String, String> raiz() {
        return Map.of(
                "projeto", "Simulador de Entregas por Drone - dti digital",
                "status", "/api/status",
                "drones", "/api/drones/status",
                "rotas", "/api/entregas/rota",
                "dashboard", "/api/dashboard");
    }
}
