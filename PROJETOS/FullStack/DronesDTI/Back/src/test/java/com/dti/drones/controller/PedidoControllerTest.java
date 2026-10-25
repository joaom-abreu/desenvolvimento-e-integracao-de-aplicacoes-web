package com.dti.drones.controller;

import com.dti.drones.dto.PedidoRequest;
import com.dti.drones.dto.PedidoResponse;
import com.dti.drones.exception.GlobalExceptionHandler;
import com.dti.drones.exception.RecursoNaoEncontradoException;
import com.dti.drones.exception.RegraNegocioException;
import com.dti.drones.service.PedidoService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testa a camada HTTP: status code, JSON de resposta e JSON de erro.
 * O PedidoService é um mock; o MockMvc "finge" o servidor (sem subir o Tomcat).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PedidoController (HTTP)")
class PedidoControllerTest {

    @Mock private PedidoService pedidoService;
    private MockMvc mvc;

    @BeforeEach
    void configurar() {
        mvc = MockMvcBuilders.standaloneSetup(new PedidoController(pedidoService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static PedidoResponse resposta() {
        return new PedidoResponse("p1", "Ana", 12, 7, 2.5, "ALTA", "Alta", "PENDENTE",
                Instant.parse("2026-10-24T12:00:00Z"), null, null, null, null, null, null, null);
    }

    @Test
    @DisplayName("POST válido -> 201 Created")
    void criar() throws Exception {
        when(pedidoService.criar(any(PedidoRequest.class))).thenReturn(resposta());

        mvc.perform(post("/api/pedidos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cliente\":\"Ana\",\"x\":12,\"y\":7,\"pesoKg\":2.5,\"prioridade\":\"alta\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("p1"))
                .andExpect(jsonPath("$.status").value("PENDENTE"));
    }

    @Test
    @DisplayName("POST sem peso -> 400 com o campo destacado")
    void validacao() throws Exception {
        mvc.perform(post("/api/pedidos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"x\":12,\"y\":7,\"prioridade\":\"alta\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.pesoKg").value("Informe o peso do pacote em kg."));
    }

    @Test
    @DisplayName("regra de negócio quebrada -> 422 com mensagem clara")
    void regraDeNegocio() throws Exception {
        when(pedidoService.criar(any(PedidoRequest.class)))
                .thenThrow(new RegraNegocioException("O pacote de 12,00 kg excede a capacidade máxima da frota (15,0 kg)."));

        mvc.perform(post("/api/pedidos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"x\":12,\"y\":7,\"pesoKg\":12,\"prioridade\":\"baixa\"}"))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.mensagem").value("O pacote de 12,00 kg excede a capacidade máxima da frota (15,0 kg)."));
    }

    @Test
    @DisplayName("JSON quebrado -> 400")
    void jsonInvalido() throws Exception {
        mvc.perform(post("/api/pedidos").contentType(MediaType.APPLICATION_JSON).content("{ isso não é json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET de id inexistente -> 404")
    void naoEncontrado() throws Exception {
        when(pedidoService.buscar("nao-existe")).thenThrow(new RecursoNaoEncontradoException("Pedido", "nao-existe"));

        mvc.perform(get("/api/pedidos/nao-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
