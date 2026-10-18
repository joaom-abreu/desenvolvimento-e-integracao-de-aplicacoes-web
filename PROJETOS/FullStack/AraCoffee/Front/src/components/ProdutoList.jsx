import { formatarPreco } from "../utils/formatarPreco";

/**
 * Lista de produtos da área de gestão, com busca por nome, editar e excluir.
 */
const ProdutoList = ({ produtos, carregando, busca, onBuscaChange, onEditar, onExcluir, idEmEdicao, desabilitado }) => (
  <section className="produto-lista painel" aria-labelledby="produto-lista-titulo">
    <div className="produto-lista-topo">
      <h2 id="produto-lista-titulo" className="produto-lista-titulo">
        No cardápio <span>({produtos.length})</span>
      </h2>

      <label className="campo produto-lista-busca">
        <span className="visualmente-oculto">Buscar produto pelo nome</span>
        <input
          type="search"
          value={busca}
          onChange={(evento) => onBuscaChange(evento.target.value)}
          placeholder="Buscar pelo nome"
          disabled={desabilitado}
        />
      </label>
    </div>

    {carregando && <p className="produto-lista-vazia">Carregando o cardápio…</p>}

    {!carregando && produtos.length === 0 && (
      <p className="produto-lista-vazia">
        {busca ? `Nenhum produto com “${busca}” no nome.` : "O cardápio está vazio. Adicione o primeiro produto no formulário."}
      </p>
    )}

    {produtos.length > 0 && (
      <ul className="produto-lista-itens">
        {produtos.map((produto) => (
          <li
            key={produto.id}
            className={`produto-lista-item${produto.id === idEmEdicao ? " produto-lista-item-editando" : ""}`}
          >
            <div className="produto-lista-info">
              <strong>{produto.nome}</strong>
              <span className="produto-lista-detalhes">
                <span>{produto.categoria}</span>
                <span className="produto-lista-preco">{formatarPreco(produto.preco)}</span>
              </span>
              <div className="produto-lista-marcas">
                {produto.destaque && <span className="produto-marca">Hoje no balcão</span>}
                {!produto.disponivel && <span className="produto-marca produto-marca-esgotado">Esgotado</span>}
              </div>
            </div>

            <div className="produto-lista-acoes">
              <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => onEditar(produto)} disabled={desabilitado}>
                Editar
              </button>
              <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => onExcluir(produto)} disabled={desabilitado}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ProdutoList;
