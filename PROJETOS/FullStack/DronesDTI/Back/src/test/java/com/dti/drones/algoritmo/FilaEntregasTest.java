package com.dti.drones.algoritmo;

import com.dti.drones.algoritmo.FilaEntregas.ItemFila;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Prioridade;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("Fila de entregas (prioridade + chegada + envelhecimento)")
class FilaEntregasTest {

    private static final Instant AGORA = Instant.parse("2026-10-24T12:00:00Z");

    private static Pedido pedido(String id, Prioridade prioridade, long segundosAtras) {
        Pedido p = new Pedido("Cliente " + id, 1, 1, 1, prioridade, AGORA.minusSeconds(segundosAtras));
        p.setId(id);
        return p;
    }

    @Test
    @DisplayName("ordena por prioridade e, empatando, por ordem de chegada")
    void prioridadeDepoisChegada() {
        List<Pedido> pedidos = List.of(
                pedido("baixa", Prioridade.BAIXA, 5),
                pedido("alta-nova", Prioridade.ALTA, 1),
                pedido("media", Prioridade.MEDIA, 3),
                pedido("alta-antiga", Prioridade.ALTA, 4));

        // fator 60 -> 5 s reais = 5 min simulados (menos que os 30 min do envelhecimento)
        List<ItemFila> fila = FilaEntregas.ordenar(pedidos, AGORA, 60, 30);

        assertEquals(List.of("alta-antiga", "alta-nova", "media", "baixa"),
                fila.stream().map(i -> i.pedido().getId()).toList());
        assertEquals(1, fila.get(0).posicao());
    }

    @Test
    @DisplayName("envelhecimento: pedido BAIXA esperando 70 min passa na frente de um ALTA recém-chegado")
    void envelhecimento() {
        List<Pedido> pedidos = List.of(
                pedido("alta-nova", Prioridade.ALTA, 0),
                pedido("baixa-antiga", Prioridade.BAIXA, 70)); // 70 s reais = 70 min simulados

        List<ItemFila> fila = FilaEntregas.ordenar(pedidos, AGORA, 60, 30);

        assertEquals("baixa-antiga", fila.get(0).pedido().getId());
        assertEquals(3, fila.get(0).nivelEfetivo()); // 1 + 2 promoções
    }
}
