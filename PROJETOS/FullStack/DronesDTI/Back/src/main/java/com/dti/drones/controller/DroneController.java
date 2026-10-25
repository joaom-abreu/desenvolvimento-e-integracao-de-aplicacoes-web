package com.dti.drones.controller;

import com.dti.drones.dto.DroneRequest;
import com.dti.drones.dto.DroneResponse;
import com.dti.drones.service.DroneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/drones")
public class DroneController {

    private final DroneService droneService;

    public DroneController(DroneService droneService) {
        this.droneService = droneService;
    }

    /** GET /api/drones/status: estado, bateria, posição, carga e progresso de cada drone. */
    @GetMapping({"", "/status"})
    public List<DroneResponse> status() {
        return droneService.status();
    }

    @PostMapping
    public ResponseEntity<DroneResponse> criar(@Valid @RequestBody DroneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(droneService.criar(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable String id) {
        droneService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
