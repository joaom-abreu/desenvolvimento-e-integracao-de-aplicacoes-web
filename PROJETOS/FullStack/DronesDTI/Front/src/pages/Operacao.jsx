import { useState } from "react";
import MapaAereo, { LegendaMapa } from "../components/MapaAereo/MapaAereo.jsx";
import DroneLista from "../components/DroneLista.jsx";
import Kpi from "../components/Kpi.jsx";
import Mensagem from "../components/Mensagem.jsx";
import { usePolling } from "../hooks/usePolling.js";
import { useSimulacao } from "../hooks/SimulacaoContext.jsx";
import { droneService, entregaService, pedidoService, simulacaoService, zonaService } from "../services/api.js";
import { formatarHora } from "../utils/formatadores.js";

const ATIVOS = new Set(["PENDENTE", "ALOCADO", "EM_ROTA"]);

/** Página inicial: o espaço aéreo ao vivo + a situação de cada drone. */
export default function Operacao() {
  const { cidade, agora } = useSimulacao();
  const drones = usePolling(droneService.status, 1000);
  const rotas = usePolling(entregaService.rotas, 2000);
  const pedidos = usePolling(pedidoService.listar, 2000);
  const zonas = usePolling(zonaService.listar, 15000);
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function executar(acao, sucesso) {
    setOcupado(true);
    setAviso(null);
    try {
      const resultado = await acao();
      setAviso({ tipo: "sucesso", texto: sucesso(resultado) });
      await Promise.all([drones.recarregar(), rotas.recarregar(), pedidos.recarregar(), zonas.recarregar()]);
    } catch (e) {
      setAviso({ tipo: "erro", texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  const listaPedidos = pedidos.dados ?? [];
  const ativos = listaPedidos.filter((p) => ATIVOS.has(p.status));
  const conta = (status) => listaPedidos.filter((p) => p.status === status).length;
  const erro = drones.erro || rotas.erro;

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Centro de operações</h1>
          <p>
            Cada segundo real vale um minuto na simulação. Os drones saem sozinhos quando há pedidos na fila e voltam
            para a base ao terminar.
          </p>
        </div>
        <div className="acoes nao-imprimir">
          <button
            className="botao"
            disabled={ocupado}
            onClick={() => executar(() => simulacaoService.pedidosAleatorios(20), (r) => `${r.pedidosCriados} pedidos entraram na fila.`)}
          >
            Gerar 20 pedidos
          </button>
          <button
            className="botao botao-secundario"
            disabled={ocupado}
            onClick={() => executar(simulacaoService.despachar, (r) => `${r.viagensCriadas} viagem(ns) despachada(s).`)}
          >
            Despachar agora
          </button>
          <button
            className="botao botao-perigo"
            disabled={ocupado}
            onClick={() => {
              if (window.confirm("Apagar pedidos e viagens e recomeçar a simulação?")) {
                executar(() => simulacaoService.reiniciar(0), () => "Simulação reiniciada.");
              }
            }}
          >
            Reiniciar
          </button>
        </div>
      </div>

      {aviso && <Mensagem tipo={aviso.tipo}>{aviso.texto}</Mensagem>}
      {erro && !aviso && <Mensagem tipo="erro">{erro.message}</Mensagem>}

      <div className="kpis" style={{ marginTop: 16 }}>
        <Kpi valor={conta("PENDENTE")} rotulo="na fila" />
        <Kpi valor={conta("ALOCADO") + conta("EM_ROTA")} rotulo="a caminho" destaque />
        <Kpi valor={conta("ENTREGUE")} rotulo="entregues" />
        <Kpi valor={rotas.dados?.emAndamento.length ?? 0} rotulo="viagens no ar" />
        <Kpi valor={formatarHora(agora)} rotulo="relógio do servidor" />
      </div>

      <div className="grade-2">
        <section aria-labelledby="titulo-mapa">
          <h2 id="titulo-mapa" className="somente-leitor">
            Mapa aéreo
          </h2>
          <MapaAereo
            largura={cidade.larguraKm}
            altura={cidade.alturaKm}
            base={cidade.base}
            zonas={zonas.dados ?? []}
            pedidos={ativos}
            viagens={rotas.dados?.emAndamento ?? []}
            previas={rotas.dados?.previa ?? []}
            drones={drones.dados ?? []}
          />
          <LegendaMapa />
        </section>
        <section className="painel" aria-labelledby="titulo-frota">
          <h2 id="titulo-frota">Frota</h2>
          {drones.carregando ? <p className="carregando">Buscando a frota…</p> : <DroneLista drones={drones.dados} />}
        </section>
      </div>
    </div>
  );
}
