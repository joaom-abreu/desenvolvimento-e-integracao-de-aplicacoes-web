import { Circle, Document, Ellipse, Font, G, Link, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import karla400 from "@fontsource/karla/files/karla-latin-400-normal.woff?url";
import karla700 from "@fontsource/karla/files/karla-latin-700-normal.woff?url";
import shrikhand400 from "@fontsource/shrikhand/files/shrikhand-latin-400-normal.woff?url";
import { PiCoffeeFill } from "react-icons/pi";
import {
  CAPITULOS,
  DS_INFO,
  ESCALA_TIPO,
  ESTADOS,
  FONTES,
  MEDIDAS,
  PALETA,
  PARES_CONTRASTE,
  RAIOS,
  REGISTRO,
} from "../config/designSystem";
import { contraste, formatarRazao, nivelWcag } from "../utils/contraste";

/*
 * O design system em PDF, desenhado com o @react-pdf/renderer.
 * Os dados vêm do mesmo src/config/designSystem.js da página /design.
 * As fontes são os arquivos .woff do @fontsource (o ?url faz o Vite
 * copiar o arquivo para o build e devolver o endereço dele).
 */
Font.register({
  family: "Karla",
  fonts: [
    { src: karla400, fontWeight: 400 },
    { src: karla700, fontWeight: 700 },
  ],
});
Font.register({ family: "Shrikhand", src: shrikhand400 });

// Sem hifenização automática (ela quebra palavras em português no lugar errado)
Font.registerHyphenationCallback((palavra) => [palavra]);

/* No papel a paleta se inverte: o crema vira fundo e o marrom vira tinta */
const C = Object.fromEntries(PALETA.map((cor) => [cor.variavel.replace("--", ""), cor.hex]));
const PAPEL = "#FBF5EC";
const TINTA = C["marrom-logo"];
const TINTA_SUAVE = C.mocha;
const FIO = "#E3D2BB";

/**
 * Lê o desenho de um ícone do React Icons (viewBox e os <path>).
 * Os ícones são funções que devolvem um elemento React com os paths como filhos.
 */
const desenhoDoIcone = (Icone) => {
  const elemento = Icone({});
  const filhos = [elemento.props.children].flat(Infinity).filter(Boolean);
  return {
    viewBox: elemento.props.attr?.viewBox || "0 0 24 24",
    paths: filhos.map((filho) => filho.props?.d).filter(Boolean),
  };
};

const XICARA = desenhoDoIcone(PiCoffeeFill);

/*
 * Entrelinha (lineHeight) só em estilos de <Text> que também declaram fontSize.
 * No react-pdf 4.9 a entrelinha sem unidade é convertida em pontos usando o
 * fontSize do PRÓPRIO estilo (ou 18pt, se não houver). Herdada da Page ou de
 * uma <View>, ela é multiplicada de novo no filho e, no rodapé "fixed",
 * de novo a cada página, até o desenho estourar.
 */
const s = StyleSheet.create({
  pagina: {
    backgroundColor: PAPEL,
    color: TINTA,
    fontFamily: "Karla",
    fontSize: 10.5,
    paddingTop: 54,
    paddingBottom: 64,
    paddingHorizontal: 56,
  },
  capa: {
    backgroundColor: C.espresso,
    color: C.crema,
    fontFamily: "Karla",
    padding: 0,
  },
  rodape: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: TINTA_SUAVE,
    borderTopWidth: 1,
    borderTopColor: FIO,
    paddingTop: 8,
  },
  display: { fontFamily: "Shrikhand", fontWeight: 400 },
  numeroCapitulo: { fontSize: 10, fontWeight: 700, color: TINTA_SUAVE, marginBottom: 4 },
  tituloCapitulo: { fontFamily: "Shrikhand", fontSize: 26, lineHeight: 1.15, color: TINTA },
  decisao: { fontSize: 14, lineHeight: 1.35, fontWeight: 700, marginTop: 10, maxWidth: 380 },
  paragrafo: { marginTop: 8, maxWidth: 420, color: "#4A2A1B", fontSize: 10.5, lineHeight: 1.55 },
  subtitulo: { fontSize: 11, fontWeight: 700, marginTop: 18, marginBottom: 8 },
  legenda: { fontSize: 9, color: TINTA_SUAVE, marginTop: 6, lineHeight: 1.4 },
  codigo: { fontSize: 9, color: TINTA_SUAVE },
  demo: { marginTop: 18 },
  pontilhado: { borderBottomWidth: 1.5, borderBottomStyle: "dotted", borderBottomColor: TINTA_SUAVE },
  linhaTabela: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: FIO,
  },
  cabecalhoTabela: { fontSize: 9, fontWeight: 700, color: TINTA_SUAVE },
});

