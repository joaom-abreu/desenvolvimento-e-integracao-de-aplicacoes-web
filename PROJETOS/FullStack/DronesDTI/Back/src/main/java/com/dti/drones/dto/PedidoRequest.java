package com.dti.drones.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Corpo do POST /api/pedidos. Ex.:
 * { "cliente": "Ana", "x": 12.5, "y": 7, "pesoKg": 2.3, "prioridade": "alta" }
 *
 * DTO (Data Transfer Object): o formato que entra/sai da API. Fica separado
 * do model (documento do MongoDB) para a API não expor detalhes do banco.
 */
public record PedidoRequest(
        @Size(max = 60, message = "O nome do cliente pode ter até 60 caracteres.")
        String cliente,

        @NotNull(message = "Informe a coordenada x do cliente.")
        Double x,

        @NotNull(message = "Informe a coordenada y do cliente.")
        Double y,

        @NotNull(message = "Informe o peso do pacote em kg.")
        @Positive(message = "O peso do pacote precisa ser maior que zero.")
        @DecimalMax(value = "1000", message = "Peso acima de 1000 kg não é um pacote de drone.")
        Double pesoKg,

        @NotBlank(message = "Informe a prioridade: baixa, media ou alta.")
        String prioridade) {
}
