// captchaConfig.js
// SITE KEYS (públicas) de cada captcha. Elas vão para o navegador, por isso
// usam o prefixo VITE_ no .env.local.
//
// As SECRET KEYS NÃO ficam aqui: são lidas só no servidor (pasta api/).
//
// Sem as variáveis, são usadas as CHAVES DE TESTE oficiais de cada provedor:
// o captcha sempre passa e mostra um aviso de "somente para testes".
const CHAVES_DE_TESTE = {
  // https://developers.google.com/recaptcha/docs/faq
  RECAPTCHA_V2: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  // https://docs.hcaptcha.com/#integration-testing-test-keys
  HCAPTCHA: "10000000-ffff-ffff-ffff-000000000001",
  // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  TURNSTILE: "1x00000000000000000000AA",
};

const env = import.meta.env;

const CAPTCHA_CONFIG = {
  RECAPTCHA_V2_CHECKBOX_SITE_KEY:
    env.VITE_RECAPTCHA_V2_CHECKBOX_SITE_KEY || CHAVES_DE_TESTE.RECAPTCHA_V2,

  RECAPTCHA_V2_INVISIVEL_SITE_KEY:
    env.VITE_RECAPTCHA_V2_INVISIVEL_SITE_KEY || CHAVES_DE_TESTE.RECAPTCHA_V2,

  // O Google NÃO oferece chave de teste para o v3 (vazio = aviso na página)
  RECAPTCHA_V3_SITE_KEY: env.VITE_RECAPTCHA_V3_SITE_KEY || "",

  // Precisa ser IGUAL à ACAO conferida em api/recaptcha-v3.js
  RECAPTCHA_V3_ACTION: "contato",

  HCAPTCHA_SITE_KEY: env.VITE_HCAPTCHA_SITE_KEY || CHAVES_DE_TESTE.HCAPTCHA,

  TURNSTILE_SITE_KEY: env.VITE_TURNSTILE_SITE_KEY || CHAVES_DE_TESTE.TURNSTILE,

  // Idioma dos widgets
  LANGUAGE: "pt-BR",
};

export default CAPTCHA_CONFIG;
