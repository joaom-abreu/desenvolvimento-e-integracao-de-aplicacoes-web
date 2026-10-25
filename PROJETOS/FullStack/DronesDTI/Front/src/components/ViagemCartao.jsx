import { PrioridadeSelo } from "./Selos.jsx";
import { ALGORITMOS, rotuloEstado } from "../utils/rotulos.js";
import { formatarKg, formatarKm, formatarMin, formatarPercentual } from "../utils/formatadores.js";

/** Uma viagem: drone, ocupação, distância, algoritmo usado e as paradas na ordem. */
export default function ViagemCartao({ viagem, selecionada, onSelecionar, titulo }) {
  return (
    <article className="viagem-cartao" data-selecionada={selecionada}>
      <button type="button" className="viagem-cabeca" onClick={onSelecionar} aria-pressed={selecionada}>
        <span className="viagem-titulo">{titulo ?? viagem.droneNome}</span>
        <span className="apoio">
          {viagem.status === "PREVIA" ? "Planejada" : rotuloEstado(viagem.estadoAtual)} · {formatarKm(viagem.distanciaKm)} ·{" "}
          {formatarMin(viagem.duracaoMin)}
        </span>
      </button>
      <div className="viagem-ocupacao" aria-label={`Ocupação ${formatarPercentual(viagem.ocupacaoPercentual)}`}>
        <div style={{ width: `${Math.min(100, viagem.ocupacaoPercentual)}%` }} />
      </div>
      <p className="apoio viagem-meta">
        {formatarKg(viagem.pesoKg)} de {formatarKg(viagem.capacidadeKg)} ({formatarPercentual(viagem.ocupacaoPercentual)}) ·
        rota: {ALGORITMOS[viagem.algoritmo] ?? viagem.algoritmo}
      </p>
      <ol className="viagem-paradas">
        {viagem.paradas.map((p) => (
          <li key={p.pedidoId ?? p.ordem}>
            <span>{p.cliente}</span>
            <span className="apoio">{formatarKg(p.pesoKg)}</span>
            <PrioridadeSelo prioridade={p.prioridade} />
          </li>
        ))}
      </ol>
    </article>
  );
}
