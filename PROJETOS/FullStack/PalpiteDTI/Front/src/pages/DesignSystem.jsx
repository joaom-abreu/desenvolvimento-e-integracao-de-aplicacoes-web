import { useState } from "react";
import { CORES, CORES_RESULTADO, DECISOES, ESCALA_TIPO, PARES_CONTRASTE, RAIOS } from "../config/designSystem.js";
import { nivelWcag, razaoContraste } from "../utils/contraste.js";
import Kpi from "../components/Kpi.jsx";
import Mensagem from "../components/Mensagem.jsx";
import Tabuleiro from "../components/Tabuleiro/Tabuleiro.jsx";
import HistoricoPalpites from "../components/HistoricoPalpites.jsx";
import GraficoBarras from "../components/GraficoBarras/GraficoBarras.jsx";
import { ClassificacaoSelo, ResultadoSelo, RoboSelo } from "../components/Selos.jsx";
import "./DesignSystem.scss";

const PALPITES_EXEMPLO = [
  { ordem: 1, numero: 50, resultado: "MAIOR" },
  { ordem: 2, numero: 25, resultado: "MENOR" },
  { ordem: 3, numero: 37, resultado: "MAIOR" },
];

const CAPITULOS = [
  ["origem", "De onde veio"],
  ["cores", "Cores"],
  ["resultados", "Respostas do juiz"],
  ["tipografia", "Tipografia"],
  ["formas", "Formas"],
  ["componentes", "Componentes"],
  ["tabuleiro", "O tabuleiro"],
  ["css", "SCSS e PostCSS"],
  ["acessibilidade", "Acessibilidade"],
  ["decisoes", "Registro de decisões"],
];

