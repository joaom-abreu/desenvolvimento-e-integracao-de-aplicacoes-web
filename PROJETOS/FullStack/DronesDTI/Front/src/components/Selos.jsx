import { PRIORIDADES, STATUS_PEDIDO, corEstado, rotuloEstado } from "../utils/rotulos.js";

export function EstadoSelo({ estado }) {
  return (
    <span className="selo" data-estado={estado}>
      <span className="pingo" style={{ background: corEstado(estado) }} aria-hidden="true" />
      {rotuloEstado(estado)}
    </span>
  );
}

export function PrioridadeSelo({ prioridade }) {
  const info = PRIORIDADES[prioridade];
  return <span className={`selo selo-${prioridade?.toLowerCase()}`}>{info?.rotulo ?? prioridade}</span>;
}

export function StatusSelo({ status }) {
  return <span className="selo">{STATUS_PEDIDO[status] ?? status}</span>;
}
