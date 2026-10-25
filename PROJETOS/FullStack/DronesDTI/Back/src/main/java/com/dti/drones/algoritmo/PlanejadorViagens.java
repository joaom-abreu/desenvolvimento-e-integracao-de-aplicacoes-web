package com.dti.drones.algoritmo;

import com.dti.drones.algoritmo.FilaEntregas.ItemFila;
import com.dti.drones.model.Drone;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Coração do case: decide QUAIS pacotes vão em QUAL drone, buscando o
 * MENOR NÚMERO DE VIAGENS sem quebrar as regras de capacidade (kg) e alcance (km).
 *
 * Isso é uma mistura de dois problemas clássicos (ambos NP-difíceis):
 *  - Bin Packing (empacotar pesos em "caixas" de capacidade X) e
 *  - Caixeiro Viajante (a rota de cada viagem precisa caber no alcance Y).
 *
 * Estratégia gulosa "semente + preenchimento", rodada para cada drone livre:
 *
 *  1. SEMENTE: pega o primeiro pedido da fila (maior prioridade) que cabe no drone.
 *     -> garante que a prioridade é respeitada.
 *  2. PREENCHIMENTO: enquanto houver espaço, adiciona o pedido que
 *     (a) ainda cabe no peso,
 *     (b) mantém a rota dentro do alcance (estimando o desvio por "inserção mais barata"),
 *     (c) tem o maior nível de prioridade e, empatando, o melhor aproveitamento
 *         (kg transportados por km extra voado).
 *     -> junta pacotes "no caminho" e enche o drone: menos viagens.
 *  3. ROTA FINAL: o Caixeiro Viajante reordena as paradas da viagem.
 *     Como a inserção mais barata é um limite superior da rota ótima, a rota
 *     final nunca fica maior que a estimada (continua dentro do alcance).
 */
public class PlanejadorViagens {

    /** Uma viagem planejada: drone + pedidos já na ordem de visita. */
    public record PlanoViagem(Drone drone, List<Pedido> pedidos, double distanciaKm, double pesoKg,
                              CaixeiroViajante.Metodo metodo) {

        public double ocupacaoPercentual() {
            return pesoKg / drone.getCapacidadeKg() * 100.0;
        }
    }

    /** Resultado de um planejamento: viagens e o que ficou de fora. */
    public record Planejamento(List<PlanoViagem> viagens, List<ItemFila> naoAlocados) {
    }

    private final CaixeiroViajante caixeiro;
    private final int maxParadas;

    public PlanejadorViagens(CaixeiroViajante caixeiro, int maxParadas) {
        this.caixeiro = caixeiro;
        this.maxParadas = maxParadas;
    }

    /**
     * Uma rodada: no máximo UMA viagem por drone disponível.
     * É o que acontece de verdade quando o despacho roda.
     */
    public Planejamento planejar(List<ItemFila> fila, List<Drone> disponiveis, Ponto base, MapaAereo mapa) {
        List<ItemFila> restantes = new ArrayList<>(fila);
        List<PlanoViagem> viagens = new ArrayList<>();

        // drones maiores primeiro: carregam mais por viagem
        List<Drone> drones = new ArrayList<>(disponiveis);
        drones.sort(Comparator.comparingDouble(Drone::getCapacidadeKg).reversed()
                .thenComparing(Comparator.comparingDouble(Drone::getAlcanceKm).reversed()));

        for (Drone drone : drones) {
            if (restantes.isEmpty()) {
                break;
            }
            PlanoViagem plano = montarViagem(drone, restantes, base, mapa);
            if (plano != null) {
                viagens.add(plano);
            }
        }
        return new Planejamento(viagens, restantes);
    }

    /**
     * Prévia: quantas viagens seriam necessárias para esvaziar a fila inteira,
     * repetindo rodadas com a frota de bateria cheia. Usada em GET /api/entregas/rota.
     */
    public Planejamento planejarTudo(List<ItemFila> fila, List<Drone> frota, Ponto base, MapaAereo mapa) {
        List<ItemFila> restantes = new ArrayList<>(fila);
        List<PlanoViagem> viagens = new ArrayList<>();
        List<Drone> cheios = frota.stream().map(PlanejadorViagens::copiaComBateriaCheia).toList();

        while (!restantes.isEmpty()) {
            Planejamento rodada = planejar(restantes, cheios, base, mapa);
            if (rodada.viagens().isEmpty()) {
                break; // nada mais cabe em nenhum drone
            }
            viagens.addAll(rodada.viagens());
            restantes = new ArrayList<>(rodada.naoAlocados());
        }
        return new Planejamento(viagens, restantes);
    }

