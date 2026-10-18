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
 * Painel com a "corrente" da integração:
 * React (navegador) → Spring Boot (API REST) → MongoDB Atlas (banco).
 */
const IntegrationPanel = ({ status }) => {
  const etapas = [
    { nome: "Front-end React + Vite", endereco: host(window.location.origin), estado: "online" },
    { nome: "Back-end Spring Boot", endereco: host(API_CONFIG.BASE_URL), estado: status.backend },
    { nome: "MongoDB Atlas", endereco: "Banco na nuvem", estado: status.mongodb },
  ];

  return (
    <section className="integracao" aria-labelledby="integracao-titulo">
      <h2 id="integracao-titulo" className="integracao-titulo">
        Status da integração
      </h2>

      <ol className="integracao-etapas">
        {etapas.map((etapa, indice) => {
          // A linha até a próxima etapa só "acende" quando a próxima também respondeu
          const proxima = etapas[indice + 1];
          const ligada = etapa.estado === "online" && proxima?.estado === "online";

          return (
            <li
              key={etapa.nome}
              className={`integracao-etapa integracao-etapa-${etapa.estado}${ligada ? " integracao-etapa-ligada" : ""}`}
            >
              <span className="integracao-ponto" aria-hidden="true"></span>

              <div className="integracao-texto">
                <strong>{etapa.nome}</strong>
                <span className="integracao-endereco">{etapa.endereco}</span>
                <span className="integracao-estado">{ROTULOS[etapa.estado]}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="integracao-dica" aria-live="polite">
        {dica(status)}
      </p>
    </section>
  );
};

export default IntegrationPanel;
