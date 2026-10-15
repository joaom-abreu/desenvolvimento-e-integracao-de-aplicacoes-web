package com.example.back.repository;

import com.example.back.model.Aluno;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlunoRepository extends MongoRepository<Aluno, String> {
    // Métodos de CRUD já estão disponíveis:
    // findAll, findById, save, deleteById, existsById

    // Consulta personalizada: alunos cujo nome contém o texto (sem diferenciar maiúsculas)
    List<Aluno> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);
}
