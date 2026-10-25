package com.dti.drones.service;

import com.dti.drones.algoritmo.CaixeiroViajante;
import com.dti.drones.algoritmo.MapaAereo;
import com.dti.drones.algoritmo.PlanejadorViagens;
import com.dti.drones.config.CidadeProperties;
import com.dti.drones.config.SimulacaoProperties;
import com.dti.drones.model.Drone;
import com.dti.drones.model.EstadoDrone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Prioridade;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.Viagem;
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
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("SimulacaoService (máquina de estados do drone)")
class SimulacaoServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-24T12:00:00Z");

    @Mock private PedidoRepository pedidoRepository;
    @Mock private DroneRepository droneRepository;
    @Mock private ViagemRepository viagemRepository;
    @Mock private ZonaExclusaoRepository zonaRepository;
    @Mock private MapaService mapaService;

    private final RelogioFalso clock = new RelogioFalso(T0);
    private final SimulacaoProperties props = new SimulacaoProperties();
    private final CidadeProperties cidade = new CidadeProperties();
    private SimulacaoService service;
    private Drone drone;
    private Pedido p1;
    private Pedido p2;

    /** Um Clock que o teste consegue adiantar. */
    static class RelogioFalso extends Clock {
        private Instant agora;

        RelogioFalso(Instant inicio) {
            this.agora = inicio;
        }

        void avancarSegundos(double segundos) {
            agora = agora.plusMillis((long) (segundos * 1000));
        }

        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return agora; }
    }

    @BeforeEach
    void configurar() {
        props.setDespachoAutomatico(false);
        service = new SimulacaoService(pedidoRepository, droneRepository, viagemRepository, zonaRepository, mapaService,
                new PlanejadorViagens(new CaixeiroViajante(8), 10), new RelogioSimulacao(clock, props), props, cidade);

        drone = new Drone("Falcão", 10, 30, 60, cidade.base());
        drone.setId("d1");
        p1 = pedido("p1", 13, 10, 2);  // 3 km a leste
        p2 = pedido("p2", 13, 14, 1);  // depois 4 km ao norte

        when(mapaService.mapa()).thenReturn(MapaAereo.semObstaculos());
        when(droneRepository.findByEstado(EstadoDrone.IDLE)).thenReturn(List.of(drone));
        when(droneRepository.findByEstado(EstadoDrone.RECARREGANDO)).thenReturn(List.of());
        when(droneRepository.findById("d1")).thenReturn(Optional.of(drone));
        when(pedidoRepository.findByStatus(StatusPedido.PENDENTE)).thenReturn(List.of(p1, p2));
        when(pedidoRepository.findByViagemId("v1")).thenReturn(List.of(p1, p2));
        when(pedidoRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(viagemRepository.save(any(Viagem.class))).thenAnswer(inv -> {
            Viagem v = inv.getArgument(0);
            if (v.getId() == null) {
                v.setId("v1");
            }
            return v;
        });
    }

    private static Pedido pedido(String id, double x, double y, double peso) {
        Pedido p = new Pedido("Cliente " + id, x, y, peso, Prioridade.MEDIA, T0);
        p.setId(id);
        return p;
    }

    private Viagem despacharUmaViagem() {
        List<Viagem> viagens = service.despachar();
        assertEquals(1, viagens.size());
        Viagem v = viagens.get(0);
        when(viagemRepository.findByStatus(StatusViagem.EM_ANDAMENTO)).thenReturn(List.of(v));
        return v;
    }

    @Test
    @DisplayName("despacho: IDLE -> CARREGANDO e pedidos ALOCADOS na mesma viagem")
    void despacho() {
        Viagem v = despacharUmaViagem();

        assertEquals(EstadoDrone.CARREGANDO, drone.getEstado());
        assertEquals("v1", drone.getViagemAtualId());
        assertEquals(StatusPedido.ALOCADO, p1.getStatus());
        assertEquals("v1", p2.getViagemId());
        assertEquals(12, v.getDistanciaKm(), 1e-9); // 3 + 4 + 5 (triângulo 3-4-5)
        verify(droneRepository).save(drone);
    }

    @Test
    @DisplayName("tick no minuto 3: drone EM_VOO, pedidos EM_ROTA e bateria gastando")
    void emVoo() {
        despacharUmaViagem();
        clock.avancarSegundos(3); // 3 min simulados (2 de carregamento + 1 de voo)

        service.avancar();

        assertEquals(EstadoDrone.EM_VOO, drone.getEstado());
        assertEquals(StatusPedido.EM_ROTA, p1.getStatus());
        assertTrue(drone.getBateria() < 100);
        assertEquals(11, drone.getX(), 1e-9); // 1 km voado para leste
    }

    @Test
    @DisplayName("fim da viagem: pedidos ENTREGUES, drone de volta à base e estatísticas somadas")
    void conclusao() {
        Viagem v = despacharUmaViagem();
        clock.avancarSegundos(v.getDuracaoMin() + 1);

        service.avancar();

        assertEquals(StatusViagem.CONCLUIDA, v.getStatus());
        assertEquals(StatusPedido.ENTREGUE, p1.getStatus());
        assertEquals(StatusPedido.ENTREGUE, p2.getStatus());
        assertNotNull(p2.getEntregueEm());
        assertEquals(EstadoDrone.IDLE, drone.getEstado()); // 12 km de 30 -> 60% de bateria
        assertEquals(60, drone.getBateria(), 1e-9);
        assertEquals(10, drone.getX(), 1e-9);
        assertEquals(2, drone.getEntregasRealizadas());
        assertEquals(1, drone.getViagensRealizadas());
    }

    @Test
    @DisplayName("bateria abaixo de 30% ao voltar: RETORNANDO -> RECARREGANDO -> IDLE")
    void recarga() {
        drone.setAlcanceKm(15); // 12 km de 15 -> sobra 20%
        Viagem v = despacharUmaViagem();
        clock.avancarSegundos(v.getDuracaoMin() + 0.5);

        service.avancar();
        assertEquals(EstadoDrone.RECARREGANDO, drone.getEstado());
        assertNotNull(drone.getRecargaAte());

        // 80% a 5%/min = 16 min de recarga
        when(viagemRepository.findByStatus(StatusViagem.EM_ANDAMENTO)).thenReturn(List.of());
        when(droneRepository.findByEstado(EstadoDrone.RECARREGANDO)).thenReturn(List.of(drone));
        clock.avancarSegundos(17);
        service.avancar();

        assertEquals(EstadoDrone.IDLE, drone.getEstado());
        assertEquals(100, drone.getBateria(), 1e-9);
    }

    @Test
    @DisplayName("gerar pedidos aleatórios valida a quantidade")
    void quantidadeInvalida() {
        assertThrows(IllegalArgumentException.class, () -> service.gerarPedidosAleatorios(0));
        assertThrows(IllegalArgumentException.class, () -> service.gerarPedidosAleatorios(501));
    }
}
