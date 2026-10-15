import { TbCloud, TbGrain, TbGridDots, TbLayoutGrid, TbWaveSine } from "react-icons/tb";

import SplashCursor from "../components/reactbits/SplashCursor/SplashCursor";
import Ribbons from "../components/reactbits/Ribbons/Ribbons";
import DotGrid from "../components/reactbits/DotGrid/DotGrid";
import PixelTrail from "../components/reactbits/PixelTrail/PixelTrail";
import SwarmCursor from "../components/reactbits/SwarmCursor/SwarmCursor";

/**
 * Os 5 efeitos do React Bits usados neste projeto.
 *
 * Cada item tem:
 *  - Component : o componente do React Bits (copiado para src/components/reactbits)
 *  - props     : as props que passamos para ele (o código de exemplo é gerado a partir daqui)
 *  - layer     : "fundo"  → fica ATRÁS do conteúdo (dentro do <BackgroundEffect />)
 *                "frente" → fica POR CIMA do conteúdo, sem bloquear cliques
 *  - propsInfo : explicação, em português, de cada prop usada
 *  - docs      : página do componente no reactbits.dev
 *
 * Azul PUC Minas: #005380 (principal), #00334f (escuro), #0a6ea6 e #4fa8d8 (claros).
 */
const EFFECTS = [
  {
    id: "fumaca",
    label: "Fumaça",
    icon: TbCloud,
    name: "SplashCursor",
    category: "Animations",
    Component: SplashCursor,
    layer: "frente",
    docs: "https://reactbits.dev/animations/splash-cursor",
    description:
      "Uma simulação de fluido em WebGL: o mouse solta uma fumaça azul que se espalha e some aos poucos. É o efeito do portfólio que inspirou este projeto. O componente já vem com position: fixed e pointer-events: none, então pode ficar por cima de tudo sem atrapalhar os cliques.",
    tip: "Mova o mouse por qualquer lugar da página, inclusive sobre este card. Clique para soltar um jato de fumaça.",
    props: {
      COLOR: "#005380",
      RAINBOW_MODE: false,
      DENSITY_DISSIPATION: 2.5,
      VELOCITY_DISSIPATION: 2.5,
      PRESSURE: 0.15,
      CURL: 0,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 5000,
      SHADING: true,
    },
    propsInfo: {
      COLOR: "Cor da fumaça (só vale com RAINBOW_MODE desligado)",
      RAINBOW_MODE: "true troca de cor o tempo todo (arco-íris)",
      DENSITY_DISSIPATION: "Quanto maior, mais rápido a fumaça some",
      VELOCITY_DISSIPATION: "Quanto maior, mais rápido o movimento para",
      PRESSURE: "Pressão do fluido: valores altos espalham mais",
      CURL: "Redemoinhos; 0 deixa a fumaça mais lisa",
      SPLAT_RADIUS: "Tamanho do rastro deixado pelo mouse",
      SPLAT_FORCE: "Força com que o mouse empurra o fluido",
      SHADING: "Sombreamento que dá volume à fumaça",
    },
  },
  {
    id: "fitas",
    label: "Fitas",
    icon: TbWaveSine,
    name: "Ribbons",
    category: "Animations",
    Component: Ribbons,
    layer: "fundo",
    docs: "https://reactbits.dev/animations/ribbons",
    description:
      "Três fitas em tons de azul perseguem o cursor com efeito de mola: atrasam, passam do ponto e voltam. Cada cor da lista vira uma fita, desenhada de trás para frente.",
    tip: "Mova o mouse pelas laterais da página, fora do card. Faça curvas rápidas para ver as fitas balançarem.",
    props: {
      colors: ["#00334f", "#005380", "#4fa8d8"],
      thickness: 26,
      length: 1.6,
      spread: 16,
      stiffness: 0.45,
      bounce: 0.6,
      wave: 0.3,
      fade: true,
    },
    propsInfo: {
      colors: "Uma fita para cada cor, de trás para frente",
      thickness: "Largura da fita, em pixels",
      length: "Comprimento do rastro atrás do cursor",
      spread: "Espaço entre as fitas, em pixels",
      stiffness: "De 0 a 1: quão colada a fita fica no cursor",
      bounce: "De 0 a 1: quanto ela passa do ponto e volta",
      wave: "De 0 a 1: ondulação ao longo da fita",
      fade: "Faz a ponta da fita desaparecer aos poucos",
    },
  },
  {
    id: "pontos",
    label: "Grade de pontos",
    icon: TbGridDots,
    name: "DotGrid",
    category: "Backgrounds",
    Component: DotGrid,
    layer: "fundo",
    docs: "https://reactbits.dev/backgrounds/dot-grid",
    description:
      "Uma grade de pontos cobre o fundo. Perto do cursor os pontos são empurrados, crescem e acendem em azul; depois voltam para o lugar como gelatina. É um fundo discreto, bom para portfólios.",
    tip: "Passe o mouse pelas laterais da página. Clique no fundo para soltar uma onda de choque.",
    props: {
      baseColor: "#cfdde8",
      activeColor: "#005380",
      dotSize: 5,
      gap: 22,
      proximity: 150,
      strength: 1,
      tension: 0.4,
      shockRadius: 280,
      shockStrength: 5,
    },
    propsInfo: {
      baseColor: "Cor dos pontos parados",
      activeColor: "Cor dos pontos perto do cursor",
      dotSize: "Tamanho de cada ponto, em px",
      gap: "Espaço entre os pontos, em px",
      proximity: "Raio de alcance do cursor, em px",
      strength: "Força do empurrão do cursor",
      tension: "Quanto um ponto puxa o vizinho (efeito gelatina)",
      shockRadius: "Alcance da onda de choque do clique, em px",
      shockStrength: "Força da onda de choque do clique",
    },
  },
  {
    id: "pixels",
    label: "Rastro de pixels",
    icon: TbLayoutGrid,
    name: "PixelTrail",
    category: "Animations",
    Component: PixelTrail,
    layer: "fundo",
    docs: "https://reactbits.dev/animations/pixel-trail",
    description:
      "O fundo vira uma grade de pixels invisíveis. Por onde o cursor passa, os pixels acendem e derretem uns nos outros (filtro gooey), mudando do azul PUC para o azul claro antes de sumir.",
    tip: "Mova o mouse pelas laterais da página. Clique para espalhar um anel de pixels.",
    props: {
      gridSize: 48,
      trailSize: 0.08,
      maxAge: 400,
      color: "#005380",
      trailColor: "#4fa8d8",
      gooeyFilter: { strength: 2 },
      clickBurst: true,
    },
    propsInfo: {
      gridSize: "Quantos pixels cabem no lado maior da tela",
      trailSize: "Tamanho do pincel (fração da tela)",
      maxAge: "Quanto tempo cada pixel fica aceso, em ms",
      color: "Cor do pixel quando acende",
      trailColor: "Cor para a qual o pixel muda ao envelhecer",
      gooeyFilter: "Derrete pixels vizinhos; use false para pixels separados",
      clickBurst: "Clique solta um anel de pixels",
    },
  },
  {
    id: "enxame",
    label: "Enxame",
    icon: TbGrain,
    name: "SwarmCursor",
    category: "Animations",
    Component: SwarmCursor,
    layer: "fundo",
    docs: "https://reactbits.dev/animations/swarm-cursor",
    description:
      "Centenas de partículas giram em volta do cursor como um cardume. Quando o mouse corre, o enxame forma uma cauda; quando para, ele fica rodopiando no lugar.",
    tip: "Mova o mouse pelas laterais da página e depois pare. Clique para espalhar o enxame.",
    props: {
      count: 900,
      size: 2.6,
      color: "#005380",
      accentColor: "#4fa8d8",
      spread: 100,
      swirl: 0.6,
      tail: 0.6,
      lightMode: true,
      targets: "",
    },
    propsInfo: {
      count: "Número de partículas (até 2000)",
      size: "Tamanho de cada partícula, em px",
      color: "Cor das partículas",
      accentColor: "Cor quando aceleram ou no clique",
      spread: "Raio do enxame em volta do cursor, em px",
      swirl: "De 0 a 1: quanto o enxame forma redemoinhos",
      tail: "De 0 a 1: tamanho da cauda em movimentos rápidos",
      lightMode: "Ajusta as partículas para fundo claro",
      targets: "Seletor de elementos que o enxame contorna (\"\" desliga)",
    },
  },
];

export default EFFECTS;
