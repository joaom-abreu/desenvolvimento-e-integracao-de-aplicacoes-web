// Gera o hash SHA-256 da senha com a Web Crypto API do navegador.
// Não substitui um back-end: serve só para a senha não ficar em texto puro no localStorage.
// Obs.: crypto.subtle só existe em contexto seguro (https ou localhost).
export async function hashPassword(senha) {
  const dados = new TextEncoder().encode(senha);
  const buffer = await crypto.subtle.digest("SHA-256", dados);

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
