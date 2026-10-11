import pucLogo from "../../assets/images/pucminas-logo.png";
import "./PageLayout.css";

/**
 * Card principal da página, no mesmo estilo dos outros projetos da PUC:
 * faixa azul com a logo da PUC Minas + a logo da API, e o conteúdo embaixo.
 *
 * Neste projeto ele recebe também os textos já traduzidos (label, footer,
 * pucAlt) e um espaço no canto da faixa azul para a troca de idioma (actions).
 *
 * <PageLayout icon={SiI18Next} brand="..." title={t("...")} actions={<LanguageSwitcher />}>
 *   ...conteúdo...
 * </PageLayout>
 */
const PageLayout = ({
  icon: Icon,
  brand,
  title,
  description,
  label = "PUC MINAS",
  footer = "Projeto didático · PUC Minas · React + Vite",
  pucAlt = "Logo PUC Minas",
  actions,
  children,
}) => (
  <div className="page-container">
    {/* =====================================================
        FAIXA AZUL: LOGO PUC MINAS + LOGO DA API
        ===================================================== */}
    <header className="page-hero">
      {actions && <div className="page-hero-actions">{actions}</div>}

      <img src={pucLogo} alt={pucAlt} className="page-hero-puc" />

      <span className="page-hero-divider" aria-hidden="true" />

      <div className="page-hero-brand">
        {Icon && <Icon className="page-hero-icon" aria-hidden="true" />}
        <span>{brand}</span>
      </div>
    </header>

    {/* =====================================================
        TÍTULO
        ===================================================== */}
    <section className="page-intro">
      <span className="page-label">{label}</span>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
      <div className="page-divider" />
    </section>

    {/* =====================================================
        CONTEÚDO
        ===================================================== */}
    <main className="page-content">{children}</main>

    <footer className="page-footer">{footer}</footer>
  </div>
);

export default PageLayout;
