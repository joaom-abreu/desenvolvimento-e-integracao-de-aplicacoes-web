import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Message from "../components/Message";
import { register } from "../services/userService";
import { formatCpf } from "../utils/masks";

const FORM_INICIAL = {
  nome: "",
  email: "",
  cpf: "",
  rg: "",
  endereco: "",
  instituicao: "",
  senha: "",
};

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_INICIAL);
  const [erro, setErro] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // O CPF ganha a máscara 000.000.000-00 enquanto é digitado
    const valor = name === "cpf" ? formatCpf(value) : value;

    setForm((prev) => ({ ...prev, [name]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(false);
    setEnviando(true);

    const cadastrado = await register(form);

    setEnviando(false);

    if (!cadastrado) {
      setErro(true);
      return;
    }

    // Volta para o login mostrando "Cadastro realizado com sucesso!"
    navigate("/login", { state: { aviso: "cadastro" } });
  };

  return (
    <AuthLayout wide>
      <title>Cadastro - PUC Minas</title>

      <h1 className="auth-title">Crie sua conta</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          autoComplete="name"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          inputMode="numeric"
          pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
          title="Informe os 11 dígitos do CPF"
          value={form.cpf}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="rg"
          placeholder="RG"
          value={form.rg}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          autoComplete="street-address"
          value={form.endereco}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="instituicao"
          placeholder="Instituição"
          value={form.instituicao}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          autoComplete="new-password"
          value={form.senha}
          onChange={handleChange}
          required
        />

        <div className="auth-button-container">
          <button type="submit" disabled={enviando}>
            {enviando ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>

      {/* Usuário já cadastrado */}
      {erro && (
        <Message type="error" title="Usuário já cadastrado!" className="auth-message-bottom">
          Este e-mail já possui uma conta.
        </Message>
      )}

      <div className="auth-redirect-options">
        Já possui conta? <Link to="/login">Faça login</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
