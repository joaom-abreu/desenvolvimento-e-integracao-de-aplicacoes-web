package com.dti.palpite.exception;

/** 404: o id pedido não existe no banco. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String recurso, String id) {
        super(recurso + " com id \"" + id + "\" não encontrada.");
    }
}
