/**
 * Design system da AraCoffee: uma fonte só para a página /design e para o PDF.
 *
 * Os valores aqui são os MESMOS das variáveis do src/index.css. Se mudar uma cor
 * lá, mude aqui também: a página e o PDF leem só deste arquivo.
 */

export const DS_INFO = {
  nome: "Design system da AraCoffee",
  versao: "1.1",
  atualizado: "outubro de 2026",
  arquivoPdf: "design-system-aracoffee.pdf",
};

/**
 * Paleta na ordem da torra: do grão cru (crema) ao espresso.
 * "papel" diz se a cor também aparece no PDF/impressão (onde o fundo é claro).
 */
export const PALETA = [
  { nome: "Crema", variavel: "--crema", hex: "#F1E3CF", papel: "Texto principal no escuro e fundo da logo" },
  { nome: "Crema suave", variavel: "--crema-suave", hex: "#CBB69B", papel: "Texto secundário, descrições, rodapé" },
  { nome: "Caramelo claro", variavel: "--caramelo-claro", hex: "#E4B277", papel: "Hover dos botões e links" },
  { nome: "Caramelo", variavel: "--caramelo", hex: "#D19A5B", papel: "Ação: botão principal, links, foco, preço" },
  { nome: "Mocha", variavel: "--mocha", hex: "#7A4E33", papel: "Pontilhado do cardápio e bordas fortes" },
  { nome: "Marrom da logo", variavel: "--marrom-logo", hex: "#5B3220", papel: "Logo, selo, ícone da aba, página ativa no menu" },
  { nome: "Torra clara", variavel: "--torra-clara", hex: "#3A281D", papel: "Campos de formulário e itens elevados" },
  { nome: "Torra", variavel: "--torra", hex: "#2B1C14", papel: "Painéis" },
  { nome: "Espresso", variavel: "--espresso", hex: "#1E130D", papel: "Fundo da página" },
];

/** Cores de estado: só aparecem quando algo aconteceu (salvou, falhou, conectou) */
export const ESTADOS = [
  { nome: "Sucesso", variavel: "--sucesso-borda", hex: "#6E9E5D", texto: "#CBE8BF" },
  { nome: "Erro", variavel: "--erro-borda", hex: "#B8604F", texto: "#F3B9AB" },
  { nome: "Online", variavel: "--status-online", hex: "#8FCB7A", texto: "#8FCB7A" },
  { nome: "Verificando", variavel: "--status-verificando", hex: "#E5B85C", texto: "#E5B85C" },
  { nome: "Offline", variavel: "--status-offline", hex: "#E07B67", texto: "#E07B67" },
];

/** Pares de contraste conferidos (texto sobre fundo) */
export const PARES_CONTRASTE = [
  { texto: "#F1E3CF", fundo: "#1E130D", uso: "Texto principal sobre espresso" },
  { texto: "#CBB69B", fundo: "#1E130D", uso: "Texto secundário sobre espresso" },
  { texto: "#D19A5B", fundo: "#1E130D", uso: "Link e preço sobre espresso" },
  { texto: "#1E130D", fundo: "#D19A5B", uso: "Texto do botão principal" },
  { texto: "#5B3220", fundo: "#F1E3CF", uso: "Página ativa no menu, logo e ícone da aba" },
  { texto: "#CBB69B", fundo: "#3A281D", uso: "Dica de campo sobre torra clara" },
];

export const FONTES = [
  {
    nome: "Shrikhand",
    variavel: "--fonte-display",
    papel: "Títulos, logo, nome no rodapé",
    pesos: "400",
    amostra: "Café coado devagar",
  },
  {
    nome: "Karla",
    variavel: "--fonte-texto",
    papel: "Texto corrido, menus, botões, preços",
    pesos: "400, 500 e 700",
    amostra: "Grãos do Sul de Minas torrados toda semana, espresso tirado na hora.",
  },
];

