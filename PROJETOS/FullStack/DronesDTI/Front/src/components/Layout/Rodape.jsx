import { Link } from "react-router-dom";
import { API_CONFIG } from "../../config/apiConfig.js";

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <img src="/dti-logo-azul.png" alt="dti" width="34" height="26" />
        <p>
          Simulador de entregas por drone. Case técnico do processo seletivo da dti digital, feito com React, Vite,
          Spring Boot e MongoDB.
        </p>
        <nav aria-label="Rodapé" className="rodape-links">
          <Link to="/design">Design system</Link>
          <a href={`${API_CONFIG.BASE_URL}/api/status`} target="_blank" rel="noreferrer">
            Status da API
          </a>
        </nav>
      </div>
    </footer>
  );
}
