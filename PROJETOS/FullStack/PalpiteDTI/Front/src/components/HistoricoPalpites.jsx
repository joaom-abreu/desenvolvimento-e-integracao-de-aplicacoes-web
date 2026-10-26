import { ResultadoSelo } from "./Selos.jsx";
import { RESULTADOS } from "../utils/rotulos.js";

/** A lista de palpites, do mais recente para o mais antigo. */
export default function HistoricoPalpites({ palpites = [] }) {
  if (palpites.length === 0) {
    return (
      <p className="vazio">
        <strong>Nenhum palpite ainda</strong>
        Comece pelo meio: 50 elimina metade dos números de uma vez.
      </p>
    );
  }
  const recentes = [...palpites].reverse();
  return (
    <ol className="historico" reversed aria-label="Palpites desta rodada">
      {recentes.map((p) => (
        <li key={p.ordem}>
          <span className="historico-ordem">{p.ordem}º</span>
          <span className="historico-numero">{p.numero}</span>
          <ResultadoSelo resultado={p.resultado} />
          <span className="historico-dica">{RESULTADOS[p.resultado]?.dica}</span>
        </li>
      ))}
    </ol>
  );
}
