import { useState } from "react";
import MapaAereo, { LegendaMapa } from "../components/MapaAereo/MapaAereo.jsx";
import ViagemCartao from "../components/ViagemCartao.jsx";
import Kpi from "../components/Kpi.jsx";
import Mensagem from "../components/Mensagem.jsx";
import { usePolling } from "../hooks/usePolling.js";
import { useSimulacao } from "../hooks/SimulacaoContext.jsx";
import { droneService, entregaService, zonaService } from "../services/api.js";
import "./Rotas.css";

/** Mostra o resultado do algoritmo: viagens no ar e como a fila atual seria dividida. */
export default function Rotas() {
  const { cidade } = useSimulacao();
  const rotas = usePolling(entregaService.rotas, 2000);
  const drones = usePolling(droneService.status, 1000);
  const zonas = usePolling(zonaService.listar, 15000);
  const [destaque, setDestaque] = useState(null);

  const dados = rotas.dados;
  const alternar = (chave) => setDestaque((atual) => (atual === chave ? null : chave));

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Rotas</h1>
          <p>
            Cada viagem leva o máximo de pacotes que cabem no peso e no alcance do drone. A ordem das paradas vem do
            caixeiro viajante. Clique em uma viagem para destacá-la no mapa.
          </p>
        </div>
      </div>

      {rotas.erro && <Mensagem tipo="erro">{rotas.erro.message}</Mensagem>}

      {dados && (
        <div className="kpis">
          <Kpi valor={dados.pedidosPendentes} rotulo="pedidos na fila" />
          <Kpi valor={dados.viagensPrevistas} rotulo="viagens planejadas para a fila" destaque />
          <Kpi valor={dados.minimoTeoricoViagens} rotulo="mínimo teórico (só pelo peso)" />
          <Kpi valor={dados.emAndamento.length} rotulo="viagens no ar" />
        </div>
      )}

      <div className="grade-2">
        <div>
          <MapaAereo
            largura={cidade.larguraKm}
            altura={cidade.alturaKm}
            base={cidade.base}
            zonas={zonas.dados ?? []}
            viagens={dados?.emAndamento ?? []}
            previas={dados?.previa ?? []}
            drones={drones.dados ?? []}
            destaque={destaque}
          />
          <LegendaMapa />
        </div>
        <div className="rotas-coluna">
          <section className="painel">
            <h2>No ar agora</h2>
            {dados?.emAndamento.length ? (
              <div className="viagens">
                {dados.emAndamento.map((v) => (
                  <ViagemCartao key={v.id} viagem={v} selecionada={destaque === v.id} onSelecionar={() => alternar(v.id)} />
                ))}
              </div>
            ) : (
              <div className="vazio">
                <strong>Nenhum drone voando</strong>
                Gere pedidos na página Operação para ver as viagens aqui.
              </div>
            )}
          </section>
          <section className="painel">
            <h2>Próximas viagens</h2>
            {dados?.naoAlocaveis.length > 0 && (
              <Mensagem tipo="erro">
                {dados.naoAlocaveis.length} pedido(s) não cabem em nenhum drone hoje (peso ou alcance).
              </Mensagem>
            )}
            {dados?.previa.length ? (
              <div className="viagens">
                {dados.previa.map((v, i) => (
                  <ViagemCartao
                    key={`p${i}`}
                    titulo={`${i + 1}ª · ${v.droneNome}`}
                    viagem={v}
                    selecionada={destaque === `p${i}`}
                    onSelecionar={() => alternar(`p${i}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="vazio">
                <strong>Fila vazia</strong>
                Sem pedidos esperando, não há o que planejar.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
