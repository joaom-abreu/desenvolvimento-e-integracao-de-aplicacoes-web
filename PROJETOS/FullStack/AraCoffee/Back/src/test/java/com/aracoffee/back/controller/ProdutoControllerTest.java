package com.aracoffee.back.controller;

import com.aracoffee.back.exception.DadosInvalidosException;
import com.aracoffee.back.exception.GlobalExceptionHandler;
import com.aracoffee.back.exception.ProdutoNaoEncontradoException;
import com.aracoffee.back.model.Categoria;
import com.aracoffee.back.model.Produto;
import com.aracoffee.back.service.ProdutoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testa os endpoints REST de /api/produtos com MockMvc em modo "standalone":
 * sem subir o contexto do Spring e sem MongoDB. O ProdutoService é um mock do Mockito
 * e o GlobalExceptionHandler é registrado para conferir os códigos HTTP de erro.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProdutoController")
class ProdutoControllerTest {

    private static final String URL = "/api/produtos";

    @Mock
    private ProdutoService produtoService;

    @InjectMocks
    private ProdutoController produtoController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(produtoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .defaultResponseCharacterEncoding(StandardCharsets.UTF_8)
                .build();
    }

    private static Produto espresso() {
        return new Produto("1", "Espresso", "Dose curta.", "Cafés", 6.0, false, true);
    }

    private static Produto paoDeQueijo() {
        return new Produto("2", "Pão de queijo", "Porção com 4.", "Salgados", 8.5, true, true);
    }

    private static final String JSON_VALIDO = """
            {
              "nome": "Espresso",
              "descricao": "Dose curta.",
              "categoria": "Cafés",
              "preco": 6.0,
              "destaque": false,
              "disponivel": true
            }
            """;

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("GET /api/produtos")
    class Listar {

        @Test
        @DisplayName("200 com a lista de produtos (sem filtros)")
        void listarTodos() throws Exception {
            when(produtoService.listar(null, null)).thenReturn(List.of(espresso(), paoDeQueijo()));

            mockMvc.perform(get(URL))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id").value("1"))
                    .andExpect(jsonPath("$[0].nome").value("Espresso"))
                    .andExpect(jsonPath("$[0].categoria").value("Cafés"))
                    .andExpect(jsonPath("$[0].preco").value(6.0))
                    .andExpect(jsonPath("$[1].nome").value("Pão de queijo"))
                    .andExpect(jsonPath("$[1].destaque").value(true))
                    .andExpect(jsonPath("$[1].disponivel").value(true));

            verify(produtoService).listar(null, null);
        }

