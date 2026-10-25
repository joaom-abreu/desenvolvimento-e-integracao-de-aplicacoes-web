package com.dti.drones.algoritmo;

import com.dti.drones.model.Pedido;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Fila de entregas: ordena os pedidos pendentes por PRIORIDADE + TEMPO DE CHEGADA.
 *
 * Para um pedido de prioridade baixa não ficar esperando para sempre
 * (o problema da "inanição"), usamos ENVELHECIMENTO (aging): a cada
 * "minutosEnvelhecimento" minutos simulados de espera, o pedido sobe um nível,
 * até o máximo (ALTA). Quando os níveis empatam, quem chegou antes sai antes.
 */
public final class FilaEntregas {

    /** Um pedido na fila, com o nível efetivo (já envelhecido) e a posição (1 = próximo). */
    public record ItemFila(Pedido pedido, int nivelEfetivo, int posicao, double esperaMin) {
    }

    private FilaEntregas() {
    }

    /**
     * @param fatorTempo            quantos minutos simulados passam a cada minuto real
     * @param minutosEnvelhecimento minutos simulados de espera para subir um nível
     */
    public static List<ItemFila> ordenar(List<Pedido> pendentes, Instant agora, double fatorTempo,
                                         double minutosEnvelhecimento) {
        record Avaliado(Pedido pedido, int nivel, double esperaMin) {
        }

        List<Avaliado> avaliados = new ArrayList<>();
        for (Pedido p : pendentes) {
            double esperaMin = Math.max(0, Duration.between(p.getCriadoEm(), agora).toMillis()) * fatorTempo / 60_000.0;
            int promocao = minutosEnvelhecimento > 0 ? (int) (esperaMin / minutosEnvelhecimento) : 0;
            int nivel = Math.min(3, p.getPrioridade().getNivel() + promocao);
            avaliados.add(new Avaliado(p, nivel, esperaMin));
        }

        // 1º nível efetivo (maior primeiro), 2º quem chegou antes, 3º id (desempate estável).
        // Empatando no nível, o mais antigo sai antes: é isso que impede a inanição.
        avaliados.sort(Comparator
                .comparingInt(Avaliado::nivel).reversed()
                .thenComparing(a -> a.pedido().getCriadoEm())
                .thenComparing(a -> a.pedido().getId() == null ? "" : a.pedido().getId()));

        List<ItemFila> fila = new ArrayList<>();
        for (int i = 0; i < avaliados.size(); i++) {
            Avaliado a = avaliados.get(i);
            fila.add(new ItemFila(a.pedido(), a.nivel(), i + 1, a.esperaMin()));
        }
        return fila;
    }
}
