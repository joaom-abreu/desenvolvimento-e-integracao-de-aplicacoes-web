import "./Rotas.css";
import { useEffect, useState } from "react";
import MapaAereo from "../components/MapaAereo/MapaAereo.jsx";
import PedidoForm from "../components/PedidoForm.jsx";
import Mensagem from "../components/Mensagem.jsx";
import { PrioridadeSelo, StatusSelo } from "../components/Selos.jsx";
import { usePolling } from "../hooks/usePolling.js";
import { useSimulacao } from "../hooks/SimulacaoContext.jsx";
import { pedidoService, zonaService } from "../services/api.js";
import { STATUS_PEDIDO } from "../utils/rotulos.js";
import { formatarCoordenada, formatarKg, formatarMin } from "../utils/formatadores.js";

/** Novo pedido (com clique no mapa), fila de entregas, lista e rastreio. */
export default function Pedidos() {
  const { cidade } = useSimulacao();
  const [ponto, setPonto] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [rastreado, setRastreado] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  const fila = usePolling(pedidoService.fila, 2000);
  const pedidos = usePolling(() => pedidoService.listar(filtro), 2000);
  const zonas = usePolling(zonaService.listar, 15000);
  const rastreio = usePolling(() => (rastreado ? pedidoService.rastrear(rastreado) : Promise.resolve(null)), 1000);

  // trocar o filtro ou o pedido rastreado busca de novo na hora (sem esperar o próximo ciclo)
  const recarregarPedidos = pedidos.recarregar;
  const recarregarRastreio = rastreio.recarregar;
  useEffect(() => {
    recarregarPedidos();
  }, [filtro, recarregarPedidos]);
  useEffect(() => {
    recarregarRastreio();
  }, [rastreado, recarregarRastreio]);

  async function criar(pedido) {
    const criado = await pedidoService.criar(pedido);
    setPonto(null);
    fila.recarregar();
    pedidos.recarregar();
    return criado;
  }

  async function cancelar(id) {
    setErroAcao(null);
    try {
      await pedidoService.cancelar(id);
      fila.recarregar();
      pedidos.recarregar();
    } catch (e) {
      setErroAcao(e.message);
    }
  }

  const naFila = fila.dados ?? [];

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Pedidos</h1>
          <p>Clique no mapa para escolher o endereço do cliente. A API recusa pacotes pesados demais, longe demais ou dentro de zonas proibidas.</p>
        </div>
      </div>

      <div className="grade-2">
        <MapaAereo
          largura={cidade.larguraKm}
          altura={cidade.alturaKm}
          base={cidade.base}
          zonas={zonas.dados ?? []}
          pedidos={naFila.map((i) => i.pedido)}
          ponto={ponto}
          onEscolherPonto={(x, y) => setPonto({ x, y })}
          rotulo="Mapa para escolher o endereço do pedido"
        />
        <section className="painel" aria-labelledby="titulo-novo">
          <h2 id="titulo-novo">Novo pedido</h2>
          <PedidoForm ponto={ponto} onCriar={criar} />
        </section>
      </div>

      <div className="grade-igual" style={{ marginTop: 24 }}>
        <section className="painel" aria-labelledby="titulo-fila">
          <h2 id="titulo-fila">Fila de entregas ({naFila.length})</h2>
          <p className="apoio">
            Ordem de saída: prioridade e, empatando, quem chegou antes. A cada 30 minutos de espera o pedido sobe um nível.
          </p>
          {naFila.length === 0 ? (
            <div className="vazio">
              <strong>Fila vazia</strong>
              Todo pedido novo aparece aqui até um drone sair com ele.
            </div>
          ) : (
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th className="numero">#</th>
                    <th>Cliente</th>
                    <th>Prioridade</th>
                    <th className="numero">Peso</th>
                    <th className="numero">Espera</th>
                  </tr>
                </thead>
                <tbody>
                  {naFila.slice(0, 15).map((item) => (
                    <tr key={item.pedido.id}>
                      <td className="numero">{item.posicao}</td>
                      <td>{item.pedido.cliente}</td>
                      <td>
                        <PrioridadeSelo prioridade={item.prioridadeEfetiva} />
                        {item.prioridadeEfetiva !== item.pedido.prioridade && <span className="apoio"> (era {item.pedido.prioridadeRotulo})</span>}
                      </td>
                      <td className="numero">{formatarKg(item.pedido.pesoKg)}</td>
                      <td className="numero">{formatarMin(item.esperaMin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="painel" aria-labelledby="titulo-rastreio">
          <h2 id="titulo-rastreio">Rastreio</h2>
          {!rastreado && <p className="apoio">Escolha “Rastrear” em um pedido da lista abaixo.</p>}
          {rastreio.dados && (
            <div className="rastreio" data-status={rastreio.dados.status}>
              <StatusSelo status={rastreio.dados.status} />
              <p className="rastreio-mensagem">{rastreio.dados.mensagem}</p>
              {rastreio.dados.droneNome && <p className="apoio">Drone: {rastreio.dados.droneNome}</p>}
            </div>
          )}
          {rastreio.erro && <Mensagem tipo="erro">{rastreio.erro.message}</Mensagem>}
        </section>
      </div>

      <section className="painel" style={{ marginTop: 24 }} aria-labelledby="titulo-todos">
        <div className="pagina-topo" style={{ marginBottom: 12 }}>
          <h2 id="titulo-todos" style={{ margin: 0 }}>
            Todos os pedidos
          </h2>
          <div className="campo" style={{ minWidth: 200 }}>
            <label htmlFor="filtro-status">Status</label>
            <select id="filtro-status" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(STATUS_PEDIDO).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </div>
        </div>
        {erroAcao && <Mensagem tipo="erro">{erroAcao}</Mensagem>}
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Endereço</th>
                <th className="numero">Peso</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Drone</th>
                <th className="numero">Tempo</th>
                <th>
                  <span className="somente-leitor">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(pedidos.dados ?? []).slice(0, 60).map((p) => (
                <tr key={p.id} data-selecionado={rastreado === p.id}>
                  <td>{p.cliente}</td>
                  <td>{formatarCoordenada(p.x, p.y)}</td>
                  <td className="numero">{formatarKg(p.pesoKg)}</td>
                  <td>
                    <PrioridadeSelo prioridade={p.prioridade} />
                  </td>
                  <td>
                    <StatusSelo status={p.status} />
                  </td>
                  <td>{p.droneNome ?? "—"}</td>
                  <td className="numero">{p.tempoEntregaMin != null ? formatarMin(p.tempoEntregaMin) : "—"}</td>
                  <td>
                    <div className="acoes" style={{ flexWrap: "nowrap" }}>
                      <button className="botao botao-secundario botao-pequeno" onClick={() => setRastreado(p.id)}>
                        Rastrear
                      </button>
                      {p.status === "PENDENTE" && (
                        <button className="botao botao-perigo botao-pequeno" onClick={() => cancelar(p.id)}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pedidos.dados?.length === 0 && (
            <div className="vazio">
              <strong>Nenhum pedido{filtro ? " com esse status" : ""}</strong>
              Crie um pedido acima ou gere pedidos aleatórios na página Operação.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
