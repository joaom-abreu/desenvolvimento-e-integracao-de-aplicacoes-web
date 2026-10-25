package com.dti.drones.service;

import com.dti.drones.algoritmo.FilaEntregas;
import com.dti.drones.algoritmo.FilaEntregas.ItemFila;
import com.dti.drones.algoritmo.LinhaDoTempo;
import com.dti.drones.algoritmo.MapaAereo;
import com.dti.drones.config.CidadeProperties;
import com.dti.drones.config.SimulacaoProperties;
import com.dti.drones.dto.FilaItemResponse;
import com.dti.drones.dto.Numeros;
import com.dti.drones.dto.PedidoRequest;
import com.dti.drones.dto.PedidoResponse;
import com.dti.drones.dto.RastreioResponse;
import com.dti.drones.exception.RecursoNaoEncontradoException;
import com.dti.drones.exception.RegraNegocioException;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Parada;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;
import com.dti.drones.model.Prioridade;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.Viagem;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ViagemRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/** Regras de negócio dos pedidos: validação, fila, cancelamento e rastreio. */
@Service
public class PedidoService {

    static final Locale PT_BR = Locale.of("pt", "BR");

    private final PedidoRepository pedidoRepository;
    private final DroneRepository droneRepository;
    private final ViagemRepository viagemRepository;
    private final MapaService mapaService;
    private final RelogioSimulacao relogio;
    private final CidadeProperties cidade;
    private final SimulacaoProperties props;

    public PedidoService(PedidoRepository pedidoRepository, DroneRepository droneRepository,
                         ViagemRepository viagemRepository, MapaService mapaService, RelogioSimulacao relogio,
                         CidadeProperties cidade, SimulacaoProperties props) {
        this.pedidoRepository = pedidoRepository;
        this.droneRepository = droneRepository;
        this.viagemRepository = viagemRepository;
        this.mapaService = mapaService;
        this.relogio = relogio;
        this.cidade = cidade;
        this.props = props;
    }

    /** Valida as regras do case e grava o pedido como PENDENTE (entra na fila). */
    public PedidoResponse criar(PedidoRequest req) {
        Prioridade prioridade = Prioridade.de(req.prioridade());
        Ponto destino = new Ponto(req.x(), req.y());
        validarDestinoEPeso(destino, req.pesoKg());

        String cliente = req.cliente() == null || req.cliente().isBlank() ? "Cliente sem nome" : req.cliente().trim();
        Pedido pedido = new Pedido(cliente, req.x(), req.y(), req.pesoKg(), prioridade, relogio.agora());
        return paraResposta(pedidoRepository.save(pedido));
    }

    /**
     * As regras que fazem um pedido ser REJEITADO (422), com mensagens claras:
     * fora da cidade, sem frota, dentro de zona proibida, pesado demais, longe demais.
     */
    void validarDestinoEPeso(Ponto destino, double pesoKg) {
        if (!cidade.dentroDaCidade(destino.x(), destino.y())) {
            throw new RegraNegocioException(String.format(PT_BR,
                    "O endereço (%.1f, %.1f) está fora da cidade. Use x entre 0 e %.0f e y entre 0 e %.0f.",
                    destino.x(), destino.y(), cidade.getLarguraKm(), cidade.getAlturaKm()));
        }

        List<Drone> frota = droneRepository.findAll();
        if (frota.isEmpty()) {
            throw new RegraNegocioException("Não há drones cadastrados. Cadastre a frota antes de receber pedidos.");
        }

        MapaAereo mapa = mapaService.mapa();
        String zona = mapa.zonaQueContem(destino);
        if (zona != null) {
            throw new RegraNegocioException("O endereço fica dentro da zona de exclusão aérea \"" + zona
                    + "\". Drones não podem entregar ali.");
        }

        double maiorCapacidade = frota.stream().mapToDouble(Drone::getCapacidadeKg).max().orElse(0);
        if (pesoKg > maiorCapacidade) {
            throw new RegraNegocioException(String.format(PT_BR,
                    "O pacote de %.2f kg excede a capacidade máxima da frota (%.1f kg).", pesoKg, maiorCapacidade));
        }

        Ponto base = cidade.base();
        double idaEVolta = mapa.distancia(base, destino) + mapa.distancia(destino, base);
        if (Double.isInfinite(idaEVolta)) {
            throw new RegraNegocioException("Não existe rota até o endereço sem atravessar zonas de exclusão aérea.");
        }
        boolean algumDroneConsegue = frota.stream()
                .anyMatch(d -> d.getCapacidadeKg() >= pesoKg && d.getAlcanceKm() >= idaEVolta);
        if (!algumDroneConsegue) {
            double maiorAlcance = frota.stream().mapToDouble(Drone::getAlcanceKm).max().orElse(0);
            if (idaEVolta > maiorAlcance) {
                throw new RegraNegocioException(String.format(PT_BR,
                        "O endereço exige %.1f km de voo (ida e volta) e o maior alcance da frota é %.1f km.",
                        idaEVolta, maiorAlcance));
            }
            throw new RegraNegocioException(String.format(PT_BR,
                    "Nenhum drone consegue levar %.2f kg por %.1f km (ida e volta). Os drones mais fortes têm alcance menor.",
                    pesoKg, idaEVolta));
        }
    }

