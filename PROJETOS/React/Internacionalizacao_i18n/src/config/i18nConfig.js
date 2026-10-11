// i18nConfig.js
// Idiomas do site. Para acrescentar um idioma:
//   1. crie src/i18n/locales/<código>/translation.json (copie o pt-BR e traduza)
//   2. importe o JSON em src/i18n/index.js
//   3. acrescente o idioma aqui (a bandeira vem do country-flag-icons)
import { BR, ES, US } from "country-flag-icons/react/3x2";

const I18N_CONFIG = {
  // Idioma usado quando o do navegador não está na lista
  // (pode vir do .env.local: VITE_DEFAULT_LANGUAGE, veja o .env.example)
  FALLBACK: import.meta.env.VITE_DEFAULT_LANGUAGE || "pt-BR",

  // Onde a escolha do usuário fica salva (localStorage)
  STORAGE_KEY: "i18nextLng",

  // code: código do idioma (é o nome da pasta em locales/)
  // name: nome no PRÓPRIO idioma (quem não lê português precisa achar o seu)
  // short: o que aparece ao lado da bandeira
  // flag: componente SVG da bandeira (country-flag-icons)
  LANGUAGES: [
    { code: "pt-BR", name: "Português", short: "PT", flag: BR },
    { code: "en", name: "English", short: "EN", flag: US },
    { code: "es", name: "Español", short: "ES", flag: ES },
  ],
};

export default I18N_CONFIG;
