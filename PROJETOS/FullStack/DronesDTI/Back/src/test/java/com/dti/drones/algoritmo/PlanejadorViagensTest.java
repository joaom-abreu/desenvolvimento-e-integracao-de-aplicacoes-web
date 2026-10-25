package com.dti.drones.algoritmo;

import com.dti.drones.algoritmo.FilaEntregas.ItemFila;
import com.dti.drones.algoritmo.PlanejadorViagens.Planejamento;
import com.dti.drones.algoritmo.PlanejadorViagens.PlanoViagem;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;
import com.dti.drones.model.Prioridade;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Planejador de viagens (menor número de viagens)")
class PlanejadorViagensTest {

    private static final Ponto BASE = new Ponto(10, 10);
    private static final Instant AGORA = Instant.parse("2026-10-24T12:00:00Z");
    private final PlanejadorViagens planejador = new PlanejadorViagens(new CaixeiroViajante(8), 10);
    private final MapaAereo mapa = MapaAereo.semObstaculos();
    private int sequencia = 0;

    private static Drone drone(String nome, double capacidade, double alcance) {
        Drone d = new Drone(nome, capacidade, alcance, 60, BASE);
        d.setId(nome);
        return d;
    }

    private Pedido pedido(double x, double y, double peso, Prioridade prioridade) {
        sequencia++;
        Pedido p = new Pedido("C" + sequencia, x, y, peso, prioridade, AGORA.plusMillis(sequencia));
        p.setId("p" + sequencia);
        return p;
    }

    private static List<ItemFila> fila(List<Pedido> pedidos) {
        return FilaEntregas.ordenar(pedidos, AGORA.plusSeconds(1), 60, 30);
    }

    @Test
    @DisplayName("junta 5 pacotes leves e próximos em UMA viagem")
    void consolida() {
        List<Pedido> pedidos = List.of(
                pedido(11, 10, 1, Prioridade.BAIXA), pedido(12, 10, 1, Prioridade.MEDIA),
                pedido(10, 11, 1, Prioridade.BAIXA), pedido(9, 10, 1, Prioridade.ALTA),
                pedido(10, 9, 1, Prioridade.BAIXA));

        Planejamento p = planejador.planejarTudo(fila(pedidos), List.of(drone("Falcão", 10, 30)), BASE, mapa);

        assertEquals(1, p.viagens().size());
        assertEquals(5, p.viagens().get(0).pedidos().size());
        assertTrue(p.naoAlocados().isEmpty());
    }

    @Test
    @DisplayName("nunca passa da capacidade do drone")
    void capacidade() {
        List<Pedido> pedidos = List.of(pedido(11, 10, 3, Prioridade.BAIXA),
                pedido(12, 10, 3, Prioridade.BAIXA), pedido(13, 10, 3, Prioridade.BAIXA));

        Planejamento p = planejador.planejarTudo(fila(pedidos), List.of(drone("Mini", 5, 30)), BASE, mapa);

        assertEquals(3, p.viagens().size());
        p.viagens().forEach(v -> assertTrue(v.pesoKg() <= 5));
    }

    @Test
    @DisplayName("nunca passa do alcance: dois clientes em lados opostos viram duas viagens")
    void alcance() {
        List<Pedido> pedidos = List.of(pedido(14, 10, 1, Prioridade.BAIXA), pedido(6, 10, 1, Prioridade.BAIXA));

        Planejamento p = planejador.planejarTudo(fila(pedidos), List.of(drone("Curto", 10, 10)), BASE, mapa);

        assertEquals(2, p.viagens().size());
        p.viagens().forEach(v -> assertTrue(v.distanciaKm() <= 10 + 1e-9));
    }

    @Test
    @DisplayName("prioridade ALTA sai primeiro, mesmo tendo chegado depois")
    void prioridade() {
        Pedido baixa = pedido(11, 10, 2, Prioridade.BAIXA);
        Pedido alta = pedido(9, 10, 2, Prioridade.ALTA);

        Planejamento p = planejador.planejar(fila(List.of(baixa, alta)), List.of(drone("Mini", 2, 30)), BASE, mapa);

        assertEquals(1, p.viagens().size());
        assertEquals(alta.getId(), p.viagens().get(0).pedidos().get(0).getId());
        assertEquals(baixa.getId(), p.naoAlocados().get(0).pedido().getId());
    }

    @Test
    @DisplayName("pacote mais pesado que o drone fica de fora")
    void pesadoDemais() {
        Planejamento p = planejador.planejarTudo(fila(List.of(pedido(11, 10, 20, Prioridade.ALTA))),
                List.of(drone("Falcão", 10, 30)), BASE, mapa);

        assertTrue(p.viagens().isEmpty());
        assertEquals(1, p.naoAlocados().size());
    }

    @Test
    @DisplayName("usa a bateria ATUAL: com 20% o drone não alcança um cliente a 4 km")
    void bateria() {
        Drone fraco = drone("Fraco", 10, 30);
        fraco.setBateria(20); // 30 km * 20% = 6 km disponíveis; ida e volta = 8 km

        Planejamento p = planejador.planejar(fila(List.of(pedido(14, 10, 1, Prioridade.ALTA))),
                List.of(fraco), BASE, mapa);

        assertTrue(p.viagens().isEmpty());
    }

    @Test
    @DisplayName("carga: 500 pedidos aleatórios, todos alocados respeitando as regras, em menos de 5 s")
    void cargaComQuinhentosPedidos() {
        Random random = new Random(2026);
        List<Pedido> pedidos = new ArrayList<>();
        while (pedidos.size() < 500) {
            double x = random.nextDouble() * 20;
            double y = random.nextDouble() * 20;
            if (2 * BASE.distanciaAte(new Ponto(x, y)) > 20) {
                continue;
            }
            Prioridade prioridade = Prioridade.values()[random.nextInt(3)];
            pedidos.add(pedido(x, y, 0.2 + random.nextDouble() * 3.8, prioridade));
        }
        List<Drone> frota = List.of(drone("Falcão", 10, 30), drone("Colibri", 4, 22),
                drone("Albatroz", 15, 26), drone("Gavião", 8, 28));

        long inicio = System.nanoTime();
        Planejamento p = planejador.planejarTudo(fila(pedidos), frota, BASE, mapa);
        double segundos = (System.nanoTime() - inicio) / 1e9;

        int pacotes = p.viagens().stream().mapToInt(v -> v.pedidos().size()).sum();
        assertEquals(500, pacotes);
        assertTrue(p.naoAlocados().isEmpty());
        for (PlanoViagem v : p.viagens()) {
            assertTrue(v.pesoKg() <= v.drone().getCapacidadeKg() + 1e-9, "capacidade");
            assertTrue(v.distanciaKm() <= v.drone().getAlcanceKm() + 1e-9, "alcance");
        }
        int minimo = PlanejadorViagens.minimoTeoricoDeViagens(pedidos, frota);
        assertTrue(p.viagens().size() >= minimo);
        assertTrue(segundos < 5, "demorou " + segundos + " s");
        System.out.printf("500 pedidos -> %d viagens (mínimo teórico pelo peso: %d) em %.2f s%n",
                p.viagens().size(), minimo, segundos);
    }
}
