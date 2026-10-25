// Endereço do back-end (Spring Boot).
// - No seu computador: sem VITE_API_URL, usa http://localhost:8080
// - No Vercel: a variável VITE_API_URL aponta para o Render
const URL_PADRAO = "http://localhost:8080";

export const API_CONFIG = {
  BASE_URL: (import.meta.env.VITE_API_URL || URL_PADRAO).replace(/\/+$/, ""),
};
