package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.EstatisticasResponse;
import com.dti.palpite.jogo.Arbitro;
import com.dti.palpite.jogo.Intervalo;
import com.dti.palpite.model.Partida;
import com.dti.palpite.repository.PartidaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("EstatisticaService (indicadores e gráficos)")
class EstatisticaServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-26T12:00:00Z");
    private final Arbitro arbitro = new Arbitro();

    @Mock private PartidaRepository partidaRepository;

    private Partida jogada(int secreto, int... palpites) {
        Partida p = new Partida("Ana", secreto, new Intervalo(1, 100), T0);
        long s = 0;
        for (int n : palpites) {
            arbitro.registrar(p, n, T0.plusSeconds(s += 10));
        }
        return p;
    }

    @Test
    @DisplayName("conta, calcula médias e monta as barras")
    void resumo() {
        Partida emTres = jogada(42, 50, 25, 42);              // vencida, 3 tentativas, 30 s
        Partida deCara = jogada(50, 50);                       // vencida, 1 tentativa, 10 s
        Partida abandonada = jogada(7, 50);
        arbitro.desistir(abandonada, T0.plusSeconds(60));
        Partida emAndamento = jogada(99, 50);                  // não pode entrar nos sorteios por faixa
        when(partidaRepository.findAll()).thenReturn(List.of(emTres, deCara, abandonada, emAndamento));

        EstatisticasResponse e = new EstatisticaService(partidaRepository, new JogoProperties()).resumo();

        assertEquals(4, e.totalPartidas());
        assertEquals(2, e.vencidas());
        assertEquals(1, e.abandonadas());
        assertEquals(1, e.emAndamento());
        assertEquals(66.7, e.taxaVitoria());                   // 2 de 3 encerradas
        assertEquals(2.0, e.mediaTentativas());
        assertEquals(1, e.melhorTentativas());
        assertEquals(100.0, e.percentualNoIdeal());
        assertEquals(20.0, e.duracaoMediaSegundos());

        assertEquals(13, e.distribuicaoTentativas().size());
        assertEquals(1, e.distribuicaoTentativas().get(0).valor());   // "1" tentativa
        assertEquals(1, e.distribuicaoTentativas().get(2).valor());   // "3" tentativas
        assertEquals("13+", e.distribuicaoTentativas().get(12).rotulo());

        assertEquals("50", e.primeirosPalpites().get(0).rotulo());
        assertEquals(4, e.primeirosPalpites().get(0).valor());

        assertEquals(10, e.sorteiosPorFaixa().size());
        assertEquals("1–10", e.sorteiosPorFaixa().get(0).rotulo());
        assertEquals(1, e.sorteiosPorFaixa().get(0).valor());          // o 7 (abandonada)
        assertEquals(0, e.sorteiosPorFaixa().get(9).valor());          // o 99 está em andamento: fica de fora
        long totalSorteios = e.sorteiosPorFaixa().stream().mapToLong(b -> b.valor()).sum();
        assertEquals(3, totalSorteios);
    }

    @Test
    @DisplayName("banco vazio: zeros, sem dividir por zero")
    void vazio() {
        when(partidaRepository.findAll()).thenReturn(List.of());

        EstatisticasResponse e = new EstatisticaService(partidaRepository, new JogoProperties()).resumo();

        assertEquals(0, e.totalPartidas());
        assertEquals(0.0, e.taxaVitoria());
        assertNull(e.mediaTentativas());
        assertNull(e.melhorTentativas());
    }
}
