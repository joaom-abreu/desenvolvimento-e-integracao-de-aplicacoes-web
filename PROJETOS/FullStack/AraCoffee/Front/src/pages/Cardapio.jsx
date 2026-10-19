import { useEffect, useState } from "react";
import { Link } from "react-router";
import bannerCardapio from "../assets/images/banner-cardapio.webp";
import Banner from "../components/Banner";
import Message from "../components/Message";
import MenuItem from "../components/MenuItem";
import { listarCategorias, listarProdutos } from "../services/produtoService";
import "./Cardapio.css";

/** Usada só até o back-end responder com GET /api/produtos/categorias */
const CATEGORIAS_PADRAO = ["Cafés", "Bebidas geladas", "Chás", "Doces", "Salgados"];

/** Agrupa a lista do back-end por categoria, mantendo a ordem das categorias */
const agruparPorCategoria = (produtos, categorias) =>
  categorias
    .map((categoria) => ({ categoria, itens: produtos.filter((p) => p.categoria === categoria) }))
    .filter((grupo) => grupo.itens.length > 0);

/** Cardápio público: filtros por categoria e busca, tudo vindo da API */
const Cardapio = ({ status, conectado }) => {
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO);
  const [categoriaAtiva, setCategoriaAtiva] = useState("");
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // GET /api/produtos/categorias
  useEffect(() => {
    if (!conectado) return;
    listarCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, [conectado]);

  // GET /api/produtos?nome=...&categoria=...
  // (espera 300 ms depois da última tecla para não chamar a API a cada letra)
  useEffect(() => {
    if (!conectado) return;

    const timer = setTimeout(async () => {
      setCarregando(true);
      try {
        setProdutos(await listarProdutos({ nome: busca, categoria: categoriaAtiva }));
        setErro("");
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [conectado, busca, categoriaAtiva]);

  const grupos = agruparPorCategoria(produtos, categorias);
  const filtrando = Boolean(busca.trim() || categoriaAtiva);

  return (
    <>
      <Banner imagem={bannerCardapio} titulo="Cardápio" posicao="70% center">
        Preços do balcão, atualizados pela equipe ao longo do dia. O grão caramelo marca o que a casa recomenda hoje.
      </Banner>

      <div className="container cardapio">
        <p className="cardapio-impresso">
          Prefere a folha do balcão? <Link to="/cardapio/pdf">Abrir o cardápio em PDF</Link>
        </p>

      <div className="cardapio-filtros">
        <div className="cardapio-categorias" role="group" aria-label="Filtrar por categoria">
          <button
            type="button"
            className="cardapio-chip"
            aria-pressed={categoriaAtiva === ""}
            onClick={() => setCategoriaAtiva("")}
          >
            Tudo
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria}
              type="button"
              className="cardapio-chip"
              aria-pressed={categoriaAtiva === categoria}
              onClick={() => setCategoriaAtiva(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>

        <label className="campo cardapio-busca">
          <span className="visualmente-oculto">Buscar no cardápio</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar no cardápio" />
        </label>
      </div>

      {!conectado && status.backend === "verificando" && <p className="cardapio-aviso">Abrindo o cardápio…</p>}

      {!conectado && status.backend !== "verificando" && (
        <Message type="error" title="O cardápio não carregou">
          O servidor do cardápio não respondeu. Esta página tenta de novo a cada 5 segundos.
        </Message>
      )}

      {conectado && erro && (
        <Message type="error" title="O cardápio não carregou">
          {erro}
        </Message>
      )}

      {conectado && !erro && !carregando && grupos.length === 0 && (
        <p className="cardapio-aviso">
          {filtrando ? "Nada encontrado com esse filtro. Tente outra categoria ou outro nome." : "O cardápio ainda está vazio."}
        </p>
      )}

      {grupos.length > 0 && (
        <div className={`cardapio-grupos${carregando ? " cardapio-grupos-carregando" : ""}`}>
          {grupos.map((grupo) => (
            <section key={grupo.categoria} className="cardapio-grupo painel" aria-labelledby={`grupo-${grupo.categoria}`}>
              <h2 id={`grupo-${grupo.categoria}`} className="titulo-secao">
                {grupo.categoria}
              </h2>
              <ul className="lista-cardapio">
                {grupo.itens.map((produto) => (
                  <MenuItem key={produto.id} produto={produto} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default Cardapio;
