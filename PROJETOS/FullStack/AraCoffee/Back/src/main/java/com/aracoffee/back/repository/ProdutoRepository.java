package com.aracoffee.back.repository;

import com.aracoffee.back.model.Produto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends MongoRepository<Produto, String> {
    // Métodos de CRUD já estão disponíveis:
    // findAll, findById, save, saveAll, deleteById, existsById, count

    // O Spring Data monta a consulta a partir do nome do método:

    // produtos cujo nome contém o texto (sem diferenciar maiúsculas)
    List<Produto> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);

    // produtos de uma categoria
    List<Produto> findByCategoriaOrderByNomeAsc(String categoria);

    // nome contém o texto E é da categoria
    List<Produto> findByNomeContainingIgnoreCaseAndCategoriaOrderByNomeAsc(String nome, String categoria);

    // destaques disponíveis (página inicial)
    List<Produto> findByDestaqueTrueAndDisponivelTrueOrderByNomeAsc();
}
