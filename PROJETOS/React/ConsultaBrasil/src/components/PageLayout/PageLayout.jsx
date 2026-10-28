import { useState } from "react";
import pucLogo from "../../assets/images/pucminas-logo.png";
import brasilApiLogo from "../../assets/images/brasilapi-logo.png";
import "./PageLayout.css";

// A logo do ViaCEP fica em public/logos/viacep.png (veja o README).
// Se o arquivo não estiver lá, aparece o nome em texto no lugar.
const VIACEP_LOGO = "/logos/viacep.png";

function ApiLogo({ src, name, href }) {
  const [failed, setFailed] = useState(false);
  return (
    <a className="page-hero-api" href={href} target="_blank" rel="noreferrer" title={`Abrir o site ${name}`}>
      {failed ? (
        <span className="page-hero-api-text">{name}</span>
      ) : (
        <img src={src} alt={`Logo ${name}`} onError={() => setFailed(true)} />
      )}
    </a>
  );
}

/**
 * Card principal da página, no mesmo estilo dos outros projetos do repositório:
 * faixa azul com a logo da PUC Minas + as logos das APIs, e o conteúdo embaixo.
 */
const PageLayout = ({ title, description, children }) => (
  <div className="page-container">
    {/* =====================================================
        FAIXA AZUL: LOGO PUC MINAS + LOGOS DAS APIS
        ===================================================== */}
    <header className="page-hero">
      <img src={pucLogo} alt="Logo PUC Minas" className="page-hero-puc" />

      <span className="page-hero-divider" aria-hidden="true" />

      <div className="page-hero-apis">
        <ApiLogo src={VIACEP_LOGO} name="ViaCEP" href="https://viacep.com.br" />
        <ApiLogo src={brasilApiLogo} name="BrasilAPI" href="https://brasilapi.com.br" />
      </div>
    </header>

    {/* =====================================================
        TÍTULO
        ===================================================== */}
    <section className="page-intro">
      <span className="page-label">PUC MINAS</span>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
      <div className="page-divider" />
    </section>

    {/* =====================================================
        CONTEÚDO
        ===================================================== */}
    <main className="page-content">{children}</main>

    <footer className="page-footer">
      Projeto didático · PUC Minas · React + Vite · Dados: ViaCEP, BrasilAPI e IBGE
    </footer>
  </div>
);

export default PageLayout;
