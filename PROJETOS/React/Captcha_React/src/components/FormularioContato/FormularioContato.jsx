import { useState } from "react";
import { enviarFormulario } from "../../services/captchaService";
import Resultado from "./Resultado";
import "./FormularioContato.css";

const VAZIO = { nome: "", mensagem: "" };

/**
 * Formulário de contato usado em todas as páginas (Nome + Mensagem).
 * O captcha entra como filho e é controlado pelo captchaRef:
 *
 * <FormularioContato rota="/api/hcaptcha" captchaRef={captchaRef}>
 *   <HCaptcha ref={captchaRef} siteKey="..." />
 * </FormularioContato>
 *
 * Ao enviar:
 *   1. captchaRef.current.obterDados() → campo(s) do captcha
 *   2. POST na rota com { nome, mensagem, ...campos do captcha }
 *   3. mostra a resposta do servidor (Validado / Bloqueado)
 *   4. captchaRef.current.reiniciar() → cada captcha vale uma vez só
 */
const FormularioContato = ({ rota, captchaRef, children }) => {
  const [form, setForm] = useState(VAZIO);
  const [resultado, setResultado] = useState(null); // { sucesso, mensagem }
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // null = verificação cancelada (ex.: reCAPTCHA invisível clicado de novo)
    const camposDoCaptcha = await captchaRef.current?.obterDados();
    if (camposDoCaptcha === null) return;

    setEnviando(true);
    const resposta = await enviarFormulario(rota, { ...form, ...camposDoCaptcha });
    setEnviando(false);

    setResultado(resposta);
    if (resposta.sucesso) setForm(VAZIO);
    captchaRef.current?.reiniciar();
  };

  return (
    <>
      <Resultado resultado={resultado} />

      <form className="formulario" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            maxLength={80}
            autoComplete="name"
          />
        </label>

        <label>
          Mensagem
          <textarea
            name="mensagem"
            rows={3}
            value={form.mensagem}
            onChange={handleChange}
            maxLength={500}
          />
        </label>

        {/* ============== CAPTCHA ============== */}
        {children}

        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar mensagem"}
        </button>
      </form>
    </>
  );
};

export default FormularioContato;
