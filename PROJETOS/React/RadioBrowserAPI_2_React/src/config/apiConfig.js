/**
 * Monta as URLs da Radio Browser API a partir de VITE_RADIO_API_BASE_URL.
 * Mesmo papel do ApiConfig.java (que lia radio.api.base.url do application.properties).
 */
const baseUrl = (
  import.meta.env.VITE_RADIO_API_BASE_URL || "https://de1.api.radio-browser.info/json"
).replace(/\/+$/, "");

const apiConfig = {
  getSearchUrl: () => `${baseUrl}/stations/search`,
  getCountriesUrl: () => `${baseUrl}/countries`,
  getStatesUrl: () => `${baseUrl}/states`,
};

export default apiConfig;
