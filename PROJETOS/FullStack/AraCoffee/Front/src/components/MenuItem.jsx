import { formatarPreco } from "../utils/formatarPreco";

/**
 * Uma linha do cardápio no estilo "nome ........ preço".
 * Produtos em destaque ganham um grão caramelo antes do nome.
 */
const MenuItem = ({ produto }) => (
  <li className={produto.disponivel ? "item-cardapio" : "item-cardapio item-esgotado"}>
    <div className="item-linha">
      <span className="item-nome">
        {produto.destaque && <span className="item-da-casa" title="Destaque da casa" aria-label="Destaque da casa"></span>}
        {produto.nome}
      </span>
      <span className="item-pontilhado" aria-hidden="true"></span>
      <span className="item-preco">{formatarPreco(produto.preco)}</span>
    </div>

    {produto.descricao && <p className="item-descricao">{produto.descricao}</p>}
    {!produto.disponivel && <span className="item-selo">Esgotado hoje</span>}
  </li>
);

export default MenuItem;
