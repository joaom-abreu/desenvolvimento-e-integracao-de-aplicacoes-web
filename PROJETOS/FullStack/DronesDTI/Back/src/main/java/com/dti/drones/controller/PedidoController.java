package com.dti.drones.controller;

import com.dti.drones.dto.FilaItemResponse;
import com.dti.drones.dto.PedidoRequest;
import com.dti.drones.dto.PedidoResponse;
import com.dti.drones.dto.RastreioResponse;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller = porta de entrada HTTP. Não tem regra de negócio:
 * recebe, valida o formato (@Valid), chama o service e devolve o status certo.
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    /** POST /api/pedidos -> 201 Created (ou 400/422 com a mensagem do erro). */
    @PostMapping
    public ResponseEntity<PedidoResponse> criar(@Valid @RequestBody PedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.criar(request));
    }

    /** GET /api/pedidos?status=PENDENTE */
    @GetMapping
    public List<PedidoResponse> listar(@RequestParam(required = false) StatusPedido status) {
        return pedidoService.listar(status);
    }

    /** GET /api/pedidos/fila: pendentes na ordem em que serão atendidos. */
    @GetMapping("/fila")
    public List<FilaItemResponse> fila() {
        return pedidoService.fila();
    }

    @GetMapping("/{id}")
    public PedidoResponse buscar(@PathVariable String id) {
        return pedidoService.buscar(id);
    }

    /** GET /api/pedidos/{id}/rastreio: "Seu pacote está a 2 quadras de distância". */
    @GetMapping("/{id}/rastreio")
    public RastreioResponse rastrear(@PathVariable String id) {
        return pedidoService.rastrear(id);
    }

    /** DELETE /api/pedidos/{id}: cancela (só se ainda estiver na fila). */
    @DeleteMapping("/{id}")
    public PedidoResponse cancelar(@PathVariable String id) {
        return pedidoService.cancelar(id);
    }
}
