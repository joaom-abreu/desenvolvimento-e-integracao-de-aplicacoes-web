import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import AuthLayout from "../components/AuthLayout";
import Message from "../components/Message";
import { useAuth } from "../auth/authContext";
import RECAPTCHA_CONFIG from "../config/recaptchaConfig";

// Mensagens que outras telas podem mandar para o login (via navigate state)
const AVISOS = {
  cadastro: {
    title: "Cadastro realizado com sucesso!",
    text: "Agora você já pode fazer login.",
  },
  "senha-redefinida": {
    title: "Senha redefinida com sucesso!",
    text: "Faça login com a sua nova senha.",
  },
};

const Login = () => {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef(null);

  const [form, setForm] = useState({ username: "", senha: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [erro, setErro] = useState(null); // "credenciais" | "captcha"
  const [enviando, setEnviando] = useState(false);

  // Já está logado? Vai direto para a home
  if (usuario) {
    return <Navigate to="/home" replace />;
  }

  const aviso = AVISOS[location.state?.aviso];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    // Sem back-end, o reCAPTCHA é conferido só no front:
    // o login só segue depois que a caixa "Não sou um robô" for marcada
    if (!captchaToken) {
      setErro("captcha");
      return;
    }

    setEnviando(true);

    const sucesso = await login(form.username, form.senha);

    if (sucesso) {
      navigate("/home", { replace: true });
      return;
    }

    setEnviando(false);
    setErro("credenciais");
    setForm((prev) => ({ ...prev, senha: "" }));

    // Cada token do reCAPTCHA vale para uma única tentativa
    recaptchaRef.current?.reset();
    setCaptchaToken(null);
  };

  return (
    <AuthLayout spinLogo>
      <title>Login - PUC Minas</title>

      <form onSubmit={handleSubmit}>
        <h1 className="auth-title">Login</h1>

        {/* Cadastro realizado / senha redefinida */}
        {aviso && !erro && <Message title={aviso.title}>{aviso.text}</Message>}

        {/* Usuário ou senha incorretos */}
        {erro === "credenciais" && (
          <Message type="error" title="Usuário ou senha incorretos!">
            Verifique seus dados e tente novamente.
          </Message>
        )}

        {/* reCAPTCHA não marcado */}
        {erro === "captcha" && (
          <Message type="error">
            Por favor, confirme que você não é um robô.
          </Message>
        )}

        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          id="senha"
          name="senha"
          placeholder="Senha"
          autoComplete="current-password"
          value={form.senha}
          onChange={handleChange}
          required
        />

        {/* Google reCAPTCHA v2 */}
        <div className="recaptcha-container">
          <ReCAPTCHA
            ref={recaptchaRef}
            className="g-recaptcha"
            sitekey={RECAPTCHA_CONFIG.SITE_KEY}
            hl={RECAPTCHA_CONFIG.LANGUAGE}
            onChange={setCaptchaToken}
            onExpired={() => setCaptchaToken(null)}
          />
        </div>

        <div className="auth-button-container">
          <button type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <p className="auth-redirect-options">
          Ainda não tem cadastro?
          <br />
          <Link to="/register">Cadastre-se</Link>
          <span>|</span>
          <Link to="/recoverpassword">Esqueceu sua senha?</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
