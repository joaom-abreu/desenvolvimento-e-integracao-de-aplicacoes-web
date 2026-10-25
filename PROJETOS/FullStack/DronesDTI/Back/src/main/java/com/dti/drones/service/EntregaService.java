package com.dti.drones.service;

import com.dti.drones.algoritmo.FilaEntregas;
import com.dti.drones.algoritmo.FilaEntregas.ItemFila;
import com.dti.drones.algoritmo.LinhaDoTempo;
import com.dti.drones.algoritmo.MapaAereo;
import com.dti.drones.algoritmo.PlanejadorViagens;
import com.dti.drones.algoritmo.PlanejadorViagens.Planejamento;
import com.dti.drones.algoritmo.PlanejadorViagens.PlanoViagem;
import com.dti.drones.config.CidadeProperties;
import com.dti.drones.config.SimulacaoProperties;
import com.dti.drones.dto.PedidoResponse;
import com.dti.drones.dto.RotasResponse;
import com.dti.drones.dto.ViagemResponse;
import com.dti.drones.exception.RecursoNaoEncontradoException;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.Viagem;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ViagemRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/** Rotas: viagens em andamento, prévia do planejamento e histórico. */
@Service
public class EntregaService {

    private final ViagemRepository viagemRepository;
    private final PedidoRepository pedidoRepository;
    private final DroneRepository droneRepository;
    private final MapaService mapaService;
    private final PlanejadorViagens planejador;
    private final RelogioSimulacao relogio;
    private final SimulacaoProperties props;
    private final CidadeProperties cidade;

    public EntregaService(ViagemRepository viagemRepository, PedidoRepository pedidoRepository,
                          DroneRepository droneRepository, MapaService mapaService, PlanejadorViagens planejador,
                          RelogioSimulacao relogio, SimulacaoProperties props, CidadeProperties cidade) {
        this.viagemRepository = viagemRepository;
        this.pedidoRepository = pedidoRepository;
        this.droneRepository = droneRepository;
        this.mapaService = mapaService;
        this.planejador = planejador;
        this.relogio = relogio;
        this.props = props;
        this.cidade = cidade;
    }

    /** GET /api/entregas/rota */
    public RotasResponse rotas() {
        Instant agora = relogio.agora();
        List<ViagemResponse> emAndamento = viagemRepository.findByStatus(StatusViagem.EM_ANDAMENTO).stream()
                .map(v -> comProgresso(v, agora))
                .toList();

        List<Pedido> pendentes = pedidoRepository.findByStatus(StatusPedido.PENDENTE);
        List<Drone> frota = droneRepository.findAll();
        MapaAereo mapa = mapaService.mapa();
        List<ItemFila> fila = FilaEntregas.ordenar(pendentes, agora, props.getFatorTempo(),
                props.getMinutosEnvelhecimento());
        Planejamento planejamento = planejador.planejarTudo(fila, frota, cidade.base(), mapa);

        List<ViagemResponse> previa = planejamento.viagens().stream().map(p -> previa(p, mapa)).toList();
        List<PedidoResponse> naoAlocaveis = planejamento.naoAlocados().stream()
                .map(item -> PedidoResponse.de(item.pedido(), null))
                .toList();

        return new RotasResponse(cidade.base(), emAndamento, previa, pendentes.size(), previa.size(),
                PlanejadorViagens.minimoTeoricoDeViagens(pendentes, frota), naoAlocaveis);
    }

    public List<ViagemResponse> historico() {
        return viagemRepository.findTop50ByStatusOrderByFimDesc(StatusViagem.CONCLUIDA).stream()
                .map(v -> ViagemResponse.de(v, v.getDuracaoMin(), "CONCLUIDA"))
                .toList();
    }

    public ViagemResponse buscar(String id) {
        Viagem v = viagemRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Viagem", id));
        return v.getStatus() == StatusViagem.EM_ANDAMENTO ? comProgresso(v, relogio.agora())
                : ViagemResponse.de(v, v.getDuracaoMin(), "CONCLUIDA");
    }

    private ViagemResponse comProgresso(Viagem v, Instant agora) {
        double t = Math.min(v.getDuracaoMin(), relogio.minutosEntre(v.getInicio(), agora));
        String estado = v.getFases().isEmpty() ? "IDLE" : LinhaDoTempo.faseEm(v.getFases(), t).estado().name();
        return ViagemResponse.de(v, t, estado);
    }

    private ViagemResponse previa(PlanoViagem plano, MapaAereo mapa) {
        Drone d = plano.drone();
        LinhaDoTempo linha = LinhaDoTempo.montar(cidade.base(), plano.pedidos(), mapa, d.getVelocidadeKmh(),
                props.getTempoCarregamentoMin(), props.getTempoEntregaMin());
        return ViagemResponse.previa(d.getId(), d.getNome(), d.getCapacidadeKg(), plano.pesoKg(),
                plano.metodo().name(), linha);
    }
}
