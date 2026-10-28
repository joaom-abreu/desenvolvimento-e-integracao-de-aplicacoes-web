package com.aracoffee.back.service;

import com.aracoffee.back.exception.DadosInvalidosException;
import com.aracoffee.back.exception.ProdutoNaoEncontradoException;
import com.aracoffee.back.model.Categoria;
import com.aracoffee.back.model.Produto;
import com.aracoffee.back.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Testes unitários das regras de negócio do cardápio.
 * O ProdutoRepository é simulado com Mockito: nenhum MongoDB é necessário.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProdutoService")
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    private Produto produtoValido;

    @BeforeEach
    void setUp() {
        produtoValido = new Produto(null, "Espresso", "Dose curta.", "Cafés", 6.0, false, true);
    }

    private static Produto produto(String id, String nome) {
        return new Produto(id, nome, "Descrição", "Cafés", 10.0, false, true);
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("listar(nome, categoria)")
    class Listar {

        @Test
        @DisplayName("sem filtros: busca todos ordenados por nome")
        void semFiltros() {
            List<Produto> todos = List.of(produto("1", "A"), produto("2", "B"));
            when(produtoRepository.findAll(Sort.by("nome"))).thenReturn(todos);

            List<Produto> resultado = produtoService.listar(null, null);

            assertEquals(todos, resultado);
            verify(produtoRepository).findAll(Sort.by("nome"));
            verifyNoMoreInteractions(produtoRepository);
        }

        @Test
        @DisplayName("filtros em branco são ignorados")
        void filtrosEmBranco() {
            when(produtoRepository.findAll(Sort.by("nome"))).thenReturn(List.of());

            produtoService.listar("   ", "");

            verify(produtoRepository).findAll(Sort.by("nome"));
            verifyNoMoreInteractions(produtoRepository);
        }

        @Test
        @DisplayName("só nome: busca por nome (com trim)")
        void soNome() {
            List<Produto> esperado = List.of(produto("1", "Pão de queijo"));
            when(produtoRepository.findByNomeContainingIgnoreCaseOrderByNomeAsc("pão")).thenReturn(esperado);

            List<Produto> resultado = produtoService.listar("  pão  ", null);

            assertEquals(esperado, resultado);
            verify(produtoRepository).findByNomeContainingIgnoreCaseOrderByNomeAsc("pão");
            verifyNoMoreInteractions(produtoRepository);
        }

        @Test
        @DisplayName("só categoria: busca por categoria (com trim)")
        void soCategoria() {
            List<Produto> esperado = List.of(produto("1", "Espresso"));
            when(produtoRepository.findByCategoriaOrderByNomeAsc("Cafés")).thenReturn(esperado);

            List<Produto> resultado = produtoService.listar(null, " Cafés ");

            assertEquals(esperado, resultado);
            verify(produtoRepository).findByCategoriaOrderByNomeAsc("Cafés");
            verifyNoMoreInteractions(produtoRepository);
        }

        @Test
        @DisplayName("nome e categoria: usa a consulta combinada")
        void nomeECategoria() {
            List<Produto> esperado = List.of(produto("1", "Pão de queijo"));
            when(produtoRepository.findByNomeContainingIgnoreCaseAndCategoriaOrderByNomeAsc("pão", "Salgados"))
                    .thenReturn(esperado);

            List<Produto> resultado = produtoService.listar(" pão ", " Salgados ");

            assertEquals(esperado, resultado);
            verify(produtoRepository).findByNomeContainingIgnoreCaseAndCategoriaOrderByNomeAsc("pão", "Salgados");
            verifyNoMoreInteractions(produtoRepository);
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("listarDestaques() e listarCategorias()")
    class DestaquesECategorias {

        @Test
        @DisplayName("listarDestaques delega para o repositório")
        void destaques() {
            List<Produto> esperado = List.of(produto("1", "Coado na V60"));
            when(produtoRepository.findByDestaqueTrueAndDisponivelTrueOrderByNomeAsc()).thenReturn(esperado);

            assertEquals(esperado, produtoService.listarDestaques());
            verify(produtoRepository).findByDestaqueTrueAndDisponivelTrueOrderByNomeAsc();
        }

        @Test
        @DisplayName("listarCategorias devolve Categoria.TODAS sem acessar o banco")
        void categorias() {
            assertEquals(Categoria.TODAS, produtoService.listarCategorias());
            verifyNoInteractions(produtoRepository);
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("buscarPorId(id)")
    class BuscarPorId {

        @Test
        @DisplayName("devolve o produto quando o id existe")
        void encontrado() {
            Produto p = produto("abc", "Espresso");
            when(produtoRepository.findById("abc")).thenReturn(Optional.of(p));

            assertSame(p, produtoService.buscarPorId("abc"));
        }

        @Test
        @DisplayName("lança ProdutoNaoEncontradoException quando o id não existe")
        void naoEncontrado() {
            when(produtoRepository.findById("xyz")).thenReturn(Optional.empty());

            ProdutoNaoEncontradoException ex = assertThrows(ProdutoNaoEncontradoException.class,
                    () -> produtoService.buscarPorId("xyz"));
            assertEquals("Produto com id xyz não encontrado no cardápio.", ex.getMessage());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("inserir(produto)")
    class Inserir {

        @Test
        @DisplayName("salva um produto válido e devolve o que o repositório retornou")
        void inserirValido() {
            Produto salvo = new Produto("novo-id", "Espresso", "Dose curta.", "Cafés", 6.0, false, true);
            when(produtoRepository.save(any(Produto.class))).thenReturn(salvo);

            Produto resultado = produtoService.inserir(produtoValido);

            assertSame(salvo, resultado);
            verify(produtoRepository).save(produtoValido);
        }

        @Test
        @DisplayName("ignora o id enviado: quem gera o id é o MongoDB")
        void zeraId() {
            produtoValido.setId("id-do-cliente");
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            Produto resultado = produtoService.inserir(produtoValido);

            assertNull(resultado.getId());
        }

        @Test
        @DisplayName("remove espaços de nome, categoria e descrição e arredonda o preço")
        void limpaCampos() {
            Produto sujo = new Produto(null, "  Pão de queijo  ", "  Porção com 4.  ", "  Salgados  ",
                    9.999, true, false);
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            produtoService.inserir(sujo);

            ArgumentCaptor<Produto> captor = ArgumentCaptor.forClass(Produto.class);
            verify(produtoRepository).save(captor.capture());
            Produto gravado = captor.getValue();

            assertEquals("Pão de queijo", gravado.getNome());
            assertEquals("Salgados", gravado.getCategoria());
            assertEquals("Porção com 4.", gravado.getDescricao());
            assertEquals(10.0, gravado.getPreco());
            assertTrue(gravado.isDestaque());
            assertFalse(gravado.isDisponivel());
        }

        @Test
        @DisplayName("arredonda o preço para centavos")
        void arredondaPreco() {
            produtoValido.setPreco(8.499);
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            assertEquals(8.5, produtoService.inserir(produtoValido).getPreco());
        }

        @Test
        @DisplayName("descrição nula vira texto vazio")
        void descricaoNula() {
            produtoValido.setDescricao(null);
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            assertEquals("", produtoService.inserir(produtoValido).getDescricao());
        }

        @Test
        @DisplayName("aceita descrição com exatamente 160 caracteres")
        void descricaoNoLimite() {
            produtoValido.setDescricao("a".repeat(160));
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            assertEquals(160, produtoService.inserir(produtoValido).getDescricao().length());
        }

        @ParameterizedTest(name = "categoria \"{0}\" é aceita")
        @ValueSource(strings = {"Cafés", "Bebidas geladas", "Chás", "Doces", "Salgados"})
        void aceitaTodasAsCategorias(String categoria) {
            produtoValido.setCategoria(categoria);
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            assertEquals(categoria, produtoService.inserir(produtoValido).getCategoria());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("validação (400 - DadosInvalidosException)")
    class Validacao {

        private void assertInvalido(Produto produto, String mensagemEsperada) {
            DadosInvalidosException ex = assertThrows(DadosInvalidosException.class,
                    () -> produtoService.inserir(produto));
            assertEquals(mensagemEsperada, ex.getMessage());
            verify(produtoRepository, never()).save(any());
        }

        @Test
        @DisplayName("produto nulo")
        void produtoNulo() {
            assertInvalido(null, "Envie os dados do produto no corpo da requisição.");
        }

        @ParameterizedTest(name = "nome = \"{0}\"")
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t"})
        void nomeObrigatorio(String nome) {
            produtoValido.setNome(nome);
            assertInvalido(produtoValido, "O nome do produto é obrigatório.");
        }

        @ParameterizedTest(name = "categoria = \"{0}\"")
        @NullAndEmptySource
        @ValueSource(strings = {"Pizzas", "cafés", "CAFÉS", "Cafe"})
        void categoriaInvalida(String categoria) {
            produtoValido.setCategoria(categoria);
            assertInvalido(produtoValido,
                    "Escolha uma categoria: Cafés, Bebidas geladas, Chás, Doces, Salgados.");
        }

        @Test
        @DisplayName("preço nulo")
        void precoNulo() {
            produtoValido.setPreco(null);
            assertInvalido(produtoValido, "Informe um preço maior que zero (ex.: 8.50).");
        }

        @ParameterizedTest(name = "preço = {0}")
        @ValueSource(doubles = {0.0, -0.01, -10.0})
        void precoMenorOuIgualAZero(double preco) {
            produtoValido.setPreco(preco);
            assertInvalido(produtoValido, "Informe um preço maior que zero (ex.: 8.50).");
        }

        @Test
        @DisplayName("descrição com mais de 160 caracteres")
        void descricaoLonga() {
            produtoValido.setDescricao("a".repeat(161));
            assertInvalido(produtoValido, "A descrição pode ter no máximo 160 caracteres.");
        }

        @Test
        @DisplayName("espaços nas pontas não contam no limite da descrição")
        void descricaoComEspacos() {
            produtoValido.setDescricao("   " + "a".repeat(160) + "   ");
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            assertDoesNotThrow(() -> produtoService.inserir(produtoValido));
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("atualizar(id, dados)")
    class Atualizar {

        @Test
        @DisplayName("copia os dados para o produto existente, mantém o id e salva")
        void atualizaExistente() {
            Produto existente = new Produto("abc", "Antigo", "Antiga", "Doces", 5.0, false, true);
            Produto dados = new Produto("outro-id", "  Novo  ", "  Nova descrição  ", " Cafés ", 12.5, true, false);
            when(produtoRepository.findById("abc")).thenReturn(Optional.of(existente));
            when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

            Produto resultado = produtoService.atualizar("abc", dados);

            assertSame(existente, resultado);
            assertEquals("abc", resultado.getId());
            assertEquals("Novo", resultado.getNome());
            assertEquals("Nova descrição", resultado.getDescricao());
            assertEquals("Cafés", resultado.getCategoria());
            assertEquals(12.5, resultado.getPreco());
            assertTrue(resultado.isDestaque());
            assertFalse(resultado.isDisponivel());
            verify(produtoRepository).save(existente);
        }

        @Test
        @DisplayName("lança 404 quando o id não existe e não salva nada")
        void naoEncontrado() {
            when(produtoRepository.findById("xyz")).thenReturn(Optional.empty());

            assertThrows(ProdutoNaoEncontradoException.class,
                    () -> produtoService.atualizar("xyz", produtoValido));
            verify(produtoRepository, never()).save(any());
        }

        @Test
        @DisplayName("lança 400 quando os dados são inválidos e não altera o existente")
        void dadosInvalidos() {
            Produto existente = new Produto("abc", "Antigo", "Antiga", "Doces", 5.0, false, true);
            when(produtoRepository.findById("abc")).thenReturn(Optional.of(existente));
            produtoValido.setPreco(0.0);

            assertThrows(DadosInvalidosException.class, () -> produtoService.atualizar("abc", produtoValido));

            assertEquals("Antigo", existente.getNome());
            assertEquals(5.0, existente.getPreco());
            verify(produtoRepository, never()).save(any());
        }

        @Test
        @DisplayName("lança 400 quando o corpo é nulo")
        void corpoNulo() {
            when(produtoRepository.findById("abc")).thenReturn(Optional.of(produto("abc", "X")));

            assertThrows(DadosInvalidosException.class, () -> produtoService.atualizar("abc", null));
            verify(produtoRepository, never()).save(any());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("excluir(id)")
    class Excluir {

        @Test
        @DisplayName("exclui quando o id existe")
        void excluiExistente() {
            when(produtoRepository.existsById("abc")).thenReturn(true);

            produtoService.excluir("abc");

            verify(produtoRepository).deleteById("abc");
        }

        @Test
        @DisplayName("lança 404 quando o id não existe e não chama deleteById")
        void naoEncontrado() {
            when(produtoRepository.existsById("xyz")).thenReturn(false);

            ProdutoNaoEncontradoException ex = assertThrows(ProdutoNaoEncontradoException.class,
                    () -> produtoService.excluir("xyz"));
            assertTrue(ex.getMessage().contains("xyz"));
            verify(produtoRepository, never()).deleteById(anyString());
        }
    }
}
