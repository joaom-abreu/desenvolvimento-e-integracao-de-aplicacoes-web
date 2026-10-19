import { useEffect, useState } from "react";
import { Link } from "react-router";
import fotoBalcao from "../assets/images/balcao.webp";
import MenuItem from "../components/MenuItem";
import Selo from "../components/Selo";
import CAFETERIA from "../config/cafeteria";
import { listarDestaques } from "../services/produtoService";
import "./Home.css";

/** Página inicial: apresentação, destaques do dia (vindos da API) e horário */
const Home = ({ status, conectado }) => {
  const [destaques, setDestaques] = useState([]);
  const [erro, setErro] = useState("");

  // GET /api/produtos/destaques assim que o back-end e o MongoDB responderem
  useEffect(() => {
    if (!conectado) return;

    listarDestaques()
      .then((lista) => {
        setDestaques(lista);
        setErro("");
      })
      .catch((e) => setErro(e.message));
  }, [conectado]);

  const aguardando = status.backend === "verificando";

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-interno">
          <div className="home-hero-texto">
            <h1 className="home-titulo">Café coado devagar, a dois passos da sua aula.</h1>
            <p className="texto-apoio">
              Grãos do Sul de Minas torrados toda semana, espresso tirado na hora e pão de queijo saindo do forno. A
              AraCoffee fica dentro do campus Coração Eucarístico da PUC Minas.
            </p>

            <div className="home-acoes">
              <Link to="/cardapio" className="btn btn-primario">
                Ver cardápio
              </Link>
              <Link to="/contato" className="btn btn-secundario">
                Como chegar
              </Link>
            </div>
          </div>

          <Selo className="home-selo" />
        </div>
      </section>

      <div className="container home-corpo">
      <div className="home-dupla">
      <section className="home-balcao painel" aria-labelledby="balcao-titulo">
        <div className="home-balcao-topo">
          <h2 id="balcao-titulo" className="titulo-secao">
            Hoje no balcão
          </h2>
          <Link to="/cardapio">Cardápio completo</Link>
        </div>

        {conectado && destaques.length > 0 && (
          <ul className="lista-cardapio">
            {destaques.map((produto) => (
              <MenuItem key={produto.id} produto={produto} />
            ))}
          </ul>
        )}

        {conectado && !erro && destaques.length === 0 && (
          <p className="home-balcao-aviso">Nenhum destaque marcado hoje. Marque produtos em Gerenciar cardápio.</p>
        )}

        {(erro || (!conectado && !aguardando)) && (
          <p className="home-balcao-aviso">
            Os destaques aparecem aqui quando o servidor do cardápio responder. Enquanto isso, passe no balcão: o café
            está pronto.
          </p>
        )}

        {aguardando && <p className="home-balcao-aviso">Buscando os destaques de hoje…</p>}
      </section>

      <figure className="home-foto">
        <img src={fotoBalcao} alt="Balcão de madeira com máquina de espresso, xícaras empilhadas e prateleiras com plantas" loading="lazy" />
        <figcaption>O balcão fica aberto de segunda a sábado. Pode trazer o notebook.</figcaption>
      </figure>
      </div>

      <section className="home-info" aria-label="Horário e endereço">
        <div>
          <h2 className="titulo-secao">Horário</h2>
          <dl className="home-horario">
            {CAFETERIA.horarios.map((h) => (
              <div key={h.dias}>
                <dt>{h.dias}</dt>
                <dd>{h.horas}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="titulo-secao">Onde estamos</h2>
          <address className="home-endereco">
            {CAFETERIA.endereco.rua}, {CAFETERIA.endereco.bairro}
            <br />
            {CAFETERIA.endereco.cidade}, {CAFETERIA.endereco.cep}
            <br />
            <span>{CAFETERIA.endereco.referencia}</span>
          </address>
          <Link to="/contato">Ver no mapa</Link>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home;
