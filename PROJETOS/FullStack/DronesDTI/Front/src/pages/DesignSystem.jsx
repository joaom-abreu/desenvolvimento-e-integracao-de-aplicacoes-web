import { useState } from "react";
import { CORES, CORES_ESTADO, DECISOES, ESCALA_TIPO, PARES_CONTRASTE, RAIOS } from "../config/designSystem.js";
import { nivelWcag, razaoContraste } from "../utils/contraste.js";
import Bateria from "../components/Bateria.jsx";
import Kpi from "../components/Kpi.jsx";
import Mensagem from "../components/Mensagem.jsx";
import DroneLista from "../components/DroneLista.jsx";
import MapaAereo from "../components/MapaAereo/MapaAereo.jsx";
import { EstadoSelo, PrioridadeSelo } from "../components/Selos.jsx";
import "./DesignSystem.css";

const DRONE_EXEMPLO = {
  id: "ex",
  nome: "Falcão",
  estado: "EM_VOO",
  bateria: 64,
  cargaKg: 6.5,
  capacidadeKg: 10,
  pacotes: 3,
  entregasRealizadas: 41,
  viagemAtualId: "v",
  progressoPercentual: 45,
  proximaParada: "Marina",
};

const CAPITULOS = [
  ["origem", "De onde veio"],
  ["cores", "Cores"],
  ["estados", "Estados do drone"],
  ["tipografia", "Tipografia"],
  ["formas", "Formas"],
  ["componentes", "Componentes"],
  ["mapa", "O mapa aéreo"],
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
            Como a identidade da dti virou a interface de um centro de operações de drones: cores, letras, formas e as
            peças que nasceram delas.
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
              O ponto de partida foi o material do próprio processo seletivo: capas em azul dti com o logo em ciano,
              páginas internas em cinza-papel, números grandes em laranja e formas de pílula e círculo que repetem as
              hastes e o pingo do “dti”.
            </p>
            <p>
              A decisão central foi transformar a capa em espaço aéreo: o mapa da cidade é desenhado sobre o azul da
              marca, e o ciano passa a significar “no ar”.
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

          <section id="estados" className="painel">
            <h2>3. Estados do drone</h2>
            <p>
              Cada estado da máquina de estados tem uma cor própria, usada no mapa, nos cartões e nos selos. O ciclo é
              Parado → Carregando → Em voo → Entregando → Retornando → Parado (ou Recarregando).
            </p>
            <div className="ds-estados">
              {CORES_ESTADO.map((e) => (
                <div key={e.estado} className="ds-estado">
                  <span className="ds-estado-cor" style={{ background: e.hex }} />
                  <EstadoSelo estado={e.estado} />
                  <code>{e.hex}</code>
                </div>
              ))}
            </div>
          </section>

          <section id="tipografia" className="painel">
            <h2>4. Tipografia</h2>
            <p>
              <strong>Red Hat Display</strong> nos títulos e números, como nos slides da dti. <strong>Red Hat Text</strong>{" "}
              no texto corrido, mais legível em tamanhos pequenos. As duas vêm do pacote Fontsource e são servidas pelo
              próprio site.
            </p>
            <table className="ds-tipos">
              <tbody>
                {ESCALA_TIPO.map((t) => (
                  <tr key={t.nome}>
                    <th scope="row">
                      {t.nome}
                      <span className="apoio">
                        {t.familia} {t.peso} · {t.tamanho}
                      </span>
                    </th>
                    <td
                      style={{
                        fontFamily: `"${t.familia}"`,
                        fontWeight: t.peso,
                        fontSize: t.tamanho,
                        lineHeight: 1.15,
                      }}
                    >
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
              Três raios para a interface inteira. A pílula, que vem das hastes do logo, é a forma de tudo que se aperta
              ou se lê de relance: botões, selos e barras.
            </p>
            <div className="ds-raios">
              {RAIOS.map((r) => (
                <div key={r.nome} className="ds-raio">
                  <div style={{ borderRadius: r.valor }} />
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
              <button className="botao">Adicionar à fila</button>
              <button className="botao botao-secundario">Despachar agora</button>
              <button className="botao botao-perigo">Cancelar</button>
              <button className="botao" disabled>
                Enviando…
              </button>
            </div>
            <h3 className="ds-sub">Selos</h3>
            <div className="acoes">
              <PrioridadeSelo prioridade="ALTA" />
              <PrioridadeSelo prioridade="MEDIA" />
              <PrioridadeSelo prioridade="BAIXA" />
              <EstadoSelo estado="EM_VOO" />
            </div>
            <h3 className="ds-sub">Campo</h3>
            <div className="linha-campos" style={{ maxWidth: 520 }}>
              <div className="campo">
                <label htmlFor="ds-x">x (km)</label>
                <input id="ds-x" defaultValue="12,5" />
              </div>
              <div className="campo" data-invalido="true">
                <label htmlFor="ds-peso">Peso (kg)</label>
                <input id="ds-peso" defaultValue="0" />
                <span className="erro-campo">Maior que zero.</span>
              </div>
            </div>
            <h3 className="ds-sub">Mensagens</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <Mensagem tipo="sucesso">Pedido de Ana entrou na fila.</Mensagem>
              <Mensagem tipo="erro">O pacote de 18,00 kg excede a capacidade máxima da frota (15,0 kg).</Mensagem>
              <Mensagem tipo="info">Seu pacote está a 2 quadras de distância.</Mensagem>
            </div>
            <h3 className="ds-sub">Bateria</h3>
            <div style={{ display: "grid", gap: 8, maxWidth: 260 }}>
              <Bateria valor={88} />
              <Bateria valor={42} />
              <Bateria valor={18} />
            </div>
            <h3 className="ds-sub">Indicadores e cartão de drone</h3>
            <div className="ds-lado">
              <div className="kpis" style={{ margin: 0 }}>
                <Kpi valor="128" rotulo="entregas realizadas" destaque />
                <Kpi valor="23 min" rotulo="tempo médio por entrega" />
              </div>
              <DroneLista drones={[DRONE_EXEMPLO]} />
            </div>
          </section>

          <section id="mapa" className="painel">
            <h2>7. O mapa aéreo</h2>
            <p>
              Grade de 1 km com linhas mais fortes a cada 5 km. Zonas proibidas em laranja tracejado, rotas no ar em
              ciano contínuo, próximas viagens em lilás tracejado. Os drones deslizam entre uma atualização e outra
              (transição de 1 s), e o movimento é desligado quando o sistema pede “reduzir movimento”.
            </p>
            <div style={{ maxWidth: 420 }}>
              <MapaAereo
                largura={10}
                altura={10}
                base={{ x: 5, y: 5 }}
                zonas={[{ id: "z", nome: "Aeroporto", xMin: 6.5, yMin: 6.5, xMax: 9, yMax: 9 }]}
                pedidos={[
                  { id: "a", x: 8, y: 3, prioridade: "ALTA", status: "EM_ROTA" },
                  { id: "b", x: 2, y: 7, prioridade: "BAIXA", status: "PENDENTE" },
                ]}
                viagens={[{ id: "v", caminho: [{ x: 5, y: 5 }, { x: 8, y: 3 }, { x: 5, y: 5 }] }]}
                previas={[{ caminho: [{ x: 5, y: 5 }, { x: 2, y: 7 }, { x: 5, y: 5 }] }]}
                drones={[{ id: "d", nome: "Falcão", x: 6.8, y: 4.2, estado: "EM_VOO" }]}
                rotulo="Exemplo do mapa aéreo"
              />
            </div>
          </section>

          <section id="acessibilidade" className="painel">
            <h2>8. Acessibilidade</h2>
            <p>
              Contraste calculado pela fórmula da WCAG 2.1 (texto comum pede 4,5:1). Foco visível em azul elétrico em
              todos os controles, navegação completa por teclado e textos alternativos no mapa.
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
                            Aa drones
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
            <h2>9. Registro de decisões</h2>
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
