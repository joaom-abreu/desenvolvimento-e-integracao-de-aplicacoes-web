// githubConfig.js
// Configurações dos componentes do GitHub.
//
// O token do GitHub NÃO fica aqui: ele é lido só no servidor (GITHUB_TOKEN),
// pela Vercel Function api/github.js e pelo vite.config.js no npm run dev.
const GITHUB_CONFIG = {
  // Seu usuário do GitHub (troque pelo seu!)
  USERNAME: "joaopauloaramuni",

  API_PATH: "/api/github",

  // Quantos repositórios aparecem antes do botão "Ver mais"
  REPOS_PER_PAGE: 6,

  // Esconde forks e repositórios arquivados da lista e das estatísticas
  HIDE_FORKS: true,
  HIDE_ARCHIVED: false,

  // Quantas linguagens aparecem no gráfico
  MAX_LANGUAGES: 8,

  // Mostra a caixa de busca para ver outro usuário
  ALLOW_SEARCH: true,
};

export default GITHUB_CONFIG;
