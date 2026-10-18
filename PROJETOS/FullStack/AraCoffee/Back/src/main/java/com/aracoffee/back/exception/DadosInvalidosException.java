package com.aracoffee.back.exception;

/**
 * Lançada quando o JSON enviado pelo front tem algum campo inválido
 * (ex.: nome em branco, preço zerado). O GlobalExceptionHandler transforma em HTTP 400.
 */
public class DadosInvalidosException extends RuntimeException {

    public DadosInvalidosException(String mensagem) {
        super(mensagem);
    }
}
