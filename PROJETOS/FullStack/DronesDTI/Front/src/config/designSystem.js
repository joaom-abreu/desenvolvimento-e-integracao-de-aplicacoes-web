// Fonte única dos tokens do design system. Os mesmos valores estão como
// variáveis CSS em src/index.css: mudou aqui, mude lá também.

export const CORES = [
  { nome: "Azul dti", variavel: "--azul-dti", hex: "#000066", uso: "Cabeçalho, fundo do mapa aéreo, títulos. A cor da marca." },
  { nome: "Ciano", variavel: "--ciano", hex: "#40E6F2", uso: "Rotas no ar e drones em voo. Só sobre o azul dti." },
  { nome: "Laranja", variavel: "--laranja", hex: "#FC6D3A", uso: "Prioridade alta, entregas e zonas proibidas. Pede atenção." },
  { nome: "Azul elétrico", variavel: "--azul-eletrico", hex: "#3038D5", uso: "Botões, links, foco e prioridade média." },
  { nome: "Papel", variavel: "--papel", hex: "#F4F4F4", uso: "Fundo das páginas, como os slides da dti." },
  { nome: "Branco", variavel: "--branco", hex: "#FFFFFF", uso: "Painéis sobre o papel e texto sobre o azul." },
  { nome: "Tinta", variavel: "--tinta", hex: "#010B0C", uso: "Texto principal." },
  { nome: "Cinza médio", variavel: "--cinza-medio", hex: "#5B5F6E", uso: "Texto de apoio, prioridade baixa, drone parado." },
];

export const CORES_ESTADO = [
  { estado: "IDLE", nome: "Parado na base", hex: "#8A8FA3" },
  { estado: "CARREGANDO", nome: "Carregando", hex: "#3038D5" },
  { estado: "EM_VOO", nome: "Em voo", hex: "#40E6F2" },
  { estado: "ENTREGANDO", nome: "Entregando", hex: "#FC6D3A" },
  { estado: "RETORNANDO", nome: "Retornando", hex: "#A9AEFF" },
  { estado: "RECARREGANDO", nome: "Recarregando", hex: "#F5B82E" },
];

export const PARES_CONTRASTE = [
  { texto: "#010B0C", fundo: "#F4F4F4", onde: "Texto principal no papel" },
  { texto: "#5B5F6E", fundo: "#F4F4F4", onde: "Texto de apoio no papel" },
  { texto: "#FFFFFF", fundo: "#000066", onde: "Texto no cabeçalho" },
  { texto: "#40E6F2", fundo: "#000066", onde: "Ciano no mapa aéreo" },
  { texto: "#FFFFFF", fundo: "#3038D5", onde: "Botão principal" },
  { texto: "#000066", fundo: "#FC6D3A", onde: "Selo de prioridade alta" },
];

export const ESCALA_TIPO = [
  { nome: "Display", familia: "Red Hat Display", peso: 900, tamanho: "3rem", exemplo: "Drones no ar" },
  { nome: "Título 1", familia: "Red Hat Display", peso: 700, tamanho: "2.25rem", exemplo: "Centro de operações" },
  { nome: "Título 2", familia: "Red Hat Display", peso: 700, tamanho: "1.5rem", exemplo: "Fila de entregas" },
  { nome: "Título 3", familia: "Red Hat Display", peso: 700, tamanho: "1.125rem", exemplo: "Falcão · 3 pacotes" },
  { nome: "Texto", familia: "Red Hat Text", peso: 400, tamanho: "1rem", exemplo: "Seu pacote está a 2 quadras de distância." },
  { nome: "Apoio", familia: "Red Hat Text", peso: 500, tamanho: "0.875rem", exemplo: "Atualizado a cada segundo" },
];

export const RAIOS = [
  { nome: "Campo", variavel: "--raio-campo", valor: "8px", uso: "Inputs e selects" },
  { nome: "Painel", variavel: "--raio-painel", valor: "20px", uso: "Painéis e cartões" },
  { nome: "Pílula", variavel: "--raio-pilula", valor: "999px", uso: "Botões, selos e barras de bateria" },
];

export const DECISOES = [
  { versao: "1.0", decisao: "Fundo do mapa em azul dti com rotas em ciano", porque: "Repete a capa dos slides do processo seletivo: a marca vira o espaço aéreo." },
  { versao: "1.0", decisao: "Laranja reservado para urgência", porque: "Prioridade alta, entregas e zonas proibidas. Se tudo é laranja, nada é urgente." },
  { versao: "1.0", decisao: "Red Hat Display + Red Hat Text", porque: "As mesmas famílias dos títulos dos slides da dti, livres no Fontsource." },
  { versao: "1.0", decisao: "Pílulas e círculos como forma-base", porque: "As hastes e o pingo do \"dti\" viraram botões, selos e o marcador dos drones." },
];
