package com.dti.palpite.controller;

import com.dti.palpite.dto.IntervaloResponse;
import com.dti.palpite.dto.PalpiteRequest;
import com.dti.palpite.dto.PalpiteResponse;
import com.dti.palpite.dto.PartidaResponse;
import com.dti.palpite.dto.ResultadoPalpiteResponse;
import com.dti.palpite.exception.ConflitoException;
import com.dti.palpite.exception.GlobalExceptionHandler;
import com.dti.palpite.exception.RecursoNaoEncontradoException;
import com.dti.palpite.exception.RegraNegocioException;
import com.dti.palpite.service.PartidaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testa a camada HTTP: status code, cabeçalho Location, JSON de resposta e JSON de erro.
 * O PartidaService é um mock; o MockMvc "finge" o servidor (sem subir o Tomcat).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PartidaController (HTTP)")
class PartidaControllerTest {

    private static final Instant T0 = Instant.parse("2026-10-26T12:00:00Z");

    @Mock private PartidaService partidaService;
    private MockMvc mvc;

    @BeforeEach
    void configurar() {
        mvc = MockMvcBuilders.standaloneSetup(new PartidaController(partidaService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static PartidaResponse partida(String status, Integer secreto) {
        IntervaloResponse cem = new IntervaloResponse(1, 100, 100);
        return new PartidaResponse("p1", "Ana", status, "Em andamento", cem, cem, 0, 7, List.of(),
                secreto, T0, null, null, null, null, null);
    }

    @Test
    @DisplayName("POST /api/partidas -> 201 + Location, sem o número secreto")
    void iniciar() throws Exception {
        when(partidaService.iniciar(any())).thenReturn(partida("EM_ANDAMENTO", null));

        mvc.perform(post("/api/partidas").contentType(MediaType.APPLICATION_JSON).content("{\"jogador\":\"Ana\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/partidas/p1"))
                .andExpect(jsonPath("$.id").value("p1"))
                .andExpect(jsonPath("$.numeroSecreto").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/partidas sem corpo também funciona (jogador anônimo)")
    void iniciarSemCorpo() throws Exception {
        when(partidaService.iniciar(null)).thenReturn(partida("EM_ANDAMENTO", null));

        mvc.perform(post("/api/partidas")).andExpect(status().isCreated());
    }

    @Test
    @DisplayName("nome com mais de 30 letras -> 400")
    void nomeGrande() throws Exception {
        mvc.perform(post("/api/partidas").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"jogador\":\"" + "a".repeat(31) + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.jogador").value("O nome pode ter no máximo 30 caracteres."));
    }

    @Test
    @DisplayName("POST palpite válido -> 201 + Location do palpite")
    void palpitar() throws Exception {
        PalpiteResponse p = new PalpiteResponse(1, 50, "MAIOR", "Maior que o sorteado", T0);
        when(partidaService.palpitar(eq("p1"), any(PalpiteRequest.class))).thenReturn(new ResultadoPalpiteResponse(
                p, "50 é maior que o número sorteado. Tente um número menor.", null, partida("EM_ANDAMENTO", null)));

        mvc.perform(post("/api/partidas/p1/palpites").contentType(MediaType.APPLICATION_JSON).content("{\"numero\":50}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/partidas/p1/palpites/1"))
                .andExpect(jsonPath("$.palpite.resultado").value("MAIOR"))
                .andExpect(jsonPath("$.mensagem").value("50 é maior que o número sorteado. Tente um número menor."));
    }

    @Test
    @DisplayName("palpite sem número -> 400 com o campo destacado")
    void semNumero() throws Exception {
        mvc.perform(post("/api/partidas/p1/palpites").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.numero").value("Informe o número do palpite."))
                .andExpect(jsonPath("$.mensagem").value("Informe o número do palpite."));
    }

    @Test
    @DisplayName("palpite 42.5 -> 400 (precisa ser inteiro)")
    void decimal() throws Exception {
        mvc.perform(post("/api/partidas/p1/palpites").contentType(MediaType.APPLICATION_JSON).content("{\"numero\":42.5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.numero").value("O palpite precisa ser um número inteiro, sem casas decimais."));
    }

    @Test
    @DisplayName("palpite 150 -> 422 (regra do jogo)")
    void foraDaFaixa() throws Exception {
        when(partidaService.palpitar(eq("p1"), any(PalpiteRequest.class)))
                .thenThrow(new RegraNegocioException("Escolha um número entre 1 e 100. Você enviou 150."));

        mvc.perform(post("/api/partidas/p1/palpites").contentType(MediaType.APPLICATION_JSON).content("{\"numero\":150}"))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.mensagem").value("Escolha um número entre 1 e 100. Você enviou 150."));
    }

    @Test
    @DisplayName("palpite em partida encerrada -> 409")
    void encerrada() throws Exception {
        when(partidaService.palpitar(eq("p1"), any(PalpiteRequest.class)))
                .thenThrow(new ConflitoException("Esta partida já terminou."));

        mvc.perform(post("/api/partidas/p1/palpites").contentType(MediaType.APPLICATION_JSON).content("{\"numero\":10}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("JSON quebrado -> 400")
    void jsonInvalido() throws Exception {
        mvc.perform(post("/api/partidas/p1/palpites").contentType(MediaType.APPLICATION_JSON).content("{ isso não é json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET de id inexistente -> 404")
    void naoEncontrada() throws Exception {
        when(partidaService.buscar("nao-existe")).thenThrow(new RecursoNaoEncontradoException("Partida", "nao-existe"));

        mvc.perform(get("/api/partidas/nao-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").value("Partida com id \"nao-existe\" não encontrada."));
    }

    @Test
    @DisplayName("POST desistência -> 200 com o número revelado")
    void desistir() throws Exception {
        when(partidaService.desistir("p1")).thenReturn(partida("ABANDONADA", 42));

        mvc.perform(post("/api/partidas/p1/desistencia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroSecreto").value(42));
    }
}
