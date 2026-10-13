import { FiClock, FiGlobe, FiLayers, FiMessageSquare } from "react-icons/fi";
import { languageName } from "../../core";
import { formatDecimal, formatDuration, formatInt } from "./format";
import "./SubtitlesGenerator.css";

/** Indicadores: duração, legendas, trechos e idioma do áudio. */
export default function SubtitleStatCards({ result }) {
  const cues = result?.cues ?? [];
  const average = cues.length
    ? cues.reduce((sum, c) => sum + (c.end - c.start), 0) / cues.length
    : 0;

  const cards = [
    {
      icon: FiClock,
      label: "Duração",
      value: result ? formatDuration(result.duration) : "—",
      note: result ? `processado em ${formatDuration(result.elapsed)}` : "do vídeo escolhido",
    },
    {
      icon: FiMessageSquare,
      label: "Legendas",
      value: result ? formatInt(cues.length) : "—",
      note: result ? `média de ${formatDecimal(average)} s na tela` : "no arquivo .srt",
    },
    {
      icon: FiLayers,
      label: "Trechos",
      value: result ? `${result.chunksDone}/${result.chunkCount}` : "—",
      note: "enviados ao Gemini",
      tone: result && result.chunksDone < result.chunkCount ? "danger" : undefined,
    },
    {
      icon: FiGlobe,
      label: "Idioma",
      value: result ? languageName(result.language) : "—",
      note: result ? (result.translated ? "traduzido para pt-BR" : "transcrito em pt-BR") : "legenda em pt-BR",
      tone: result ? "success" : undefined,
    },
  ];

  return (
    <ul className="sg-kpis">
      {cards.map(({ icon: Icon, label, value, note, tone }) => (
        <li key={label} className={`sg-kpi${tone ? ` is-${tone}` : ""}`}>
          <span className="sg-kpi-label">
            <Icon aria-hidden="true" /> {label}
          </span>
          <strong className="sg-kpi-value">{value}</strong>
          <span className={`sg-kpi-note${tone ? ` is-${tone}` : ""}`}>{note}</span>
        </li>
      ))}
    </ul>
  );
}
