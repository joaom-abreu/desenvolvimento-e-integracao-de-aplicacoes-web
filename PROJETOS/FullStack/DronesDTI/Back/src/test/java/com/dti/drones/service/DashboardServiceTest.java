package com.dti.drones.service;

import com.dti.drones.config.CidadeProperties;
import com.dti.drones.config.SimulacaoProperties;
import com.dti.drones.dto.DashboardResponse;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Prioridade;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.ZonaExclusao;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ViagemRepository;
import com.dti.drones.repository.ZonaExclusaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("DashboardService (relatório)")
class DashboardServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-24T12:00:00Z");

    @Mock private PedidoRepository pedidoRepository;
    @Mock private ViagemRepository viagemRepository;
    @Mock private DroneRepository droneRepository;
    @Mock private ZonaExclusaoRepository zonaRepository;

    private DashboardService service;

    @BeforeEach
    void configurar() {
        CidadeProperties cidade = new CidadeProperties();
        RelogioSimulacao relogio = new RelogioSimulacao(Clock.fixed(T0, ZoneOffset.UTC), new SimulacaoProperties());
        service = new DashboardService(pedidoRepository, viagemRepository, droneRepository, zonaRepository, relogio, cidade);

        Drone a = new Drone("Albatroz", 15, 26, 45, cidade.base());
        a.setEntregasRealizadas(10);
        a.setDistanciaTotalKm(20);   // 0,5 entrega/km
        Drone b = new Drone("Colibri", 4, 22, 80, cidade.base());
        b.setEntregasRealizadas(4);
        b.setDistanciaTotalKm(4);    // 1,0 entrega/km

        when(droneRepository.findAll()).thenReturn(List.of(a, b));
        when(pedidoRepository.findAll()).thenReturn(List.of(entregue("p1", 10), entregue("p2", 20)));
        when(viagemRepository.findByStatus(StatusViagem.CONCLUIDA)).thenReturn(List.of());
        when(zonaRepository.findAll()).thenReturn(List.of(new ZonaExclusao("Aeroporto", 12, 13, 15, 16)));
    }

    /** Pedido entregue "segundos" depois de criado (fator 60 -> mesmos minutos simulados). */
    private static Pedido entregue(String id, int segundos) {
        Pedido p = new Pedido("Ana", 11, 11, 1, Prioridade.ALTA, T0.minusSeconds(60));
        p.setId(id);
        p.setStatus(StatusPedido.ENTREGUE);
        p.setEntregueEm(p.getCriadoEm().plusSeconds(segundos));
        return p;
    }

    @Test
    @DisplayName("tempo médio por entrega e drone mais eficiente")
    void indicadores() {
        DashboardResponse d = service.calcular();

        assertEquals(2, d.entregasRealizadas());
        assertEquals(15, d.tempoMedioEntregaMin(), 1e-9);
        assertEquals("Colibri", d.droneMaisEficiente().nome());
        assertEquals(Long.valueOf(2), d.entregasPorPrioridade().get("ALTA"));
    }

    @Test
    @DisplayName("mapa ASCII mostra a base e as zonas")
    void mapaAscii() {
        String mapa = service.mapaAscii();
        assertTrue(mapa.contains("B"));
        assertTrue(mapa.contains("#"));
        assertTrue(mapa.contains("*"));
    }
}
