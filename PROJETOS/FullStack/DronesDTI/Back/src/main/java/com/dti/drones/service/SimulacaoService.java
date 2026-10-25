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
import com.dti.drones.dto.SimulacaoStatusResponse;
import com.dti.drones.model.Drone;
import com.dti.drones.model.EstadoDrone;
import com.dti.drones.model.Fase;
import com.dti.drones.model.Parada;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;
import com.dti.drones.model.Prioridade;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.Viagem;
import com.dti.drones.model.ZonaExclusao;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ViagemRepository;
import com.dti.drones.repository.ZonaExclusaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * O "motor" da simulação orientada a eventos.
 *
 * A cada tick (padrão: 1 s real = 1 min simulado) o motor:
 *  1. avança as viagens em andamento: muda o estado do drone conforme a linha
 *     do tempo (CARREGANDO -> EM_VOO -> ENTREGANDO -> ... -> RETORNANDO),
 *     move o drone no mapa, gasta bateria e marca os pedidos como entregues;
 *  2. termina as viagens que chegaram ao fim (drone volta a IDLE ou vai RECARREGAR);
 *  3. termina as recargas;
 *  4. despacha: monta viagens para os drones IDLE com a fila de pedidos.
 *
 * Os métodos que mudam o estado são "synchronized" na mesma trava: o tick
 * (thread do agendador) e as requisições HTTP (threads do Tomcat) nunca
 * alteram a frota ao mesmo tempo.
 */
@Service
public class SimulacaoService {

    private static final Logger log = LoggerFactory.getLogger(SimulacaoService.class);
    private static final String[] NOMES = {"Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabi", "Heitor",
            "Iara", "João", "Kátia", "Lucas", "Marina", "Nina", "Otávio", "Paula", "Rafa", "Sofia", "Tiago", "Vitória"};

    private final PedidoRepository pedidoRepository;
    private final DroneRepository droneRepository;
    private final ViagemRepository viagemRepository;
    private final ZonaExclusaoRepository zonaRepository;
    private final MapaService mapaService;
    private final PlanejadorViagens planejador;
    private final RelogioSimulacao relogio;
    private final SimulacaoProperties props;
    private final CidadeProperties cidade;
    private final Object trava = new Object();
    private final Random random = new Random();
    private long ultimoAvisoDeErro;

    public SimulacaoService(PedidoRepository pedidoRepository, DroneRepository droneRepository,
                            ViagemRepository viagemRepository, ZonaExclusaoRepository zonaRepository,
                            MapaService mapaService, PlanejadorViagens planejador, RelogioSimulacao relogio,
                            SimulacaoProperties props, CidadeProperties cidade) {
        this.pedidoRepository = pedidoRepository;
        this.droneRepository = droneRepository;
        this.viagemRepository = viagemRepository;
        this.zonaRepository = zonaRepository;
        this.mapaService = mapaService;
        this.planejador = planejador;
        this.relogio = relogio;
        this.props = props;
        this.cidade = cidade;
    }

    // =====================================================================
    // Relógio
    // =====================================================================

    /** Chamado pelo Spring a cada app.simulacao.intervalo-ms. */
    @Scheduled(fixedDelayString = "${app.simulacao.intervalo-ms:1000}", initialDelay = 3000)
    public void tick() {
        try {
            avancar();
        } catch (RuntimeException e) {
            // sem MongoDB o tick falharia a cada segundo: avisa no máximo 1x por minuto
            long agora = System.currentTimeMillis();
            if (agora - ultimoAvisoDeErro > 60_000) {
                ultimoAvisoDeErro = agora;
                log.warn("Tick da simulação falhou: {}", e.getMessage());
            }
        }
    }

    /** Um passo da simulação. */
    public void avancar() {
        synchronized (trava) {
            Instant agora = relogio.agora();
            for (Viagem viagem : viagemRepository.findByStatus(StatusViagem.EM_ANDAMENTO)) {
                atualizarViagem(viagem, agora);
            }
            for (Drone drone : droneRepository.findByEstado(EstadoDrone.RECARREGANDO)) {
                atualizarRecarga(drone, agora);
            }
            if (props.isDespachoAutomatico()) {
                despacharInterno(agora);
            }
        }
    }

    /** POST /api/simulacao/despachar: força um despacho agora. */
    public List<Viagem> despachar() {
        synchronized (trava) {
            return despacharInterno(relogio.agora());
        }
    }

    // =====================================================================
    // Despacho: fila -> planejador -> viagens
    // =====================================================================

