import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Message from "../components/Message";
import ErrorPage from "./ErrorPage";
import { updatePassword } from "../services/userService";
import { getEmailFromToken, invalidateToken } from "../services/passwordRecoveryService";

const LINK_INVALIDO = "O link de recuperação é inválido ou expirou.";

const ResetPassword = () => {
  const navigate = useNavigate();

  // Token recebido através do link do e-mail: /resetpassword?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [tokenValido, setTokenValido] = useState(() => getEmailFromToken(token) !== null);
  const [form, setForm] = useState({ senha: "", confirmarSenha: "" });
  const [erro, setErro] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!tokenValido) {
    return <ErrorPage mensagem={LINK_INVALIDO} />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(false);

    if (form.senha !== form.confirmarSenha) {
      setErro(true);
      return;
    }

    // Confere de novo: o token pode ter expirado com a tela aberta
    const email = getEmailFromToken(token);

    if (!email) {
      setTokenValido(false);
      return;
    }

    setEnviando(true);

    await updatePassword(email, form.senha);

    // Token usado uma única vez
    invalidateToken(token);

    navigate("/login", { replace: true, state: { aviso: "senha-redefinida" } });
  };

  return (
    <AuthLayout>
      <title>Redefinir senha - PUC Minas</title>

      <form onSubmit={handleSubmit}>
        <h1 className="auth-title auth-title-compact">Redefinir senha</h1>

        <p className="auth-description">Digite sua nova senha abaixo.</p>

        {/* Senhas diferentes */}
        {erro && (
          <Message type="error" title="Senhas diferentes!">
            As senhas informadas não são iguais.
          </Message>
        )}

        <input
          type="password"
          id="senha"
          name="senha"
          placeholder="Nova senha"
          autoComplete="new-password"
          value={form.senha}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          id="confirmarSenha"
          name="confirmarSenha"
          placeholder="Confirmar nova senha"
          autoComplete="new-password"
          value={form.confirmarSenha}
          onChange={handleChange}
          required
        />

        <div className="auth-button-container">
          <button type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Redefinir senha"}
          </button>
        </div>

        <div className="auth-redirect-options">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
