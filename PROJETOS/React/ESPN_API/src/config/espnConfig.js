// espnConfig.js
// Configurações do painel <EspnDashboard /> (futebol e basquete).
//
// Tudo vem da API pública da ESPN (site.api.espn.com): não pede chave, não
// tem cadastro e libera CORS, então o navegador chama a ESPN direto.
// ⚠️ Ela não é documentada oficialmente: os endereços abaixo são os mesmos que o
// site e o app da ESPN usam e podem mudar sem aviso.
const ESPN_CONFIG = {
  // Fuso usado para mostrar dia e hora dos jogos
  TIMEZONE: "America/Sao_Paulo",
  LOCALE: "pt-BR",

  // Quanto tempo (ms) cada resposta fica guardada no navegador
  CACHE_MS: 60 * 1000,

  // Aba aberta ao carregar a página: "futebol" ou "basquete"
  DEFAULT_SPORT: "futebol",

  /* ===================================================================
     FUTEBOL
     =================================================================== */
  SOCCER: {
    // Endereços da ESPN
    SITE_API: "https://site.api.espn.com/apis/site/v2/sports/soccer",
    STANDINGS_API: "https://site.api.espn.com/apis/v2/sports/soccer",

    // Liga da tabela e da lista de times (bra.1 = Brasileirão Série A)
    LEAGUE: "bra.1",
    LEAGUE_NAME: "Brasileirão Série A",

    // Time aberto ao carregar a página (id da ESPN). 7632 = Atlético-MG
    // O id está na URL do time: espn.com.br/futebol/time/_/id/7632/atletico-mg
    DEFAULT_TEAM_ID: "7632",

    // Página do calendário do time na ESPN (o id entra no fim)
    TEAM_PAGE: "https://www.espn.com.br/futebol/time/calendario/_/id/",
    STANDINGS_PAGE: "https://www.espn.com.br/futebol/classificacao/_/liga/bra.1",

    // Quantos jogos aparecem antes do "Ver todos"
    NEXT_GAMES: 5,
    LAST_RESULTS: 5,

    // Faixas da tabela (posição inicial e final de cada uma)
    ZONES: [
      { from: 1, to: 4, key: "libertadores", label: "Libertadores" },
      { from: 5, to: 6, key: "pre-libertadores", label: "Pré-Libertadores" },
      { from: 7, to: 12, key: "sudamericana", label: "Sul-Americana" },
      { from: 17, to: 20, key: "rebaixamento", label: "Rebaixamento" },
    ],
  },

  /* ===================================================================
     BASQUETE (NBA)
     =================================================================== */
  BASKETBALL: {
    SITE_API: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba",
    STANDINGS_API: "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings",
    LEAGUE_LOGO: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
    SCHEDULE_PAGE: "https://www.espn.com.br/nba/calendario",
    TEAM_PAGE: "https://www.espn.com.br/nba/time/calendario/_/sigla/",

    // Time aberto ao carregar a aba: "" = a liga toda, ou a sigla ("lal", "gs"...)
    DEFAULT_TEAM: "",

    // Quantos jogos aparecem antes do "Ver todos"
    NEXT_GAMES: 6,

    // A ESPN não aceita intervalo de datas no placar da liga: o painel busca
    // dia a dia, nos dias que têm jogo (o calendário vem na própria resposta),
    // até juntar NEXT_GAMES jogos ou olhar DAYS_MAX dias.
    DAYS_MAX: 6,
  },
};

export default ESPN_CONFIG;
