import { useEffect, useRef } from "react";
import "./SubtitlesGenerator.css";

/** Aba "Log de execução": o histórico de cada etapa (ffmpeg, trechos, Gemini). */
export default function ExecutionLog({ entries }) {
  const boxRef = useRef(null);

  // Rola (só a caixa do log) para o fim a cada nova linha
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [entries.length]);

  return (
    <section className="sg-card">
      <div ref={boxRef} className="sg-log" role="log" aria-live="polite">
        {!entries.length && <p className="sg-empty">Nenhuma legenda gerada ainda.</p>}
        {entries.map((e) => (
          <p key={e.id} className={`sg-log-line is-${e.level}`}>
            <time>{e.time}</time> {e.message}
          </p>
        ))}
      </div>
    </section>
  );
}
