/**
 * Endereço do back-end Spring Boot.
 *
 * - No seu computador: http://localhost:8080 (não precisa configurar nada).
 * - No Vercel: cadastre a variável VITE_API_URL com a URL do Render,
 *   por exemplo https://exemplo-integracao-back.onrender.com
 *
 * Atenção: o Vite "cola" o valor de VITE_API_URL dentro do JavaScript
 * no momento do build. Se mudar a variável no Vercel, faça um novo deploy.
 */
const URL_PADRAO = "http://localhost:8080";

const API_CONFIG = {
  // Remove a barra do final, se houver ("...com/" vira "...com")
  BASE_URL: (import.meta.env.VITE_API_URL || URL_PADRAO).replace(/\/+$/, ""),
};

export default API_CONFIG;