/** Escala de tipo usada no site (classe CSS → tamanho) */
export const ESCALA_TIPO = [
  { classe: ".titulo-pagina", fonte: "Shrikhand", tamanho: "clamp(2.4rem, 5.5vw, 3.6rem)", px: 58, linha: "1.05" },
  { classe: ".titulo-secao", fonte: "Shrikhand", tamanho: "clamp(1.6rem, 3.4vw, 2.1rem)", px: 34, linha: "1.15" },
  { classe: ".texto-apoio", fonte: "Karla 400", tamanho: "1.125rem", px: 18, linha: "1.6" },
  { classe: "body", fonte: "Karla 400", tamanho: "1.0625rem", px: 17, linha: "1.6" },
  { classe: ".campo-dica", fonte: "Karla 400", tamanho: "0.875rem", px: 14, linha: "1.6" },
];

export const RAIOS = [
  { nome: "Campo", variavel: "--raio-campo", valor: "10px", uso: "Campos, mensagens, menu no celular" },
  { nome: "Painel", variavel: "--raio-painel", valor: "20px", uso: "Painéis, quadro do cardápio, formulários" },
  { nome: "Pílula", variavel: "999px", valor: "999px", uso: "Botões, links do menu, selos de estado" },
];

export const MEDIDAS = [
  { nome: "Largura do conteúdo", variavel: "--largura-conteudo", valor: "1120px" },
  { nome: "Margem lateral", variavel: "--margem-lateral", valor: "clamp(1.25rem, 4vw, 2.5rem)" },
  { nome: "Altura mínima de botão e campo", variavel: ".btn / .campo input", valor: "46px" },
  { nome: "Quebra para celular", variavel: "@media", valor: "760px" },
];

/**
 * A história do layout, capítulo por capítulo.
 * Cada capítulo tem a decisão (o que foi feito) e o porquê.
 * A ordem é a ordem em que o layout foi pensado, por isso os capítulos são numerados.
 */
