// wakatimeConfig.js
// Configurações do componente <WakaTimeStats />.
//
// A chave do WakaTime NÃO fica aqui: ela é lida só no servidor (WAKATIME_API_KEY),
// pela Vercel Function api/wakatime.js e pelo vite.config.js no npm run dev.
// O navegador apenas chama API_PATH no próprio domínio.
const WAKATIME_CONFIG = {
  API_PATH: "/api/wakatime",

  // Período aberto ao carregar a página
  DEFAULT_RANGE: "last_7_days",

  // Botões de período (value = range aceito pela API do WakaTime)
  RANGES: [
    { value: "last_7_days", label: "7 dias" },
    { value: "last_30_days", label: "30 dias" },
    { value: "last_6_months", label: "6 meses" },
    { value: "last_year", label: "1 ano" },
    { value: "all_time", label: "Desde sempre" },
  ],

  // Link do seu perfil público (opcional: deixe "" para esconder o botão)
  PROFILE_URL: "https://wakatime.com/@aramuni",

  // Quantas linguagens aparecem na lista (o resto vira "+ N outras")
  MAX_LANGUAGES: 10,

  // Linguagens que você não quer mostrar, ex.: ["Text", "Other"]
  HIDDEN_LANGUAGES: [],

  // "Codando agora": em que projeto você está mexendo no editor NESTE momento.
  // Sai dos heartbeats do WakaTime, que são privados: só funciona com a
  // WAKATIME_API_KEY (no modo perfil público o cartão não aparece).
  // Este bloco também é lido pelo servidor (api/_codando.js).
  CODING_NOW: {
    API_PATH: "/api/codando",

    // Fuso da sua conta no WakaTime (wakatime.com/settings/preferences):
    // é por ele que a API separa os dias
    TIMEZONE: "America/Sao_Paulo",

    // Último heartbeat há até tantos minutos = "codando agora".
    // A extensão manda um a cada ~2 min enquanto você digita.
    ACTIVE_MINUTES: 10,

    // Pausa maior que isso encerra a sessão (mesmo timeout padrão do WakaTime)
    BREAK_MINUTES: 15,

    // De quanto em quanto tempo a página pergunta de novo
    REFRESH_SECONDS: 60,

    // Projetos que aparecem pelo nome (com a branch). "*" = todos.
    // Para esconder projetos de cliente, troque por uma lista, ex.:
    //   PUBLIC_PROJECTS: ["meu-portfolio", "WakaTimeAPI"],
    // O nome é o que o WakaTime mostra no dashboard (em geral, o nome da pasta).
    // Também dá para somar nomes pela variável WAKATIME_PUBLIC_PROJECTS.
    PUBLIC_PROJECTS: ["*"],

    // Projeto fora da lista: true = aparece como "projeto privado" (sem nome
    // e sem branch); false = o cartão nem aparece
    SHOW_PRIVATE: true,
  },
};

export default WAKATIME_CONFIG;
