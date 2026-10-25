package com.dti.drones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Corpo do POST /api/zonas: um retângulo pelos dois cantos opostos. */
public record ZonaRequest(
        @NotBlank(message = "Dê um nome à zona.")
        @Size(max = 40, message = "O nome pode ter até 40 caracteres.")
        String nome,
        @NotNull(message = "Informe xMin.") Double xMin,
        @NotNull(message = "Informe yMin.") Double yMin,
        @NotNull(message = "Informe xMax.") Double xMax,
        @NotNull(message = "Informe yMax.") Double yMax) {
}
