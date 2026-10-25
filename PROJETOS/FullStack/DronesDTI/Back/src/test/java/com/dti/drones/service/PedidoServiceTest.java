package com.dti.drones.service;

import com.dti.drones.algoritmo.LinhaDoTempo;
import com.dti.drones.algoritmo.MapaAereo;
import com.dti.drones.config.CidadeProperties;
import com.dti.drones.config.SimulacaoProperties;
import com.dti.drones.dto.PedidoRequest;
import com.dti.drones.dto.PedidoResponse;
import com.dti.drones.dto.RastreioResponse;
import com.dti.drones.exception.RecursoNaoEncontradoException;
import com.dti.drones.exception.RegraNegocioException;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;
import com.dti.drones.model.Prioridade;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.Viagem;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ViagemRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Teste UNITÁRIO com Mockito: os repositories são "dublês" (mocks).
 * Nenhum MongoDB é necessário: testamos só as regras do PedidoService.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PedidoService (regras de validação e rastreio)")
class PedidoServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-24T12:00:00Z");

    @Mock private PedidoRepository pedidoRepository;
    @Mock private DroneRepository droneRepository;
    @Mock private ViagemRepository viagemRepository;
    @Mock private MapaService mapaService;

    private final CidadeProperties cidade = new CidadeProperties(); // 20 x 20 km, base (10, 10)
    private final SimulacaoProperties props = new SimulacaoProperties(); // fator 60
    private PedidoService service;

    @BeforeEach
    void configurar() {
        criarService(Clock.fixed(T0, ZoneOffset.UTC));
        when(droneRepository.findAll()).thenReturn(List.of(new Drone("Falcão", 10, 30, 60, cidade.base())));
        when(mapaService.mapa()).thenReturn(MapaAereo.semObstaculos());
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> {
            Pedido p = inv.getArgument(0);
            if (p.getId() == null) {
                p.setId("p1");
            }
            return p;
        });
    }

    private void criarService(Clock clock) {
        service = new PedidoService(pedidoRepository, droneRepository, viagemRepository, mapaService,
                new RelogioSimulacao(clock, props), cidade, props);
    }

    @Test
    @DisplayName("pedido válido entra na fila como PENDENTE")
    void criaValido() {
        PedidoResponse r = service.criar(new PedidoRequest("Ana", 12.0, 7.0, 2.5, "alta"));

        assertEquals("PENDENTE", r.status());
        assertEquals("ALTA", r.prioridade());
        assertEquals(T0, r.criadoEm());
        verify(pedidoRepository).save(any(Pedido.class));
    }

    @Test
    @DisplayName("aceita prioridade com acento e maiúscula (\"Média\")")
    void prioridadeComAcento() {
        assertEquals("MEDIA", service.criar(new PedidoRequest("Ana", 12.0, 7.0, 1.0, "Média")).prioridade());
    }

    @Test
    @DisplayName("rejeita pacote mais pesado que o maior drone")
    void pesadoDemais() {
        RegraNegocioException e = assertThrows(RegraNegocioException.class,
                () -> service.criar(new PedidoRequest("Ana", 12.0, 7.0, 12.0, "baixa")));

        assertTrue(e.getMessage().contains("excede a capacidade"));
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    @DisplayName("rejeita endereço fora da cidade")
    void foraDaCidade() {
        assertThrows(RegraNegocioException.class, () -> service.criar(new PedidoRequest("Ana", 25.0, 7.0, 1.0, "baixa")));
    }

    @Test
    @DisplayName("rejeita endereço dentro de zona de exclusão aérea")
    void dentroDeZona() {
        when(mapaService.mapa()).thenReturn(new MapaAereo(List.of(new MapaAereo.Retangulo("Aeroporto", 11, 6, 13, 8))));

        RegraNegocioException e = assertThrows(RegraNegocioException.class,
                () -> service.criar(new PedidoRequest("Ana", 12.0, 7.0, 1.0, "baixa")));
        assertTrue(e.getMessage().contains("Aeroporto"));
    }

    @Test
    @DisplayName("rejeita endereço além do alcance da frota")
    void longeDemais() {
        when(droneRepository.findAll()).thenReturn(List.of(new Drone("Curto", 10, 5, 60, cidade.base())));

        RegraNegocioException e = assertThrows(RegraNegocioException.class,
                () -> service.criar(new PedidoRequest("Ana", 15.0, 10.0, 1.0, "baixa")));
        assertTrue(e.getMessage().contains("alcance"));
    }

    @Test
    @DisplayName("rejeita pedido quando não há drones")
    void semFrota() {
        when(droneRepository.findAll()).thenReturn(List.of());
        assertThrows(RegraNegocioException.class, () -> service.criar(new PedidoRequest("Ana", 12.0, 7.0, 1.0, "baixa")));
    }

    @Test
    @DisplayName("prioridade desconhecida vira IllegalArgumentException (400)")
    void prioridadeInvalida() {
        assertThrows(IllegalArgumentException.class,
                () -> service.criar(new PedidoRequest("Ana", 12.0, 7.0, 1.0, "urgentíssima")));
    }

    @Test
    @DisplayName("só cancela pedido que ainda está na fila")
    void cancelar() {
        Pedido emRota = new Pedido("Ana", 12, 7, 1, Prioridade.BAIXA, T0);
        emRota.setId("p9");
        emRota.setStatus(StatusPedido.EM_ROTA);
        when(pedidoRepository.findById("p9")).thenReturn(Optional.of(emRota));

        assertThrows(RegraNegocioException.class, () -> service.cancelar("p9"));
    }

    @Test
    @DisplayName("id inexistente vira 404")
    void naoEncontrado() {
        when(pedidoRepository.findById("x")).thenReturn(Optional.empty());
        assertThrows(RecursoNaoEncontradoException.class, () -> service.buscar("x"));
    }

    @Test
    @DisplayName("rastreio: \"Seu pacote está a 2 quadras de distância\"")
    void rastreio() {
        // Pedido a 3 km da base. 60 km/h = 1 km/min. Carregamento 2 min -> chega no minuto 5.
        Pedido pedido = new Pedido("Ana", 13, 10, 1, Prioridade.ALTA, T0);
        pedido.setId("p1");
        pedido.setStatus(StatusPedido.EM_ROTA);
        pedido.setViagemId("v1");
        pedido.setDroneNome("Falcão");

        LinhaDoTempo linha = LinhaDoTempo.montar(new Ponto(10, 10), List.of(pedido), MapaAereo.semObstaculos(), 60, 2, 1);
        Viagem viagem = new Viagem();
        viagem.setId("v1");
        viagem.setDroneNome("Falcão");
        viagem.setInicio(T0);
        viagem.setParadas(linha.paradas());
        viagem.setCaminho(linha.caminho());
        viagem.setFases(linha.fases());
        viagem.setDuracaoMin(linha.duracaoMin());

        when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
        when(viagemRepository.findById("v1")).thenReturn(Optional.of(viagem));

        // minuto 4,8 simulado = 4,8 s reais (fator 60): faltam 0,2 km = 2 quadras de 100 m
        criarService(Clock.fixed(T0.plusMillis(4800), ZoneOffset.UTC));
        RastreioResponse r = service.rastrear("p1");

        assertEquals(Integer.valueOf(2), r.quadras());
        assertTrue(r.mensagem().contains("2 quadras"), r.mensagem());
    }
}
