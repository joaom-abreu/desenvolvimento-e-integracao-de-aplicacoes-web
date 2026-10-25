import Bateria from "./Bateria.jsx";
import { EstadoSelo } from "./Selos.jsx";
import { formatarKg } from "../utils/formatadores.js";
import "./DroneLista.css";

/** Cartões com a situação de cada drone (estado, bateria, carga e progresso). */
export default function DroneLista({ drones }) {
  if (!drones?.length) {
    return (
      <div className="vazio">
        <strong>Nenhum drone na frota</strong>
        Cadastre um drone em Frota e zonas.
      </div>
    );
  }
  return (
    <ul className="drone-lista">
      {drones.map((d) => (
        <li key={d.id} className="drone-cartao" data-estado={d.estado}>
          <div className="drone-topo">
            <h3>{d.nome}</h3>
            <EstadoSelo estado={d.estado} />
          </div>
          <Bateria valor={d.bateria} />
          <dl className="drone-dados">
            <div>
              <dt>Carga</dt>
              <dd>
                {formatarKg(d.cargaKg)} de {formatarKg(d.capacidadeKg)}
              </dd>
            </div>
            <div>
              <dt>Pacotes</dt>
              <dd>{d.pacotes}</dd>
            </div>
            <div>
              <dt>Entregas</dt>
              <dd>{d.entregasRealizadas}</dd>
            </div>
          </dl>
          {d.viagemAtualId && (
            <div className="drone-progresso" aria-label={`Viagem ${Math.round(d.progressoPercentual)}% concluída`}>
              <div style={{ width: `${d.progressoPercentual}%` }} />
            </div>
          )}
          {d.proximaParada && <p className="apoio drone-proxima">Próxima entrega: {d.proximaParada}</p>}
        </li>
      ))}
    </ul>
  );
}
