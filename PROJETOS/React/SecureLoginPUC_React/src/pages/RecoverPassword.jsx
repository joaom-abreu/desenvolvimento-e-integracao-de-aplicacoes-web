import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Message from "../components/Message";
import { findByEmail, getFirstName } from "../services/userService";
import { generateToken, invalidateToken } from "../services/passwordRecoveryService";
import { isEmailJsConfigured, sendRecoveryEmail } from "../services/sendEmailService";

// Mensagens exibidas depois de enviar o formulário
const STATUS = {
  sucesso: {
    type: "success",
    title: "Link enviado com sucesso!",
    text: "Verifique seu e-mail para continuar a recuperação da senha.",
  },
  "nao-encontrado": {
    type: "error",
    title: "E-mail não encontrado!",
    text: "O e-mail informado não está cadastrado.",
  },
  "falha-envio": {
    type: "error",
    title: "Falha ao enviar o e-mail!",
    text: "Tente novamente em alguns instantes.",
  },
  "nao-configurado": {
    type: "error",
    title: "EmailJS não configurado!",
    text: "Preencha as variáveis VITE_EMAILJS_* no .env.local. O link de teste foi exibido no console.",
  },
};

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const user = findByEmail(email);

    if (!user) {
      setStatus("nao-encontrado");
      return;
    }

    // Token válido por 15 minutos, salvo no localStorage
    const token = generateToken(user.email);

    const link = `${window.location.origin}/resetpassword?token=${token}`;

    // Sem EmailJS configurado: mostra o link no console para testar o fluxo
    if (!isEmailJsConfigured()) {
      console.warn("EmailJS não configurado. Link de recuperação (teste):", link);
      setStatus("nao-configurado");
      return;
    }

    setEnviando(true);

    try {
      await sendRecoveryEmail({
        nome: getFirstName(user),
        email: user.email,
        link,
      });

      console.log("Link de recuperação enviado para:", user.email);
      setStatus("sucesso");
      setEmail("");
    } catch (err) {
      console.error("Erro ao enviar e-mail de recuperação:", err);
      invalidateToken(token); // o e-mail não saiu, então o token não serve para nada
      setStatus("falha-envio");
    } finally {
      setEnviando(false);
    }
  };

  const mensagem = STATUS[status];

  return (
    <AuthLayout>
      <title>Recuperar senha - PUC Minas</title>

      <form onSubmit={handleSubmit}>
        <h1 className="auth-title auth-title-compact">Recuperar senha</h1>

        <p className="auth-description">
          Informe seu e-mail para receber as instruções de recuperação da senha.
        </p>

        {mensagem && (
          <Message type={mensagem.type} title={mensagem.title}>
            {mensagem.text}
          </Message>
        )}

        <input
          type="email"
          id="email"
          name="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="auth-button-container">
          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Recuperar senha"}
          </button>
        </div>

        <div className="auth-redirect-options">
          Lembrou sua senha? <Link to="/login">Faça login</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RecoverPassword;