    List<Viagem> despacharInterno(Instant agora) {
        List<Pedido> pendentes = pedidoRepository.findByStatus(StatusPedido.PENDENTE);
        List<Drone> livres = droneRepository.findByEstado(EstadoDrone.IDLE);
        if (pendentes.isEmpty() || livres.isEmpty()) {
            return List.of();
        }

        List<ItemFila> fila = FilaEntregas.ordenar(pendentes, agora, props.getFatorTempo(),
                props.getMinutosEnvelhecimento());
        MapaAereo mapa = mapaService.mapa();
        Planejamento planejamento = planejador.planejar(fila, livres, cidade.base(), mapa);

        List<Viagem> criadas = new ArrayList<>();
        Set<String> usados = new HashSet<>();
        for (PlanoViagem plano : planejamento.viagens()) {
            criadas.add(iniciarViagem(plano, mapa, agora));
            usados.add(plano.drone().getId());
        }

        // Recarga automática: sobrou fila, mas o drone livre não conseguiu levar nada
        // com a bateria que tem -> vai recarregar em vez de ficar parado.
        if (!planejamento.naoAlocados().isEmpty()) {
            for (Drone drone : livres) {
                if (!usados.contains(drone.getId()) && drone.getBateria() < 100) {
                    iniciarRecarga(drone, agora);
                    droneRepository.save(drone);
                }
            }
        }
        if (!criadas.isEmpty()) {
            log.info("Despacho: {} viagem(ns) criada(s), {} pedido(s) ainda na fila.",
                    criadas.size(), planejamento.naoAlocados().size());
        }
        return criadas;
    }

    Viagem iniciarViagem(PlanoViagem plano, MapaAereo mapa, Instant agora) {
        Drone drone = plano.drone();
        LinhaDoTempo linha = LinhaDoTempo.montar(cidade.base(), plano.pedidos(), mapa, drone.getVelocidadeKmh(),
                props.getTempoCarregamentoMin(), props.getTempoEntregaMin());

        Viagem viagem = new Viagem();
        viagem.setDroneId(drone.getId());
        viagem.setDroneNome(drone.getNome());
        viagem.setStatus(StatusViagem.EM_ANDAMENTO);
        viagem.setInicio(agora);
        viagem.setDuracaoMin(linha.duracaoMin());
        viagem.setDistanciaKm(linha.distanciaKm());
        viagem.setPesoKg(plano.pesoKg());
        viagem.setCapacidadeKg(drone.getCapacidadeKg());
        viagem.setBateriaNaPartida(drone.getBateria());
        viagem.setConsumoPorKm(drone.consumoPorKm());
        viagem.setAlgoritmo(plano.metodo().name());
        viagem.setPedidoIds(plano.pedidos().stream().map(Pedido::getId).toList());
        viagem.setParadas(linha.paradas());
        viagem.setCaminho(linha.caminho());
        viagem.setFases(linha.fases());
        Viagem salva = viagemRepository.save(viagem);

        for (Pedido pedido : plano.pedidos()) {
            pedido.setStatus(StatusPedido.ALOCADO);
            pedido.setAlocadoEm(agora);
            pedido.setDroneId(drone.getId());
            pedido.setDroneNome(drone.getNome());
            pedido.setViagemId(salva.getId());
        }
        pedidoRepository.saveAll(plano.pedidos());

        drone.setEstado(EstadoDrone.CARREGANDO);
        drone.setViagemAtualId(salva.getId());
        droneRepository.save(drone);
        return salva;
    }

    // =====================================================================
    // Avanço das viagens (máquina de estados do drone)
    // =====================================================================

    void atualizarViagem(Viagem viagem, Instant agora) {
        Drone drone = droneRepository.findById(viagem.getDroneId()).orElse(null);
        List<Pedido> pedidos = pedidoRepository.findByViagemId(viagem.getId());
        double t = relogio.minutosEntre(viagem.getInicio(), agora);

        if (t >= viagem.getDuracaoMin()) {
            concluirViagem(viagem, drone, pedidos);
            return;
        }

        Fase fase = LinhaDoTempo.faseEm(viagem.getFases(), t);
        double km = LinhaDoTempo.kmEm(viagem.getFases(), t);
        double fimCarregamento = viagem.getFases().get(0).fimMin();

        List<Pedido> alterados = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            Parada parada = paradaDo(viagem, pedido.getId());
            if (pedido.getStatus() != StatusPedido.ENTREGUE && parada != null && t >= parada.minutoEntrega()) {
                marcarEntregue(pedido, viagem, parada, fimCarregamento);
                alterados.add(pedido);
            } else if (pedido.getStatus() == StatusPedido.ALOCADO && t >= fimCarregamento) {
                pedido.setStatus(StatusPedido.EM_ROTA);
                pedido.setSaiuParaEntregaEm(relogio.depoisDe(viagem.getInicio(), fimCarregamento));
                alterados.add(pedido);
            }
        }
        if (!alterados.isEmpty()) {
            pedidoRepository.saveAll(alterados);
        }

