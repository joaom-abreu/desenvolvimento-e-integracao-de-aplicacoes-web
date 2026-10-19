import { Link } from "react-router";
import CAFETERIA from "../config/cafeteria";
import "./Footer.css";

const ROTULO_STATUS = {
  verificando: "conectando…",
  online: "conectado",
  offline: "sem resposta",
};

/** Rodapé com endereço, horário e um indicador discreto da conexão com o back-end */
const Footer = ({ status }) => {
  const estado = status.backend === "online" && status.mongodb !== "online" ? "offline" : status.backend;

  return (
    <footer className="rodape">
      <div className="rodape-interno">
        <div className="rodape-coluna">
          <p className="rodape-marca">AraCoffee</p>
          <p>Café torrado em Belo Horizonte, servido no Coração Eucarístico.</p>
        </div>

        <div className="rodape-coluna">
          <h2>Onde estamos</h2>
          <address>
            {CAFETERIA.endereco.rua}
            <br />
            {CAFETERIA.endereco.bairro}, {CAFETERIA.endereco.cidade}
          </address>
          <Link to="/contato">Ver no mapa</Link>
        </div>

        <div className="rodape-coluna">
          <h2>Horário</h2>
          <ul>
            {CAFETERIA.horarios.map((h) => (
              <li key={h.dias}>
                {h.dias}: {h.horas}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rodape-base">
        <p className={`rodape-status rodape-status-${estado}`}>
          <span className="rodape-status-ponto" aria-hidden="true"></span>
          Servidor do cardápio: {ROTULO_STATUS[estado]}
        </p>
        <p>
          Projeto de integração React + Vite, Spring Boot e MongoDB Atlas. <Link to="/design">Design system</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
