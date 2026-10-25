package com.dti.drones.algoritmo;

import com.dti.drones.model.Ponto;
import com.dti.drones.model.ZonaExclusao;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * O espaço aéreo da cidade, com as zonas de exclusão (obstáculos).
 *
 * Como achar o menor caminho desviando de retângulos?
 *
 *  1. Se a linha reta A -> B não atravessa nenhuma zona, é ela.
 *  2. Senão, monta um "grafo de visibilidade": os nós são A, B e os 4 cantos
 *     de cada zona (afastados 50 m para o drone não raspar na borda). Liga dois
 *     nós quando a linha reta entre eles não atravessa nenhuma zona.
 *  3. Roda Dijkstra nesse grafo: o menor caminho entre A e B no grafo é o
 *     menor desvio possível ao redor dos retângulos.
 */
public class MapaAereo implements MedidorDistancia {

    /** Afastamento dos cantos (em km): 0,05 km = 50 m. */
    static final double MARGEM = 0.05;
    private static final double EPS = 1e-7;

    /** Um retângulo proibido. */
    public record Retangulo(String nome, double xMin, double yMin, double xMax, double yMax) {

        /** Ponto dentro do retângulo ou na borda. */
        public boolean contem(Ponto p) {
            return p.x() >= xMin && p.x() <= xMax && p.y() >= yMin && p.y() <= yMax;
        }

        /** Ponto estritamente dentro (a borda não conta). */
        boolean contemNoInterior(Ponto p) {
            return p.x() > xMin + EPS && p.x() < xMax - EPS && p.y() > yMin + EPS && p.y() < yMax - EPS;
        }

        List<Ponto> cantosAfastados() {
            return List.of(
                    new Ponto(xMin - MARGEM, yMin - MARGEM),
                    new Ponto(xMax + MARGEM, yMin - MARGEM),
                    new Ponto(xMax + MARGEM, yMax + MARGEM),
                    new Ponto(xMin - MARGEM, yMax + MARGEM));
        }

        /**
         * O segmento A-B passa pelo INTERIOR do retângulo?
         * Algoritmo de recorte de Liang-Barsky: calcula em que "pedaço" t do
         * segmento (0 = A, 1 = B) ele está dentro do retângulo.
         */
        boolean atravessadoPor(Ponto a, Ponto b) {
            double x0 = xMin + EPS, x1 = xMax - EPS, y0 = yMin + EPS, y1 = yMax - EPS;
            double dx = b.x() - a.x();
            double dy = b.y() - a.y();
            double[] p = {-dx, dx, -dy, dy};
            double[] q = {a.x() - x0, x1 - a.x(), a.y() - y0, y1 - a.y()};
            double tEntrada = 0;
            double tSaida = 1;
            for (int i = 0; i < 4; i++) {
                if (Math.abs(p[i]) < 1e-15) {
                    if (q[i] < 0) {
                        return false; // paralelo e do lado de fora
                    }
                } else {
                    double t = q[i] / p[i];
                    if (p[i] < 0) {
                        if (t > tSaida) return false;
                        if (t > tEntrada) tEntrada = t;
                    } else {
                        if (t < tEntrada) return false;
                        if (t < tSaida) tSaida = t;
                    }
                }
            }
            return tSaida - tEntrada > 1e-9;
        }
    }

    /** Caminho entre dois pontos: lista de pontos (com os desvios) e a distância total. */
    public record Trajeto(List<Ponto> pontos, double distancia) {
        public boolean possivel() {
            return !Double.isInfinite(distancia);
        }
    }

    private final List<Retangulo> zonas;
    private final List<Ponto> cantosValidos;
    private final Map<String, Trajeto> cache = new ConcurrentHashMap<>();

