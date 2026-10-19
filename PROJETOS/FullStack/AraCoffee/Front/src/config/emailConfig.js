/**
 * Chaves do EmailJS (https://www.emailjs.com), usadas no formulário de Contato.
 *
 * Coloque os valores no arquivo .env (no seu computador) e em
 * Settings > Environment Variables (no Vercel):
 *
 * VITE_EMAILJS_SERVICE_ID   → Email Services > o serviço criado (ex.: service_abc123)
 * VITE_EMAILJS_TEMPLATE_ID  → Email Templates > o template criado (ex.: template_xyz789)
 * VITE_EMAILJS_PUBLIC_KEY   → Account > General > Public Key
 *
 * A Public Key pode ficar no front-end: ela só permite enviar e-mails usando
 * os templates da sua conta. Nunca coloque aqui a Private Key.
 */
const EMAIL_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "",
};

/** true quando as três chaves foram preenchidas */
export const emailConfigurado = Boolean(EMAIL_CONFIG.SERVICE_ID && EMAIL_CONFIG.TEMPLATE_ID && EMAIL_CONFIG.PUBLIC_KEY);

export default EMAIL_CONFIG;
