package com.example.back.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Documento salvo na coleção "alunos" do MongoDB.
 *
 * Exemplo de como fica no Atlas:
 * { "_id": ObjectId("..."), "nome": "Maria", "email": "maria@...", "curso": "Engenharia de Software" }
 */
@Document(collection = "alunos")
public class Aluno {

    @Id
    private String id;
    private String nome;
    private String email;
    private String curso;

    // Construtor vazio: usado pelo Spring/Jackson para montar o objeto a partir do JSON
    public Aluno() {
    }

    public Aluno(String id, String nome, String email, String curso) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.curso = curso;
    }

    // Getters e Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }
}
