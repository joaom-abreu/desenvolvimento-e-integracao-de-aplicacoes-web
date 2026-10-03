import { readJSON, writeJSON } from "../utils/storage";

// Chave onde os tokens de recuperação ficam salvos no localStorage
const TOKENS_STORAGE_KEY = "puc-recovery-tokens";

// Token válido por 15 minutos (mesmo tempo do projeto Spring Boot)
export const TOKEN_VALIDITY_MINUTES = 15;

// Remove do objeto os tokens que já expiraram
const removeExpired = (tokens) =>
  Object.fromEntries(
    Object.entries(tokens).filter(([, info]) => info.expiration > Date.now())
  );

/**
 * Gera um token de recuperação para o e-mail informado.
 */
export function generateToken(email) {
  const token = crypto.randomUUID();

  const expiration = Date.now() + TOKEN_VALIDITY_MINUTES * 60 * 1000;

  const tokens = removeExpired(readJSON(TOKENS_STORAGE_KEY, {}));

  tokens[token] = { email, expiration };

  writeJSON(TOKENS_STORAGE_KEY, tokens);

  return token;
}

/**
 * Retorna o e-mail associado ao token.
 * Retorna null caso o token seja inválido ou expirado.
 */
export function getEmailFromToken(token) {
  if (!token) {
    return null;
  }

  const tokens = readJSON(TOKENS_STORAGE_KEY, {});
  const info = tokens[token];

  if (!info) {
    return null;
  }

  // Verifica se o token expirou
  if (Date.now() > info.expiration) {
    invalidateToken(token);
    return null;
  }

  return info.email;
}

/**
 * Remove o token depois que ele for utilizado.
 */
export function invalidateToken(token) {
  const tokens = readJSON(TOKENS_STORAGE_KEY, {});

  delete tokens[token];

  writeJSON(TOKENS_STORAGE_KEY, tokens);
}
