package com.dti.palpite.service;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.NovaPartidaRequest;
import com.dti.palpite.dto.PalpiteRequest;
import com.dti.palpite.dto.PartidaResponse;
import com.dti.palpite.dto.ResultadoPalpiteResponse;
import com.dti.palpite.exception.ConflitoException;
import com.dti.palpite.exception.RecursoNaoEncontradoException;
import com.dti.palpite.exception.RegraNegocioException;
import com.dti.palpite.jogo.Arbitro;
import com.dti.palpite.jogo.Intervalo;
import com.dti.palpite.jogo.Sorteador;
import com.dti.palpite.model.Partida;
import com.dti.palpite.repository.PartidaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Teste UNITÁRIO com Mockito: o repository e o ranking são "dublês" (mocks).
 * Nenhum MongoDB é necessário: testamos só a orquestração do PartidaService.
 * O sorteador é "viciado" (sempre 42) para o teste saber a resposta.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PartidaService (orquestração da partida)")
class PartidaServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-26T12:00:00Z");
    private static final Sorteador VICIADO_EM_42 = intervalo -> 42;

    @Mock private PartidaRepository partidaRepository;
    @Mock private RankingService rankingService;

    private PartidaService service;

    @BeforeEach
    void configurar() {
        service = new PartidaService(partidaRepository, rankingService, new Arbitro(), VICIADO_EM_42,
                new JogoProperties(), Clock.fixed(T0, ZoneOffset.UTC));
        // save devolve o próprio objeto, com um id, como o MongoDB faria
        when(partidaRepository.save(any(Partida.class))).thenAnswer(inv -> {
            Partida p = inv.getArgument(0);
            if (p.getId() == null) {
                p.setId("p1");
            }
            return p;
        });
    }

    private Partida partidaEmAndamento() {
        Partida p = new Partida("Ana", 42, new Intervalo(1, 100), T0);
        p.setId("p1");
        when(partidaRepository.findById("p1")).thenReturn(Optional.of(p));
        return p;
    }

    private static PalpiteRequest palpite(int numero) {
        return new PalpiteRequest(BigDecimal.valueOf(numero));
    }

    @Test
    @DisplayName("iniciar: sorteia, grava e NÃO devolve o número secreto")
    void iniciar() {
        PartidaResponse resposta = service.iniciar(new NovaPartidaRequest("  Ana   Maria "));

        ArgumentCaptor<Partida> gravada = ArgumentCaptor.forClass(Partida.class);
        verify(partidaRepository).save(gravada.capture());
        assertEquals(42, gravada.getValue().getNumeroSecreto());
        assertEquals("Ana Maria", resposta.jogador());
        assertEquals("EM_ANDAMENTO", resposta.status());
        assertEquals(7, resposta.tentativasIdeais());
        assertNull(resposta.numeroSecreto(), "o número não pode sair do servidor durante o jogo");
    }

    @Test
    @DisplayName("iniciar sem nome: entra como Anônimo")
    void iniciarAnonimo() {
        assertEquals("Anônimo", service.iniciar(null).jogador());
        assertEquals("Anônimo", service.iniciar(new NovaPartidaRequest("   ")).jogador());
    }

    @Test
    @DisplayName("palpite menor que o sorteado: mensagem, faixa possível e número ainda oculto")
    void palpiteMenor() {
        partidaEmAndamento();

        ResultadoPalpiteResponse r = service.palpitar("p1", palpite(30));

        assertEquals("MENOR", r.palpite().resultado());
        assertEquals("30 é menor que o número sorteado. Tente um número maior.", r.mensagem());
        assertEquals(31, r.partida().possivel().minimo());
        assertEquals(100, r.partida().possivel().maximo());
        assertNull(r.partida().numeroSecreto());
    }

    @Test
    @DisplayName("acertar: VENCIDA, número revelado e posição no ranking")
    void acertar() {
        partidaEmAndamento();
        when(rankingService.posicaoDe(any(Partida.class))).thenReturn(3);

        service.palpitar("p1", palpite(50));
        ResultadoPalpiteResponse r = service.palpitar("p1", palpite(42));

        assertEquals("ACERTOU", r.palpite().resultado());
        assertEquals("VENCIDA", r.partida().status());
        assertEquals(42, r.partida().numeroSecreto());
        assertEquals(2, r.partida().tentativas());
        assertEquals("EXCELENTE", r.partida().classificacao());
        assertEquals(3, r.partida().posicaoRanking());
    }

    @Test
    @DisplayName("palpite repetido: 422 e nada é gravado")
    void repetido() {
        Partida p = partidaEmAndamento();
        service.palpitar("p1", palpite(50));            // 1ª gravação

        assertThrows(RegraNegocioException.class, () -> service.palpitar("p1", palpite(50)));

        assertEquals(1, p.getTentativas());
        verify(partidaRepository, times(1)).save(any());  // o repetido não gerou uma 2ª
    }

    @Test
    @DisplayName("partida já vencida: 409 e nada é gravado")
    void partidaEncerrada() {
        Partida p = partidaEmAndamento();
        new Arbitro().registrar(p, 42, T0);

        assertThrows(ConflitoException.class, () -> service.palpitar("p1", palpite(10)));
        verify(partidaRepository, never()).save(any());
    }

    @Test
    @DisplayName("id inexistente: 404")
    void naoEncontrada() {
        when(partidaRepository.findById("x")).thenReturn(Optional.empty());

        RecursoNaoEncontradoException e = assertThrows(RecursoNaoEncontradoException.class, () -> service.buscar("x"));
        assertEquals("Partida com id \"x\" não encontrada.", e.getMessage());
    }

    @Test
    @DisplayName("desistir: ABANDONADA e o número é revelado")
    void desistir() {
        partidaEmAndamento();

        PartidaResponse r = service.desistir("p1");

        assertEquals("ABANDONADA", r.status());
        assertEquals(42, r.numeroSecreto());
        assertNull(r.posicaoRanking());
    }

    @Test
    @DisplayName("normaliza o nome do jogador")
    void normalizarNome() {
        assertEquals("Ana Maria", PartidaService.normalizarNome("  Ana   Maria "));
        assertEquals("Anônimo", PartidaService.normalizarNome(""));
        assertEquals("Anônimo", PartidaService.normalizarNome(null));
    }
}
