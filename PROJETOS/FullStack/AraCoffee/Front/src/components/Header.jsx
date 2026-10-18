import { useState } from "react";
import { Link, NavLink } from "react-router";
import logo from "../assets/images/logo-aracoffee.svg";
import "./Header.css";

const LINKS = [
  { para: "/", texto: "Início", fim: true },
  { para: "/cardapio", texto: "Cardápio" },
  { para: "/contato", texto: "Contato" },
  { para: "/gerenciar", texto: "Gerenciar cardápio" },
];

/** Cabeçalho fixo com a logo da AraCoffee e o menu de páginas */
const Header = () => {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="cabecalho">
      <div className="cabecalho-interno">
        <Link to="/" className="cabecalho-logo" onClick={() => setMenuAberto(false)}>
          <img src={logo} alt="AraCoffee, página inicial" width="200" height="53" />
        </Link>

        <button
          type="button"
          className="cabecalho-menu-botao"
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          {menuAberto ? "Fechar" : "Menu"}
        </button>

        <nav id="menu-principal" className={`cabecalho-nav${menuAberto ? " cabecalho-nav-aberta" : ""}`}>
          <ul>
            {LINKS.map((link) => (
              <li key={link.para}>
                <NavLink to={link.para} end={link.fim} onClick={() => setMenuAberto(false)}>
                  {link.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
