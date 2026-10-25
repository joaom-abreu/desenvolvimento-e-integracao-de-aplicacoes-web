package com.dti.drones.algoritmo;

import com.dti.drones.model.EstadoDrone;
import com.dti.drones.model.Fase;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;
import com.dti.drones.model.Prioridade;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("Linha do tempo da viagem (estados do drone)")
class LinhaDoTempoTest {

    private static final Ponto BASE = new Ponto(0, 0);

    private static Pedido pedido(String id, double x, double y) {
        Pedido p = new Pedido(id, x, y, 1, Prioridade.MEDIA, Instant.EPOCH);
        p.setId(id);
        return p;
    }

    @Test
    @DisplayName("segue o ciclo CARREGANDO -> EM_VOO -> ENTREGANDO -> ... -> RETORNANDO")
    void cicloDeEstados() {
        LinhaDoTempo linha = LinhaDoTempo.montar(BASE, List.of(pedido("a", 3, 0), pedido("b", 3, 4)),
                MapaAereo.semObstaculos(), 60, 2, 1);

        assertEquals(List.of(EstadoDrone.CARREGANDO, EstadoDrone.EM_VOO, EstadoDrone.ENTREGANDO,
                        EstadoDrone.EM_VOO, EstadoDrone.ENTREGANDO, EstadoDrone.RETORNANDO),
                linha.fases().stream().map(Fase::estado).toList());
        assertEquals(12, linha.distanciaKm(), 1e-9); // 3 + 4 + 5
    }

    @Test
    @DisplayName("duração = carregar + voar (60 km/h = 1 km/min) + entregar")
    void duracao() {
        LinhaDoTempo linha = LinhaDoTempo.montar(BASE, List.of(pedido("a", 6, 0)), MapaAereo.semObstaculos(), 60, 2, 1);

        assertEquals(15, linha.duracaoMin(), 1e-9); // 2 + 6 + 1 + 6
        assertEquals(8, linha.paradas().get(0).minutoChegada(), 1e-9);
        assertEquals(9, linha.paradas().get(0).minutoEntrega(), 1e-9);
    }

    @Test
    @DisplayName("no meio do voo o drone está no meio do caminho")
    void posicao() {
        LinhaDoTempo linha = LinhaDoTempo.montar(BASE, List.of(pedido("a", 6, 0)), MapaAereo.semObstaculos(), 60, 2, 1);

        assertEquals(EstadoDrone.EM_VOO, LinhaDoTempo.faseEm(linha.fases(), 5).estado());
        double km = LinhaDoTempo.kmEm(linha.fases(), 5); // 3 minutos de voo
        assertEquals(3, km, 1e-9);
        assertEquals(new Ponto(3, 0), LinhaDoTempo.pontoNoCaminho(linha.caminho(), km));
        assertEquals(EstadoDrone.RETORNANDO, LinhaDoTempo.faseEm(linha.fases(), 12).estado());
    }
}
