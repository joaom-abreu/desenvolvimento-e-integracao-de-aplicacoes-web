package com.aracoffee.back.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Modelo: Produto e Categoria")
class ProdutoTest {

    @Test
    @DisplayName("construtor vazio: disponivel começa true e destaque false")
    void construtorVazio() {
        Produto p = new Produto();

        assertNull(p.getId());
        assertNull(p.getNome());
        assertNull(p.getDescricao());
        assertNull(p.getCategoria());
        assertNull(p.getPreco());
        assertFalse(p.isDestaque());
        assertTrue(p.isDisponivel());
    }

    @Test
    @DisplayName("construtor completo preenche todos os campos")
    void construtorCompleto() {
        Produto p = new Produto("1", "Espresso", "Dose curta.", "Cafés", 6.0, true, false);

        assertEquals("1", p.getId());
        assertEquals("Espresso", p.getNome());
        assertEquals("Dose curta.", p.getDescricao());
        assertEquals("Cafés", p.getCategoria());
        assertEquals(6.0, p.getPreco());
        assertTrue(p.isDestaque());
        assertFalse(p.isDisponivel());
    }

    @Test
    @DisplayName("setters alteram os campos")
    void setters() {
        Produto p = new Produto();
        p.setId("2");
        p.setNome("Cold brew");
        p.setDescricao("Extraído a frio.");
        p.setCategoria("Bebidas geladas");
        p.setPreco(13.0);
        p.setDestaque(true);
        p.setDisponivel(false);

        assertEquals("2", p.getId());
        assertEquals("Cold brew", p.getNome());
        assertEquals("Extraído a frio.", p.getDescricao());
        assertEquals("Bebidas geladas", p.getCategoria());
        assertEquals(13.0, p.getPreco());
        assertTrue(p.isDestaque());
        assertFalse(p.isDisponivel());
    }

    @Test
    @DisplayName("Categoria.TODAS tem as 5 categorias na ordem da tela")
    void categorias() {
        assertEquals(List.of("Cafés", "Bebidas geladas", "Chás", "Doces", "Salgados"), Categoria.TODAS);
    }

    @Test
    @DisplayName("Categoria.TODAS é imutável")
    void categoriasImutavel() {
        assertThrows(UnsupportedOperationException.class, () -> Categoria.TODAS.add("Pizzas"));
    }
}
