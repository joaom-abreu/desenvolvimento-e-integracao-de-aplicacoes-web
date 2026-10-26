package com.dti.palpite.controller;

import com.dti.palpite.dto.NovaPartidaRequest;
import com.dti.palpite.dto.PalpiteRequest;
import com.dti.palpite.dto.PalpiteResponse;
import com.dti.palpite.dto.PartidaResponse;
import com.dti.palpite.dto.ResultadoPalpiteResponse;
import com.dti.palpite.service.PartidaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Controller = porta de entrada HTTP. Não tem regra de jogo:
 * recebe, valida o formato (@Valid), chama o service e devolve o status certo.
 *
 * Recursos REST:
 *   /api/partidas                      a coleção de partidas
 *   /api/partidas/{id}                 uma partida
 *   /api/partidas/{id}/palpites        os palpites daquela partida
 *   /api/partidas/{id}/desistencia     a desistência (criar = desistir)
 */
@RestController
@RequestMapping("/api/partidas")
public class PartidaController {

    private final PartidaService partidaService;

    public PartidaController(PartidaService partidaService) {
        this.partidaService = partidaService;
    }

    /** POST /api/partidas -> 201 Created + Location: /api/partidas/{id}. O corpo é opcional. */
    @PostMapping
    public ResponseEntity<PartidaResponse> iniciar(@Valid @RequestBody(required = false) NovaPartidaRequest request) {
        PartidaResponse partida = partidaService.iniciar(request);
        return ResponseEntity.created(URI.create("/api/partidas/" + partida.id())).body(partida);
    }

    /** GET /api/partidas/{id} -> 200 (o número secreto só aparece se a partida terminou). */
    @GetMapping("/{id}")
    public PartidaResponse buscar(@PathVariable String id) {
        return partidaService.buscar(id);
    }

    /**
     * POST /api/partidas/{id}/palpites { "numero": 42 }
     * 201 (palpite registrado) · 400 (não é número inteiro) · 404 (partida não existe)
     * 409 (partida já terminou) · 422 (fora de 1 a 100 ou repetido)
     */
    @PostMapping("/{id}/palpites")
    public ResponseEntity<ResultadoPalpiteResponse> palpitar(@PathVariable String id,
                                                             @Valid @RequestBody PalpiteRequest request) {
        ResultadoPalpiteResponse resultado = partidaService.palpitar(id, request);
        URI local = URI.create("/api/partidas/" + id + "/palpites/" + resultado.palpite().ordem());
        return ResponseEntity.created(local).body(resultado);
    }

    /** GET /api/partidas/{id}/palpites -> histórico na ordem em que foram feitos. */
    @GetMapping("/{id}/palpites")
    public List<PalpiteResponse> palpites(@PathVariable String id) {
        return partidaService.palpites(id);
    }

    /** POST /api/partidas/{id}/desistencia -> 200 com a partida encerrada e o número revelado (409 se já terminou). */
    @PostMapping("/{id}/desistencia")
    public PartidaResponse desistir(@PathVariable String id) {
        return partidaService.desistir(id);
    }
}
