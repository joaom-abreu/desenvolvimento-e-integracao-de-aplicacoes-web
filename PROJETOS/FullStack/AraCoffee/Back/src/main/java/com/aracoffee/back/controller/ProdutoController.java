package com.aracoffee.back.controller;

import com.aracoffee.back.model.Produto;
import com.aracoffee.back.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints REST do cardápio. É aqui que o front-end React "bate".
 *
 * | Método | Endpoint                           | O que faz                  | Resposta  |
 * | ------ | ---------------------------------- | -------------------------- | --------- |
 * | GET    | /api/produtos                      | Lista todos                | 200       |
 * | GET    | /api/produtos?nome=pão             | Busca pelo nome            | 200       |
 * | GET    | /api/produtos?categoria=Cafés      | Filtra pela categoria      | 200       |
 * | GET    | /api/produtos/destaques            | Destaques disponíveis      | 200       |
 * | GET    | /api/produtos/categorias           | Categorias aceitas         | 200       |
 * | GET    | /api/produtos/{id}                 | Busca um produto           | 200 / 404 |
 * | POST   | /api/produtos                      | Cadastra                   | 201 / 400 |
 * | PUT    | /api/produtos/{id}                 | Atualiza                   | 200 / 404 |
 * | DELETE | /api/produtos/{id}                 | Exclui                     | 204 / 404 |
 */
@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    // http://localhost:8080/api/produtos
    // http://localhost:8080/api/produtos?nome=pão&categoria=Salgados
    @GetMapping
    public List<Produto> listar(@RequestParam(required = false) String nome,
                                @RequestParam(required = false) String categoria) {
        return produtoService.listar(nome, categoria);
    }

    // Caminhos fixos ("/destaques", "/categorias") têm prioridade sobre "/{id}"
    @GetMapping("/destaques")
    public List<Produto> destaques() {
        return produtoService.listarDestaques();
    }

    @GetMapping("/categorias")
    public List<String> categorias() {
        return produtoService.listarCategorias();
    }

    @GetMapping("/{id}")
    public Produto buscarPorId(@PathVariable String id) {
        return produtoService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Produto> inserir(@RequestBody Produto produto) {
        Produto criado = produtoService.inserir(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable String id, @RequestBody Produto produto) {
        return produtoService.atualizar(id, produto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
