// Sem back-end, os dados ficam no localStorage do navegador.
// O try/catch evita quebrar a tela em navegação privada ou com o storage bloqueado.

export function readJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Não foi possível salvar "${key}" no localStorage:`, err);
  }
}
