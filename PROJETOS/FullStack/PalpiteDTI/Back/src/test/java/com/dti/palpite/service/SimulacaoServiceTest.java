package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.jogo.Arbitro;
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

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("SimulacaoService (partidas de robôs)")
class SimulacaoServiceTest {

    @Mock private PartidaRepository partidaRepository;
    private SimulacaoService service;

    @BeforeEach
    void configurar() {
        service = new SimulacaoService(partidaRepository, new Arbitro(), intervalo -> 73, new JogoProperties(),
                Clock.fixed(Instant.parse("2026-10-26T12:00:00Z"), ZoneOffset.UTC));
    }

    @Test
    @DisplayName("gera N partidas vencidas, marcadas como simuladas, e grava de uma vez")
    @SuppressWarnings("unchecked")
    void gerar() {
        assertEquals(25, service.gerarPartidas(25).criadas());

        ArgumentCaptor<List<Partida>> gravadas = ArgumentCaptor.forClass(List.class);
        verify(partidaRepository).saveAll(gravadas.capture());
        assertEquals(25, gravadas.getValue().size());
        for (Partida p : gravadas.getValue()) {
            assertEquals(StatusPartida.VENCIDA, p.getStatus());
            assertTrue(p.isSimulada());
            assertEquals(73, p.getPalpites().get(p.getTentativas() - 1).numero());
        }
    }

    @Test
    @DisplayName("quantidade fora de 1 a 500 -> 400, nada é gravado")
    void quantidadeInvalida() {
        assertThrows(IllegalArgumentException.class, () -> service.gerarPartidas(0));
        assertThrows(IllegalArgumentException.class, () -> service.gerarPartidas(501));
        verify(partidaRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("reiniciar com 0 só limpa o banco")
    void reiniciar() {
        assertEquals(0, service.reiniciar(0).criadas());
        verify(partidaRepository).deleteAll();
    }
}
