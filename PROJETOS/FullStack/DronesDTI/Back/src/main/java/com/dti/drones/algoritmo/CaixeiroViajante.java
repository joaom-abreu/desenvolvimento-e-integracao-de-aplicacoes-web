package com.dti.drones.algoritmo;

import com.dti.drones.model.Ponto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

/**
 * Problema do Caixeiro Viajante (TSP - Travelling Salesman Problem).
 *
 * Pergunta: o drone sai da base, precisa passar por N clientes e voltar.
 * Em que ordem visitar os clientes para voar a MENOR distância?
 *
 * O número de ordens possíveis é N! (fatorial). Por isso usamos duas estratégias:
 *
 *  1. EXATO (N <= limiteExato, padrão 8 -> 8! = 40.320 ordens):
 *     backtracking recursivo com poda ("branch and bound"). Garante a melhor rota.
 *
 *  2. HEURÍSTICO (N > limiteExato):
 *     vizinho mais próximo (RECURSÃO EM CAUDA) + melhoria 2-opt.
 *     Não garante o ótimo, mas é rápido e costuma ficar a poucos % dele.
 *
 * Os índices trabalham sobre uma matriz de distâncias "d", onde a posição 0
 * é a base e as posições 1..N são os clientes.
 */
public final class CaixeiroViajante {

    public enum Metodo {
        /** Nenhuma ou uma parada: não há o que ordenar. */
        TRIVIAL,
        /** Força bruta recursiva com poda: resultado ótimo. */
        EXATO,
        /** Vizinho mais próximo (recursão em cauda) + 2-opt: resultado aproximado. */
        VIZINHO_MAIS_PROXIMO_2OPT
    }

    /**
     * Resultado do cálculo.
     *
     * @param ordem     índices das paradas (0-based, na lista recebida) na ordem de visita
     * @param distancia distância total do circuito base -> paradas -> base
     */
    public record Resultado(List<Integer> ordem, double distancia, Metodo metodo) {
    }

    private final int limiteExato;

    public CaixeiroViajante(int limiteExato) {
        this.limiteExato = limiteExato;
    }

    public CaixeiroViajante() {
        this(8);
    }

