package com.dti.drones.controller;

import com.dti.drones.dto.SimulacaoStatusResponse;
import com.dti.drones.service.SimulacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/simulacao")
public class SimulacaoController {

    private final SimulacaoService simulacaoService;

    public SimulacaoController(SimulacaoService simulacaoService) {
        this.simulacaoService = simulacaoService;
    }

    /** Relógio, tamanho da cidade, base e contadores (o front usa para desenhar o mapa). */
    @GetMapping("/status")
    public SimulacaoStatusResponse status() {
        return simulacaoService.status();
    }

    /** Monta viagens agora para os drones parados. */
    @PostMapping("/despachar")
    public Map<String, Integer> despachar() {
        return Map.of("viagensCriadas", simulacaoService.despachar().size());
    }

    /** Gera N pedidos aleatórios válidos (1 a 500). */
    @PostMapping("/pedidos-aleatorios")
    public Map<String, Integer> pedidosAleatorios(@RequestParam(defaultValue = "20") int quantidade) {
        return Map.of("pedidosCriados", simulacaoService.gerarPedidosAleatorios(quantidade).size());
    }

    /** Apaga tudo e recomeça com a frota/zonas de exemplo (+ N pedidos). */
    @PostMapping("/reiniciar")
    public ResponseEntity<Void> reiniciar(@RequestParam(defaultValue = "0") int pedidos) {
        simulacaoService.reiniciar(pedidos);
        return ResponseEntity.noContent().build();
    }
}
