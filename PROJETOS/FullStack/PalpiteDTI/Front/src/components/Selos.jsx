import { CLASSIFICACOES, RESULTADOS } from "../utils/rotulos.js";

/** "Maior ↓", "Menor ↑" ou "Acertou ✓": a resposta do juiz para um palpite. */
export function ResultadoSelo({ resultado }) {
  const info = RESULTADOS[resultado];
  return (
    <span className={`selo selo-${resultado?.toLowerCase()}`}>
      <span aria-hidden="true">{info?.seta}</span>
      {info?.rotulo ?? resultado}
    </span>
  );
}

export function ClassificacaoSelo({ classificacao }) {
  return <span className="selo selo-acertou">{CLASSIFICACOES[classificacao] ?? classificacao}</span>;
}

export function RoboSelo() {
  return (
    <span className="selo selo-robo" title="Partida de exemplo jogada por um robô">
      robô
    </span>
  );
}
