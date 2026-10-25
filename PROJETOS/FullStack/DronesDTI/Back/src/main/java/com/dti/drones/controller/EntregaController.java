package com.dti.drones.controller;

import com.dti.drones.dto.RotasResponse;
import com.dti.drones.dto.ViagemResponse;
import com.dti.drones.service.EntregaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/entregas")
public class EntregaController {

    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    /** GET /api/entregas/rota: viagens no ar + prévia de como a fila será dividida. */
    @GetMapping("/rota")
    public RotasResponse rotas() {
        return entregaService.rotas();
    }

    /** GET /api/entregas: últimas 50 viagens concluídas. */
    @GetMapping
    public List<ViagemResponse> historico() {
        return entregaService.historico();
    }

    @GetMapping("/{id}")
    public ViagemResponse buscar(@PathVariable String id) {
        return entregaService.buscar(id);
    }
}
