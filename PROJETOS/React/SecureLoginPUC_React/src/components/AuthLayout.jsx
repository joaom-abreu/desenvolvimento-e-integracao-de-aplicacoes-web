import logo from "../assets/images/pucminas-logo.png";
import "./AuthLayout.css";

/**
 * Card em duas colunas usado por todas as telas de autenticação:
 * painel azul com a logo à esquerda e o formulário à direita.
 *
 * - wide: card mais largo (tela de cadastro, que tem mais campos)
 * - spinLogo: logo girando em 3D (tela de login)
 */
const AuthLayout = ({ children, wide = false, spinLogo = false }) => {
  const containerClass = wide ? "auth-container auth-container-wide" : "auth-container";
  const logoClass = spinLogo ? "auth-logo auth-logo-spin" : "auth-logo";

  return (
    <div className={containerClass}>
      {/* =====================================================
          LOGO PUC MINAS
          ===================================================== */}
      <div className="auth-image-logo-container">
        <img src={logo} alt="Logo PUC Minas" className={logoClass} />
      </div>

      {/* =====================================================
          FORMULÁRIO
          ===================================================== */}
      <div className="auth-form">{children}</div>
    </div>
  );
};

export default AuthLayout;
