import { requisicao } from "./httpClient";

/**
 * Chamadas para o AlunoController do Spring Boot.
 *
 * | Função            | Método | Endpoint              |
 * | ----------------- | ------ | --------------------- |
 * | listarAlunos      | GET    | /api/alunos?nome=...  |
 * | buscarAlunoPorId  | GET    | /api/alunos/{id}      |
 * | criarAluno        | POST   | /api/alunos           |
 * | atualizarAluno    | PUT    | /api/alunos/{id}      |
 * | excluirAluno      | DELETE | /api/alunos/{id}      |
 */

const CAMINHO = "/api/alunos";

/** Lista todos os alunos. Com "nome", filtra pelos que contêm o texto. */
export function listarAlunos(nome = "") {
  const filtro = nome.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : "";
  return requisicao(`${CAMINHO}${filtro}`);
}

export function buscarAlunoPorId(id) {
  return requisicao(`${CAMINHO}/${id}`);
}

export function criarAluno(aluno) {
  return requisicao(CAMINHO, {
    method: "POST",
    body: JSON.stringify(aluno),
  });
}

export function atualizarAluno(id, aluno) {
  return requisicao(`${CAMINHO}/${id}`, {
    method: "PUT",
    body: JSON.stringify(aluno),
  });
}

export function excluirAluno(id) {
  return requisicao(`${CAMINHO}/${id}`, { method: "DELETE" });
}
