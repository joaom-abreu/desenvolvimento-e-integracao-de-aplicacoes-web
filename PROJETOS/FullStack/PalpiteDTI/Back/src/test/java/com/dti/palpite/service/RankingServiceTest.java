package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.RankingItemResponse;
import com.dti.palpite.jogo.Arbitro;
import com.dti.palpite.jogo.Intervalo;
import com.dti.palpite.model.Partida;
import com.dti.palpite.model.StatusPartida;
import com.dti.palpite.repository.PartidaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RankingService (placar)")
class RankingServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-26T12:00:00Z");

    @Mock private PartidaRepository partidaRepository;
    private RankingService service;

    @BeforeEach
    void configurar() {
        service = new RankingService(partidaRepository, new JogoProperties());
    }

    /** Uma partida vencida em "palpites" tentativas: erra (palpites - 1) vezes e acerta. */
    private static Partida vencida(String jogador, int tentativas, long segundos) {
        Partida p = new Partida(jogador, 100, new Intervalo(1, 100), T0);
        Arbitro arbitro = new Arbitro();
        for (int i = 1; i < tentativas; i++) {
            arbitro.registrar(p, i, T0);
        }
        arbitro.registrar(p, 100, T0.plusSeconds(segundos));
        return p;
    }

    @Test
    @DisplayName("devolve posição, classificação e pede ao banco a ordem certa")
    void top() {
        when(partidaRepository.findByStatus(eq(StatusPartida.VENCIDA), any(Pageable.class)))
                .thenReturn(List.of(vencida("Ana", 4, 20), vencida("Bruno", 9, 40)));

        List<RankingItemResponse> ranking = service.top(null);

        assertEquals(2, ranking.size());
        assertEquals(1, ranking.get(0).posicao());
        assertEquals("Ana", ranking.get(0).jogador());
        assertEquals("EXCELENTE", ranking.get(0).classificacao());
        assertEquals("BOM", ranking.get(1).classificacao());

        ArgumentCaptor<Pageable> pagina = ArgumentCaptor.forClass(Pageable.class);
        verify(partidaRepository).findByStatus(eq(StatusPartida.VENCIDA), pagina.capture());
        assertEquals(10, pagina.getValue().getPageSize());
        assertEquals(RankingService.ORDEM, pagina.getValue().getSort());
    }

    @Test
    @DisplayName("limite fora de 1 a 100 -> 400")
    void limiteInvalido() {
        assertThrows(IllegalArgumentException.class, () -> service.top(0));
        assertThrows(IllegalArgumentException.class, () -> service.top(101));
    }

    @Test
    @DisplayName("posição = quantas partidas estão na frente + 1")
    void posicao() {
        Partida p = vencida("Ana", 5, 30);
        when(partidaRepository.countByStatusAndTentativasLessThan(StatusPartida.VENCIDA, 5)).thenReturn(2L);
        when(partidaRepository.countByStatusAndTentativasAndDuracaoSegundosLessThan(StatusPartida.VENCIDA, 5, 30L))
                .thenReturn(1L);
        when(partidaRepository.countByStatusAndTentativasAndDuracaoSegundosAndFinalizadaEmLessThan(
                StatusPartida.VENCIDA, 5, 30L, p.getFinalizadaEm())).thenReturn(0L);

        assertEquals(4, service.posicaoDe(p));
        assertTrue(p.getFinalizadaEm().isAfter(T0));
    }
}