    public MapaAereo(List<Retangulo> zonas) {
        this.zonas = List.copyOf(zonas);
        List<Ponto> cantos = new ArrayList<>();
        for (Retangulo z : this.zonas) {
            for (Ponto canto : z.cantosAfastados()) {
                // um canto que cai dentro de outra zona não serve de "esquina"
                if (this.zonas.stream().noneMatch(outra -> outra.contemNoInterior(canto))) {
                    cantos.add(canto);
                }
            }
        }
        this.cantosValidos = List.copyOf(cantos);
    }

    public static MapaAereo semObstaculos() {
        return new MapaAereo(List.of());
    }

    public static MapaAereo de(List<ZonaExclusao> zonas) {
        return new MapaAereo(zonas.stream()
                .map(z -> new Retangulo(z.getNome(), z.getXMin(), z.getYMin(), z.getXMax(), z.getYMax()))
                .toList());
    }

    public List<Retangulo> getZonas() {
        return zonas;
    }

    /** O ponto cai dentro de alguma zona de exclusão? */
    public boolean bloqueado(Ponto p) {
        return zonas.stream().anyMatch(z -> z.contem(p));
    }

    /** Nome da zona que contém o ponto (ou null). */
    public String zonaQueContem(Ponto p) {
        return zonas.stream().filter(z -> z.contem(p)).map(Retangulo::nome).findFirst().orElse(null);
    }

    /** A linha reta entre A e B está livre de zonas? */
    public boolean visivel(Ponto a, Ponto b) {
        return zonas.stream().noneMatch(z -> z.atravessadoPor(a, b));
    }

    @Override
    public double distancia(Ponto a, Ponto b) {
        return trajeto(a, b).distancia();
    }

    /** Menor caminho de A até B desviando das zonas (com cache). */
    public Trajeto trajeto(Ponto a, Ponto b) {
        String chave = a.x() + "," + a.y() + ">" + b.x() + "," + b.y();
        return cache.computeIfAbsent(chave, k -> calcularTrajeto(a, b));
    }

    private Trajeto calcularTrajeto(Ponto a, Ponto b) {
        if (visivel(a, b)) {
            return new Trajeto(List.of(a, b), a.distanciaAte(b));
        }
        // Nós do grafo: 0 = A, 1 = B, 2.. = cantos
        List<Ponto> nos = new ArrayList<>();
        nos.add(a);
        nos.add(b);
        nos.addAll(cantosValidos);
        return dijkstra(nos);
    }

    /** Dijkstra simples O(n²): o grafo tem poucos nós (2 + 4 por zona). */
    private Trajeto dijkstra(List<Ponto> nos) {
        int n = nos.size();
        double[] dist = new double[n];
        int[] anterior = new int[n];
        boolean[] fechado = new boolean[n];
        Arrays.fill(dist, Double.POSITIVE_INFINITY);
        Arrays.fill(anterior, -1);
        dist[0] = 0;

        for (int iter = 0; iter < n; iter++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!fechado[i] && (u == -1 || dist[i] < dist[u])) {
                    u = i;
                }
            }
            if (u == -1 || Double.isInfinite(dist[u])) {
                break;
            }
            if (u == 1) {
                break; // chegamos em B
            }
            fechado[u] = true;
            for (int v = 0; v < n; v++) {
                if (fechado[v] || v == u) {
                    continue;
                }
                if (!visivel(nos.get(u), nos.get(v))) {
                    continue;
                }
                double alternativa = dist[u] + nos.get(u).distanciaAte(nos.get(v));
                if (alternativa < dist[v]) {
                    dist[v] = alternativa;
                    anterior[v] = u;
                }
            }
        }

        if (Double.isInfinite(dist[1])) {
            return new Trajeto(List.of(), Double.POSITIVE_INFINITY);
        }
        List<Ponto> caminho = new ArrayList<>();
        for (int atual = 1; atual != -1; atual = anterior[atual]) {
            caminho.add(nos.get(atual));
        }
        Collections.reverse(caminho);
        return new Trajeto(List.copyOf(caminho), dist[1]);
    }
}