    /** Monta a matriz de distâncias e resolve. */
    public Resultado resolver(Ponto base, List<Ponto> paradas, MedidorDistancia medidor) {
        List<Ponto> todos = new ArrayList<>();
        todos.add(base);
        todos.addAll(paradas);

        int n = todos.size();
        double[][] d = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double dist = medidor.distancia(todos.get(i), todos.get(j));
                d[i][j] = dist;
                d[j][i] = dist; // distância simétrica: ir de A a B = ir de B a A
            }
        }

        Resultado resultado = resolver(d);
        // converte de índices da matriz (1..N) para índices da lista de paradas (0..N-1)
        List<Integer> ordemNasParadas = resultado.ordem().stream().map(i -> i - 1).toList();
        return new Resultado(ordemNasParadas, resultado.distancia(), resultado.metodo());
    }

    /** Resolve usando a matriz de distâncias (índice 0 = base). Devolve índices da matriz. */
    public Resultado resolver(double[][] d) {
        int n = d.length - 1; // quantidade de clientes
        if (n <= 1) {
            List<Integer> ordem = n == 1 ? List.of(1) : List.of();
            return new Resultado(ordem, custoDoCircuito(d, ordem), Metodo.TRIVIAL);
        }

        // Toda resolução começa pela heurística: ela é rápida e dá um "teto" para a poda.
        List<Integer> heuristica = doisOpt(d, vizinhoMaisProximo(d));
        double custoHeuristica = custoDoCircuito(d, heuristica);

        if (n > limiteExato) {
            return new Resultado(heuristica, custoHeuristica, Metodo.VIZINHO_MAIS_PROXIMO_2OPT);
        }

        Melhor melhor = new Melhor(custoHeuristica, heuristica);
        boolean[] visitado = new boolean[n + 1];
        explorar(d, 0, visitado, 0, new int[n], 0.0, melhor);
        return new Resultado(melhor.ordem, melhor.custo, Metodo.EXATO);
    }

    // =====================================================================
    // 1) EXATO: backtracking recursivo com poda (branch and bound)
    // =====================================================================

    /** Guarda a melhor rota encontrada até agora (é atualizada durante a recursão). */
    private static final class Melhor {
        double custo;
        List<Integer> ordem;

        Melhor(double custo, List<Integer> ordem) {
            this.custo = custo;
            this.ordem = ordem;
        }
    }

    /**
     * Testa recursivamente todas as ordens possíveis, mas abandona ("poda")
     * qualquer caminho parcial que já seja mais caro que a melhor rota conhecida.
     *
     * Atenção: esta recursão NÃO é em cauda, porque depois da chamada recursiva
     * ainda é preciso desfazer a escolha (visitado[prox] = false) e testar o
     * próximo candidato do laço. É a natureza do backtracking.
     */
    private static void explorar(double[][] d, int atual, boolean[] visitado, int visitados,
                                 int[] parcial, double custo, Melhor melhor) {
        int n = d.length - 1;
        if (custo >= melhor.custo) {
            return; // poda: este caminho já perdeu
        }
        if (visitados == n) {
            double total = custo + d[atual][0]; // volta para a base
            if (total < melhor.custo - 1e-12) {
                melhor.custo = total;
                List<Integer> ordem = new ArrayList<>(n);
                for (int i : parcial) {
                    ordem.add(i);
                }
                melhor.ordem = ordem;
            }
            return;
        }
        for (int prox = 1; prox <= n; prox++) {
            if (!visitado[prox]) {
                visitado[prox] = true;
                parcial[visitados] = prox;
                explorar(d, prox, visitado, visitados + 1, parcial, custo + d[atual][prox], melhor);
                visitado[prox] = false; // desfaz a escolha (backtrack)
            }
        }
    }

    // =====================================================================
    // 2) HEURÍSTICA: vizinho mais próximo com RECURSÃO EM CAUDA
    // =====================================================================

    /** Ponto de entrada: começa na base (0) com todos os clientes por visitar. */
    static List<Integer> vizinhoMaisProximo(double[][] d) {
        Set<Integer> restantes = new TreeSet<>();
        for (int i = 1; i < d.length; i++) {
            restantes.add(i);
        }
        return vizinhoMaisProximo(d, 0, restantes, new ArrayList<>());
    }

    /**
     * RECURSÃO EM CAUDA (tail recursion):
     * a chamada recursiva é a ÚLTIMA coisa que o método faz. Nada é calculado
     * "na volta" da recursão; todo o resultado viaja no parâmetro acumulador.
     *
     *  - caso base: não há mais clientes -> devolve o acumulado
     *  - passo:     escolhe o cliente mais próximo de "atual", põe no acumulado
     *               e chama a si mesmo a partir desse cliente
     *
     * Observação importante para a entrevista: a JVM NÃO faz eliminação de
     * chamada em cauda (TCO), diferente de Scala (@tailrec) ou Kotlin (tailrec).
     * Cada chamada ainda ocupa um quadro na pilha. Aqui a profundidade é igual ao
     * número de paradas de UMA viagem (poucas dezenas), então não há risco de
     * StackOverflowError. Por estar em cauda, a conversão para um laço while é
     * mecânica, caso um dia seja necessário (veja o README).
     */
    static List<Integer> vizinhoMaisProximo(double[][] d, int atual, Set<Integer> restantes, List<Integer> acumulado) {
        if (restantes.isEmpty()) {
            return acumulado; // caso base
        }
        int maisProximo = restantes.stream()
                .min(Comparator.comparingDouble(i -> d[atual][i]))
                .orElseThrow();
        restantes.remove(maisProximo);
        acumulado.add(maisProximo);
        return vizinhoMaisProximo(d, maisProximo, restantes, acumulado); // chamada em cauda
    }

    /** Custo do circuito base -> ordem... -> base (também com recursão em cauda). */
    static double custoDoCircuito(double[][] d, List<Integer> ordem) {
        return custoDoCircuito(d, ordem, 0, 0, 0.0);
    }

    private static double custoDoCircuito(double[][] d, List<Integer> ordem, int i, int anterior, double acumulado) {
        if (i == ordem.size()) {
            return acumulado + d[anterior][0]; // caso base: volta para a base
        }
        int atual = ordem.get(i);
        return custoDoCircuito(d, ordem, i + 1, atual, acumulado + d[anterior][atual]); // em cauda
    }

    // =====================================================================
    // 3) MELHORIA 2-OPT: desfaz "cruzamentos" na rota
    // =====================================================================

    /**
     * Para cada par de arestas (a-b) e (c-d), testa se trocar por (a-c) e (b-d)
     * (invertendo o trecho entre elas) encurta a rota. Repete até não melhorar mais.
     */
    static List<Integer> doisOpt(double[][] d, List<Integer> ordem) {
        int[] r = new int[ordem.size() + 2]; // [0, ...ordem, 0]
        for (int i = 0; i < ordem.size(); i++) {
            r[i + 1] = ordem.get(i);
        }
        boolean melhorou = true;
        while (melhorou) {
            melhorou = false;
            for (int i = 1; i < r.length - 2; i++) {
                for (int k = i + 1; k < r.length - 1; k++) {
                    double delta = d[r[i - 1]][r[k]] + d[r[i]][r[k + 1]]
                            - d[r[i - 1]][r[i]] - d[r[k]][r[k + 1]];
                    if (delta < -1e-9) {
                        inverter(r, i, k);
                        melhorou = true;
                    }
                }
            }
        }
        List<Integer> resultado = new ArrayList<>(ordem.size());
        for (int i = 1; i < r.length - 1; i++) {
            resultado.add(r[i]);
        }
        return resultado;
    }

    private static void inverter(int[] r, int i, int k) {
        while (i < k) {
            int tmp = r[i];
            r[i] = r[k];
            r[k] = tmp;
            i++;
            k--;
        }
    }
}
