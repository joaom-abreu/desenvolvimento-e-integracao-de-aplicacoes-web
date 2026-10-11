// spotifyConfig.js
// Configurações do painel <SpotifyDashboard />.
//
// As chaves do Spotify NÃO ficam aqui: elas são lidas só no servidor
// (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET e SPOTIFY_REFRESH_TOKEN), pela
// Vercel Function api/spotify.js e pelo vite.config.js no npm run dev.
const SPOTIFY_CONFIG = {
  API_PATH: "/api/spotify",
  LOCALE: "pt-BR",

  // Período do "mais ouvidas" ao abrir (value = time_range da API do Spotify)
  DEFAULT_RANGE: "short_term",
  RANGES: [
    { value: "short_term", label: "4 semanas" },
    { value: "medium_term", label: "6 meses" },
    { value: "long_term", label: "1 ano" },
  ],

  // De quanto em quanto tempo o "tocando agora" pergunta de novo (segundos)
  NOW_REFRESH_SECONDS: 30,

  // Aba aberta ao carregar: "api" (Web API) ou "cards" (cards prontos)
  DEFAULT_TAB: "api",

  /* -------------------------------------------------------------------
     Cards prontos (aba "Cards"): imagens geradas por serviços de terceiros,
     sem código nem chave. Os mesmos do meu portfólio.
     ------------------------------------------------------------------- */
  CARDS: {
    // Seu id de usuário do Spotify: abra o seu perfil no app → "..." →
    // Compartilhar → Copiar link: open.spotify.com/user/<ID>
    SPOTIFY_USER_ID: "22lih5eniohc7dawfxohlo7wy",
    // Seu usuário no Last.fm (opcional: "" esconde o card)
    LASTFM_USER: "joaoaramuni",
    // Música do player embutido (o id está no link da música)
    EMBED_TRACK_ID: "0o8AsVRLRF15nT8GsLz5zO",
  },
};

export default SPOTIFY_CONFIG;