/** Página /design: a identidade visual contada como uma história de decisões. */
export default function DesignSystem() {
  const [copiado, setCopiado] = useState(null);

  async function copiar(variavel) {
    try {
      await navigator.clipboard.writeText(`var(${variavel})`);
      setCopiado(variavel);
      setTimeout(() => setCopiado(null), 1600);
    } catch {
      /* navegador sem permissão de área de transferência */
    }
  }

  return (
    <div className="ds">
      <header className="ds-capa">
        <div className="ds-capa-texto">
          <img src="/dti-logo-branco.png" alt="dti" width="84" height="64" />
          <h1>Design system</h1>
          <p>
            Como a identidade da dti virou um jogo de adivinhação: cores, letras, formas e as peças que nasceram delas.
          </p>
          <button className="botao ds-botao-pdf nao-imprimir" onClick={() => window.print()}>
            Salvar em PDF
          </button>
        </div>
        <div className="ds-formas" aria-hidden="true">
          <span className="haste haste-1" />
          <span className="haste haste-2" />
          <span className="pingo-grande" />
        </div>
      </header>

      <div className="pagina ds-corpo">
        <nav className="ds-indice nao-imprimir" aria-label="Capítulos">
          <ol>
            {CAPITULOS.map(([id, titulo]) => (
              <li key={id}>
                <a href={`#${id}`}>{titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="ds-capitulos">
          <section id="origem" className="painel">
            <h2>1. De onde veio</h2>
            <p>
              O ponto de partida foi o mesmo do DronesDTI: o material do processo seletivo, com capas em azul dti e logo
              em ciano, páginas internas em cinza-papel, destaques em laranja e formas de pílula e círculo que repetem as
              hastes e o pingo do “dti”.
            </p>
            <p>
              Aqui, a capa virou o tabuleiro: cem círculos (cem “pingos”) sobre o azul da marca. O ciano passa a
              significar “ainda pode ser”, e o resto apaga conforme o juiz responde.
            </p>
            <div className="ds-logos">
              <figure className="ds-logo ds-logo-escuro">
                <img src="/dti-logo-branco.png" alt="Logo dti branco" />
                <figcaption>Sobre azul dti: branco ou ciano</figcaption>
              </figure>
              <figure className="ds-logo">
                <img src="/dti-logo-azul.png" alt="Logo dti azul" />
                <figcaption>Sobre papel: azul dti</figcaption>
              </figure>
              <figure className="ds-logo ds-logo-escuro">
                <img src="/dti-logo-ciano.png" alt="Logo dti ciano" />
                <figcaption>Ciano: só em destaque</figcaption>
              </figure>
            </div>
          </section>

          <section id="cores" className="painel">
            <h2>2. Cores</h2>
            <p className="apoio">Clique em uma cor para copiar a variável CSS.</p>
            <ul className="ds-cores">
              {CORES.map((c) => (
                <li key={c.variavel}>
                  <button type="button" onClick={() => copiar(c.variavel)} className="ds-amostra" style={{ background: c.hex }}>
                    <span className="somente-leitor">Copiar {c.variavel}</span>
                  </button>
                  <div>
                    <strong>{c.nome}</strong>
                    <code>{copiado === c.variavel ? "copiado!" : c.variavel}</code>
                    <code>{c.hex}</code>
                    <p className="apoio">{c.uso}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="resultados" className="painel">
            <h2>3. Respostas do juiz</h2>
            <p>
              Cada resposta tem uma cor e uma seta. A cor ajuda a ler o tabuleiro de relance; a seta diz a mesma coisa
              para quem não distingue cores: ↓ “o número é menor”, ↑ “o número é maior”.
            </p>
            <div className="ds-estados">
              {CORES_RESULTADO.map((r) => (
                <div key={r.nome} className="ds-estado">
                  <span className="ds-estado-cor" style={{ background: r.hex }} />
                  {r.resultado ? <ResultadoSelo resultado={r.resultado} /> : <span className="selo">{r.nome}</span>}
                  <code>
                    {r.variavel} {r.hex}
                  </code>
                </div>
              ))}
            </div>
          </section>

          <section id="tipografia" className="painel">
            <h2>4. Tipografia</h2>
            <p>
              <strong>Red Hat Display</strong> nos títulos e números, como nos slides da dti. <strong>Red Hat Text</strong>{" "}
              no texto corrido. O maior texto do site é o número sorteado, quando enfim aparece.
            </p>
            <table className="ds-tipos">
              <tbody>
                {ESCALA_TIPO.map((t) => (
                  <tr key={t.nome}>
                    <th scope="row">
                      {t.nome}
                      <span className="apoio">
                        {t.familia} {t.peso}, {t.tamanho}
                      </span>
                    </th>
                    <td style={{ fontFamily: `"${t.familia}"`, fontWeight: t.peso, fontSize: t.tamanho, lineHeight: 1.15 }}>
                      {t.exemplo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="formas" className="painel">
            <h2>5. Formas</h2>
            <p>
              A pílula vem das hastes do logo e vira botão, selo e a faixa possível. O círculo vem do pingo do “i” e vira
              cada número do tabuleiro.
            </p>
            <div className="ds-raios">
              {RAIOS.map((r) => (
                <div key={r.nome} className="ds-raio">
                  <div style={{ borderRadius: r.valor, aspectRatio: r.nome === "Círculo" ? "1" : undefined, width: r.nome === "Círculo" ? 64 : undefined }} />
                  <strong>{r.nome}</strong>
                  <code>
                    {r.variavel}: {r.valor}
                  </code>
                  <span className="apoio">{r.uso}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="componentes" className="painel">
            <h2>6. Componentes</h2>
            <h3>Botões</h3>
            <div className="acoes">
              <button className="botao botao-grande">Chutar</button>
              <button className="botao">Começar rodada</button>
              <button className="botao botao-secundario">Ver ranking</button>
              <button className="botao botao-perigo botao-pequeno">Desistir e ver o número</button>
              <button className="botao" disabled>
                Enviando…
              </button>
            </div>
            <h3 className="ds-sub">Selos</h3>
            <div className="acoes">
              <ResultadoSelo resultado="MAIOR" />
              <ResultadoSelo resultado="MENOR" />
              <ResultadoSelo resultado="ACERTOU" />
              <ClassificacaoSelo classificacao="EXCELENTE" />
              <RoboSelo />
            </div>
            <h3 className="ds-sub">Campo</h3>
            <div className="ds-campos">
              <div className="campo">
                <label htmlFor="ds-ok">Seu palpite (1 a 100)</label>
                <input id="ds-ok" defaultValue="42" />
                <span className="ajuda-campo">Digite e aperte Enter.</span>
              </div>
              <div className="campo" data-invalido="true">
                <label htmlFor="ds-erro">Seu palpite (1 a 100)</label>
                <input id="ds-erro" defaultValue="150" aria-invalid="true" />
                <span className="erro-campo">Escolha um número entre 1 e 100.</span>
              </div>
            </div>
            <h3 className="ds-sub">Mensagens</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <Mensagem tipo="info">50 é maior que o número sorteado. Tente um número menor.</Mensagem>
              <Mensagem tipo="aviso">Esse palpite não ajudou: pelas respostas anteriores, o número está entre 26 e 36.</Mensagem>
              <Mensagem tipo="sucesso">Acertou! O número era 31 e você precisou de 5 tentativas.</Mensagem>
              <Mensagem tipo="erro">Você já tentou o número 50 nesta partida. Escolha outro.</Mensagem>
            </div>
            <h3 className="ds-sub">Indicadores, histórico e gráfico</h3>
            <div className="ds-lado">
              <div className="kpis" style={{ margin: 0 }}>
                <Kpi valor="3" rotulo="tentativas" destaque />
                <Kpi valor="11" rotulo="números possíveis" />
              </div>
              <HistoricoPalpites palpites={PALPITES_EXEMPLO} />
              <GraficoBarras
                titulo="Tentativas até acertar"
                dados={[1, 2, 3, 4, 5, 6, 7, 8].map((t) => ({ rotulo: String(t), valor: [1, 1, 3, 5, 8, 9, 6, 2][t - 1] }))}
                referencia={{ rotulo: "7", texto: "limite: 7" }}
              />
            </div>
          </section>

          <section id="tabuleiro" className="painel">
            <h2>7. O tabuleiro</h2>
            <p>
              Dez por dez, um círculo por número. Depois de “50 é maior”, “25 é menor” e “37 é maior”, só sobram 26 a 36
              em ciano. A faixa no topo mostra o mesmo em uma linha, e o último palpite ganha um anel branco.
            </p>
            <div style={{ maxWidth: 520 }}>
              <Tabuleiro palpites={PALPITES_EXEMPLO} possivel={{ minimo: 26, maximo: 36 }} />
            </div>
          </section>

          <section id="css" className="painel">
            <h2>8. SCSS e PostCSS</h2>
            <p>
              Os estilos são escritos em <strong>SCSS</strong> (pré-processador): <code>_tokens.scss</code> guarda as
              variáveis, <code>_mixins.scss</code> guarda receitas como <code>@include ate(tablet)</code> e{" "}
              <code>@include pilula</code>, e cada componente tem seu <code>.scss</code> ao lado do <code>.jsx</code>.
            </p>
            <p>
              Depois do Sass, o <strong>PostCSS</strong> (pós-processador) roda o <strong>Autoprefixer</strong>, que
              acrescenta prefixos de navegador só onde a lista <code>browserslist</code> do <code>package.json</code>{" "}
              ainda precisa.
            </p>
            <pre className="ds-codigo">{`// src/styles/_mixins.scss
@mixin ate($tela) {
  @media (max-width: map.get(tokens.$telas, $tela)) { @content; }
}

// uso, em qualquer componente
.grade-2 {
  @include ate(tablet) { grid-template-columns: 1fr; }
}`}</pre>
          </section>

          <section id="acessibilidade" className="painel">
            <h2>9. Acessibilidade</h2>
            <p>
              Contraste calculado pela fórmula da WCAG 2.1 (texto comum pede 4,5:1). Foco visível em azul elétrico, HTML
              semântico (header, nav, main, section, form, label, ol, table, figure), mensagens do juiz anunciadas com{" "}
              <code>aria-live</code> e gráficos com tabela equivalente para leitores de tela.
            </p>
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Exemplo</th>
                    <th>Onde</th>
                    <th className="numero">Contraste</th>
                    <th>WCAG</th>
                  </tr>
                </thead>
                <tbody>
                  {PARES_CONTRASTE.map((p) => {
                    const razao = razaoContraste(p.texto, p.fundo);
                    return (
                      <tr key={p.onde}>
                        <td>
                          <span className="ds-par" style={{ color: p.texto, background: p.fundo }}>
                            42
                          </span>
                        </td>
                        <td>{p.onde}</td>
                        <td className="numero">{razao.toFixed(1).replace(".", ",")}:1</td>
                        <td>{nivelWcag(razao)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section id="decisoes" className="painel">
            <h2>10. Registro de decisões</h2>
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Versão</th>
                    <th>Decisão</th>
                    <th>Por quê</th>
                  </tr>
                </thead>
                <tbody>
                  {DECISOES.map((d) => (
                    <tr key={d.decisao}>
                      <td>{d.versao}</td>
                      <td>{d.decisao}</td>
                      <td>{d.porque}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
