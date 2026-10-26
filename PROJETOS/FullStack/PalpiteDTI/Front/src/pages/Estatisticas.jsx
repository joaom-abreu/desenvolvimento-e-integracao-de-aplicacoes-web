import { usePolling } from "../hooks/usePolling.js";
import { estatisticaService } from "../services/api.js";
import Kpi from "../components/Kpi.jsx";
import Mensagem from "../components/Mensagem.jsx";
import GraficoBarras from "../components/GraficoBarras/GraficoBarras.jsx";
import { formatarDuracao, formatarNumero, formatarPercentual } from "../utils/formatadores.js";
import "./Estatisticas.scss";

/** "/estatisticas": indicadores e gráficos, atualizados a cada 5 segundos. */
export default function Estatisticas() {
  const { dados: e, erro, carregando } = usePolling(estatisticaService.resumo, 5000);

  const maisComum = e?.primeirosPalpites?.[0]?.rotulo;

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Estatísticas</h1>
          <p>Como as pessoas (e os robôs de exemplo) estão jogando. Os números se atualizam sozinhos.</p>
        </div>
      </div>

      {erro && <Mensagem tipo="erro">{erro.message}</Mensagem>}
      {carregando && !e && <p className="carregando">Carregando…</p>}

      {e && (
        <>
          <div className="kpis">
            <Kpi valor={e.totalPartidas} rotulo="partidas jogadas" destaque />
            <Kpi valor={formatarPercentual(e.taxaVitoria)} rotulo="das encerradas terminam em acerto" />
            <Kpi valor={formatarNumero(e.mediaTentativas)} rotulo="tentativas, em média" />
            <Kpi valor={e.melhorTentativas ?? "–"} rotulo="melhor resultado" />
            <Kpi valor={formatarPercentual(e.percentualNoIdeal)} rotulo={`acertaram em até ${e.tentativasIdeais}`} />
            <Kpi valor={formatarDuracao(e.duracaoMediaSegundos)} rotulo="por rodada vencida" />
          </div>

          <div className="grade-igual estatisticas">
            <section className="painel estatisticas-larga">
              <GraficoBarras
                titulo="Tentativas até acertar"
                descricao={`À esquerda da linha estão as partidas que ficaram dentro do pior caso da busca binária (${e.tentativasIdeais}).`}
                dados={e.distribuicaoTentativas}
                referencia={{ rotulo: String(e.tentativasIdeais), texto: `limite da busca binária: ${e.tentativasIdeais}` }}
                largura={1080}
              />
            </section>
            <section className="painel">
              <GraficoBarras
                titulo="Primeiro palpite mais comum"
                descricao="O meio (50) é o chute que mais informação dá."
                dados={e.primeirosPalpites}
                destacar={(rotulo) => rotulo === maisComum}
                unidade="vezes"
              />
            </section>
            <section className="painel">
              <GraficoBarras
                titulo="Números sorteados por faixa"
                descricao="Com muitas partidas, as barras se igualam: o sorteio não favorece faixa nenhuma."
                dados={e.sorteiosPorFaixa}
              />
            </section>
          </div>

          <p className="apoio estatisticas-rodape">
            {e.vencidas} vencidas, {e.abandonadas} abandonadas e {e.emAndamento} em andamento. Partidas em andamento não
            entram no gráfico de sorteios, para não dar pista do número de ninguém.
          </p>
        </>
      )}
    </div>
  );
}
