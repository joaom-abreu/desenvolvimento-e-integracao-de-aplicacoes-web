// appConfig.js
// Configurações do AraUrl. Os três primeiros valores são os mesmos do UrlService.java.

/** Endereço base dos links curtos, sem "/" no final. */
function shortUrlBase() {
  const base = import.meta.env.VITE_SHORT_URL_BASE || window.location.origin;
  return base.replace(/\/+$/, "");
}

const APP_CONFIG = {
  // Alfabeto e tamanho do código aleatório (CHARACTERS e SHORT_URL_LENGTH do Spring)
  CHARACTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  SHORT_URL_LENGTH: 6,

  // Quantas vezes tentar um novo código se o sorteado já existir (o do/while do Spring)
  MAX_ATTEMPTS: 5,

  // Alias personalizado: letras, números, "-" e "_" (a mesma regra do banco)
  ALIAS_PATTERN: /^[A-Za-z0-9_-]{3,32}$/,

  // Tamanho máximo da URL longa (o banco também confere)
  MAX_URL_LENGTH: 4096,

  // Ex.: https://araurl.vercel.app
  SHORT_URL_BASE: shortUrlBase(),

  // Chaves do localStorage. A do tema também é usada no index.html.
  STORAGE_KEYS: {
    OWNER_TOKEN: "araurl:owner-token",
    THEME: "araurl:theme",
  },
};

export default APP_CONFIG;
