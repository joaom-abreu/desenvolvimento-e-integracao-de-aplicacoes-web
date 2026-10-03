import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

// Rota protegida: sem usuário logado, volta para o login
const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();

  return usuario ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
