import { requisicao } from "./httpClient";

/**
 * Chamadas para o ProdutoController do Spring Boot.
 *
 * | Função             | Método | Endpoint                               |
 * | ------------------ | ------ | -------------------------------------- |
 * | listarProdutos     | GET    | /api/produtos?nome=...&categoria=...   |
 * | listarDestaques    | GET    | /api/produtos/destaques                |
 * | listarCategorias   | GET    | /api/produtos/categorias               |
 * | buscarProdutoPorId | GET    | /api/produtos/{id}                     |
 * | criarProduto       | POST   | /api/produtos                          |
 * | atualizarProduto   | PUT    | /api/produtos/{id}                     |
 * | excluirProduto     | DELETE | /api/produtos/{id}                     |
 */

const CAMINHO = "/api/produtos";

/** Lista os produtos. Os filtros "nome" e "categoria" são opcionais. */
export function listarProdutos({ nome = "", categoria = "" } = {}) {
  const params = new URLSearchParams();
  if (nome.trim()) params.set("nome", nome.trim());
  if (categoria.trim()) params.set("categoria", categoria.trim());

  const filtro = params.toString() ? `?${params}` : "";
  return requisicao(`${CAMINHO}${filtro}`);
}

export function listarDestaques() {
  return requisicao(`${CAMINHO}/destaques`);
}

export function listarCategorias() {
  return requisicao(`${CAMINHO}/categorias`);
}

export function buscarProdutoPorId(id) {
  return requisicao(`${CAMINHO}/${id}`);
}

export function criarProduto(produto) {
  return requisicao(CAMINHO, {
    method: "POST",
    body: JSON.stringify(produto),
  });
}

export function atualizarProduto(id, produto) {
  return requisicao(`${CAMINHO}/${id}`, {
    method: "PUT",
    body: JSON.stringify(produto),
  });
}

export function excluirProduto(id) {
  return requisicao(`${CAMINHO}/${id}`, { method: "DELETE" });
}
