// https://www.google.com/recaptcha/admin
// Chave de teste oficial do Google: o widget sempre libera e mostra um aviso
// de "somente para testes". Use a sua site key no .env.local para tirar o aviso.
// https://developers.google.com/recaptcha/docs/faq
const RECAPTCHA_TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const RECAPTCHA_CONFIG = {
  SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || RECAPTCHA_TEST_SITE_KEY,
  LANGUAGE: "pt-BR", // "Não sou um robô"
};

export default RECAPTCHA_CONFIG;