/* ---------- Peças reutilizadas ---------- */

const Xicara = ({ tamanho = 40, fundo = C.crema, cor = TINTA }) => (
  <Svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
    <Circle cx="32" cy="32" r="31" fill={fundo} />
    <G transform="translate(10 11) scale(0.171875)">
      {XICARA.paths.map((d) => (
        <Path key={d.slice(0, 12)} d={d} fill={cor} />
      ))}
    </G>
  </Svg>
);

const Grao = ({ tamanho = 10, cor = C.caramelo }) => (
  <Svg width={tamanho} height={tamanho * 1.3} viewBox="-16 -21 32 42">
    <G transform="rotate(28)">
      <Ellipse rx="13" ry="18" fill={cor} />
    </G>
  </Svg>
);

const Rodape = () => (
  <View style={s.rodape} fixed>
    <Text>
      {DS_INFO.nome}, versão {DS_INFO.versao}
    </Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`} />
  </View>
);

const LinhaCardapio = ({ nome, preco, descricao, destaque, esgotado }) => (
  <View style={{ marginBottom: 10 }}>
    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
      {destaque && (
        <View style={{ marginRight: 5, marginBottom: 2 }}>
          <Grao tamanho={7} />
        </View>
      )}
      <Text
        style={{
          fontWeight: 700,
          fontSize: 12,
          color: esgotado ? TINTA_SUAVE : TINTA,
          textDecoration: esgotado ? "line-through" : "none",
        }}
      >
        {nome}
      </Text>
      <View style={[s.pontilhado, { flexGrow: 1, marginHorizontal: 5, marginBottom: 4 }]} />
      <Text
        style={{
          fontWeight: 700,
          fontSize: 12,
          color: esgotado ? TINTA_SUAVE : "#9A6232",
          textDecoration: esgotado ? "line-through" : "none",
        }}
      >
        {preco}
      </Text>
    </View>
    {descricao && <Text style={{ fontSize: 9.5, color: TINTA_SUAVE }}>{descricao}</Text>}
    {esgotado && (
      <Text
        style={{
          alignSelf: "flex-start",
          marginTop: 3,
          paddingHorizontal: 7,
          paddingVertical: 1,
          borderWidth: 1,
          borderColor: TINTA_SUAVE,
          borderRadius: 99,
          fontSize: 8.5,
          fontWeight: 700,
          color: TINTA_SUAVE,
        }}
      >
        Esgotado hoje
      </Text>
    )}
  </View>
);

const Botao = ({ texto, tipo }) => {
  const estilos = {
    primario: { backgroundColor: C.caramelo, color: C.espresso, borderColor: C.caramelo },
    secundario: { backgroundColor: "transparent", color: TINTA, borderColor: TINTA_SUAVE },
    perigo: { backgroundColor: "transparent", color: "#9A4535", borderColor: "#B8604F" },
  }[tipo];
  return (
    <Text
      style={{
        ...estilos,
        borderWidth: 1.5,
        borderRadius: 99,
        paddingVertical: 6,
        paddingHorizontal: 14,
        fontWeight: 700,
        fontSize: 10,
        marginRight: 8,
      }}
    >
      {texto}
    </Text>
  );
};

const Mensagem = ({ titulo, texto, cor, fundo }) => (
  <View
    style={{
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: cor,
      backgroundColor: fundo,
      borderRadius: 6,
      paddingVertical: 7,
      paddingHorizontal: 10,
      marginBottom: 6,
    }}
  >
    <Text style={{ fontWeight: 700 }}>{titulo}</Text>
    <Text style={{ fontSize: 9.5 }}>{texto}</Text>
  </View>
);

/* ---------- Demonstrações de cada capítulo ---------- */

const DemoAnatomia = () => (
  <View style={s.demo}>
    <View style={{ backgroundColor: C.espresso, borderRadius: 10, padding: 7, width: 330 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 7,
          backgroundColor: "#2A1D15",
          borderRadius: 5,
        }}
      >
        <View style={{ width: 50, height: 11, borderRadius: 99, backgroundColor: C.crema }} />
        <View style={{ flexDirection: "row" }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: 20,
                height: 6,
                borderRadius: 99,
                marginLeft: 4,
                backgroundColor: i === 2 ? C.crema : C.mocha,
              }}
            />
          ))}
        </View>
      </View>
      <View style={{ height: 70, marginTop: 4, borderRadius: 5, backgroundColor: C.mocha, padding: 9, justifyContent: "flex-end" }}>
        <View style={{ width: 120, height: 10, borderRadius: 3, backgroundColor: C.crema }} />
        <View style={{ width: 160, height: 4, borderRadius: 3, backgroundColor: C["crema-suave"], marginTop: 5 }} />
      </View>
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <View style={{ flex: 1.4, backgroundColor: C.torra, borderRadius: 7, padding: 9, marginRight: 4 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ borderBottomWidth: 1.5, borderBottomStyle: "dotted", borderBottomColor: C.mocha, marginVertical: 5 }} />
          ))}
        </View>
        <View style={{ flex: 1, backgroundColor: C["torra-clara"], borderRadius: 7, height: 56 }} />
      </View>
      <View style={{ height: 20, marginTop: 4, borderRadius: 5, backgroundColor: "#160E09" }} />
    </View>
    <Text style={[s.legenda, { maxWidth: 330 }]}>
      Cabeçalho fixo com a logo, banner com foto escura à esquerda, conteúdo em até 1120px e o rodapé com o status
      do servidor.
    </Text>
  </View>
);

const DemoPaleta = () => (
  <View style={s.demo}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}>
      {PALETA.map((cor) => (
        <View key={cor.variavel} style={{ width: "33.33%", padding: 5 }} wrap={false}>
          <View style={{ height: 46, backgroundColor: cor.hex, borderRadius: 6, borderWidth: 0.5, borderColor: FIO }} />
          <Text style={{ fontWeight: 700, marginTop: 4 }}>{cor.nome}</Text>
          <Text style={s.codigo}>
            {cor.hex}, var({cor.variavel})
          </Text>
          <Text style={{ fontSize: 8.5, color: TINTA_SUAVE, lineHeight: 1.35, marginTop: 1 }}>{cor.papel}</Text>
        </View>
      ))}
    </View>
    <Text style={s.subtitulo}>Cores de estado</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {ESTADOS.map((estado) => (
        <View key={estado.variavel} style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 6 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: estado.hex, marginRight: 5 }} />
          <Text style={{ fontSize: 9.5 }}>
            {estado.nome} <Text style={s.codigo}>{estado.hex}</Text>
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const DemoTipografia = () => (
  <View style={s.demo}>
    {FONTES.map((fonte) => (
      <View key={fonte.nome} style={{ borderTopWidth: 1, borderTopColor: FIO, paddingVertical: 12 }} wrap={false}>
        <Text
          style={
            fonte.nome === "Shrikhand"
              ? { fontFamily: "Shrikhand", fontSize: 30, lineHeight: 1.2 }
              : { fontSize: 15, lineHeight: 1.4 }
          }
        >
          {fonte.amostra}
        </Text>
        <Text style={{ fontFamily: fonte.nome, fontSize: 12, color: "#9A6232", marginTop: 4 }}>
          Aa Bb Cc Çç Ãã Éé 0123456789 R$
        </Text>
        <Text style={[s.codigo, { marginTop: 4 }]}>
          {fonte.nome}, pesos {fonte.pesos}. {fonte.papel}. var({fonte.variavel})
        </Text>
      </View>
    ))}
    <Text style={s.subtitulo}>Escala</Text>
    {ESCALA_TIPO.map((nivel) => (
      <View key={nivel.classe} style={[s.linhaTabela, { justifyContent: "space-between" }]} wrap={false}>
        <Text
          style={{
            fontFamily: nivel.fonte === "Shrikhand" ? "Shrikhand" : "Karla",
            fontSize: Math.min(nivel.px * 0.6, 28),
            lineHeight: 1.2,
          }}
        >
          Coração Eucarístico
        </Text>
        <Text style={s.codigo}>
          {nivel.classe}, {nivel.px}px
        </Text>
      </View>
    ))}
  </View>
);

const DemoCardapio = () => (
  <View style={[s.demo, { borderWidth: 1, borderColor: FIO, borderRadius: 12, padding: 16, maxWidth: 380 }]}>
    <LinhaCardapio nome="Espresso da casa" preco="R$ 7,00" descricao="Blend do Sul de Minas, torra média." destaque />
    <LinhaCardapio nome="Cappuccino" preco="R$ 12,50" descricao="Espresso, leite vaporizado e canela." />
    <LinhaCardapio nome="Bolo de fubá" preco="R$ 9,00" descricao="Fatia da fornada da manhã." esgotado />
  </View>
);

const DemoFormas = () => (
  <View style={s.demo}>
    <View style={{ flexDirection: "row" }}>
      {RAIOS.map((raio) => (
        <View key={raio.nome} style={{ flex: 1, marginRight: 12 }}>
          <View
            style={{
              height: 44,
              borderWidth: 1.5,
              borderColor: C.caramelo,
              backgroundColor: "#F3E6D3",
              borderRadius: raio.valor === "999px" ? 22 : Number.parseInt(raio.valor, 10),
            }}
          />
          <Text style={{ fontWeight: 700, marginTop: 5 }}>
            {raio.nome}, {raio.valor}
          </Text>
          <Text style={{ fontSize: 9, color: TINTA_SUAVE }}>{raio.uso}</Text>
        </View>
      ))}
    </View>
    <Text style={s.subtitulo}>Medidas</Text>
    {MEDIDAS.map((m) => (
      <View key={m.nome} style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 6 }}>
        <Text>{m.nome}</Text>
        <View style={[s.pontilhado, { flexGrow: 1, marginHorizontal: 5, marginBottom: 4 }]} />
        <Text style={s.codigo}>{m.valor}</Text>
      </View>
    ))}
  </View>
);

const DemoComponentes = () => (
  <View style={s.demo}>
    <Text style={[s.subtitulo, { marginTop: 0 }]}>Botões</Text>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Botao texto="Ver cardápio" tipo="primario" />
      <Botao texto="Como chegar" tipo="secundario" />
      <Botao texto="Excluir" tipo="perigo" />
    </View>
    <Text style={s.legenda}>Uma ação principal por tela. A pílula diz: isto se aperta.</Text>

    <Text style={s.subtitulo}>Campo</Text>
    <View style={{ width: 240 }}>
      <Text style={{ fontWeight: 700, fontSize: 9.5 }}>Nome do produto</Text>
      <View
        style={{
          marginTop: 4,
          borderWidth: 1,
          borderColor: FIO,
          backgroundColor: "#F3E6D3",
          borderRadius: 6,
          paddingVertical: 7,
          paddingHorizontal: 9,
        }}
      >
        <Text style={{ color: "#9C8670", fontSize: 10 }}>Ex.: Café coado</Text>
      </View>
      <Text style={{ fontSize: 8.5, color: TINTA_SUAVE, marginTop: 3 }}>Como aparece no cardápio.</Text>
    </View>

    <Text style={s.subtitulo}>Mensagens</Text>
    <View style={{ maxWidth: 380 }}>
      <Mensagem titulo="Produto salvo." texto="Cappuccino já aparece no cardápio." cor="#6E9E5D" fundo="#EEF4E8" />
      <Mensagem titulo="Não foi possível salvar" texto="Informe um preço maior que zero (ex.: 8.50)." cor="#B8604F" fundo="#F8E7E2" />
      <Mensagem titulo="Envio ainda não configurado" texto="Preencha as chaves do EmailJS no arquivo .env." cor={C.mocha} fundo="#F5EADB" />
    </View>

    <Text style={s.subtitulo}>Status do servidor</Text>
    <View style={{ flexDirection: "row" }}>
      {[
        { cor: "#6E9E5D", texto: "conectado" },
        { cor: "#C9962F", texto: "conectando…" },
        { cor: "#B8604F", texto: "sem resposta" },
      ].map((item) => (
        <View key={item.texto} style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: item.cor, marginRight: 5 }} />
          <Text style={{ fontSize: 9.5 }}>Servidor do cardápio: {item.texto}</Text>
        </View>
      ))}
    </View>
  </View>
);

const DemoMarca = () => (
  <View style={[s.demo, { flexDirection: "row", alignItems: "center" }]}>
    <View style={{ alignItems: "center", marginRight: 28 }}>
      <View
        style={{
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: "#F1E3CF",
          borderWidth: 2,
          borderColor: TINTA,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grao tamanho={14} cor={TINTA} />
        <Text style={{ fontFamily: "Shrikhand", fontSize: 18, marginTop: 4 }}>AraCoffee</Text>
        <Text style={{ fontSize: 8, fontWeight: 700, color: TINTA_SUAVE, letterSpacing: 1.5 }}>cafeteria</Text>
      </View>
      <Text style={s.legenda}>Selo</Text>
    </View>
    <View style={{ alignItems: "center", marginRight: 28 }}>
      <Xicara tamanho={84} />
      <Text style={s.legenda}>Ícone da aba, ampliado</Text>
    </View>
    <View style={{ alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Xicara tamanho={16} />
        <Text style={{ fontSize: 9, marginLeft: 5 }}>AraCoffee | Cafeteria</Text>
      </View>
      <Text style={s.legenda}>Em 16px, na aba</Text>
    </View>
  </View>
);

const DemoMovimento = () => (
  <View style={[s.demo, { maxWidth: 380 }]}>
    <Mensagem
      titulo="O PDF não tem fumaça."
      texto="O Splash Cursor só existe no site. No papel, o vapor fica no ícone da xícara."
      cor={C.mocha}
      fundo="#F5EADB"
    />
  </View>
);

const DemoAcessibilidade = () => (
  <View style={s.demo}>
    <View style={[s.linhaTabela, { borderBottomColor: TINTA_SUAVE }]}>
      <Text style={[s.cabecalhoTabela, { width: 52 }]}>Amostra</Text>
      <Text style={[s.cabecalhoTabela, { flex: 1 }]}>Uso</Text>
      <Text style={[s.cabecalhoTabela, { width: 60 }]}>Contraste</Text>
      <Text style={[s.cabecalhoTabela, { width: 44 }]}>WCAG</Text>
    </View>
    {PARES_CONTRASTE.map((par) => {
      const razao = contraste(par.texto, par.fundo);
      return (
        <View key={par.uso} style={s.linhaTabela} wrap={false}>
          <View style={{ width: 52 }}>
            <Text
              style={{
                width: 34,
                textAlign: "center",
                paddingVertical: 3,
                borderRadius: 5,
                backgroundColor: par.fundo,
                color: par.texto,
                fontWeight: 700,
              }}
            >
              Aa
            </Text>
          </View>
          <Text style={{ flex: 1, fontSize: 9.5 }}>{par.uso}</Text>
          <Text style={{ width: 60, fontSize: 9.5, fontWeight: 700 }}>{formatarRazao(razao)}</Text>
          <Text style={{ width: 44, fontSize: 9.5 }}>{nivelWcag(razao)}</Text>
        </View>
      );
    })}
    <Text style={s.legenda}>Contraste calculado com a fórmula da WCAG 2.1. O mínimo para texto comum é 4,5:1.</Text>
  </View>
);

const DemoPapel = () => (
  <View style={[s.demo, { flexDirection: "row" }]}>
    {[
      { titulo: "Na tela", fundo: C.espresso, texto: C.crema, destaque: C.caramelo },
      { titulo: "No papel", fundo: PAPEL, texto: TINTA, destaque: TINTA_SUAVE },
    ].map((modo) => (
      <View
        key={modo.titulo}
        style={{
          width: 160,
          marginRight: 14,
          padding: 12,
          borderRadius: 8,
          backgroundColor: modo.fundo,
          borderWidth: 1,
          borderColor: FIO,
        }}
      >
        <Text style={{ fontFamily: "Shrikhand", fontSize: 15, color: modo.texto }}>{modo.titulo}</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 8 }}>
          <Text style={{ fontWeight: 700, color: modo.texto }}>Coado</Text>
          <View
            style={{
              flexGrow: 1,
              marginHorizontal: 4,
              marginBottom: 4,
              borderBottomWidth: 1.5,
              borderBottomStyle: "dotted",
              borderBottomColor: modo.destaque,
            }}
          />
          <Text style={{ fontWeight: 700, color: modo.destaque }}>R$ 8,00</Text>
        </View>
      </View>
    ))}
  </View>
);

const DEMOS = {
  "ponto-de-partida": DemoAnatomia,
  paleta: DemoPaleta,
  tipografia: DemoTipografia,
  cardapio: DemoCardapio,
  formas: DemoFormas,
  componentes: DemoComponentes,
  marca: DemoMarca,
  movimento: DemoMovimento,
  acessibilidade: DemoAcessibilidade,
  papel: DemoPapel,
};

/* ---------- Documento ---------- */

const DesignSystemPdf = () => (
  <Document
    title={`${DS_INFO.nome} ${DS_INFO.versao}`}
    author="AraCoffee"
    subject="Cores, fontes, componentes e a história do layout do site da AraCoffee"
    keywords="AraCoffee, design system, React, Vite"
    language="pt-BR"
  >
    {/* Capa escura: o mesmo espresso do site */}
    <Page size="A4" style={s.capa}>
      <View style={{ flexGrow: 1, paddingHorizontal: 56, paddingTop: 64 }}>
        <Xicara tamanho={52} />
        <Text style={{ marginTop: 140, fontSize: 13, fontWeight: 700, color: C.caramelo }}>AraCoffee</Text>
        <Text style={[s.display, { fontSize: 58, lineHeight: 1.05, color: C.crema, marginTop: 4 }]}>Design system</Text>
        <Text style={{ marginTop: 18, maxWidth: 360, fontSize: 13, lineHeight: 1.5, color: C["crema-suave"] }}>
          As cores, fontes e peças do site, contadas na ordem em que o layout foi pensado: do balcão escuro à folha
          impressa.
        </Text>
        <Text style={{ marginTop: 26, fontSize: 10, color: C["crema-suave"] }}>
          Versão {DS_INFO.versao}, {DS_INFO.atualizado}
        </Text>
      </View>
      {/* A régua de torra, de ponta a ponta da folha */}
      <View style={{ flexDirection: "row", height: 150 }}>
        {PALETA.map((cor) => {
          const escura = contraste(cor.hex, C.espresso) > 6;
          return (
            <View key={cor.variavel} style={{ flex: 1, backgroundColor: cor.hex, justifyContent: "flex-end", padding: 7 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 700, lineHeight: 1.2, color: escura ? C.espresso : C.crema }}>
                {cor.nome}
              </Text>
              <Text style={{ fontSize: 6.5, color: escura ? C.espresso : C["crema-suave"] }}>{cor.hex}</Text>
            </View>
          );
        })}
      </View>
    </Page>

    {/* Miolo claro: sumário, capítulos e registro */}
    <Page size="A4" style={s.pagina} wrap>
      <Rodape />

      <Text style={s.tituloCapitulo}>Capítulos</Text>
      <Text style={[s.paragrafo, { marginBottom: 14 }]}>
        Cada capítulo conta uma decisão do layout e o porquê dela, seguida das peças que saíram dessa decisão.
      </Text>
      {CAPITULOS.map((capitulo, i) => (
        <Link key={capitulo.id} src={`#${capitulo.id}`} style={{ textDecoration: "none", color: TINTA }}>
          <View style={{ flexDirection: "row", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: FIO }}>
            <Text style={{ width: 24, fontWeight: 700, color: "#9A6232" }}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 700, fontSize: 11.5 }}>{capitulo.titulo}</Text>
              <Text style={{ fontSize: 9.5, color: TINTA_SUAVE }}>{capitulo.decisao}</Text>
            </View>
          </View>
        </Link>
      ))}
      <Link src="#registro" style={{ textDecoration: "none", color: TINTA }}>
        <View style={{ flexDirection: "row", paddingVertical: 7 }}>
          <Text style={{ width: 24 }}> </Text>
          <Text style={{ fontWeight: 700, fontSize: 11.5 }}>Registro de decisões</Text>
        </View>
      </Link>

      {CAPITULOS.map((capitulo, i) => {
        const Demo = DEMOS[capitulo.id];
        return (
          <View key={capitulo.id} id={capitulo.id} break>
            <View wrap={false}>
              <Text style={s.numeroCapitulo}>Capítulo {i + 1}</Text>
              <Text style={s.tituloCapitulo}>{capitulo.titulo}</Text>
              <Text style={s.decisao}>{capitulo.decisao}</Text>
            </View>
            {capitulo.texto.map((paragrafo) => (
              <Text key={paragrafo.slice(0, 24)} style={s.paragrafo}>
                {paragrafo}
              </Text>
            ))}
            {Demo && <Demo />}
          </View>
        );
      })}

      <View id="registro" break>
        <Text style={s.tituloCapitulo}>Registro de decisões</Text>
        <View style={{ marginTop: 14 }}>
          {REGISTRO.map((item) => (
            <View
              key={item.titulo}
              style={{ flexDirection: "row", paddingVertical: 9, borderBottomWidth: 1.5, borderBottomStyle: "dotted", borderBottomColor: TINTA_SUAVE }}
              wrap={false}
            >
              <Text style={{ width: 40, fontWeight: 700, color: "#9A6232" }}>v{item.versao}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 700 }}>{item.titulo}</Text>
                <Text style={{ fontSize: 9.5, color: TINTA_SUAVE }}>{item.texto}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={[s.legenda, { marginTop: 18 }]}>
          A versão viva deste documento fica na página /design do site, gerada dos mesmos dados
          (src/config/designSystem.js).
        </Text>
      </View>
    </Page>
  </Document>
);

export default DesignSystemPdf;
