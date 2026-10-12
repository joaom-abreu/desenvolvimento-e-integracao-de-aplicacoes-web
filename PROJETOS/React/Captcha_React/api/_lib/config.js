// Chaves e configurações de cada captcha (equivale ao application.properties
// do projeto Spring Boot).
//
// Cada valor vem da variável de ambiente e, se ela não existir, do valor
// padrão. Os padrões são as CHAVES DE TESTE oficiais de cada provedor: o
// captcha sempre passa. Servem só para desenvolvimento.
//
//   • SITE KEY (pública)   → prefixo VITE_: vai para o navegador e o servidor
//                             também consegue ler.
//   • SECRET KEY (secreta) → SEM o prefixo VITE_: fica só no servidor.
//
// Onde as variáveis são lidas:
//   • npm run dev / preview → .env.local (o vite.config.js repassa o env)
//   • Vercel                → Settings > Environment Variables (process.env)

export const CHAVES_DE_TESTE = {
  // https://developers.google.com/recaptcha/docs/faq
  RECAPTCHA_V2_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  RECAPTCHA_V2_SECRET_KEY: "6LeIxAcTAAAAAGG-vFI1TRnWxEg4jB4kFGeWtxJ-FXM",
  // https://docs.hcaptcha.com/#integration-testing-test-keys
  HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001",
  HCAPTCHA_SECRET_KEY: "0x0000000000000000000000000000000000000000",
  // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
  TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
};

const texto = (valor) => String(valor ?? "").trim();
const ou = (valor, padrao) => texto(valor) || padrao;

export function lerConfig(env = {}) {
  return {
    // =========================================================
    // GOOGLE reCAPTCHA v2 - CHECKBOX ("Não sou um robô")
    // =========================================================
    recaptchaV2Checkbox: {
      secretKey: ou(env.RECAPTCHA_V2_CHECKBOX_SECRET_KEY, CHAVES_DE_TESTE.RECAPTCHA_V2_SECRET_KEY),
    },

    // =========================================================
    // GOOGLE reCAPTCHA v2 - INVISÍVEL ("v2 > Selo invisível")
    // =========================================================
    recaptchaV2Invisivel: {
      secretKey: ou(env.RECAPTCHA_V2_INVISIVEL_SECRET_KEY, CHAVES_DE_TESTE.RECAPTCHA_V2_SECRET_KEY),
    },

    // =========================================================
    // GOOGLE reCAPTCHA v3 (NÃO existe chave de teste)
    // =========================================================
    recaptchaV3: {
      secretKey: texto(env.RECAPTCHA_V3_SECRET_KEY),
      scoreMinimo: Number(ou(env.RECAPTCHA_V3_SCORE_MINIMO, "0.5")),
    },

    // =========================================================
    // hCAPTCHA (a site key também é enviada na validação)
    // =========================================================
    hcaptcha: {
      siteKey: ou(env.VITE_HCAPTCHA_SITE_KEY, CHAVES_DE_TESTE.HCAPTCHA_SITE_KEY),
      secretKey: ou(env.HCAPTCHA_SECRET_KEY, CHAVES_DE_TESTE.HCAPTCHA_SECRET_KEY),
    },

    // =========================================================
    // CLOUDFLARE TURNSTILE
    // =========================================================
    turnstile: {
      secretKey: ou(env.TURNSTILE_SECRET_KEY, CHAVES_DE_TESTE.TURNSTILE_SECRET_KEY),
    },

    // =========================================================
    // ALTCHA (a chave HMAC é um texto aleatório criado por você)
    // =========================================================
    altcha: {
      hmacKey: ou(env.ALTCHA_HMAC_KEY, "troque-esta-chave-por-um-texto-longo-e-aleatorio"),
      maxNumber: Number(ou(env.ALTCHA_MAX_NUMBER, "100000")),
      validadeMinutos: Number(ou(env.ALTCHA_VALIDADE_MINUTOS, "10")),
    },

    // =========================================================
    // CAPTCHA DE IMAGEM e CAPTCHA MATEMÁTICO
    // Gerados pelo próprio projeto. A chave assina o desafio
    // (é o que substitui a HttpSession do Spring).
    // =========================================================
    desafio: {
      hmacKey: ou(env.DESAFIO_HMAC_KEY, "troque-esta-outra-chave-por-um-texto-longo-e-aleatorio"),
      validadeMinutos: 10,
    },
    captchaImagem: {
      tamanho: Number(ou(env.CAPTCHA_IMAGEM_TAMANHO, "5")),
    },
  };
}
