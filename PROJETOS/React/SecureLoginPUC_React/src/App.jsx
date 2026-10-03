import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecoverPassword from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";

// Mesmas rotas do SecureLoginPUC (Spring Boot), agora no React Router
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recoverpassword" element={<RecoverPassword />} />
      <Route path="/resetpassword" element={<ResetPassword />} />

      {/* Só entra quem estiver logado */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<ErrorPage mensagem="Página não encontrada." />} />
    </Routes>
  );
}

export default App;
