import emailjs from "@emailjs/browser";
import EMAILJS_CONFIG from "../config/emailJsConfig";
import { TOKEN_VALIDITY_MINUTES } from "./passwordRecoveryService";

/**
 * Sem as variáveis no .env.local o EmailJS não é chamado:
 * a tela avisa e o link de teste aparece no console.
 */
export const isEmailJsConfigured = () =>
  Boolean(
    EMAILJS_CONFIG.SERVICE_ID &&
      EMAILJS_CONFIG.TEMPLATE_ID_RECOVERY &&
      EMAILJS_CONFIG.PUBLIC_KEY
  );

/**
 * Envia o e-mail de recuperação de senha pelo EmailJS.
 * As chaves do objeto viram as variáveis {{name}}, {{email}}, {{link}}...
 * do template criado no painel do EmailJS.
 */
export function sendRecoveryEmail({ nome, email, link }) {
  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID_RECOVERY,
    {
      name: nome,
      email: email, // destinatário (campo "To Email" do template)
      link: link,
      validity: `${TOKEN_VALIDITY_MINUTES} minutos`,
      title: "Recuperação de Senha - PUC Minas", // assunto do e-mail
    },
    { publicKey: EMAILJS_CONFIG.PUBLIC_KEY }
  );
}
