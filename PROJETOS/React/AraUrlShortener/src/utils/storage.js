import APP_CONFIG from "../config/appConfig";

/**
 * localStorage com try/catch: em aba anônima ou com o armazenamento
 * bloqueado, o acesso pode lançar erro. Aí o app segue funcionando,
 * só não lembra o tema nem o histórico ao recarregar.
 */

const { OWNER_TOKEN, THEME } = APP_CONFIG.STORAGE_KEYS;

function ler(chave) {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, valor);
  } catch {
    // sem localStorage: fica só na memória desta aba
  }
}

let ownerTokenEmMemoria = null;

/**
 * Identificador anônimo deste navegador (um UUID aleatório).
 * Vai junto em cada link criado e é a "chave" do histórico e da exclusão.
 */
export function getOwnerToken() {
  if (ownerTokenEmMemoria) return ownerTokenEmMemoria;

  let token = ler(OWNER_TOKEN);
  if (!token) {
    token = crypto.randomUUID();
    gravar(OWNER_TOKEN, token);
  }
  ownerTokenEmMemoria = token;
  return token;
}

/** "light", "dark" ou null (nunca escolheu: segue o sistema). */
export function getSavedTheme() {
  const tema = ler(THEME);
  return tema === "light" || tema === "dark" ? tema : null;
}

export function saveTheme(tema) {
  gravar(THEME, tema);
}
