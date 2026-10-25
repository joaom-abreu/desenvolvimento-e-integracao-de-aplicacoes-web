package com.dti.drones.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Corpo do POST /api/drones. Ex.: { "nome": "Falcão", "capacidadeKg": 10, "alcanceKm": 30, "velocidadeKmh": 60 } */
public record DroneRequest(
        @NotBlank(message = "Dê um nome ao drone.")
        @Size(max = 30, message = "O nome pode ter até 30 caracteres.")
        String nome,

        @NotNull(message = "Informe a capacidade em kg.")
        @Positive(message = "A capacidade precisa ser maior que zero.")
        @DecimalMax(value = "100", message = "Capacidade máxima aceita: 100 kg.")
        Double capacidadeKg,

        @NotNull(message = "Informe o alcance por carga em km.")
        @Positive(message = "O alcance precisa ser maior que zero.")
        @DecimalMax(value = "200", message = "Alcance máximo aceito: 200 km.")
        Double alcanceKm,

        @Positive(message = "A velocidade precisa ser maior que zero.")
        @DecimalMax(value = "200", message = "Velocidade máxima aceita: 200 km/h.")
        Double velocidadeKmh) {
}
