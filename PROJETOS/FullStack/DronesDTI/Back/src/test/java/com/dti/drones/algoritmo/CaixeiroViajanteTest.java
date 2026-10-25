package com.dti.drones.algoritmo;

import com.dti.drones.model.Ponto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Caixeiro Viajante (rota de cada viagem)")
class CaixeiroViajanteTest {

    private static final Ponto BASE = new Ponto(0, 0);
    private final CaixeiroViajante caixeiro = new CaixeiroViajante(8);

    @Test
    @DisplayName("sem paradas, a distância é zero")
    void semParadas() {
        CaixeiroViajante.Resultado r = caixeiro.resolver(BASE, List.of(), MedidorDistancia.LINHA_RETA);
        assertEquals(0, r.distancia(), 1e-9);
        assertTrue(r.ordem().isEmpty());
    }

    @Test
    @DisplayName("uma parada: ida e volta (triângulo 3-4-5 -> 10 km)")
    void umaParada() {
        CaixeiroViajante.Resultado r = caixeiro.resolver(BASE, List.of(new Ponto(3, 4)), MedidorDistancia.LINHA_RETA);
        assertEquals(10, r.distancia(), 1e-9);
        assertEquals(CaixeiroViajante.Metodo.TRIVIAL, r.metodo());
    }

    @Test
    @DisplayName("quadrado: o exato encontra o perímetro (4 km)")
    void quadrado() {
        List<Ponto> paradas = List.of(new Ponto(1, 1), new Ponto(0, 1), new Ponto(1, 0));
        CaixeiroViajante.Resultado r = caixeiro.resolver(BASE, paradas, MedidorDistancia.LINHA_RETA);
        assertEquals(4, r.distancia(), 1e-9);
        assertEquals(CaixeiroViajante.Metodo.EXATO, r.metodo());
    }

    @Test
    @DisplayName("exato = força bruta de todas as permutações (20 casos aleatórios)")
    void exatoIgualForcaBruta() {
        Random random = new Random(42);
        for (int caso = 0; caso < 20; caso++) {
            List<Ponto> paradas = pontosAleatorios(random, 6);
            CaixeiroViajante.Resultado r = caixeiro.resolver(BASE, paradas, MedidorDistancia.LINHA_RETA);
            assertEquals(forcaBruta(paradas), r.distancia(), 1e-9, "caso " + caso);
        }
    }

    @Test
    @DisplayName("muitas paradas: usa a heurística e visita todas exatamente uma vez")
    void heuristica() {
        List<Ponto> paradas = pontosAleatorios(new Random(7), 15);
        CaixeiroViajante.Resultado r = caixeiro.resolver(BASE, paradas, MedidorDistancia.LINHA_RETA);
        assertEquals(CaixeiroViajante.Metodo.VIZINHO_MAIS_PROXIMO_2OPT, r.metodo());
        assertEquals(15, r.ordem().size());
        assertEquals(15, new HashSet<>(r.ordem()).size());
    }

    @Test
    @DisplayName("vizinho mais próximo (recursão em cauda) segue os pontos em linha")
    void vizinhoMaisProximoEmLinha() {
        double[][] d = matriz(List.of(BASE, new Ponto(3, 0), new Ponto(1, 0), new Ponto(2, 0)));
        assertEquals(List.of(2, 3, 1), CaixeiroViajante.vizinhoMaisProximo(d));
    }

    @Test
    @DisplayName("2-opt desfaz cruzamentos: ordem embaralhada num círculo vira o polígono")
    void doisOpt() {
        List<Ponto> pontos = new ArrayList<>();
        pontos.add(new Ponto(10, 0)); // base no círculo
        for (int i = 1; i < 8; i++) {
            double ang = 2 * Math.PI * i / 8;
            pontos.add(new Ponto(10 * Math.cos(ang), 10 * Math.sin(ang)));
        }
        double[][] d = matriz(pontos);
        List<Integer> ruim = List.of(4, 1, 6, 3, 7, 2, 5);
        List<Integer> melhorada = CaixeiroViajante.doisOpt(d, ruim);
        double perimetro = 8 * d[0][1];
        assertTrue(CaixeiroViajante.custoDoCircuito(d, melhorada) < CaixeiroViajante.custoDoCircuito(d, ruim));
        assertEquals(perimetro, CaixeiroViajante.custoDoCircuito(d, melhorada), 1e-6);
    }

    @Test
    @DisplayName("custo recursivo (acumulador) = soma iterativa")
    void custoRecursivo() {
        List<Ponto> pontos = List.of(BASE, new Ponto(0, 3), new Ponto(4, 3), new Ponto(4, 0));
        double[][] d = matriz(pontos);
        assertEquals(14, CaixeiroViajante.custoDoCircuito(d, List.of(1, 2, 3)), 1e-9);
    }

    @Test
    @DisplayName("recursão em cauda aguenta 1000 paradas sem StackOverflowError")
    void recursaoProfunda() {
        List<Ponto> pontos = new ArrayList<>();
        pontos.add(BASE);
        pontos.addAll(pontosAleatorios(new Random(1), 1000));
        List<Integer> ordem = CaixeiroViajante.vizinhoMaisProximo(matriz(pontos));
        assertEquals(1000, ordem.size());
    }

    // ---------------------------------------------------------------- auxiliares

    private static List<Ponto> pontosAleatorios(Random random, int n) {
        List<Ponto> pontos = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            pontos.add(new Ponto(random.nextDouble() * 20 - 10, random.nextDouble() * 20 - 10));
        }
        return pontos;
    }

    private static double[][] matriz(List<Ponto> pontos) {
        double[][] d = new double[pontos.size()][pontos.size()];
        for (int i = 0; i < pontos.size(); i++) {
            for (int j = 0; j < pontos.size(); j++) {
                d[i][j] = pontos.get(i).distanciaAte(pontos.get(j));
            }
        }
        return d;
    }

    /** Testa as n! ordens possíveis (só para conferir o algoritmo exato). */
    private static double forcaBruta(List<Ponto> paradas) {
        return permutar(paradas, new ArrayList<>(), new boolean[paradas.size()]);
    }

    private static double permutar(List<Ponto> paradas, List<Ponto> atual, boolean[] usado) {
        if (atual.size() == paradas.size()) {
            double total = 0;
            Ponto anterior = BASE;
            for (Ponto p : atual) {
                total += anterior.distanciaAte(p);
                anterior = p;
            }
            return total + anterior.distanciaAte(BASE);
        }
        double melhor = Double.POSITIVE_INFINITY;
        for (int i = 0; i < paradas.size(); i++) {
            if (!usado[i]) {
                usado[i] = true;
                atual.add(paradas.get(i));
                melhor = Math.min(melhor, permutar(paradas, atual, usado));
                atual.remove(atual.size() - 1);
                usado[i] = false;
            }
        }
        return melhor;
    }
}
