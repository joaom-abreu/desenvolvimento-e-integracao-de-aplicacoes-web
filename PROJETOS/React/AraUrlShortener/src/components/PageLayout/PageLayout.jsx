import { LuLink } from "react-icons/lu";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./PageLayout.css";

/**
 * Card principal da página, no mesmo estilo dos outros projetos React:
 * faixa azul com a logo do Aramuni + a marca AraUrl, e o conteúdo embaixo.
 *
 * <PageLayout title="..." description="...">
 *   ...conteúdo...
 * </PageLayout>
 */
const PageLayout = ({ label = "ENCURTADOR DE URL", title, description, children }) => (
  <div className="page-container">
    {/* =====================================================
        FAIXA AZUL: LOGO ARAMUNI + ARAURL
        ===================================================== */}
    <header className="page-hero">
      <span className="page-hero-logo" role="img" aria-label="Logo Aramuni" />

      <span className="page-hero-divider" aria-hidden="true" />

      <div className="page-hero-brand">
        <LuLink className="page-hero-icon" aria-hidden="true" />
        <span>AraUrl</span>
      </div>

      <ThemeToggle />
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

    <footer className="page-footer">
      AraUrlShortener · João Paulo Aramuni · React + Vite + Supabase
    </footer>
  </div>
);

export default PageLayout;
