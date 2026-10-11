// Configuração do i18next. É importado UMA vez, no main.jsx, antes do <App />.
//
//   i18next                          → o motor de tradução (funciona em qualquer JS)
//   react-i18next                    → useTranslation(), <Trans> e o re-render ao trocar de idioma
//   i18next-browser-languagedetector → descobre o idioma (escolha salva ou idioma do navegador)

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import I18N_CONFIG from "../config/i18nConfig";

// Um JSON por idioma. Aqui eles entram no bundle (o site já abre traduzido,
// sem esperar nenhum download). Com muitos idiomas, dá para carregar sob
// demanda com o i18next-http-backend (veja o README).
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import ptBR from "./locales/pt-BR/translation.json";

const resources = {
  "pt-BR": { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: I18N_CONFIG.LANGUAGES.map((l) => l.code),
    // Idioma não suportado (ex.: "fr") → português. "en-US" vira "en" e "es-AR" vira "es" sozinhos.
    fallbackLng: I18N_CONFIG.FALLBACK,

    detection: {
      // 1º a escolha salva; 2º os idiomas do navegador. (Sem "htmlTag": o
      // <html lang="pt-BR"> do index.html venceria o "en-US" do navegador,
      // porque o i18next prefere um código exato a um parecido.)
      order: ["localStorage", "navigator"],
      lookupLocalStorage: I18N_CONFIG.STORAGE_KEY,
      // Quando o usuário troca de idioma, a escolha fica salva aqui
      caches: ["localStorage"],
    },

    interpolation: {
      // O React já protege contra XSS: não precisa escapar de novo
      escapeValue: false,
    },
  });

// A cada troca de idioma: <html lang="..."> (leitores de tela, tradutor do
// navegador, SEO) e o título da aba
function syncDocument(lng) {
  document.documentElement.lang = i18n.resolvedLanguage ?? lng;
  document.title = i18n.t("meta.title");
}
i18n.on("languageChanged", syncDocument);
syncDocument(i18n.language);

export default i18n;
