import emailjs from "@emailjs/browser";
import EMAIL_CONFIG, { emailConfigurado } from "../config/emailConfig";

/**
 * Envia o formulário de Contato pelo EmailJS.
 *
 * O EmailJS lê os campos do <form> pelo atributo "name" de cada input.
 * Os nomes precisam ser iguais às variáveis do template no painel do EmailJS:
 *
 *   <input name="nome">      →  {{nome}}
 *   <input name="email">     →  {{email}}
 *   <select name="assunto">  →  {{assunto}}
 *   <textarea name="mensagem"> → {{mensagem}}
 *
 * Este envio sai direto do navegador para o EmailJS: o Spring Boot não participa.
 *
 * @param {HTMLFormElement} formulario O elemento <form> (via useRef)
 */
export async function enviarContato(formulario) {
  if (!emailConfigurado) {
    throw new Error(
      "O envio de e-mail ainda não foi configurado. Preencha VITE_EMAILJS_SERVICE_ID, " +
        "VITE_EMAILJS_TEMPLATE_ID e VITE_EMAILJS_PUBLIC_KEY no arquivo .env (veja o README).",
    );
  }

  try {
    return await emailjs.sendForm(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, formulario, {
      publicKey: EMAIL_CONFIG.PUBLIC_KEY,
    });
  } catch (erro) {
    // O EmailJS devolve { status, text } quando recusa o envio (chave errada, template inexistente...)
    const detalhe = erro?.text ? ` (EmailJS: ${erro.status} ${erro.text})` : "";
    throw new Error(`A mensagem não foi enviada${detalhe}. Tente de novo em alguns instantes.`, { cause: erro });
  }
}
