package com.dti.drones.service;

import com.dti.drones.config.CidadeProperties;
import com.dti.drones.dto.DashboardResponse;
import com.dti.drones.dto.DashboardResponse.DroneRanking;
import com.dti.drones.dto.DashboardResponse.PontoEntrega;
import com.dti.drones.dto.DashboardResponse.ViagemResumo;
import com.dti.drones.dto.Numeros;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Prioridade;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.Viagem;
import com.dti.drones.model.ZonaExclusao;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ViagemRepository;
import com.dti.drones.repository.ZonaExclusaoRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Relatório: indicadores, ranking de drones, mapa ASCII e exportação CSV. */
@Service
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final ViagemRepository viagemRepository;
    private final DroneRepository droneRepository;
    private final ZonaExclusaoRepository zonaRepository;
    private final RelogioSimulacao relogio;
    private final CidadeProperties cidade;

    public DashboardService(PedidoRepository pedidoRepository, ViagemRepository viagemRepository,
                            DroneRepository droneRepository, ZonaExclusaoRepository zonaRepository,
                            RelogioSimulacao relogio, CidadeProperties cidade) {
        this.pedidoRepository = pedidoRepository;
        this.viagemRepository = viagemRepository;
        this.droneRepository = droneRepository;
        this.zonaRepository = zonaRepository;
        this.relogio = relogio;
        this.cidade = cidade;
    }

    public DashboardResponse calcular() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        List<Pedido> entregues = pedidos.stream()
                .filter(p -> p.getStatus() == StatusPedido.ENTREGUE && p.getEntregueEm() != null)
                .toList();
        List<Viagem> concluidas = viagemRepository.findByStatus(StatusViagem.CONCLUIDA);
        List<Drone> drones = droneRepository.findAll();

        long pendentes = contar(pedidos, StatusPedido.PENDENTE);
        long emAndamento = contar(pedidos, StatusPedido.ALOCADO) + contar(pedidos, StatusPedido.EM_ROTA);
        long cancelados = contar(pedidos, StatusPedido.CANCELADO);

        double tempoMedio = entregues.stream().mapToDouble(this::tempoEntrega).average().orElse(0);
        double tempoMedioViagem = concluidas.stream().mapToDouble(Viagem::getDuracaoMin).average().orElse(0);
        double distanciaTotal = concluidas.stream().mapToDouble(Viagem::getDistanciaKm).sum();
        double pacotesPorViagem = concluidas.stream().mapToInt(v -> v.getParadas().size()).average().orElse(0);
        double ocupacao = concluidas.stream().mapToDouble(Viagem::ocupacaoPercentual).average().orElse(0);

        List<DroneRanking> ranking = drones.stream()
                .map(d -> new DroneRanking(d.getId(), d.getNome(), d.getEntregasRealizadas(), d.getViagensRealizadas(),
                        Numeros.r2(d.getDistanciaTotalKm()), Numeros.r2(d.getPesoTotalEntregueKg()),
                        Numeros.r2(d.getDistanciaTotalKm() > 0 ? d.getEntregasRealizadas() / d.getDistanciaTotalKm() : 0),
                        Numeros.r2(d.getDistanciaTotalKm() > 0 ? d.getPesoTotalEntregueKg() / d.getDistanciaTotalKm() : 0)))
                .sorted(Comparator.comparingDouble(DroneRanking::entregasPorKm).reversed()
                        .thenComparing(Comparator.comparingDouble(DroneRanking::kgPorKm).reversed()))
                .toList();
        DroneRanking maisEficiente = ranking.stream().filter(r -> r.entregas() > 0).findFirst().orElse(null);

        Map<String, Long> porPrioridade = new LinkedHashMap<>();
        Map<String, Double> tempoPorPrioridade = new LinkedHashMap<>();
        for (Prioridade p : Prioridade.values()) {
            List<Pedido> daPrioridade = entregues.stream().filter(e -> e.getPrioridade() == p).toList();
            porPrioridade.put(p.name(), (long) daPrioridade.size());
            tempoPorPrioridade.put(p.name(),
                    Numeros.r1(daPrioridade.stream().mapToDouble(this::tempoEntrega).average().orElse(0)));
        }

        List<PontoEntrega> mapa = entregues.stream()
                .sorted(Comparator.comparing(Pedido::getEntregueEm).reversed())
                .limit(300)
                .map(p -> new PontoEntrega(p.getX(), p.getY(), p.getPrioridade().name(), Numeros.r1(tempoEntrega(p))))
                .toList();

        List<ViagemResumo> ultimas = concluidas.stream()
                .filter(v -> v.getFim() != null)
                .sorted(Comparator.comparing(Viagem::getFim).reversed())
                .limit(20)
                .map(v -> new ViagemResumo(v.getId(), v.getDroneNome(), v.getParadas().size(),
                        Numeros.r2(v.getDistanciaKm()), Numeros.r1(v.ocupacaoPercentual()),
                        Numeros.r1(v.getDuracaoMin()), v.getAlgoritmo(), v.getFim()))
                .toList();

        return new DashboardResponse(entregues.size(), pendentes, emAndamento, cancelados, concluidas.size(),
                Numeros.r1(tempoMedio), Numeros.r1(tempoMedioViagem), Numeros.r2(distanciaTotal),
                Numeros.r2(pacotesPorViagem), Numeros.r1(ocupacao), maisEficiente, ranking,
                porPrioridade, tempoPorPrioridade, mapa, ultimas);
    }

    private static long contar(List<Pedido> pedidos, StatusPedido status) {
        return pedidos.stream().filter(p -> p.getStatus() == status).count();
    }

    /** Minutos simulados entre o pedido e a entrega. */
    double tempoEntrega(Pedido p) {
        return relogio.minutosEntre(p.getCriadoEm(), p.getEntregueEm());
    }

    /**
     * Mapa em texto (ASCII), como pede o case. Cada coluna = 0,5 km, cada linha = 1 km.
     *   B base   # zona proibida   letra = drone   ! pedido alta   o pedido na fila   * entregue
     */
    public String mapaAscii() {
        int colunas = (int) Math.round(cidade.getLarguraKm() * 2) + 1;
        int linhas = (int) Math.round(cidade.getAlturaKm()) + 1;
        char[][] grade = new char[linhas][colunas];
        for (char[] linha : grade) {
            java.util.Arrays.fill(linha, '.');
        }
        for (ZonaExclusao z : zonaRepository.findAll()) {
            for (int l = 0; l < linhas; l++) {
                for (int c = 0; c < colunas; c++) {
                    double x = c / 2.0;
                    double y = cidade.getAlturaKm() - l;
                    if (x >= z.getXMin() && x <= z.getXMax() && y >= z.getYMin() && y <= z.getYMax()) {
                        grade[l][c] = '#';
                    }
                }
            }
        }
        for (Pedido p : pedidoRepository.findAll()) {
            char simbolo = switch (p.getStatus()) {
                case ENTREGUE -> '*';
                case PENDENTE -> p.getPrioridade() == Prioridade.ALTA ? '!' : 'o';
                case ALOCADO, EM_ROTA -> '+';
                case CANCELADO -> ' ';
            };
            if (simbolo != ' ') {
                marcar(grade, p.getX(), p.getY(), simbolo);
            }
        }
        marcar(grade, cidade.getBaseX(), cidade.getBaseY(), 'B');
        for (Drone d : droneRepository.findAll()) {
            if (d.getEstado().emOperacao()) {
                marcar(grade, d.getX(), d.getY(), Character.toUpperCase(d.getNome().charAt(0)));
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Mapa das entregas (").append(relogio.agora()).append(")\n");
        for (int l = 0; l < linhas; l++) {
            sb.append(String.format("%2d ", (int) (cidade.getAlturaKm() - l))).append(grade[l]).append('\n');
        }
        sb.append("   0         5         10        15        20 km\n");
        sb.append("Legenda: B base | # zona de exclusão | letra = drone voando | ! alta na fila | o na fila | + em rota | * entregue\n");
        return sb.toString();
    }

    private void marcar(char[][] grade, double x, double y, char simbolo) {
        int c = (int) Math.round(x * 2);
        int l = (int) Math.round(cidade.getAlturaKm() - y);
        if (l >= 0 && l < grade.length && c >= 0 && c < grade[0].length) {
            grade[l][c] = simbolo;
        }
    }

    /** CSV das entregas (para abrir no Excel, Google Sheets, Flourish ou Tableau). */
    public String csvEntregas() {
        StringBuilder sb = new StringBuilder("pedido_id;cliente;x;y;peso_kg;prioridade;drone;criado_em;entregue_em;tempo_entrega_min\n");
        pedidoRepository.findByStatus(StatusPedido.ENTREGUE).stream()
                .filter(p -> p.getEntregueEm() != null)
                .sorted(Comparator.comparing(Pedido::getEntregueEm))
                .forEach(p -> sb.append(String.join(";",
                        p.getId(), p.getCliente().replace(";", ","),
                        fmt(p.getX()), fmt(p.getY()), fmt(p.getPesoKg()), p.getPrioridade().name(),
                        p.getDroneNome() == null ? "" : p.getDroneNome(),
                        String.valueOf(p.getCriadoEm()), String.valueOf(p.getEntregueEm()),
                        fmt(tempoEntrega(p)))).append('\n'));
        return sb.toString();
    }

    private static String fmt(double v) {
        return String.format(Locale.ROOT, "%.2f", v);
    }
}