    public List<PedidoResponse> listar(StatusPedido status) {
        List<Pedido> pedidos = status == null ? pedidoRepository.findAll() : pedidoRepository.findByStatus(status);
        return pedidos.stream()
                .sorted(Comparator.comparing(Pedido::getCriadoEm, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::paraResposta)
                .toList();
    }

    public PedidoResponse buscar(String id) {
        return paraResposta(buscarEntidade(id));
    }

    /** Só dá para cancelar o que ainda está na fila. */
    public PedidoResponse cancelar(String id) {
        Pedido pedido = buscarEntidade(id);
        if (pedido.getStatus() != StatusPedido.PENDENTE) {
            throw new RegraNegocioException("Só é possível cancelar pedidos que ainda estão na fila. Status atual: "
                    + pedido.getStatus() + ".");
        }
        pedido.setStatus(StatusPedido.CANCELADO);
        return paraResposta(pedidoRepository.save(pedido));
    }

    /** A fila na ordem em que será atendida (prioridade + chegada + envelhecimento). */
    public List<FilaItemResponse> fila() {
        return ordenarFila().stream()
                .map(item -> new FilaItemResponse(item.posicao(), item.nivelEfetivo(),
                        Prioridade.doNivel(item.nivelEfetivo()).name(), Numeros.r1(item.esperaMin()),
                        paraResposta(item.pedido())))
                .toList();
    }

    private List<ItemFila> ordenarFila() {
        return FilaEntregas.ordenar(pedidoRepository.findByStatus(StatusPedido.PENDENTE), relogio.agora(),
                props.getFatorTempo(), props.getMinutosEnvelhecimento());
    }

    /** "Seu pacote está a 2 quadras de distância". */
    public RastreioResponse rastrear(String id) {
        Pedido pedido = buscarEntidade(id);
        return switch (pedido.getStatus()) {
            case PENDENTE -> {
                List<ItemFila> fila = ordenarFila();
                int posicao = fila.stream().filter(i -> id.equals(i.pedido().getId()))
                        .mapToInt(ItemFila::posicao).findFirst().orElse(0);
                yield new RastreioResponse(id, "PENDENTE", String.format(PT_BR,
                        "Seu pedido está na fila: posição %d de %d. Assim que um drone ficar livre, ele sai.",
                        posicao, fila.size()), null, null, null, null, null, null);
            }
            case ALOCADO -> new RastreioResponse(id, "ALOCADO",
                    "O drone " + pedido.getDroneNome() + " está carregando seu pacote na base.",
                    null, null, null, pedido.getDroneNome(), null, null);
            case EM_ROTA -> rastrearEmRota(pedido);
            case ENTREGUE -> new RastreioResponse(id, "ENTREGUE", String.format(PT_BR,
                    "Pacote entregue pelo drone %s, %.0f minutos após o pedido.", pedido.getDroneNome(),
                    relogio.minutosEntre(pedido.getCriadoEm(), pedido.getEntregueEm())),
                    0.0, 0, 0.0, pedido.getDroneNome(), pedido.getX(), pedido.getY());
            case CANCELADO -> new RastreioResponse(id, "CANCELADO", "Pedido cancelado.",
                    null, null, null, null, null, null);
        };
    }

    private RastreioResponse rastrearEmRota(Pedido pedido) {
        Viagem viagem = viagemRepository.findById(pedido.getViagemId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Viagem", pedido.getViagemId()));
        Parada parada = viagem.getParadas().stream()
                .filter(p -> pedido.getId().equals(p.pedidoId()))
                .findFirst()
                .orElseThrow(() -> new RegraNegocioException("O pedido não está na rota da viagem."));

        double t = relogio.minutosEntre(viagem.getInicio(), relogio.agora());
        double kmAgora = LinhaDoTempo.kmEm(viagem.getFases(), t);
        Ponto posicaoDrone = LinhaDoTempo.pontoNoCaminho(viagem.getCaminho(), kmAgora);
        double restanteKm = Math.max(0, parada.kmAcumulado() - kmAgora);
        int quadras = (int) Math.round(restanteKm * 1000 / cidade.getMetrosPorQuadra());
        double previsao = Math.max(0, parada.minutoChegada() - t);
        // quantas entregas o drone ainda faz antes da sua
        long entregasAntes = viagem.getParadas().stream()
                .filter(p -> p.ordem() < parada.ordem() && p.minutoEntrega() > t)
                .count();

        String mensagem;
        if (quadras == 0) {
            mensagem = "O drone " + viagem.getDroneNome() + " chegou! Seu pacote está sendo entregue.";
        } else {
            String antes = entregasAntes == 0 ? ""
                    : " (antes, ele passa em " + entregasAntes + (entregasAntes == 1 ? " endereço)" : " endereços)");
            mensagem = String.format(PT_BR, "Seu pacote está a %d %s de distância%s. Chegada em cerca de %.0f min.",
                    quadras, quadras == 1 ? "quadra" : "quadras", antes, Math.ceil(previsao));
        }
        return new RastreioResponse(pedido.getId(), "EM_ROTA", mensagem, Numeros.r2(restanteKm), quadras,
                Numeros.r1(previsao), viagem.getDroneNome(), Numeros.r2(posicaoDrone.x()), Numeros.r2(posicaoDrone.y()));
    }

    private Pedido buscarEntidade(String id) {
        return pedidoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Pedido", id));
    }

    PedidoResponse paraResposta(Pedido p) {
        Double tempo = p.getEntregueEm() != null && p.getCriadoEm() != null
                ? relogio.minutosEntre(p.getCriadoEm(), p.getEntregueEm())
                : null;
        return PedidoResponse.de(p, tempo);
    }
}