    /** Monta uma viagem para o drone, REMOVENDO de "restantes" os pedidos escolhidos. */
    PlanoViagem montarViagem(Drone drone, List<ItemFila> restantes, Ponto base, MapaAereo mapa) {
        double capacidade = drone.getCapacidadeKg();
        double limiteKm = drone.alcanceDisponivelKm();

        // 1. SEMENTE: o primeiro da fila que cabe sozinho no drone
        ItemFila semente = null;
        for (ItemFila item : restantes) {
            Pedido p = item.pedido();
            if (p.getPesoKg() <= capacidade && idaEVolta(base, p.ponto(), mapa) <= limiteKm) {
                semente = item;
                break;
            }
        }
        if (semente == null) {
            return null;
        }
        restantes.remove(semente);

        List<Pedido> carga = new ArrayList<>();
        List<Ponto> rota = new ArrayList<>(); // ordem de visita atual (sem a base)
        carga.add(semente.pedido());
        rota.add(semente.pedido().ponto());
        double peso = semente.pedido().getPesoKg();
        double distancia = idaEVolta(base, semente.pedido().ponto(), mapa);

        // 2. PREENCHIMENTO guloso
        while (carga.size() < maxParadas) {
            ItemFila escolhido = null;
            Insercao melhorInsercao = null;
            double melhorAproveitamento = -1;

            for (ItemFila candidato : restantes) {
                Pedido p = candidato.pedido();
                if (peso + p.getPesoKg() > capacidade + 1e-9) {
                    continue; // não cabe no peso
                }
                Insercao ins = insercaoMaisBarata(base, rota, p.ponto(), mapa);
                if (distancia + ins.custoExtra() > limiteKm + 1e-9) {
                    continue; // estouraria o alcance
                }
                double aproveitamento = p.getPesoKg() / (ins.custoExtra() + 0.5);
                boolean melhor = escolhido == null
                        || candidato.nivelEfetivo() > escolhido.nivelEfetivo()
                        || (candidato.nivelEfetivo() == escolhido.nivelEfetivo() && aproveitamento > melhorAproveitamento);
                if (melhor) {
                    escolhido = candidato;
                    melhorInsercao = ins;
                    melhorAproveitamento = aproveitamento;
                }
            }
            if (escolhido == null) {
                break; // nada mais cabe
            }
            restantes.remove(escolhido);
            carga.add(melhorInsercao.posicao(), escolhido.pedido());
            rota.add(melhorInsercao.posicao(), escolhido.pedido().ponto());
            peso += escolhido.pedido().getPesoKg();
            distancia += melhorInsercao.custoExtra();
        }

        // 3. ROTA FINAL pelo Caixeiro Viajante
        CaixeiroViajante.Resultado resultado = caixeiro.resolver(base, rota, mapa);
        List<Pedido> ordenados = new ArrayList<>();
        for (int indice : resultado.ordem()) {
            ordenados.add(carga.get(indice));
        }
        double distanciaFinal = Math.min(resultado.distancia(), distancia);
        if (resultado.distancia() > distancia + 1e-9) {
            ordenados = carga; // segurança: mantém a ordem da inserção se ela for melhor
        }
        return new PlanoViagem(drone, ordenados, distanciaFinal, peso, resultado.metodo());
    }

    /** Onde inserir o ponto na rota para aumentar o mínimo possível a distância. */
    record Insercao(int posicao, double custoExtra) {
    }

    static Insercao insercaoMaisBarata(Ponto base, List<Ponto> rota, Ponto novo, MedidorDistancia medidor) {
        int melhorPosicao = 0;
        double melhorCusto = Double.POSITIVE_INFINITY;
        for (int i = 0; i <= rota.size(); i++) {
            Ponto antes = i == 0 ? base : rota.get(i - 1);
            Ponto depois = i == rota.size() ? base : rota.get(i);
            double custo = medidor.distancia(antes, novo) + medidor.distancia(novo, depois) - medidor.distancia(antes, depois);
            if (custo < melhorCusto) {
                melhorCusto = custo;
                melhorPosicao = i;
            }
        }
        return new Insercao(melhorPosicao, melhorCusto);
    }

    static double idaEVolta(Ponto base, Ponto destino, MedidorDistancia medidor) {
        return medidor.distancia(base, destino) + medidor.distancia(destino, base);
    }

    /** Limite inferior teórico (só pelo peso): ceil(peso total / maior capacidade). */
    public static int minimoTeoricoDeViagens(List<Pedido> pedidos, List<Drone> frota) {
        double maiorCapacidade = frota.stream().mapToDouble(Drone::getCapacidadeKg).max().orElse(0);
        if (maiorCapacidade == 0 || pedidos.isEmpty()) {
            return 0;
        }
        double pesoTotal = pedidos.stream().mapToDouble(Pedido::getPesoKg).sum();
        return (int) Math.ceil(pesoTotal / maiorCapacidade - 1e-9);
    }

    private static Drone copiaComBateriaCheia(Drone original) {
        Drone copia = new Drone(original.getNome(), original.getCapacidadeKg(), original.getAlcanceKm(),
                original.getVelocidadeKmh(), original.ponto());
        copia.setId(original.getId());
        copia.setBateria(100);
        return copia;
    }
}
