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
};

export default WAKATIME_CONFIG;
