import { NavLink } from "react-router-dom";
import "./Layout.css";

const LINKS = [
  { para: "/", texto: "Operação", fim: true },
  { para: "/pedidos", texto: "Pedidos" },
  { para: "/rotas", texto: "Rotas" },
  { para: "/dashboard", texto: "Dashboard" },
  { para: "/frota", texto: "Frota e zonas" },
];

export default function Cabecalho({ online }) {
  const statusTexto = online === null ? "Conectando ao servidor" : online ? "Servidor no ar" : "Servidor fora do ar";
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <NavLink to="/" className="marca" aria-label="DronesDTI, página inicial">
          <img src="/dti-logo-branco.png" alt="dti" width="46" height="35" />
          <span className="marca-produto">drones</span>
        </NavLink>
        <nav aria-label="Principal">
          <ul className="menu">
            {LINKS.map((l) => (
              <li key={l.para}>
                <NavLink to={l.para} end={l.fim} className={({ isActive }) => (isActive ? "ativo" : undefined)}>
                  {l.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <span className="status-api" data-online={String(online)} title={statusTexto}>
          <span className="pingo" aria-hidden="true" />
          <span className="status-texto">{statusTexto}</span>
        </span>
      </div>
    </header>
  );
}
