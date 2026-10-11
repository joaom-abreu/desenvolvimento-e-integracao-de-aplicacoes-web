// canvasConfig.js
// Configurações do painel <CanvasDashboard />.
//
// O token do Canvas NÃO fica aqui: ele é lido só no servidor (CANVAS_TOKEN),
// pela Vercel Function api/canvas.js e pelo vite.config.js no npm run dev.
// O navegador apenas chama API_PATH no próprio domínio.
const CANVAS_CONFIG = {
  API_PATH: "/api/canvas",

  TIMEZONE: "America/Sao_Paulo",
  LOCALE: "pt-BR",

  // Seção aberta ao carregar: "resumo", "tarefas" ou "agenda"
  DEFAULT_SECTION: "resumo",

  // "Esta semana" = os próximos N dias
  WEEK_DAYS: 7,
  // Quantos dias a agenda mostra
  AGENDA_DAYS: 21,
  // Tarefas vencidas há até N dias aparecem em "Vencidas"
  OVERDUE_DAYS: 21,

  // De quanto em quanto tempo a página busca de novo (minutos)
  REFRESH_MINUTES: 5,

  // Nome curto de cada curso (opcional). Sem isso, o painel monta as iniciais
  // da disciplina: "Desenvolvimento e Integração de Aplicações Web" → "DIAW".
  //   COURSE_LABELS: { "292753": "DIAW G1", "290578": "DIAW G2" },
  COURSE_LABELS: {},

  // Cor de cada curso (na ordem em que o Canvas devolve)
  COURSE_COLORS: ["#0a6ea6", "#7c3aed", "#0f766e", "#c2410c", "#be185d", "#4d7c0f", "#b45309", "#1d4ed8"],
};

export default CANVAS_CONFIG;
