import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Message from "../components/Message";

// Tela de erro: link de recuperação inválido/expirado ou página inexistente
const ErrorPage = ({ mensagem = "Ocorreu um erro durante a operação." }) => (
  <AuthLayout>
    <title>Erro - PUC Minas</title>

    <h1 className="auth-title">Erro</h1>

    <Message type="error" title={mensagem} />

    <p className="auth-redirect-options">
      <Link to="/login">Voltar para o login</Link>
      <span>|</span>
      <Link to="/recoverpassword">Recuperar senha</Link>
    </p>
  </AuthLayout>
);

export default ErrorPage;
