package com.example.back.exception;

/**
 * Lançada quando o id informado não existe na coleção "alunos".
 * O GlobalExceptionHandler transforma esta exceção em HTTP 404 (Not Found).
 */
public class AlunoNaoEncontradoException extends RuntimeException {

    public AlunoNaoEncontradoException(String id) {
        super("Aluno com id " + id + " não encontrado.");
    }
}
