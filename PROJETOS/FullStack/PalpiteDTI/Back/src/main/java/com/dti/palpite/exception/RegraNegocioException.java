package com.dti.palpite.exception;

/**
 * 422: os dados estão bem formados, mas quebram uma regra do jogo.
 * Ex.: palpite fora de 1 a 100, número que o jogador já tentou.
 */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
