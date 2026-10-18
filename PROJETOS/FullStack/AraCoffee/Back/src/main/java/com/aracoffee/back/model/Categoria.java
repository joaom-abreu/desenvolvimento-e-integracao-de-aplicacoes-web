package com.aracoffee.back.model;

import java.util.List;

/**
 * Categorias aceitas no cardápio, na ordem em que aparecem na tela.
 *
 * O front busca esta lista em GET /api/produtos/categorias para montar
 * os filtros do cardápio e o campo "Categoria" do formulário.
 */
public final class Categoria {

    public static final List<String> TODAS = List.of(
            "Cafés",
            "Bebidas geladas",
            "Chás",
            "Doces",
            "Salgados"
    );

    private Categoria() {
    }
}
