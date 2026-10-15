import logo from "../assets/images/pucminas-logo.png";
import API_CONFIG from "../config/apiConfig";
import "./IntegrationPanel.css";

/** Texto mostrado ao lado de cada bolinha de status */
const ROTULOS = {
  online: "Conectado",
  offline: "Sem resposta",
  verificando: "Verificando",
  desconhecido: "Aguardando o back-end",
};

/** Mostra só "host:porta" (ex.: localhost:8080) em vez da URL inteira */
const host = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/** Explica, em uma frase, o que fazer em cada situação */
const dica = ({ backend, mongodb }) => {
  if (backend === "verificando") {
    return "Procurando o back-end. No Render (plano gratuito) a primeira resposta pode levar até 1 minuto.";
  }

  if (backend === "offline") {
    return "O Spring Boot não respondeu. Rode npm run dev:all (ou inicie o back-end) e aguarde: esta tela tenta de novo a cada 5 segundos.";
  }

  if (mongodb !== "online") {
    return "O Spring Boot respondeu, mas não alcançou o MongoDB Atlas. Confira a connection string no application.properties e o Network Access do Atlas.";
  }

  return "Tudo conectado. Cada ação do formulário vira uma requisição HTTP para o Spring Boot, que grava no MongoDB Atlas.";
};

/**
 * Painel azul com a logo da PUC Minas e a "corrente" da integração:
 * React (navegador) → Spring Boot (API REST) → MongoDB Atlas (banco).
 */
const IntegrationPanel = ({ status }) => {
  const etapas = [
    {
      nome: "Front-end React + Vite",
      endereco: host(window.location.origin),
      estado: "online",
    },
    {
      nome: "Back-end Spring Boot",
      endereco: host(API_CONFIG.BASE_URL),
      estado: status.backend,
    },
    {
      nome: "MongoDB Atlas",
      endereco: "Banco na nuvem",
      estado: status.mongodb,
    },
  ];

  return (
    <aside className="integration-panel">
      <img src={logo} alt="Logo PUC Minas" className="integration-logo" />

      <div className="integration-chain">
        <h2 className="integration-heading">Status da integração</h2>

        <ol className="integration-steps">
          {etapas.map((etapa, indice) => {
            // A linha até a próxima etapa só "acende" quando a próxima também respondeu
            const proxima = etapas[indice + 1];
            const ligada = etapa.estado === "online" && proxima?.estado === "online";

            return (
              <li
                key={etapa.nome}
                className={`integration-step integration-step-${etapa.estado}${ligada ? " integration-step-linked" : ""}`}
              >
                <span className="integration-dot" aria-hidden="true"></span>

                <div className="integration-step-text">
                  <strong>{etapa.nome}</strong>
                  <span className="integration-address">{etapa.endereco}</span>
                  <span className="integration-state">{ROTULOS[etapa.estado]}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="integration-hint" aria-live="polite">
          {dica(status)}
        </p>
      </div>
    </aside>
  );
};

export default IntegrationPanel;
