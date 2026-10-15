package com.example.back.controller;

import com.example.back.model.Aluno;
import com.example.back.service.AlunoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints REST do CRUD de alunos. É aqui que o front-end React "bate".
 *
 * | Método | Endpoint              | O que faz                      | Resposta  |
 * | ------ | --------------------- | ------------------------------ | --------- |
 * | GET    | /api/alunos           | Lista todos                    | 200       |
 * | GET    | /api/alunos?nome=ana  | Busca pelo nome                | 200       |
 * | GET    | /api/alunos/{id}      | Busca um aluno                 | 200 / 404 |
 * | POST   | /api/alunos           | Cadastra                       | 201 / 400 |
 * | PUT    | /api/alunos/{id}      | Atualiza                       | 200 / 404 |
 * | DELETE | /api/alunos/{id}      | Exclui                         | 204 / 404 |
 */
@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoService alunoService;

    public AlunoController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    // http://localhost:8080/api/alunos
    // http://localhost:8080/api/alunos?nome=ana
    @GetMapping
    public List<Aluno> listar(@RequestParam(required = false) String nome) {
        return alunoService.listar(nome);
    }

    // http://localhost:8080/api/alunos/{id}
    @GetMapping("/{id}")
    public Aluno buscarPorId(@PathVariable String id) {
        return alunoService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Aluno> inserir(@RequestBody Aluno aluno) {
        Aluno criado = alunoService.inserir(aluno);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Aluno atualizar(@PathVariable String id, @RequestBody Aluno aluno) {
        return alunoService.atualizar(id, aluno);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        alunoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
