import { useNavigate } from "react-router-dom";
import logo from "../assets/images/pucminas-logo.png";
import { useAuth } from "../auth/authContext";
import { getFirstName } from "../services/userService";
import "./Home.css";

const Home = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="home-container">
      <title>Home - PUC Minas</title>

      {/* =====================================================
          LOGO PUC MINAS
          ===================================================== */}
      <div className="home-logo">
        <img src={logo} alt="Logo PUC Minas" />
      </div>

      {/* =====================================================
          CONTEÚDO PRINCIPAL
          ===================================================== */}
      <div className="home-content">
        <span className="home-label">PUC MINAS</span>

        <h1>Bem-vindo, {getFirstName(usuario)}!</h1>

        <p className="home-message">Login realizado com sucesso.</p>

        <div className="home-divider"></div>

        <p className="home-description">
          Usuário: <strong>{usuario.email}</strong>
        </p>

        <p className="home-description">Você está autenticado no sistema.</p>

        <button type="button" className="home-btn" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  );
};

export default Home;