        if (drone != null) {
            Ponto posicao = LinhaDoTempo.pontoNoCaminho(viagem.getCaminho(), km);
            drone.setEstado(fase.estado());
            drone.setX(posicao.x());
            drone.setY(posicao.y());
            drone.setBateria(Math.max(0, viagem.getBateriaNaPartida() - km * viagem.getConsumoPorKm()));
            droneRepository.save(drone);
        }
    }

    void concluirViagem(Viagem viagem, Drone drone, List<Pedido> pedidos) {
        Instant fim = relogio.depoisDe(viagem.getInicio(), viagem.getDuracaoMin());
        double fimCarregamento = viagem.getFases().isEmpty() ? 0 : viagem.getFases().get(0).fimMin();

        List<Pedido> alterados = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            if (pedido.getStatus() != StatusPedido.ENTREGUE) {
                marcarEntregue(pedido, viagem, paradaDo(viagem, pedido.getId()), fimCarregamento);
                alterados.add(pedido);
            }
        }
        if (!alterados.isEmpty()) {
            pedidoRepository.saveAll(alterados);
        }

        viagem.setStatus(StatusViagem.CONCLUIDA);
        viagem.setFim(fim);
        viagemRepository.save(viagem);

        if (drone != null) {
            Ponto base = cidade.base();
            drone.setX(base.x());
            drone.setY(base.y());
            drone.setBateria(Math.max(0, viagem.getBateriaNaPartida() - viagem.getDistanciaKm() * viagem.getConsumoPorKm()));
            drone.setEntregasRealizadas(drone.getEntregasRealizadas() + viagem.getParadas().size());
            drone.setViagensRealizadas(drone.getViagensRealizadas() + 1);
            drone.setDistanciaTotalKm(drone.getDistanciaTotalKm() + viagem.getDistanciaKm());
            drone.setPesoTotalEntregueKg(drone.getPesoTotalEntregueKg() + viagem.getPesoKg());
            drone.setTempoVooTotalMin(drone.getTempoVooTotalMin() + viagem.getDuracaoMin());
            drone.setViagemAtualId(null);
            if (drone.getBateria() < props.getLimiarRecarga()) {
                iniciarRecarga(drone, fim);  // RETORNANDO -> RECARREGANDO
            } else {
                drone.setEstado(EstadoDrone.IDLE); // RETORNANDO -> IDLE
            }
            droneRepository.save(drone);
        }
    }

    private void marcarEntregue(Pedido pedido, Viagem viagem, Parada parada, double fimCarregamento) {
        if (pedido.getSaiuParaEntregaEm() == null) {
            pedido.setSaiuParaEntregaEm(relogio.depoisDe(viagem.getInicio(), fimCarregamento));
        }
        double minuto = parada != null ? parada.minutoEntrega() : viagem.getDuracaoMin();
        pedido.setStatus(StatusPedido.ENTREGUE);
        pedido.setEntregueEm(relogio.depoisDe(viagem.getInicio(), minuto));
    }

    private static Parada paradaDo(Viagem viagem, String pedidoId) {
        return viagem.getParadas().stream().filter(p -> p.pedidoId().equals(pedidoId)).findFirst().orElse(null);
    }

    // =====================================================================
    // Bateria
    // =====================================================================

    void iniciarRecarga(Drone drone, Instant inicio) {
        double minutos = (100 - drone.getBateria()) / props.getRecargaPorMinuto();
        drone.setEstado(EstadoDrone.RECARREGANDO);
        drone.setRecargaAte(relogio.depoisDe(inicio, minutos));
    }

    void atualizarRecarga(Drone drone, Instant agora) {
        if (drone.getRecargaAte() == null || !agora.isBefore(drone.getRecargaAte())) {
            drone.setBateria(100);
            drone.setEstado(EstadoDrone.IDLE);
            drone.setRecargaAte(null);
        } else {
            double faltamMin = relogio.minutosEntre(agora, drone.getRecargaAte());
            drone.setBateria(Math.max(drone.getBateria(), 100 - faltamMin * props.getRecargaPorMinuto()));
        }
        droneRepository.save(drone);
    }

    // =====================================================================
    // Dados de exemplo
    // =====================================================================

    public void popularSeVazio() {
        synchronized (trava) {
            Ponto base = cidade.base();
            if (droneRepository.count() == 0) {
                droneRepository.saveAll(List.of(
                        new Drone("Falcão", 10, 30, 60, base),
                        new Drone("Colibri", 4, 22, 80, base),
                        new Drone("Albatroz", 15, 26, 45, base),
                        new Drone("Gavião", 8, 28, 65, base)));
                log.info("Frota de exemplo criada (4 drones).");
            }
            if (zonaRepository.count() == 0) {
                zonaRepository.saveAll(List.of(
                        new ZonaExclusao("Aeroporto", 12.5, 13, 15.5, 16.5),
                        new ZonaExclusao("Hospital (heliponto)", 4, 11, 6, 13.5),
                        new ZonaExclusao("Estádio", 9, 3.5, 12, 5.5)));
                mapaService.invalidar();
                log.info("Zonas de exclusão de exemplo criadas (3).");
            }
        }
    }

    /** Apaga tudo, recria a frota/zonas de exemplo e gera "pedidosDemo" pedidos aleatórios. */
    public void reiniciar(int pedidosDemo) {
        synchronized (trava) {
            viagemRepository.deleteAll();
            pedidoRepository.deleteAll();
            droneRepository.deleteAll();
            zonaRepository.deleteAll();
            mapaService.invalidar();
            popularSeVazio();
            if (pedidosDemo > 0) {
                gerarPedidosAleatorios(pedidosDemo);
            }
        }
    }

    /** Gera pedidos válidos espalhados pela cidade (também serve de "simulação de carga"). */
    public List<Pedido> gerarPedidosAleatorios(int quantidade) {
        if (quantidade < 1 || quantidade > 500) {
            throw new IllegalArgumentException("A quantidade de pedidos aleatórios deve ficar entre 1 e 500.");
        }
        List<Drone> frota = droneRepository.findAll();
        if (frota.isEmpty()) {
            throw new IllegalArgumentException("Cadastre drones antes de gerar pedidos.");
        }
        MapaAereo mapa = mapaService.mapa();
        Ponto base = cidade.base();
        double alcanceSeguro = frota.stream().mapToDouble(Drone::getAlcanceKm).min().orElse(0) * 0.9;
        double pesoMaximo = Math.min(6, frota.stream().mapToDouble(Drone::getCapacidadeKg).min().orElse(1));
        Instant agora = relogio.agora();

        List<Pedido> novos = new ArrayList<>();
        int tentativas = 0;
        while (novos.size() < quantidade && tentativas < quantidade * 50) {
            tentativas++;
            double x = arredondar(random.nextDouble() * cidade.getLarguraKm());
            double y = arredondar(random.nextDouble() * cidade.getAlturaKm());
            Ponto destino = new Ponto(x, y);
            if (mapa.bloqueado(destino) || 2 * mapa.distancia(base, destino) > alcanceSeguro) {
                continue;
            }
            // muitos pacotes leves e poucos pesados, como na vida real
            double peso = arredondar(0.2 + Math.pow(random.nextDouble(), 2) * (pesoMaximo - 0.2));
            double sorteio = random.nextDouble();
            Prioridade prioridade = sorteio < 0.5 ? Prioridade.BAIXA : sorteio < 0.8 ? Prioridade.MEDIA : Prioridade.ALTA;
            String cliente = NOMES[random.nextInt(NOMES.length)];
            novos.add(new Pedido(cliente, x, y, peso, prioridade, agora.plusMillis(novos.size())));
        }
        return pedidoRepository.saveAll(novos);
    }

    private static double arredondar(double v) {
        return Math.round(v * 10) / 10.0;
    }

    public SimulacaoStatusResponse status() {
        return new SimulacaoStatusResponse(relogio.agora(), props.getFatorTempo(), props.isDespachoAutomatico(),
                cidade.getLarguraKm(), cidade.getAlturaKm(), cidade.base(), cidade.getMetrosPorQuadra(),
                droneRepository.count(), pedidoRepository.countByStatus(StatusPedido.PENDENTE),
                viagemRepository.findByStatus(StatusViagem.EM_ANDAMENTO).size());
    }
}
