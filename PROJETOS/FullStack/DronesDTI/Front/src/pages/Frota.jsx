import { useState } from "react";
import Mensagem from "../components/Mensagem.jsx";
import Bateria from "../components/Bateria.jsx";
import { EstadoSelo } from "../components/Selos.jsx";
import { usePolling } from "../hooks/usePolling.js";
import { droneService, zonaService } from "../services/api.js";
import { paraNumero } from "../components/PedidoForm.jsx";
import { formatarDecimal, formatarKg, formatarKm } from "../utils/formatadores.js";

const DRONE_VAZIO = { nome: "", capacidadeKg: "", alcanceKm: "", velocidadeKmh: "60" };
const ZONA_VAZIA = { nome: "", xMin: "", yMin: "", xMax: "", yMax: "" };

function Campo({ id, rotulo, valor, onChange, erro, ...props }) {
  return (
    <div className="campo" data-invalido={Boolean(erro)}>
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} value={valor} onChange={(e) => onChange(e.target.value)} {...props} />
      {erro && <span className="erro-campo">{erro}</span>}
    </div>
  );
}

/** Cadastro de drones (X kg, Y km) e de zonas de exclusão aérea. */
export default function Frota() {
  const drones = usePolling(droneService.status, 2000);
  const zonas = usePolling(zonaService.listar, 5000);
  const [drone, setDrone] = useState(DRONE_VAZIO);
  const [zona, setZona] = useState(ZONA_VAZIA);
  const [aviso, setAviso] = useState(null);
  const [campos, setCampos] = useState({});

  async function executar(acao, sucesso, limpar) {
    setAviso(null);
    setCampos({});
    try {
      await acao();
      setAviso({ tipo: "sucesso", texto: sucesso });
      limpar?.();
      drones.recarregar();
      zonas.recarregar();
    } catch (e) {
      setAviso({ tipo: "erro", texto: e.message });
      setCampos(e.campos || {});
    }
  }

  const salvarDrone = (e) => {
    e.preventDefault();
    executar(
      () =>
        droneService.criar({
          nome: drone.nome,
          capacidadeKg: paraNumero(drone.capacidadeKg),
          alcanceKm: paraNumero(drone.alcanceKm),
          velocidadeKmh: paraNumero(drone.velocidadeKmh),
        }),
      `Drone ${drone.nome} entrou na frota.`,
      () => setDrone(DRONE_VAZIO),
    );
  };

  const salvarZona = (e) => {
    e.preventDefault();
    const corpo = Object.fromEntries(Object.entries(zona).map(([k, v]) => [k, k === "nome" ? v : paraNumero(v)]));
    executar(() => zonaService.criar(corpo), `Zona ${zona.nome} criada. As rotas passam a desviar dela.`, () => setZona(ZONA_VAZIA));
  };

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Frota e zonas</h1>
          <p>Cada drone carrega até X kg e voa até Y km por carga de bateria. Zonas de exclusão aérea são obstáculos: as rotas desviam delas.</p>
        </div>
      </div>

      {aviso && <Mensagem tipo={aviso.tipo}>{aviso.texto}</Mensagem>}

      <div className="grade-2" style={{ marginTop: 16 }}>
        <section className="painel">
          <h2>Drones</h2>
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="numero">Capacidade</th>
                  <th className="numero">Alcance</th>
                  <th className="numero">Velocidade</th>
                  <th>Bateria</th>
                  <th>Estado</th>
                  <th className="numero">Entregas/km</th>
                  <th>
                    <span className="somente-leitor">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(drones.dados ?? []).map((d) => (
                  <tr key={d.id}>
                    <td>{d.nome}</td>
                    <td className="numero">{formatarKg(d.capacidadeKg)}</td>
                    <td className="numero">{formatarKm(d.alcanceKm)}</td>
                    <td className="numero">{formatarDecimal(d.velocidadeKmh, 0)} km/h</td>
                    <td style={{ minWidth: 130 }}>
                      <Bateria valor={d.bateria} />
                    </td>
                    <td>
                      <EstadoSelo estado={d.estado} />
                    </td>
                    <td className="numero">{formatarDecimal(d.entregasPorKm)}</td>
                    <td>
                      <button
                        className="botao botao-perigo botao-pequeno"
                        onClick={() => executar(() => droneService.remover(d.id), `Drone ${d.nome} removido.`)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="painel">
          <h2>Novo drone</h2>
          <form className="formulario" onSubmit={salvarDrone} noValidate>
            <Campo id="drone-nome" rotulo="Nome" valor={drone.nome} onChange={(v) => setDrone({ ...drone, nome: v })} erro={campos.nome} maxLength={30} />
            <div className="linha-campos">
              <Campo id="drone-cap" rotulo="Capacidade (kg)" inputMode="decimal" valor={drone.capacidadeKg} onChange={(v) => setDrone({ ...drone, capacidadeKg: v })} erro={campos.capacidadeKg} />
              <Campo id="drone-alc" rotulo="Alcance (km)" inputMode="decimal" valor={drone.alcanceKm} onChange={(v) => setDrone({ ...drone, alcanceKm: v })} erro={campos.alcanceKm} />
              <Campo id="drone-vel" rotulo="Velocidade (km/h)" inputMode="decimal" valor={drone.velocidadeKmh} onChange={(v) => setDrone({ ...drone, velocidadeKmh: v })} erro={campos.velocidadeKmh} />
            </div>
            <button className="botao" type="submit">
              Adicionar drone
            </button>
          </form>
        </section>
      </div>

      <div className="grade-2" style={{ marginTop: 24 }}>
        <section className="painel">
          <h2>Zonas de exclusão aérea</h2>
          {(zonas.dados ?? []).length === 0 ? (
            <div className="vazio">
              <strong>Céu livre</strong>
              Sem zonas, os drones voam em linha reta.
            </div>
          ) : (
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Canto inferior</th>
                    <th>Canto superior</th>
                    <th>
                      <span className="somente-leitor">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {zonas.dados.map((z) => (
                    <tr key={z.id}>
                      <td>{z.nome}</td>
                      <td>({formatarDecimal(z.xMin, 1)} ; {formatarDecimal(z.yMin, 1)})</td>
                      <td>({formatarDecimal(z.xMax, 1)} ; {formatarDecimal(z.yMax, 1)})</td>
                      <td>
                        <button
                          className="botao botao-perigo botao-pequeno"
                          onClick={() => executar(() => zonaService.remover(z.id), `Zona ${z.nome} removida.`)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="painel">
          <h2>Nova zona</h2>
          <form className="formulario" onSubmit={salvarZona} noValidate>
            <Campo id="zona-nome" rotulo="Nome" valor={zona.nome} onChange={(v) => setZona({ ...zona, nome: v })} erro={campos.nome} maxLength={40} />
            <div className="linha-campos">
              {["xMin", "yMin", "xMax", "yMax"].map((k) => (
                <Campo key={k} id={`zona-${k}`} rotulo={k} inputMode="decimal" valor={zona[k]} onChange={(v) => setZona({ ...zona, [k]: v })} erro={campos[k]} />
              ))}
            </div>
            <button className="botao" type="submit">
              Criar zona
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
