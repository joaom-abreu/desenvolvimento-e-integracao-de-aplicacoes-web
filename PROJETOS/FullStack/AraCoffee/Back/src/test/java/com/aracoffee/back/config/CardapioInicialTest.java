package com.aracoffee.back.config;

import com.aracoffee.back.model.Categoria;
import com.aracoffee.back.model.Produto;
import com.aracoffee.back.repository.ProdutoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CardapioInicial")
class CardapioInicialTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Captor
    private ArgumentCaptor<List<Produto>> captor;

    @Test
    @DisplayName("não faz nada quando popular-ao-iniciar=false")
    void desligado() {
        new CardapioInicial(produtoRepository, false).run();

        verifyNoInteractions(produtoRepository);
    }

    @Test
    @DisplayName("não grava nada quando a coleção já tem produtos")
    void colecaoComDados() {
        when(produtoRepository.count()).thenReturn(3L);

        new CardapioInicial(produtoRepository, true).run();

        verify(produtoRepository).count();
        verify(produtoRepository, never()).saveAll(anyIterable());
    }

    @Test
    @DisplayName("grava os 11 produtos de exemplo quando a coleção está vazia")
    void colecaoVazia() {
        when(produtoRepository.count()).thenReturn(0L);

        new CardapioInicial(produtoRepository, true).run();

        verify(produtoRepository).saveAll(captor.capture());
        List<Produto> gravados = captor.getValue();

        assertEquals(11, gravados.size());
        assertTrue(gravados.stream().allMatch(p -> p.getId() == null), "o id deve ser gerado pelo MongoDB");
        assertTrue(gravados.stream().allMatch(p -> Categoria.TODAS.contains(p.getCategoria())));
        assertTrue(gravados.stream().allMatch(p -> p.getPreco() != null && p.getPreco() > 0));
        assertTrue(gravados.stream().allMatch(p -> p.getNome() != null && !p.getNome().isBlank()));

        Set<String> nomes = new HashSet<>();
        gravados.forEach(p -> nomes.add(p.getNome()));
        assertEquals(11, nomes.size(), "não deve haver nomes repetidos");
        assertTrue(nomes.contains("Espresso"));
        assertTrue(nomes.contains("Pão de queijo"));

        // Brownie começa como "Esgotado hoje"
        Produto brownie = gravados.stream()
                .filter(p -> p.getNome().equals("Brownie com flor de sal"))
                .findFirst().orElseThrow();
        assertFalse(brownie.isDisponivel());

        // Destaques: Coado na V60, Latte de doce de leite e Pão de queijo
        assertEquals(3, gravados.stream().filter(Produto::isDestaque).count());
    }

    @Test
    @DisplayName("não derruba a aplicação quando o MongoDB não responde no count()")
    void mongoOfflineNoCount() {
        when(produtoRepository.count()).thenThrow(new DataAccessResourceFailureException("timeout"));

        CardapioInicial cardapio = new CardapioInicial(produtoRepository, true);

        assertDoesNotThrow(() -> cardapio.run());
        verify(produtoRepository, never()).saveAll(anyIterable());
    }

    @Test
    @DisplayName("não derruba a aplicação quando o saveAll() falha")
    void mongoOfflineNoSaveAll() {
        when(produtoRepository.count()).thenReturn(0L);
        when(produtoRepository.saveAll(any())).thenThrow(new RuntimeException("falha"));

        CardapioInicial cardapio = new CardapioInicial(produtoRepository, true);

        assertDoesNotThrow(() -> cardapio.run("--qualquer-argumento"));
    }
}
