package com.example.back.exception;

import java.time.LocalDateTime;

/**
 * Formato padrão (JSON) de todos os erros que a API devolve.
 *
 * {
 *   "status": 404,
 *   "erro": "Not Found",
 *   "mensagem": "Aluno com id 123 não encontrado.",
 *   "caminho": "/api/alunos/123",
 *   "timestamp": "2026-10-15T10:30:00"
 * }
 *
 * O front-end (httpClient.js) lê o campo "mensagem" e mostra na tela.
 */
public class ErroResposta {

    private final int status;
    private final String erro;
    private final String mensagem;
    private final String caminho;
    private final String timestamp;

    public ErroResposta(int status, String erro, String mensagem, String caminho) {
        this.status = status;
        this.erro = erro;
        this.mensagem = mensagem;
        this.caminho = caminho;
        this.timestamp = LocalDateTime.now().toString();
    }

    public int getStatus() {
        return status;
    }

    public String getErro() {
        return erro;
    }

    public String getMensagem() {
        return mensagem;
    }

    public String getCaminho() {
        return caminho;
    }

    public String getTimestamp() {
        return timestamp;
    }
}
