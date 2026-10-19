import { useState } from "react";
import { PiCoffeeFill, PiDownloadSimpleBold } from "react-icons/pi";
import logo from "../assets/images/logo-aracoffee.svg";
import MenuItem from "../components/MenuItem";
import Message from "../components/Message";
import Selo from "../components/Selo";
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
import "./DesignSystem.css";

/** Produtos de exemplo para mostrar a linha do cardápio sem depender da API */
const PRODUTOS_EXEMPLO = [
  {
    id: "ex-1",
    nome: "Espresso da casa",
    descricao: "Blend do Sul de Minas, torra média, notas de chocolate e caramelo.",
    preco: 7,
    destaque: true,
    disponivel: true,
  },
  { id: "ex-2", nome: "Cappuccino", descricao: "Espresso, leite vaporizado e canela.", preco: 12.5, disponivel: true },
  { id: "ex-3", nome: "Bolo de fubá", descricao: "Fatia da fornada da manhã.", preco: 9, disponivel: false },
];

const prefereMenosMovimento =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------- Demonstrações de cada capítulo ---------- */

/** Anatomia da página: o "esqueleto" que todas as rotas seguem */
const DemoAnatomia = () => (
  <figure className="ds-demo">
    <div className="ds-anatomia" aria-hidden="true">
      <div className="ds-anatomia-cabecalho">
        <span className="ds-anatomia-logo"></span>
        <span className="ds-anatomia-menu">
          <i></i>
          <i></i>
          <i className="ativo"></i>
          <i></i>
        </span>
      </div>
      <div className="ds-anatomia-banner">
        <span className="ds-anatomia-titulo"></span>
        <span className="ds-anatomia-linha"></span>
      </div>
      <div className="ds-anatomia-corpo">
        <div className="ds-anatomia-painel">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="ds-anatomia-foto"></div>
      </div>
      <div className="ds-anatomia-rodape"></div>
    </div>
    <figcaption>
      Toda página segue o mesmo esqueleto: cabeçalho fixo com a logo, banner com foto escura à esquerda (onde fica o
      título), conteúdo em até 1120px e o rodapé com o status do servidor.
    </figcaption>
  </figure>
);

