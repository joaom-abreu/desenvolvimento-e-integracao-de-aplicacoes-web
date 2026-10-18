import { useRef, useState } from "react";
import bannerContato from "../assets/images/banner-contato.webp";
import Banner from "../components/Banner";
import Message from "../components/Message";
import CAFETERIA from "../config/cafeteria";
import { emailConfigurado } from "../config/emailConfig";
import { enviarContato } from "../services/emailService";
import "./Contato.css";

const ASSUNTOS = ["Dúvida", "Encomenda para evento", "Sugestão para o cardápio", "Trabalhe conosco", "Outro assunto"];

const VAZIO = { nome: "", email: "", assunto: ASSUNTOS[0], mensagem: "" };

/** Validação feita no próprio navegador (o EmailJS não valida os campos) */
const validar = ({ nome, email, mensagem }) => {
  if (!nome.trim()) return "Escreva seu nome.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return "Informe um e-mail válido para podermos responder.";
  if (mensagem.trim().length < 10) return "Escreva uma mensagem com pelo menos 10 caracteres.";
  return "";
};

/**
 * Contato: endereço, horário, mapa (Google Maps em iframe) e formulário enviado pelo EmailJS.
 * Esta página não usa o Spring Boot: o e-mail sai direto do navegador para o EmailJS.
 */
const Contato = () => {
  const formRef = useRef(null);
  const [dados, setDados] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const handleChange = (evento) => {
    const { name, value } = evento.target;
    setDados((atual) => ({ ...atual, [name]: value }));
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    const erro = validar(dados);
    if (erro) {
      setMensagem({ type: "error", title: "Confira o formulário", texto: erro });
      return;
    }

    setEnviando(true);
    setMensagem(null);

    try {
      await enviarContato(formRef.current);
      setMensagem({
        type: "success",
        title: "Mensagem enviada.",
        texto: `Respondemos em até um dia útil no e-mail ${dados.email.trim()}.`,
      });
      setDados(VAZIO);
    } catch (e) {
      setMensagem({ type: "error", title: "A mensagem não foi enviada", texto: e.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Banner imagem={bannerContato} titulo="Contato">
        Fale com a gente para encomendas, eventos no campus ou só para dizer qual café você quer ver no cardápio.
      </Banner>

      <div className="container contato">
        <section className="contato-local" aria-labelledby="contato-local-titulo">
          <h2 id="contato-local-titulo" className="titulo-secao">
            Como chegar
          </h2>

          <dl className="contato-dados">
            <div>
              <dt>Endereço</dt>
              <dd>
                {CAFETERIA.endereco.rua}, {CAFETERIA.endereco.bairro}
                <br />
                {CAFETERIA.endereco.cidade}, {CAFETERIA.endereco.cep}
                <br />
                <span className="contato-referencia">{CAFETERIA.endereco.referencia}</span>
              </dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>
                <a href={`tel:+55${CAFETERIA.telefone.replace(/\D/g, "")}`}>{CAFETERIA.telefone}</a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>{CAFETERIA.instagram}</dd>
            </div>
            <div>
              <dt>Horário</dt>
              <dd>
                {CAFETERIA.horarios.map((h) => (
                  <span key={h.dias} className="contato-horario">
                    {h.dias}: {h.horas}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="contato-mapa">
            <iframe
              title="Mapa com a localização da AraCoffee no campus Coração Eucarístico da PUC Minas"
              src={CAFETERIA.mapaEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
          </div>
          <a href={CAFETERIA.mapaLink} target="_blank" rel="noreferrer" className="contato-mapa-link">
            Abrir no Google Maps
          </a>
        </section>

        <section className="contato-formulario painel" aria-labelledby="contato-form-titulo">
          <h2 id="contato-form-titulo" className="titulo-secao">
            Mande uma mensagem
          </h2>

          {!emailConfigurado && (
            <Message type="info" title="Envio ainda não configurado">
              Preencha as chaves do EmailJS no arquivo .env para este formulário enviar e-mails de verdade.
            </Message>
          )}

          {/* Os atributos "name" precisam ser iguais às variáveis do template do EmailJS */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <fieldset disabled={enviando} className="contato-campos">
              <label className="campo">
                <span>Nome</span>
                <input name="nome" value={dados.nome} onChange={handleChange} autoComplete="name" />
              </label>

              <label className="campo">
                <span>E-mail</span>
                <input name="email" type="email" value={dados.email} onChange={handleChange} autoComplete="email" />
              </label>

              <label className="campo">
                <span>Assunto</span>
                <select name="assunto" value={dados.assunto} onChange={handleChange}>
                  {ASSUNTOS.map((assunto) => (
                    <option key={assunto}>{assunto}</option>
                  ))}
                </select>
              </label>

              <label className="campo">
                <span>Mensagem</span>
                <textarea name="mensagem" value={dados.mensagem} onChange={handleChange} rows={6} />
              </label>

              {mensagem && (
                <Message type={mensagem.type} title={mensagem.title}>
                  {mensagem.texto}
                </Message>
              )}

              <button type="submit" className="btn btn-primario contato-enviar">
                {enviando ? "Enviando…" : "Enviar mensagem"}
              </button>
            </fieldset>
          </form>
        </section>
      </div>
    </>
  );
};

export default Contato;
