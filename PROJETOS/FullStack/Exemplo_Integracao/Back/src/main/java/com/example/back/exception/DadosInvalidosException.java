package com.example.back.exception;

/**
 * Lançada quando o JSON enviado pelo front tem algum campo inválido
 * (ex.: nome em branco). O GlobalExceptionHandler transforma em HTTP 400 (Bad Request).
 */
public class DadosInvalidosException extends RuntimeException {

    public DadosInvalidosException(String mensagem) {
        super(mensagem);
    }
}
