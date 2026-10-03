// https://dashboard.emailjs.com/admin
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID_RECOVERY: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_RECOVERY, // template de recuperação de senha
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export default EMAILJS_CONFIG;
