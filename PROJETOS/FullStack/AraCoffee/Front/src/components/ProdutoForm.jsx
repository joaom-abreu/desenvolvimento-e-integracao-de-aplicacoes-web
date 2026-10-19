import { useState } from "react";

const VAZIO = { nome: "", categoria: "", preco: "", descricao: "", destaque: false, disponivel: true };
const LIMITE_DESCRICAO = 160;

/** "8,50" ou "8.50" → 8.5. Campo vazio ou inválido → null (o Spring Boot responde 400) */
const converterPreco = (texto) => {
  const numero = Number(String(texto).replace(",", ".").trim());
  return String(texto).trim() && Number.isFinite(numero) ? numero : null;
};

/** 8.5 → "8,50" (para preencher o campo ao editar) */
const precoParaTexto = (valor) => (valor == null ? "" : Number(valor).toFixed(2).replace(".", ","));

/**
 * Formulário de cadastro e edição de produto do cardápio.
 *
 * - Sem produtoEmEdicao: cria um produto novo (POST)
 * - Com produtoEmEdicao: altera o produto escolhido na lista (PUT)
 *
 * A página passa uma "key" diferente para cada produto editado,
 * então o React recria o formulário já preenchido com os dados dele.
 *
 * noValidate: deixamos o Spring Boot validar os campos para você ver
 * a mensagem de erro (400) do GlobalExceptionHandler chegando ao front.
 */
const ProdutoForm = ({ produtoEmEdicao, categorias, onSalvar, onCancelar, desabilitado }) => {
  const [dados, setDados] = useState(
    produtoEmEdicao
      ? {
          nome: produtoEmEdicao.nome,
          categoria: produtoEmEdicao.categoria,
          preco: precoParaTexto(produtoEmEdicao.preco),
          descricao: produtoEmEdicao.descricao ?? "",
          destaque: Boolean(produtoEmEdicao.destaque),
          disponivel: Boolean(produtoEmEdicao.disponivel),
        }
      : VAZIO,
  );
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(produtoEmEdicao);

  const handleChange = (evento) => {
    const { name, value, type, checked } = evento.target;
    setDados((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setSalvando(true);

    const salvou = await onSalvar({ ...dados, preco: converterPreco(dados.preco) });

    setSalvando(false);

    // Depois de cadastrar, limpa o formulário para o próximo produto
    if (salvou && !editando) {
      setDados(VAZIO);
    }
  };

  return (
    <form className="produto-form painel" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={desabilitado || salvando}>
        <legend className="produto-form-legenda">{editando ? `Editando ${produtoEmEdicao.nome}` : "Novo produto"}</legend>

        <div className="produto-form-campos">
          <label className="campo produto-form-largo">
            <span>Nome</span>
            <input name="nome" value={dados.nome} onChange={handleChange} placeholder="Ex.: Pão de queijo" autoComplete="off" />
          </label>

          <label className="campo">
            <span>Categoria</span>
            <select name="categoria" value={dados.categoria} onChange={handleChange}>
              <option value="">Escolha…</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Preço (R$)</span>
            <input name="preco" value={dados.preco} onChange={handleChange} placeholder="8,50" inputMode="decimal" autoComplete="off" />
          </label>

          <label className="campo produto-form-largo">
            <span>Descrição</span>
            <textarea
              name="descricao"
              value={dados.descricao}
              onChange={handleChange}
              placeholder="O que vai no prato ou na xícara, em uma frase."
              rows={3}
            />
            <span className={`campo-dica${dados.descricao.length > LIMITE_DESCRICAO ? " campo-dica-alerta" : ""}`}>
              {dados.descricao.length} de {LIMITE_DESCRICAO} caracteres
            </span>
          </label>

          <label className="campo-marcar">
            <input type="checkbox" name="destaque" checked={dados.destaque} onChange={handleChange} />
            Mostrar em “Hoje no balcão”
          </label>

          <label className="campo-marcar">
            <input type="checkbox" name="disponivel" checked={dados.disponivel} onChange={handleChange} />
            Disponível hoje
          </label>
        </div>

        <div className="produto-form-acoes">
          <button type="submit" className="btn btn-primario">
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Adicionar ao cardápio"}
          </button>

          {editando && (
            <button type="button" className="btn btn-secundario" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
};

export default ProdutoForm;