        @Test
        @DisplayName("repassa os filtros nome e categoria ao service")
        void listarComFiltros() throws Exception {
            when(produtoService.listar("pão", "Salgados")).thenReturn(List.of(paoDeQueijo()));

            mockMvc.perform(get(URL).param("nome", "pão").param("categoria", "Salgados"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].nome").value("Pão de queijo"));

            verify(produtoService).listar("pão", "Salgados");
        }

        @Test
        @DisplayName("200 com lista vazia")
        void listaVazia() throws Exception {
            when(produtoService.listar(any(), any())).thenReturn(List.of());

            mockMvc.perform(get(URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("503 quando o MongoDB está indisponível")
        void mongoIndisponivel() throws Exception {
            when(produtoService.listar(any(), any()))
                    .thenThrow(new DataAccessResourceFailureException("timeout"));

            mockMvc.perform(get(URL))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.status").value(503))
                    .andExpect(jsonPath("$.caminho").value(URL))
                    .andExpect(jsonPath("$.mensagem").value(
                            "Não foi possível conectar ao MongoDB Atlas. Confira a connection string no "
                                    + "application.properties e o Network Access do Atlas."));
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("GET /api/produtos/destaques e /categorias")
    class DestaquesECategorias {

        @Test
        @DisplayName("destaques: 200 e não é confundido com /{id}")
        void destaques() throws Exception {
            when(produtoService.listarDestaques()).thenReturn(List.of(paoDeQueijo()));

            mockMvc.perform(get(URL + "/destaques"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].nome").value("Pão de queijo"));

            verify(produtoService).listarDestaques();
            verify(produtoService, never()).buscarPorId(anyString());
        }

        @Test
        @DisplayName("categorias: 200 com as categorias aceitas, na ordem")
        void categorias() throws Exception {
            when(produtoService.listarCategorias()).thenReturn(Categoria.TODAS);

            mockMvc.perform(get(URL + "/categorias"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(5)))
                    .andExpect(jsonPath("$[0]").value("Cafés"))
                    .andExpect(jsonPath("$[1]").value("Bebidas geladas"))
                    .andExpect(jsonPath("$[2]").value("Chás"))
                    .andExpect(jsonPath("$[3]").value("Doces"))
                    .andExpect(jsonPath("$[4]").value("Salgados"));

            verify(produtoService, never()).buscarPorId(anyString());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("GET /api/produtos/{id}")
    class BuscarPorId {

        @Test
        @DisplayName("200 com o produto")
        void encontrado() throws Exception {
            when(produtoService.buscarPorId("1")).thenReturn(espresso());

            mockMvc.perform(get(URL + "/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("1"))
                    .andExpect(jsonPath("$.nome").value("Espresso"))
                    .andExpect(jsonPath("$.descricao").value("Dose curta."));
        }

        @Test
        @DisplayName("404 com ErroResposta quando não existe")
        void naoEncontrado() throws Exception {
            when(produtoService.buscarPorId("999")).thenThrow(new ProdutoNaoEncontradoException("999"));

            mockMvc.perform(get(URL + "/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.erro").value("Not Found"))
                    .andExpect(jsonPath("$.mensagem").value("Produto com id 999 não encontrado no cardápio."))
                    .andExpect(jsonPath("$.caminho").value(URL + "/999"))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/produtos")
    class Inserir {

        @Test
        @DisplayName("201 com o produto criado")
        void criado() throws Exception {
            when(produtoService.inserir(any(Produto.class))).thenReturn(espresso());

            mockMvc.perform(post(URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content(JSON_VALIDO))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("1"))
                    .andExpect(jsonPath("$.nome").value("Espresso"));
        }

        @Test
        @DisplayName("converte o JSON do corpo em Produto")
        void converteCorpo() throws Exception {
            when(produtoService.inserir(any(Produto.class))).thenReturn(espresso());

            mockMvc.perform(post(URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content(JSON_VALIDO))
                    .andExpect(status().isCreated());

            ArgumentCaptor<Produto> captor = ArgumentCaptor.forClass(Produto.class);
            verify(produtoService).inserir(captor.capture());
            Produto recebido = captor.getValue();
            assertEquals("Espresso", recebido.getNome());
            assertEquals("Dose curta.", recebido.getDescricao());
            assertEquals("Cafés", recebido.getCategoria());
            assertEquals(6.0, recebido.getPreco());
            assertFalse(recebido.isDestaque());
            assertTrue(recebido.isDisponivel());
        }

        @Test
        @DisplayName("quando 'disponivel' não é enviado, vale true")
        void disponivelPadrao() throws Exception {
            when(produtoService.inserir(any(Produto.class))).thenReturn(espresso());

            mockMvc.perform(post(URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content("{\"nome\":\"Espresso\",\"categoria\":\"Cafés\",\"preco\":6}"))
                    .andExpect(status().isCreated());

            ArgumentCaptor<Produto> captor = ArgumentCaptor.forClass(Produto.class);
            verify(produtoService).inserir(captor.capture());
            assertTrue(captor.getValue().isDisponivel());
            assertFalse(captor.getValue().isDestaque());
        }

        @Test
        @DisplayName("400 quando o service rejeita os dados")
        void dadosInvalidos() throws Exception {
            when(produtoService.inserir(any(Produto.class)))
                    .thenThrow(new DadosInvalidosException("O nome do produto é obrigatório."));

            mockMvc.perform(post(URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content("{\"nome\":\"\",\"categoria\":\"Cafés\",\"preco\":6}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.erro").value("Bad Request"))
                    .andExpect(jsonPath("$.mensagem").value("O nome do produto é obrigatório."))
                    .andExpect(jsonPath("$.caminho").value(URL));
        }

        @Test
        @DisplayName("400 quando o corpo não é um JSON válido (service não é chamado)")
        void jsonInvalido() throws Exception {
            mockMvc.perform(post(URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content("{ isso não é json"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensagem").value("O corpo da requisição não é um JSON válido."));

            verifyNoInteractions(produtoService);
        }

        @Test
        @DisplayName("400 quando o preço vem como texto")
        void precoComoTexto() throws Exception {
            mockMvc.perform(post(URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content("{\"nome\":\"Espresso\",\"categoria\":\"Cafés\",\"preco\":\"seis reais\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensagem").value("O corpo da requisição não é um JSON válido."));

            verifyNoInteractions(produtoService);
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("PUT /api/produtos/{id}")
    class Atualizar {

        @Test
        @DisplayName("200 com o produto atualizado")
        void atualizado() throws Exception {
            Produto atualizado = new Produto("1", "Espresso duplo", "Dose dupla.", "Cafés", 9.0, true, true);
            when(produtoService.atualizar(eq("1"), any(Produto.class))).thenReturn(atualizado);

            mockMvc.perform(put(URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content("{\"nome\":\"Espresso duplo\",\"descricao\":\"Dose dupla.\","
                                    + "\"categoria\":\"Cafés\",\"preco\":9.0,\"destaque\":true,\"disponivel\":true}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("1"))
                    .andExpect(jsonPath("$.nome").value("Espresso duplo"))
                    .andExpect(jsonPath("$.preco").value(9.0))
                    .andExpect(jsonPath("$.destaque").value(true));

            ArgumentCaptor<Produto> captor = ArgumentCaptor.forClass(Produto.class);
            verify(produtoService).atualizar(eq("1"), captor.capture());
            assertEquals("Espresso duplo", captor.getValue().getNome());
        }

        @Test
        @DisplayName("404 quando o id não existe")
        void naoEncontrado() throws Exception {
            when(produtoService.atualizar(eq("999"), any(Produto.class)))
                    .thenThrow(new ProdutoNaoEncontradoException("999"));

            mockMvc.perform(put(URL + "/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content(JSON_VALIDO))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.mensagem").value("Produto com id 999 não encontrado no cardápio."));
        }

        @Test
        @DisplayName("400 quando os dados são inválidos")
        void dadosInvalidos() throws Exception {
            when(produtoService.atualizar(eq("1"), any(Produto.class)))
                    .thenThrow(new DadosInvalidosException("Informe um preço maior que zero (ex.: 8.50)."));

            mockMvc.perform(put(URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .characterEncoding(StandardCharsets.UTF_8)
                            .content("{\"nome\":\"Espresso\",\"categoria\":\"Cafés\",\"preco\":0}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensagem").value("Informe um preço maior que zero (ex.: 8.50)."));
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("DELETE /api/produtos/{id}")
    class Excluir {

        @Test
        @DisplayName("204 sem corpo quando exclui")
        void excluido() throws Exception {
            doNothing().when(produtoService).excluir("1");

            mockMvc.perform(delete(URL + "/1"))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            verify(produtoService).excluir("1");
        }

        @Test
        @DisplayName("404 quando o id não existe")
        void naoEncontrado() throws Exception {
            doThrow(new ProdutoNaoEncontradoException("999")).when(produtoService).excluir("999");

            mockMvc.perform(delete(URL + "/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("Erros genéricos")
    class ErrosGenericos {

        @Test
        @DisplayName("405 para método HTTP não suportado")
        void metodoNaoPermitido() throws Exception {
            mockMvc.perform(patch(URL))
                    .andExpect(status().isMethodNotAllowed())
                    .andExpect(jsonPath("$.status").value(405))
                    .andExpect(jsonPath("$.mensagem").value("Método PATCH não é permitido neste endpoint."));

            verifyNoInteractions(produtoService);
        }

        @Test
        @DisplayName("500 para erro inesperado")
        void erroInesperado() throws Exception {
            when(produtoService.buscarPorId("1")).thenThrow(new IllegalStateException("bug"));

            mockMvc.perform(get(URL + "/1"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.status").value(500))
                    .andExpect(jsonPath("$.mensagem").value("Erro interno no servidor."));
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("Chamada direta (sem MockMvc)")
    class ChamadaDireta {

        @Test
        @DisplayName("inserir devolve ResponseEntity 201")
        void inserir() {
            Produto p = espresso();
            when(produtoService.inserir(p)).thenReturn(p);

            var resposta = produtoController.inserir(p);

            assertEquals(201, resposta.getStatusCode().value());
            assertSame(p, resposta.getBody());
        }

        @Test
        @DisplayName("excluir devolve ResponseEntity 204 sem corpo")
        void excluir() {
            var resposta = produtoController.excluir("1");

            assertEquals(204, resposta.getStatusCode().value());
            assertNull(resposta.getBody());
            verify(produtoService).excluir("1");
        }
    }
}