const DemoPaleta = () => (
  <div className="ds-demo">
    <div className="ds-tabela-rolagem">
      <table className="ds-tabela">
        <caption className="visualmente-oculto">Cores da paleta</caption>
        <thead>
          <tr>
            <th scope="col">Cor</th>
            <th scope="col">Variável</th>
            <th scope="col">Hex</th>
            <th scope="col">Onde aparece</th>
          </tr>
        </thead>
        <tbody>
          {PALETA.map((cor) => (
            <tr key={cor.variavel}>
              <th scope="row">
                <span className="ds-amostra-mini" style={{ background: cor.hex }}></span>
                {cor.nome}
              </th>
              <td>
                <code>var({cor.variavel})</code>
              </td>
              <td>
                <code>{cor.hex}</code>
              </td>
              <td>{cor.papel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3 className="ds-subtitulo">Cores de estado</h3>
    <ul className="ds-estados">
      {ESTADOS.map((estado) => (
        <li key={estado.variavel}>
          <span className="ds-estado-ponto" style={{ background: estado.hex }}></span>
          <span>
            <strong>{estado.nome}</strong>
            <code>var({estado.variavel})</code>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const DemoTipografia = () => (
  <div className="ds-demo">
    <div className="ds-fontes">
      {FONTES.map((fonte) => (
        <article key={fonte.nome} className={`ds-fonte ds-fonte-${fonte.nome.toLowerCase()}`}>
          <p className="ds-fonte-amostra">{fonte.amostra}</p>
          <p className="ds-fonte-alfabeto">Aa Bb Cc Çç Ãã Éé 0123456789 R$</p>
          <dl className="ds-ficha">
            <div>
              <dt>Fonte</dt>
              <dd>{fonte.nome}</dd>
            </div>
            <div>
              <dt>Pesos</dt>
              <dd>{fonte.pesos}</dd>
            </div>
            <div>
              <dt>Uso</dt>
              <dd>{fonte.papel}</dd>
            </div>
            <div>
              <dt>Variável</dt>
              <dd>
                <code>var({fonte.variavel})</code>
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>

    <h3 className="ds-subtitulo">Escala</h3>
    <ol className="ds-escala">
      {ESCALA_TIPO.map((nivel) => (
        <li key={nivel.classe}>
          <span
            className="ds-escala-amostra"
            style={{
              fontFamily: nivel.fonte === "Shrikhand" ? "var(--fonte-display)" : "var(--fonte-texto)",
              fontSize: `${Math.min(nivel.px, 44)}px`,
              lineHeight: nivel.linha,
            }}
          >
            Coração Eucarístico
          </span>
          <span className="ds-escala-ficha">
            <code>{nivel.classe}</code> {nivel.fonte}, {nivel.tamanho}, entrelinha {nivel.linha}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

const DemoCardapio = () => (
  <div className="ds-demo painel ds-demo-cardapio">
    <ul className="lista-cardapio">
      {PRODUTOS_EXEMPLO.map((produto) => (
        <MenuItem key={produto.id} produto={produto} />
      ))}
    </ul>
    <p className="ds-legenda">
      Componente <code>MenuItem</code>. O grão caramelo marca o destaque, o riscado marca o esgotado.
    </p>
  </div>
);

const DemoFormas = () => (
  <div className="ds-demo">
    <ul className="ds-raios">
      {RAIOS.map((raio) => (
        <li key={raio.nome}>
          <span className="ds-raio-forma" style={{ borderRadius: raio.valor }}></span>
          <strong>
            {raio.nome}, {raio.valor}
          </strong>
          <span>{raio.uso}</span>
        </li>
      ))}
    </ul>

    <h3 className="ds-subtitulo">Medidas</h3>
    <dl className="ds-medidas">
      {MEDIDAS.map((m) => (
        <div key={m.nome}>
          <dt>{m.nome}</dt>
          <dd>
            <code>{m.valor}</code>
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

const DemoComponentes = () => (
  <div className="ds-demo ds-componentes">
    <section className="ds-peca" aria-labelledby="peca-botoes">
      <h3 id="peca-botoes" className="ds-subtitulo">
        Botões
      </h3>
      <div className="ds-linha-pecas">
        <button type="button" className="btn btn-primario">
          Ver cardápio
        </button>
        <button type="button" className="btn btn-secundario">
          Como chegar
        </button>
        <button type="button" className="btn btn-perigo btn-pequeno">
          Excluir
        </button>
        <button type="button" className="btn btn-primario" disabled>
          Salvando…
        </button>
      </div>
      <p className="ds-legenda">
        <code>.btn-primario</code> para a ação principal da tela (uma por tela), <code>.btn-secundario</code> para a
        alternativa, <code>.btn-perigo</code> para excluir.
      </p>
    </section>

    <section className="ds-peca" aria-labelledby="peca-campos">
      <h3 id="peca-campos" className="ds-subtitulo">
        Campos
      </h3>
      <div className="ds-grade-campos">
        <label className="campo">
          <span>Nome do produto</span>
          <input type="text" placeholder="Ex.: Café coado" />
          <small className="campo-dica">Como aparece no cardápio.</small>
        </label>
        <label className="campo">
          <span>Categoria</span>
          <select defaultValue="Cafés">
            <option>Cafés</option>
            <option>Bebidas geladas</option>
            <option>Comidas</option>
          </select>
        </label>
        <label className="campo-marcar">
          <input type="checkbox" defaultChecked />
          Disponível hoje
        </label>
      </div>
    </section>

    <section className="ds-peca" aria-labelledby="peca-mensagens">
      <h3 id="peca-mensagens" className="ds-subtitulo">
        Mensagens
      </h3>
      <div className="ds-pilha">
        <Message type="success" title="Produto salvo.">
          Cappuccino já aparece no cardápio.
        </Message>
        <Message type="error" title="Não foi possível salvar">
          Informe um preço maior que zero (ex.: 8.50).
        </Message>
        <Message type="info" title="Envio ainda não configurado">
          Preencha as chaves do EmailJS no arquivo .env.
        </Message>
      </div>
    </section>

    <section className="ds-peca" aria-labelledby="peca-status">
      <h3 id="peca-status" className="ds-subtitulo">
        Status do servidor
      </h3>
      <ul className="ds-status">
        <li className="rodape-status rodape-status-online">
          <span className="rodape-status-ponto" aria-hidden="true"></span>
          Servidor do cardápio: conectado
        </li>
        <li className="rodape-status">
          <span className="rodape-status-ponto" aria-hidden="true"></span>
          Servidor do cardápio: conectando…
        </li>
        <li className="rodape-status rodape-status-offline">
          <span className="rodape-status-ponto" aria-hidden="true"></span>
          Servidor do cardápio: sem resposta
        </li>
      </ul>
    </section>
  </div>
);

const DemoMarca = () => (
  <div className="ds-demo ds-marca">
    <figure className="ds-marca-item">
      <Selo className="ds-marca-selo" />
      <figcaption>Selo (componente Selo)</figcaption>
    </figure>

    <figure className="ds-marca-item">
      <img src={logo} alt="Logo horizontal da AraCoffee" width="200" height="53" className="ds-marca-logo" />
      <figcaption>Logo do cabeçalho</figcaption>
    </figure>

    <figure className="ds-marca-item">
      <div className="ds-aba" aria-hidden="true">
        <span className="ds-aba-icone">
          <PiCoffeeFill />
        </span>
        <span className="ds-aba-titulo">AraCoffee | Cafeteria no Coração…</span>
      </div>
      <figcaption>
        Ícone da aba: <code>PiCoffeeFill</code> de <code>react-icons/pi</code>
      </figcaption>
    </figure>
  </div>
);

const DemoMovimento = () => (
  <div className="ds-demo">
    <Message type="info" title={prefereMenosMovimento ? "Neste navegador, a fumaça está desligada." : "Neste navegador, a fumaça está ligada."}>
      {prefereMenosMovimento
        ? "O sistema pediu para reduzir movimento, então o Splash Cursor não é carregado."
        : "Passe o mouse pela página para ver o vapor. Com \"reduzir movimento\" ativado no sistema, ele não aparece."}
    </Message>
  </div>
);

const DemoAcessibilidade = () => (
  <div className="ds-demo">
    <div className="ds-tabela-rolagem">
      <table className="ds-tabela">
        <caption className="visualmente-oculto">Contraste dos pares de cores</caption>
        <thead>
          <tr>
            <th scope="col">Amostra</th>
            <th scope="col">Uso</th>
            <th scope="col">Contraste</th>
            <th scope="col">WCAG</th>
          </tr>
        </thead>
        <tbody>
          {PARES_CONTRASTE.map((par) => {
            const razao = contraste(par.texto, par.fundo);
            return (
              <tr key={par.uso}>
                <th scope="row">
                  <span className="ds-par" style={{ color: par.texto, background: par.fundo }}>
                    Aa
                  </span>
                </th>
                <td>{par.uso}</td>
                <td>
                  <code>{formatarRazao(razao)}</code>
                </td>
                <td>{nivelWcag(razao)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <p className="ds-legenda">Os números são calculados na hora por src/utils/contraste.js, com a fórmula da WCAG 2.1.</p>
  </div>
);

const DemoPapel = ({ onBaixar, gerando }) => (
  <div className="ds-demo ds-papel">
    <div className="ds-papel-folhas" aria-hidden="true">
      <div className="ds-folha ds-folha-capa">
        <span className="ds-folha-icone">
          <PiCoffeeFill />
        </span>
        <span className="ds-folha-titulo">Design system</span>
        <span className="ds-folha-linha"></span>
      </div>
      <div className="ds-folha ds-folha-miolo">
        <span className="ds-folha-titulo">Do grão à crema</span>
        <span className="ds-folha-linha"></span>
        <span className="ds-folha-linha curta"></span>
        <span className="ds-folha-cores">
          {PALETA.slice(2, 7).map((cor) => (
            <i key={cor.hex} style={{ background: cor.hex }}></i>
          ))}
        </span>
      </div>
    </div>
    <button type="button" className="btn btn-secundario" onClick={onBaixar} disabled={gerando}>
      <PiDownloadSimpleBold aria-hidden="true" />
      {gerando ? "Gerando o PDF…" : "Baixar em PDF"}
    </button>
  </div>
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

/* ---------- Página ---------- */

/** /design: o design system da AraCoffee contado como a história do layout */
const DesignSystem = () => {
  const [gerando, setGerando] = useState(false);
  const [erroPdf, setErroPdf] = useState("");
  const [copiado, setCopiado] = useState("");

  // O @react-pdf/renderer é pesado: só é baixado quando alguém clica no botão
  const baixarPdf = async () => {
    setGerando(true);
    setErroPdf("");
    try {
      const { baixarDesignSystemPdf } = await import("../pdf/baixarDesignSystemPdf");
      await baixarDesignSystemPdf();
    } catch (e) {
      console.error(e);
      setErroPdf("O PDF não foi gerado. Recarregue a página e clique em Baixar em PDF de novo.");
    } finally {
      setGerando(false);
    }
  };

  const copiar = async (cor) => {
    try {
      await navigator.clipboard.writeText(`var(${cor.variavel})`);
      setCopiado(`var(${cor.variavel}) copiado.`);
    } catch {
      setCopiado(`Copie à mão: var(${cor.variavel})`);
    }
  };

  return (
    <div className="ds">
      <header className="ds-abertura">
        <div className="ds-abertura-interno">
          <h1 className="titulo-pagina">Design system</h1>
          <p className="texto-apoio">
            As cores, fontes e peças do site da AraCoffee, contadas na ordem em que o layout foi pensado: do balcão
            escuro à folha impressa.
          </p>
          <div className="ds-abertura-acoes">
            <button type="button" className="btn btn-primario" onClick={baixarPdf} disabled={gerando}>
              <PiDownloadSimpleBold aria-hidden="true" />
              {gerando ? "Gerando o PDF…" : "Baixar em PDF"}
            </button>
            <p className="ds-versao">
              Versão {DS_INFO.versao}, {DS_INFO.atualizado}
            </p>
          </div>
          {erroPdf && (
            <div className="ds-abertura-erro">
              <Message type="error" title="O PDF não saiu">
                {erroPdf}
              </Message>
            </div>
          )}
        </div>

        {/* A régua de torra: o elemento que resume a identidade inteira */}
        <div className="ds-torra" role="group" aria-label="Paleta na ordem da torra. Clique em uma cor para copiar a variável CSS.">
          {PALETA.map((cor) => (
            <button
              key={cor.variavel}
              type="button"
              className="ds-torra-cor"
              style={{ "--cor": cor.hex, "--cor-texto": contraste(cor.hex, "#1E130D") > 6 ? "#1E130D" : "#F1E3CF" }}
              onClick={() => copiar(cor)}
            >
              <span className="ds-torra-nome">{cor.nome}</span>
              <span className="ds-torra-hex">{cor.hex}</span>
            </button>
          ))}
        </div>
        <p className="ds-torra-aviso" role="status" aria-live="polite">
          {copiado}
        </p>
      </header>

      <div className="ds-corpo">
        <nav className="ds-sumario" aria-labelledby="sumario-titulo">
          <h2 id="sumario-titulo">Capítulos</h2>
          <ol>
            {CAPITULOS.map((capitulo) => (
              <li key={capitulo.id}>
                <a href={`#${capitulo.id}`}>{capitulo.titulo}</a>
              </li>
            ))}
            <li className="ds-sumario-extra">
              <a href="#registro">Registro de decisões</a>
            </li>
          </ol>
        </nav>

        <div className="ds-capitulos">
          {CAPITULOS.map((capitulo, indice) => {
            const Demo = DEMOS[capitulo.id];
            return (
              <section key={capitulo.id} id={capitulo.id} className="ds-capitulo" aria-labelledby={`${capitulo.id}-titulo`}>
                <p className="ds-capitulo-numero">Capítulo {indice + 1}</p>
                <h2 id={`${capitulo.id}-titulo`} className="titulo-secao">
                  {capitulo.titulo}
                </h2>
                <p className="ds-decisao">{capitulo.decisao}</p>
                <div className="ds-texto">
                  {capitulo.texto.map((paragrafo) => (
                    <p key={paragrafo.slice(0, 24)}>{paragrafo}</p>
                  ))}
                </div>
                {Demo && <Demo onBaixar={baixarPdf} gerando={gerando} />}
              </section>
            );
          })}

          <section id="registro" className="ds-capitulo" aria-labelledby="registro-titulo">
            <h2 id="registro-titulo" className="titulo-secao">
              Registro de decisões
            </h2>
            <ol className="ds-registro">
              {REGISTRO.map((item) => (
                <li key={item.titulo}>
                  <span className="ds-registro-versao">v{item.versao}</span>
                  <div>
                    <strong>{item.titulo}</strong>
                    <p>{item.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DesignSystem;
