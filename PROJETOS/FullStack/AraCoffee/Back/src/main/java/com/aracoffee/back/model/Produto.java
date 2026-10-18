package com.aracoffee.back.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Item do cardápio, salvo na coleção "produtos" do MongoDB.
 *
 * Exemplo de como fica no Atlas:
 * {
 *   "_id": ObjectId("..."),
 *   "nome": "Pão de queijo",
 *   "descricao": "Porção com 4, saindo do forno a cada meia hora.",
 *   "categoria": "Salgados",
 *   "preco": 8.5,
 *   "destaque": true,
 *   "disponivel": true
 * }
 */
@Document(collection = "produtos")
public class Produto {

    @Id
    private String id;
    private String nome;
    private String descricao;
    private String categoria;
    private Double preco;

    /** true = aparece em "Hoje no balcão", na página inicial */
    private boolean destaque;

    /** false = aparece no cardápio como "Esgotado hoje". Começa como true. */
    private boolean disponivel = true;

    // Construtor vazio: usado pelo Spring/Jackson para montar o objeto a partir do JSON
    public Produto() {
    }

    public Produto(String id, String nome, String descricao, String categoria,
                   Double preco, boolean destaque, boolean disponivel) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.destaque = destaque;
        this.disponivel = disponivel;
    }

    // Getters e Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public boolean isDestaque() {
        return destaque;
    }

    public void setDestaque(boolean destaque) {
        this.destaque = destaque;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }
}
