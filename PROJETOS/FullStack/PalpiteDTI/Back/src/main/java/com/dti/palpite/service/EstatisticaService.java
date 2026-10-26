package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.EstatisticasResponse;
import com.dti.palpite.dto.EstatisticasResponse.Barra;
import com.dti.palpite.jogo.Desempenho;
import com.dti.palpite.jogo.Intervalo;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.StatusPartida;
import com.dti.palpite.repository.PartidaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Números da página Estatísticas, calculados em memória a partir das partidas.
 * Simples e fácil de testar com Mockito; com milhões de partidas, o próximo passo
 * seria uma aggregation pipeline no MongoDB (veja "Próximos passos" no README).
 */
@Service
public class EstatisticaService {

    /** A partir de quantas tentativas as barras se juntam numa só ("13+"). */
    static final int ULTIMA_BARRA = 13;
    static final int TOP_PRIMEIROS_PALPITES = 8;
    static final int FAIXAS_SORTEIO = 10;

    private final PartidaRepository partidaRepository;
    private final JogoProperties props;

    public EstatisticaService(PartidaRepository partidaRepository, JogoProperties props) {
        this.partidaRepository = partidaRepository;
        this.props = props;
    }

    public EstatisticasResponse resumo() {
        List<Partida> todas = partidaRepository.findAll();
        Intervalo intervalo = props.intervaloInicial();
        int ideais = Desempenho.tentativasIdeais(intervalo);

        List<Partida> vencidas = filtrar(todas, StatusPartida.VENCIDA);
        long abandonadas = filtrar(todas, StatusPartida.ABANDONADA).size();
        long emAndamento = filtrar(todas, StatusPartida.EM_ANDAMENTO).size();
        long encerradas = vencidas.size() + abandonadas;

        Double media = vencidas.isEmpty() ? null : arredondar(vencidas.stream().mapToInt(Partida::getTentativas).average().orElse(0));
        Integer melhor = vencidas.stream().map(Partida::getTentativas).min(Integer::compare).orElse(null);
        long noIdeal = vencidas.stream().filter(p -> p.getTentativas() <= ideais).count();
        Double duracaoMedia = vencidas.isEmpty() ? null : arredondar(vencidas.stream()
                .mapToLong(p -> p.getDuracaoSegundos() == null ? 0 : p.getDuracaoSegundos()).average().orElse(0));

        return new EstatisticasResponse(
                todas.size(),
                vencidas.size(),
                abandonadas,
                emAndamento,
                percentual(vencidas.size(), encerradas),
                media,
                melhor,
                ideais,
                percentual(noIdeal, vencidas.size()),
                duracaoMedia,
                distribuicaoTentativas(vencidas),
                primeirosPalpites(todas),
                sorteiosPorFaixa(todas, intervalo));
    }

    /** Quantas partidas foram vencidas com 1, 2, 3... tentativas (as longas viram "13+"). */
    List<Barra> distribuicaoTentativas(List<Partida> vencidas) {
        long[] contagem = new long[ULTIMA_BARRA + 1];
        for (Partida p : vencidas) {
            contagem[Math.min(p.getTentativas(), ULTIMA_BARRA)]++;
        }
        List<Barra> barras = new ArrayList<>();
        for (int t = 1; t <= ULTIMA_BARRA; t++) {
            barras.add(new Barra(t == ULTIMA_BARRA ? ULTIMA_BARRA + "+" : String.valueOf(t), contagem[t]));
        }
        return barras;
    }

    /** Os números mais escolhidos como PRIMEIRO palpite (o 50 costuma ganhar). */
    List<Barra> primeirosPalpites(List<Partida> todas) {
        Map<Integer, Long> porNumero = todas.stream()
                .filter(p -> !p.getPalpites().isEmpty())
                .collect(Collectors.groupingBy(p -> p.getPalpites().get(0).numero(), Collectors.counting()));
        return porNumero.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .limit(TOP_PRIMEIROS_PALPITES)
                .map(e -> new Barra(String.valueOf(e.getKey()), e.getValue()))
                .toList();
    }

    /**
     * Em que faixa caíram os números sorteados (1-10, 11-20...). Com muitas partidas,
     * as barras ficam parecidas: é o jeito visual de mostrar que o sorteio é justo.
     * Só usa partidas ENCERRADAS: contar as em andamento daria pista do número de alguém.
     */
    List<Barra> sorteiosPorFaixa(List<Partida> todas, Intervalo intervalo) {
        int largura = Math.max(1, (int) Math.ceil(intervalo.tamanho() / (double) FAIXAS_SORTEIO));
        Map<Integer, Long> porFaixa = new TreeMap<>();
        for (int inicio = intervalo.minimo(); inicio <= intervalo.maximo(); inicio += largura) {
            porFaixa.put(inicio, 0L);
        }
        todas.stream()
                .filter(p -> !p.emAndamento())
                .map(Partida::getNumeroSecreto)
                .filter(intervalo::contem)
                .map(n -> intervalo.minimo() + ((n - intervalo.minimo()) / largura) * largura)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
                .forEach(porFaixa::put);
        return porFaixa.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                .map(e -> new Barra(e.getKey() + "–" + Math.min(e.getKey() + largura - 1, intervalo.maximo()), e.getValue()))
                .toList();
    }

    private static List<Partida> filtrar(List<Partida> partidas, StatusPartida status) {
        return partidas.stream().filter(p -> p.getStatus() == status).toList();
    }

    private static double percentual(long parte, long total) {
        return total == 0 ? 0 : arredondar(100.0 * parte / total);
    }

    private static double arredondar(double valor) {
        return Math.round(valor * 10) / 10.0;
    }
}
