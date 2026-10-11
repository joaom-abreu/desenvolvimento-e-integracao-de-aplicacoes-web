// mapboxConfig.js
// O token do Mapbox vem do .env.local (VITE_MAPBOX_TOKEN).
//
// Por que aqui pode ter VITE_ (e nos outros projetos não)?
// O token PÚBLICO do Mapbox (começa com "pk.") foi feito para ficar no
// navegador: o próprio mapa precisa dele para baixar os blocos do mapa.
// A proteção é outra: restrinja o token às URLs do seu site no painel do
// Mapbox (veja o README). Nunca use aqui um token SECRETO ("sk.").
const MAPBOX_CONFIG = {
  TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,

  // Posição inicial: [longitude, latitude] (atenção: o Mapbox usa lng antes de lat!)
  CENTER: [-44.06, -19.93],
  ZOOM: 10.2,

  // Idioma dos nomes no mapa
  LANGUAGE: "pt",

  // Estilos de mapa oferecidos nos botões
  STYLES: [
    { id: "streets", label: "Ruas", url: "mapbox://styles/mapbox/streets-v12" },
    { id: "outdoors", label: "Relevo", url: "mapbox://styles/mapbox/outdoors-v12" },
    { id: "light", label: "Claro", url: "mapbox://styles/mapbox/light-v11" },
    { id: "dark", label: "Escuro", url: "mapbox://styles/mapbox/dark-v11" },
    { id: "satellite", label: "Satélite", url: "mapbox://styles/mapbox/satellite-streets-v12" },
  ],

  // Busca de endereços (Geocoding API v6), limitada ao Brasil
  GEOCODING_URL: "https://api.mapbox.com/search/geocode/v6/forward",
  GEOCODING_COUNTRY: "br",
};

export default MAPBOX_CONFIG;
