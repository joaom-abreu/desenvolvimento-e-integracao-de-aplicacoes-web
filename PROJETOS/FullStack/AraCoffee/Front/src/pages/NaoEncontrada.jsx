import { Link } from "react-router";
import "./NaoEncontrada.css";

/** Rota inexistente (ex.: /cardapioo) */
const NaoEncontrada = () => (
  <section className="nao-encontrada">
    <div className="nao-encontrada-interno">
      <h1 className="titulo-pagina">Essa xícara está vazia.</h1>
      <p className="texto-apoio">O endereço que você abriu não existe no site da AraCoffee.</p>
      <Link to="/" className="btn btn-primario">
        Voltar ao início
      </Link>
    </div>
  </section>
);

export default NaoEncontrada;
