package com.dti.palpite.exception;

/**
 * 409: a requisição está correta, mas conflita com o estado atual do recurso.
 * Ex.: mandar um palpite para uma partida que já terminou.
 */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
