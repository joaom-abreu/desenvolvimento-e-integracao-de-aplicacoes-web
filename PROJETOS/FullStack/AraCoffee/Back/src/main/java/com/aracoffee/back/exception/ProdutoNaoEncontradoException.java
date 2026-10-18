package com.aracoffee.back.exception;

/**
 * Lançada quando o id informado não existe na coleção "produtos".
 * O GlobalExceptionHandler transforma esta exceção em HTTP 404 (Not Found).
 */
public class ProdutoNaoEncontradoException extends RuntimeException {

    public ProdutoNaoEncontradoException(String id) {
        super("Produto com id " + id + " não encontrado no cardápio.");
    }
}