export const CAPITULOS = [
  {
    id: "ponto-de-partida",
    titulo: "O ponto de partida",
    decisao: "Um site que parece o balcão, e não um painel de sistema.",
    texto: [
      "A AraCoffee é uma cafeteria pequena dentro do campus Coração Eucarístico da PUC Minas. Quem abre o site quer saber três coisas: o que tem hoje, quanto custa e se está aberto.",
      "Por isso o layout começa escuro, na cor do grão torrado e da madeira do balcão. A luz fica para o que importa: os títulos em crema e as ações em caramelo, como a luz quente de uma luminária sobre a bancada.",
    ],
  },
  {
    id: "paleta",
    titulo: "Do grão à crema",
    decisao: "Nove tons de marrom nomeados pela torra, mais cinco cores de estado.",
    texto: [
      "Toda cor do site saiu de uma xícara. O espresso é o fundo, a torra vira os painéis, o mocha desenha o pontilhado do cardápio, o caramelo é a crema por cima do café e o crema é o leite vaporizado.",
      "Os nomes são de café de propósito: no CSS, ninguém precisa lembrar que #D19A5B é a cor do botão. Basta escrever var(--caramelo). As cores de estado (verde, vermelho, amarelo) só aparecem quando algo acontece: o produto foi salvo, o servidor não respondeu.",
    ],
  },
  {
    id: "tipografia",
    titulo: "Letreiro e cardápio",
    decisao: "Shrikhand para chamar, Karla para ler.",
    texto: [
      "A Shrikhand lembra o letreiro pintado à mão na vitrine e o carimbo do saco de café. Ela é usada só em títulos curtos, onde pode ser grande e gorda sem cansar a leitura.",
      "A Karla é uma sans-serif simples, com números de largura igual (tabular-nums) para os preços se alinharem. As duas fontes vêm pelo npm com o @fontsource, sem depender do Google Fonts.",
    ],
  },
  {
    id: "cardapio",
    titulo: "O cardápio como desenho",
    decisao: "A linha \"nome ........ preço\" é o componente mais importante do site.",
    texto: [
      "Cardápio de cafeteria se lê em linha: o nome à esquerda, o preço à direita e um pontilhado levando o olho de um ao outro. O site repete isso com flexbox: o pontilhado é um elemento que cresce (flex: 1) entre o nome e o preço.",
      "Um grão caramelo antes do nome marca os destaques da casa. Produto esgotado fica riscado e ganha o selo \"Esgotado hoje\", sem sumir da lista: o cliente vê que existe e volta outro dia.",
    ],
  },
  {
    id: "formas",
    titulo: "Formas e medidas",
    decisao: "Três raios, cada um com um papel: campo, painel e pílula.",
    texto: [
      "O raio diz o que a peça é. Tudo que se aperta (botões, links do menu) tem forma de pílula. Tudo que se preenche (campos, mensagens) tem 10px. Tudo que agrupa (painéis, o quadro do cardápio) tem 20px.",
      "Botões e campos têm no mínimo 46px de altura, confortáveis para o dedo no celular. O conteúdo para em 1120px de largura e a margem lateral cresce com a tela.",
    ],
  },
  {
    id: "componentes",
    titulo: "As peças do balcão",
    decisao: "Poucos componentes, reaproveitados em todas as páginas.",
    texto: [
      "O site inteiro é montado com as mesmas peças: botão, campo, mensagem, painel, linha do cardápio, banner com foto e o selo da marca. Nenhuma página inventa um botão novo.",
      "As mensagens têm sempre um título curto dizendo o que aconteceu e um texto dizendo o que fazer. A borda esquerda mais grossa diferencia sucesso, erro e aviso também para quem não distingue bem as cores.",
    ],
  },
  {
    id: "marca",
    titulo: "Selo, logo e ícone da aba",
    decisao: "A aba do navegador agora mostra uma xícara com vapor do React Icons.",
    texto: [
      "O selo redondo da página inicial imita o carimbo de um saco de café: o nome em Shrikhand, o grão no meio e o texto correndo em volta. A logo do cabeçalho é a versão horizontal desse selo.",
      "O ícone da aba passou a ser o PiCoffeeFill, da coleção Phosphor do React Icons. Em 16 pixels, a silhueta da xícara com vapor é reconhecida na hora. Ele é desenhado em marrom da logo sobre um círculo crema, e o arquivo public/favicon.svg é gerado a partir do próprio pacote react-icons.",
    ],
  },
  {
    id: "movimento",
    titulo: "Fumaça, e só fumaça",
    decisao: "Um único efeito de movimento: o vapor que segue o mouse.",
    texto: [
      "O Splash Cursor do React Bits solta uma fumaça marrom quando o mouse passa pela página, como o vapor saindo da xícara. Ele é o único movimento que não depende de clique: nenhuma seção desliza ou pisca ao rolar a página.",
      "Quem ativou \"reduzir movimento\" no sistema operacional não vê a fumaça. O resto do site funciona igual.",
    ],
  },
  {
    id: "acessibilidade",
    titulo: "Para todo mundo pedir",
    decisao: "Contraste conferido, foco visível e navegação pelo teclado.",
    texto: [
      "Todo texto sobre o fundo escuro passa no contraste mínimo da WCAG (4,5:1 para texto comum). O foco do teclado é um contorno caramelo de 2px que aparece em qualquer elemento clicável.",
      "O primeiro Tab da página mostra o link \"Pular para o conteúdo\". No celular, o menu vira um botão \"Menu\" com aria-expanded, e o leitor de tela sabe se ele está aberto ou fechado.",
    ],
  },
  {
    id: "papel",
    titulo: "Quando o site vira papel",
    decisao: "No PDF, a paleta se inverte: o crema vira o fundo.",
    texto: [
      "Imprimir uma página espresso gasta tinta e fica borrada. Por isso o PDF deste design system usa o fundo claro, como o cardápio impresso do balcão: texto em marrom da logo, destaques em mocha e o caramelo só nas amostras.",
      "A capa continua escura, para o documento ser reconhecido como AraCoffee de longe. As fontes do PDF são as mesmas do site, lidas dos arquivos do @fontsource.",
    ],
  },
];

/** Registro de decisões, da mais antiga para a mais nova */
export const REGISTRO = [
  { versao: "1.0", titulo: "Identidade visual", texto: "Paleta do café, Shrikhand e Karla, selo, logo e fundo de grãos." },
  {
    versao: "1.0",
    titulo: "Leitor de PDF trocado",
    texto: "O @react-pdf-viewer (PDF.js 3, falha CVE-2024-4367) deu lugar ao react-pdf com PDF.js 5.",
  },
  {
    versao: "1.1",
    titulo: "Ícone da aba com React Icons",
    texto: "O favicon passou a ser a xícara PiCoffeeFill, gerada por scripts/gerar-favicon.mjs.",
  },
  {
    versao: "1.1",
    titulo: "Página do design system",
    texto: "A rota /design reúne tokens, componentes e esta história, com exportação em PDF.",
  },
];
