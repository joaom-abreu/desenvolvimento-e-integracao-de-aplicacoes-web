// Fonte única dos tokens documentados na página /design. Os mesmos valores estão
// como variáveis CSS em src/styles/_tokens.scss: mudou aqui, mude lá também.

export const CORES = [
  { nome: "Azul dti", variavel: "--azul-dti", hex: "#000066", uso: "Cabeçalho, fundo do tabuleiro, títulos. A cor da marca." },
  { nome: "Ciano", variavel: "--ciano", hex: "#40E6F2", uso: "O que ainda está vivo: números possíveis e o acerto. Só sobre o azul dti." },
  { nome: "Laranja", variavel: "--laranja", hex: "#FC6D3A", uso: "Palpite maior que o sorteado. Pede atenção: é para descer." },
  { nome: "Azul elétrico", variavel: "--azul-eletrico", hex: "#3038D5", uso: "Botões, links, foco e barras dos gráficos." },
  { nome: "Papel", variavel: "--papel", hex: "#F4F4F4", uso: "Fundo das páginas, como os slides da dti." },
  { nome: "Branco", variavel: "--branco", hex: "#FFFFFF", uso: "Painéis sobre o papel e texto sobre o azul." },
  { nome: "Tinta", variavel: "--tinta", hex: "#010B0C", uso: "Texto principal." },
  { nome: "Cinza médio", variavel: "--cinza-medio", hex: "#5B5F6E", uso: "Texto de apoio e ajudas de campo." },
];

export const CORES_RESULTADO = [
  { resultado: "MAIOR", nome: "Maior que o sorteado", hex: "#FC6D3A", variavel: "--resultado-maior" },
  { resultado: "MENOR", nome: "Menor que o sorteado", hex: "#A9AEFF", variavel: "--resultado-menor" },
  { resultado: "ACERTOU", nome: "Acertou", hex: "#40E6F2", variavel: "--resultado-acertou" },
  { resultado: null, nome: "Descartado", hex: "#1B1F86", variavel: "--descartado" },
];

export const PARES_CONTRASTE = [
  { texto: "#010B0C", fundo: "#F4F4F4", onde: "Texto principal no papel" },
  { texto: "#5B5F6E", fundo: "#F4F4F4", onde: "Texto de apoio no papel" },
  { texto: "#FFFFFF", fundo: "#000066", onde: "Números possíveis no tabuleiro" },
  { texto: "#40E6F2", fundo: "#000066", onde: "Faixa possível no tabuleiro" },
  { texto: "#000066", fundo: "#FC6D3A", onde: "Casa de palpite maior" },
  { texto: "#000066", fundo: "#A9AEFF", onde: "Casa de palpite menor" },
  { texto: "#FFFFFF", fundo: "#3038D5", onde: "Botão principal" },
];

export const ESCALA_TIPO = [
  { nome: "Número revelado", familia: "Red Hat Display", peso: 900, tamanho: "5rem", exemplo: "42" },
  { nome: "Título 1", familia: "Red Hat Display", peso: 700, tamanho: "2.25rem", exemplo: "Adivinhe o número" },
  { nome: "Título 2", familia: "Red Hat Display", peso: 700, tamanho: "1.5rem", exemplo: "Rodada de Ana" },
  { nome: "Título 3", familia: "Red Hat Display", peso: 700, tamanho: "1.125rem", exemplo: "Palpites" },
  { nome: "Texto", familia: "Red Hat Text", peso: 400, tamanho: "1rem", exemplo: "50 é maior que o número sorteado. Tente um número menor." },
  { nome: "Apoio", familia: "Red Hat Text", peso: 500, tamanho: "0.875rem", exemplo: "Sem nome, você joga como Anônimo." },
];

export const RAIOS = [
  { nome: "Campo", variavel: "--raio-campo", valor: "8px", uso: "Inputs" },
  { nome: "Painel", variavel: "--raio-painel", valor: "20px", uso: "Painéis, cartões e o tabuleiro" },
  { nome: "Pílula", variavel: "--raio-pilula", valor: "999px", uso: "Botões, selos e a faixa possível" },
  { nome: "Círculo", variavel: "50%", valor: "50%", uso: "Cada número do tabuleiro (o pingo do logo)" },
];

export const DECISOES = [
  { versao: "1.0", decisao: "Tabuleiro em azul dti com os números possíveis em ciano", porque: "Repete a capa dos slides do processo seletivo: a marca vira o lugar onde o número se esconde." },
  { versao: "1.0", decisao: "Laranja para \"maior\", lilás para \"menor\"", porque: "Duas cores bem diferentes entre si e do ciano; a seta (↓ ↑) repete a informação para quem não distingue cores." },
  { versao: "1.0", decisao: "Uma única animação: o anel do acerto", porque: "Movimento só onde algo importante mudou. Desligado quando o sistema pede reduzir movimento." },
  { versao: "1.0", decisao: "Red Hat Display + Red Hat Text", porque: "As mesmas famílias dos slides da dti, livres no Fontsource." },
  { versao: "1.0", decisao: "SCSS para organizar, variáveis CSS para os tokens", porque: "Partials e mixins na compilação; as cores continuam visíveis no DevTools e no JavaScript." },
  { versao: "1.0", decisao: "Gráficos em SVG próprio, sem biblioteca", porque: "O PDF prefere não usar bibliotecas de componentes." },
];
