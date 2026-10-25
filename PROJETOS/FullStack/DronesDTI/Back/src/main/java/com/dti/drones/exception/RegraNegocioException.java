package com.dti.drones.exception;

/**
 * 422: os dados estão bem formados, mas quebram uma regra do negócio.
 * Ex.: pacote mais pesado que qualquer drone, cliente dentro de zona de exclusão aérea.
 */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
