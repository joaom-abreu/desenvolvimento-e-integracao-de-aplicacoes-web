package com.dti.drones.algoritmo;

import com.dti.drones.model.EstadoDrone;
import com.dti.drones.model.Fase;
import com.dti.drones.model.Parada;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.Ponto;

import java.util.ArrayList;
import java.util.List;

/**
 * Transforma uma viagem planejada em uma LINHA DO TEMPO de estados.
 *
 * Exemplo com 2 entregas:
 *
 *   CARREGANDO | EM_VOO | ENTREGANDO | EM_VOO | ENTREGANDO | RETORNANDO
 *   0 ---- 2 ------ 7,5 ------ 8,5 ----- 12 ------ 13 ----------- 20 (minutos simulados)
 *
 * Com a linha do tempo pronta, saber "o que o drone está fazendo agora" é só
 * olhar em qual fase está o minuto atual. É uma simulação orientada a eventos
 * baseada em timestamps (sem Thread.sleep).
 */
public record LinhaDoTempo(List<Ponto> caminho, List<Fase> fases, List<Parada> paradas,
                           double distanciaKm, double duracaoMin) {

    /**
     * @param pedidosEmOrdem       pedidos já na ordem do caixeiro viajante
     * @param velocidadeKmh        velocidade de cruzeiro do drone
     * @param tempoCarregamentoMin tempo para colocar os pacotes no drone
     * @param tempoEntregaMin      tempo parado em cada cliente
     */
    public static LinhaDoTempo montar(Ponto base, List<Pedido> pedidosEmOrdem, MapaAereo mapa,
                                      double velocidadeKmh, double tempoCarregamentoMin, double tempoEntregaMin) {
        List<Ponto> caminho = new ArrayList<>();
        List<Fase> fases = new ArrayList<>();
        List<Parada> paradas = new ArrayList<>();
        caminho.add(base);

        double minutosPorKm = 60.0 / velocidadeKmh;
        double t = 0;
        double km = 0;

        fases.add(new Fase(EstadoDrone.CARREGANDO, t, t + tempoCarregamentoMin, 0, 0, null));
        t += tempoCarregamentoMin;

        Ponto atual = base;
        int ordem = 1;
        for (Pedido pedido : pedidosEmOrdem) {
            MapaAereo.Trajeto trecho = mapa.trajeto(atual, pedido.ponto());
            adicionarTrecho(caminho, trecho);
            double kmChegada = km + trecho.distancia();
            double tChegada = t + trecho.distancia() * minutosPorKm;
            fases.add(new Fase(EstadoDrone.EM_VOO, t, tChegada, km, kmChegada, ordem));
            fases.add(new Fase(EstadoDrone.ENTREGANDO, tChegada, tChegada + tempoEntregaMin, kmChegada, kmChegada, ordem));
            paradas.add(new Parada(pedido.getId(), pedido.getCliente(), ordem, pedido.getX(), pedido.getY(),
                    pedido.getPesoKg(), pedido.getPrioridade(), kmChegada, tChegada, tChegada + tempoEntregaMin));
            km = kmChegada;
            t = tChegada + tempoEntregaMin;
            atual = pedido.ponto();
            ordem++;
        }

        MapaAereo.Trajeto volta = mapa.trajeto(atual, base);
        adicionarTrecho(caminho, volta);
        double kmFinal = km + volta.distancia();
        double tFinal = t + volta.distancia() * minutosPorKm;
        fases.add(new Fase(EstadoDrone.RETORNANDO, t, tFinal, km, kmFinal, null));

        return new LinhaDoTempo(List.copyOf(caminho), List.copyOf(fases), List.copyOf(paradas), kmFinal, tFinal);
    }

    private static void adicionarTrecho(List<Ponto> caminho, MapaAereo.Trajeto trecho) {
        // o primeiro ponto do trecho já é o último do caminho
        for (int i = 1; i < trecho.pontos().size(); i++) {
            caminho.add(trecho.pontos().get(i));
        }
    }

    /** Fase em andamento no minuto "t" (ou a última, se a viagem já acabou). */
    public static Fase faseEm(List<Fase> fases, double t) {
        for (Fase f : fases) {
            if (t < f.fimMin()) {
                return f;
            }
        }
        return fases.get(fases.size() - 1);
    }

    /** Quantos km do caminho o drone já voou no minuto "t". */
    public static double kmEm(List<Fase> fases, double t) {
        Fase f = faseEm(fases, t);
        if (t >= f.fimMin()) {
            return f.kmFim();
        }
        if (f.duracaoMin() <= 0 || f.kmFim() == f.kmInicio()) {
            return f.kmInicio();
        }
        double fracao = Math.max(0, (t - f.inicioMin()) / f.duracaoMin());
        return f.kmInicio() + fracao * (f.kmFim() - f.kmInicio());
    }

    /** Ponto exato do caminho depois de voar "km" quilômetros (interpolação linear). */
    public static Ponto pontoNoCaminho(List<Ponto> caminho, double km) {
        double restante = km;
        for (int i = 1; i < caminho.size(); i++) {
            Ponto a = caminho.get(i - 1);
            Ponto b = caminho.get(i);
            double segmento = a.distanciaAte(b);
            if (restante <= segmento) {
                double f = segmento == 0 ? 0 : restante / segmento;
                return new Ponto(a.x() + (b.x() - a.x()) * f, a.y() + (b.y() - a.y()) * f);
            }
            restante -= segmento;
        }
        return caminho.get(caminho.size() - 1);
    }
}
