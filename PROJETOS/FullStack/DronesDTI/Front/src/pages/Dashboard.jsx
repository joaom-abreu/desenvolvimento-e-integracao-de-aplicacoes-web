import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import Kpi from "../components/Kpi.jsx";
import Mensagem from "../components/Mensagem.jsx";
import { usePolling } from "../hooks/usePolling.js";
import { useSimulacao } from "../hooks/SimulacaoContext.jsx";
import { dashboardService } from "../services/api.js";
import { ALGORITMOS, PRIORIDADES } from "../utils/rotulos.js";
import { formatarDecimal, formatarKm, formatarMin, formatarPercentual } from "../utils/formatadores.js";
import "./Dashboard.css";

const COR_PRIORIDADE_HEX = { ALTA: "#FC6D3A", MEDIA: "#3038D5", BAIXA: "#8A8FA3" };

/** Relatório pedido no case: entregas, tempo médio, drone mais eficiente e mapa das entregas. */
export default function Dashboard() {
  const { cidade } = useSimulacao();
  const { dados, erro, carregando } = usePolling(dashboardService.indicadores, 3000);
  const ascii = usePolling(dashboardService.mapaAscii, 3000);

  if (carregando) return <div className="pagina carregando">Calculando os indicadores…</div>;

  const prioridades = dados
    ? Object.keys(PRIORIDADES).map((p) => ({
        prioridade: PRIORIDADES[p].rotulo,
        chave: p,
        entregas: dados.entregasPorPrioridade[p] ?? 0,
        tempo: dados.tempoMedioPorPrioridadeMin[p] ?? 0,
      }))
    : [];

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Dashboard</h1>
          <p>Tempos em minutos simulados. Atualiza a cada 3 segundos.</p>
        </div>
        <div className="acoes nao-imprimir">
          <a className="botao botao-secundario" href={dashboardService.urlCsv()}>
            Baixar entregas (CSV)
          </a>
        </div>
      </div>

      {erro && <Mensagem tipo="erro">{erro.message}</Mensagem>}

      {dados && (
        <>
          <div className="kpis">
            <Kpi valor={dados.entregasRealizadas} rotulo="entregas realizadas" destaque />
            <Kpi valor={formatarMin(dados.tempoMedioEntregaMin)} rotulo="tempo médio por entrega (do pedido à porta)" />
            <Kpi valor={dados.droneMaisEficiente?.nome ?? "—"} rotulo={dados.droneMaisEficiente ? `drone mais eficiente (${formatarDecimal(dados.droneMaisEficiente.entregasPorKm)} entregas/km)` : "drone mais eficiente"} />
            <Kpi valor={formatarDecimal(dados.mediaPacotesPorViagem, 1)} rotulo="pacotes por viagem" />
            <Kpi valor={formatarPercentual(dados.ocupacaoMediaPercentual)} rotulo="ocupação média da capacidade" />
            <Kpi valor={formatarKm(dados.distanciaTotalKm)} rotulo="voados no total" />
          </div>

          <div className="grade-igual">
            <section className="painel">
              <h2>Ranking de eficiência</h2>
              <p className="apoio">Entregas por km voado: quanto mais pacotes numa mesma rota, maior.</p>
              <div className="grafico">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dados.ranking} layout="vertical" margin={{ left: 12, right: 24 }}>
                    <CartesianGrid horizontal={false} stroke="#E3E4EC" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="nome" width={80} tick={{ fontSize: 13 }} />
                    <Tooltip formatter={(v) => [formatarDecimal(v), "entregas/km"]} />
                    <Bar dataKey="entregasPorKm" radius={[0, 999, 999, 0]}>
                      {dados.ranking.map((r, i) => (
                        <Cell key={r.id} fill={i === 0 && r.entregas > 0 ? "#000066" : "#9EA4FF"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="painel">
              <h2>Tempo médio por prioridade</h2>
              <p className="apoio">A fila prioriza a alta; o envelhecimento evita que a baixa espere para sempre.</p>
              <div className="grafico">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={prioridades} margin={{ right: 12 }}>
                    <CartesianGrid vertical={false} stroke="#E3E4EC" />
                    <XAxis dataKey="prioridade" tick={{ fontSize: 13 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" min" width={56} />
                    <Tooltip formatter={(v, _n, item) => [`${formatarDecimal(v, 1)} min · ${item.payload.entregas} entregas`, "tempo médio"]} />
                    <Bar dataKey="tempo" radius={[999, 999, 0, 0]}>
                      {prioridades.map((p) => (
                        <Cell key={p.chave} fill={COR_PRIORIDADE_HEX[p.chave]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grade-igual" style={{ marginTop: 24 }}>
            <section className="painel">
              <h2>Mapa das entregas</h2>
              <p className="apoio">Cada ponto é uma entrega feita. A cor é a prioridade.</p>
              <div className="grafico">
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{ right: 12, bottom: 8 }}>
                    <CartesianGrid stroke="#E3E4EC" />
                    <XAxis type="number" dataKey="x" domain={[0, cidade.larguraKm]} unit=" km" tick={{ fontSize: 12 }} />
                    <YAxis type="number" dataKey="y" domain={[0, cidade.alturaKm]} unit=" km" tick={{ fontSize: 12 }} width={56} />
                    <ZAxis range={[40, 40]} />
                    <Tooltip formatter={(v, n) => [formatarDecimal(v, 1), n]} />
                    {Object.keys(PRIORIDADES).map((p) => (
                      <Scatter
                        key={p}
                        name={PRIORIDADES[p].rotulo}
                        data={dados.mapaEntregas.filter((e) => e.prioridade === p)}
                        fill={COR_PRIORIDADE_HEX[p]}
                      />
                    ))}
                    <Scatter name="Base" data={[cidade.base]} fill="#40E6F2" shape="star" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="painel">
              <h2>Mapa ASCII</h2>
              <p className="apoio">O mesmo mapa em texto, vindo de GET /api/dashboard/mapa-ascii.</p>
              <pre className="mapa-ascii" aria-label="Mapa das entregas em texto">{ascii.dados ?? "…"}</pre>
            </section>
          </div>

          <section className="painel" style={{ marginTop: 24 }}>
            <h2>Últimas viagens</h2>
            {dados.ultimasViagens.length === 0 ? (
              <div className="vazio">
                <strong>Nenhuma viagem concluída ainda</strong>
                As viagens aparecem aqui quando o drone volta para a base.
              </div>
            ) : (
              <div className="tabela-rolagem">
                <table>
                  <thead>
                    <tr>
                      <th>Drone</th>
                      <th className="numero">Pacotes</th>
                      <th className="numero">Distância</th>
                      <th className="numero">Ocupação</th>
                      <th className="numero">Duração</th>
                      <th>Rota calculada por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.ultimasViagens.map((v) => (
                      <tr key={v.id}>
                        <td>{v.droneNome}</td>
                        <td className="numero">{v.pacotes}</td>
                        <td className="numero">{formatarKm(v.distanciaKm)}</td>
                        <td className="numero">{formatarPercentual(v.ocupacaoPercentual)}</td>
                        <td className="numero">{formatarMin(v.duracaoMin)}</td>
                        <td>{ALGORITMOS[v.algoritmo] ?? v.algoritmo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
