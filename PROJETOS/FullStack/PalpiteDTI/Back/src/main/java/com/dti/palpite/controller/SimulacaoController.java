package com.dti.palpite.controller;

import com.dti.palpite.dto.SimulacaoResponse;
import com.dti.palpite.service.SimulacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Rotas de apoio à demonstração: partidas jogadas por robôs e limpeza do banco. */
@RestController
@RequestMapping("/api/simulacao")
public class SimulacaoController {

    private final SimulacaoService simulacaoService;

    public SimulacaoController(SimulacaoService simulacaoService) {
        this.simulacaoService = simulacaoService;
    }

    /** POST /api/simulacao/partidas?quantidade=20 -> 201 com quantas foram criadas. */
    @PostMapping("/partidas")
    public ResponseEntity<SimulacaoResponse> gerar(@RequestParam(defaultValue = "20") int quantidade) {
        return ResponseEntity.status(HttpStatus.CREATED).body(simulacaoService.gerarPartidas(quantidade));
    }

    /** POST /api/simulacao/reiniciar?partidas=0 -> apaga tudo (e recria N partidas de exemplo). */
    @PostMapping("/reiniciar")
    public SimulacaoResponse reiniciar(@RequestParam(defaultValue = "0") int partidas) {
        return simulacaoService.reiniciar(partidas);
    }
}
