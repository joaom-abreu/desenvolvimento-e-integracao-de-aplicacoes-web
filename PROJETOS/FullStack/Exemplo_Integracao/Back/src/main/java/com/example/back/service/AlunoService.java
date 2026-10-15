package com.example.back.service;

import com.example.back.exception.AlunoNaoEncontradoException;
import com.example.back.exception.DadosInvalidosException;
import com.example.back.model.Aluno;
import com.example.back.repository.AlunoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Regras de negócio do CRUD de alunos.
 * O controller recebe a requisição HTTP e o service decide o que fazer com o MongoDB.
 */
@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;

    // Injeção de dependência pelo construtor (equivale ao @Autowired no atributo)
    public AlunoService(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    /** Lista todos os alunos (ordem alfabética). Com "nome", filtra pelos que contêm o texto. */
    public List<Aluno> listar(String nome) {
        if (nome == null || nome.isBlank()) {
            return alunoRepository.findAll(Sort.by("nome"));
        }
        return alunoRepository.findByNomeContainingIgnoreCaseOrderByNomeAsc(nome.trim());
    }

    public Aluno buscarPorId(String id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new AlunoNaoEncontradoException(id));
    }

    public Aluno inserir(Aluno aluno) {
        validar(aluno);
        aluno.setId(null); // quem gera o id é o MongoDB
        limpar(aluno);
        return alunoRepository.save(aluno);
    }

    public Aluno atualizar(String id, Aluno dados) {
        Aluno existente = buscarPorId(id); // lança 404 se não existir
        validar(dados);

        existente.setNome(dados.getNome());
        existente.setEmail(dados.getEmail());
        existente.setCurso(dados.getCurso());
        limpar(existente);

        return alunoRepository.save(existente);
    }

    public void excluir(String id) {
        if (!alunoRepository.existsById(id)) {
            throw new AlunoNaoEncontradoException(id);
        }
        alunoRepository.deleteById(id);
    }

    /** Validação simples dos campos (lança 400 pelo GlobalExceptionHandler). */
    private void validar(Aluno aluno) {
        if (aluno == null) {
            throw new DadosInvalidosException("Envie os dados do aluno no corpo da requisição.");
        }
        if (aluno.getNome() == null || aluno.getNome().isBlank()) {
            throw new DadosInvalidosException("O nome do aluno é obrigatório.");
        }
        if (aluno.getEmail() == null || aluno.getEmail().isBlank()) {
            throw new DadosInvalidosException("O e-mail do aluno é obrigatório.");
        }
        if (!aluno.getEmail().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new DadosInvalidosException("Informe um e-mail válido (ex.: maria@sga.pucminas.br).");
        }
    }

    /** Remove espaços sobrando no começo e no fim dos textos. */
    private void limpar(Aluno aluno) {
        aluno.setNome(aluno.getNome().trim());
        aluno.setEmail(aluno.getEmail().trim().toLowerCase());
        aluno.setCurso(aluno.getCurso() == null ? "" : aluno.getCurso().trim());
    }
}
