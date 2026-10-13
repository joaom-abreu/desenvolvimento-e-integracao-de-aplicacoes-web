import { useEffect, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiPlayCircle, FiSearch } from "react-icons/fi";
import { formatTimestamp, readingSpeed } from "../../core";
import { formatDecimal } from "./format";
import "./SubtitlesGenerator.css";

// Acima disso a legenda fica rápida demais para ler (caracteres por segundo)
const MAX_CPS = 20;

/**
 * Aba "Legendas": o vídeo com a legenda por cima + a tabela para revisar o texto.
 * A legenda do player é uma TextTrack criada em JavaScript (VTTCue), então
 * qualquer correção na tabela aparece no vídeo na hora, sem gerar arquivo.
 */
export default function SubtitlePreview({ file, result, onEdit }) {
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const listRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [playable, setPlayable] = useState(true);
  const [filter, setFilter] = useState("");

  const cues = useMemo(() => result?.cues ?? [], [result]);

  // URL temporária do vídeo escolhido (nada é enviado: o player lê do disco)
  const videoUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    setPlayable(true);
    trackRef.current = null;
    return () => videoUrl && URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  // Copia as legendas para a faixa do player sempre que mudarem
  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof VTTCue === "undefined") return;
    if (!trackRef.current) {
      trackRef.current = video.addTextTrack("subtitles", "Português (Brasil)", "pt-BR");
    }
    const track = trackRef.current;
    track.mode = "showing";
    [...(track.cues ?? [])].forEach((cue) => track.removeCue(cue));
    cues.forEach((cue) => {
      const vtt = new VTTCue(cue.start, cue.end, cue.text);
      vtt.line = -2; // um pouco acima da barra de controles
      track.addCue(vtt);
    });
  }, [cues, videoUrl]);

  // Destaca na tabela a legenda que está na tela
  const handleTime = () => {
    const t = videoRef.current?.currentTime ?? 0;
    const current = cues.find((cue) => t >= cue.start && t <= cue.end);
    setActiveId(current?.id ?? null);
  };

  // Mantém a linha ativa visível (rolando só a tabela, não a página)
  useEffect(() => {
    const box = listRef.current;
    if (!box || activeId === null || box.contains(document.activeElement)) return;
    const row = box.querySelector(`[data-cue="${activeId}"]`);
    if (!row) return;
    const top = row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2;
    box.scrollTo({ top, behavior: "smooth" });
  }, [activeId]);

  const seek = (cue) => {
    const video = videoRef.current;
    if (!video || !playable) return;
    video.currentTime = cue.start + 0.01;
    video.play().catch(() => {});
  };

  const term = filter.trim().toLowerCase();
  const visible = term ? cues.filter((c) => c.text.toLowerCase().includes(term)) : cues;
  const fastCount = cues.filter((c) => readingSpeed(c) > MAX_CPS).length;

  return (
    <div className="sg-preview">
      <section className="sg-card sg-player-card">
        <div className="sg-card-head">
          <div>
            <h3>Pré-visualização</h3>
            <p className="sg-card-note">{file ? file.name : "Nenhum vídeo escolhido"}</p>
          </div>
        </div>

        {file ? (
          <div className="sg-player">
            {playable ? (
              <video
                key={videoUrl}
                ref={videoRef}
                src={videoUrl}
                controls
                preload="metadata"
                onTimeUpdate={handleTime}
                onError={() => setPlayable(false)}
              />
            ) : (
              <div className="sg-player-off">
                <FiAlertTriangle aria-hidden="true" />
                <strong>O navegador não reproduz este formato</strong>
                <span>
                  As legendas são geradas normalmente. Para assistir com a legenda, abra o vídeo e o .srt
                  no VLC (com o mesmo nome, ela carrega sozinha).
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="sg-empty">Escolha um vídeo para ver a pré-visualização.</p>
        )}
      </section>

      <section className="sg-card sg-cues-card">
        <div className="sg-card-head">
          <div>
            <h3>Revisar legendas</h3>
            <p className="sg-card-note">
              {cues.length
                ? `${cues.length} legenda(s) · clique no tempo para assistir · edite o texto direto na tabela`
                : "As legendas aparecem aqui depois de geradas"}
            </p>
          </div>
          <label className="sg-input-icon sg-filter">
            <FiSearch aria-hidden="true" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Buscar no texto"
              aria-label="Buscar no texto das legendas"
              disabled={!cues.length}
            />
          </label>
        </div>

        {cues.length ? (
          <>
            <ol ref={listRef} className="sg-cues">
              {visible.map((cue) => {
                const cps = readingSpeed(cue);
                return (
                  <li key={cue.id} data-cue={cue.id} className={cue.id === activeId ? "is-active" : undefined}>
                    <span className="sg-cue-index">{cue.id}</span>
                    <button
                      type="button"
                      className="sg-cue-time"
                      onClick={() => seek(cue)}
                      disabled={!playable}
                      title="Assistir este trecho"
                    >
                      <FiPlayCircle aria-hidden="true" />
                      <span className="sg-cue-range">
                        <span>{formatTimestamp(cue.start)}</span>
                        <span>{formatTimestamp(cue.end)}</span>
                      </span>
                    </button>
                    <textarea
                      value={cue.text}
                      rows={2}
                      onChange={(event) => onEdit(cue.id, event.target.value)}
                      aria-label={`Texto da legenda ${cue.id}`}
                      spellCheck="true"
                      lang="pt-BR"
                    />
                    <span
                      className={`sg-cps${cps > MAX_CPS ? " is-fast" : ""}`}
                      title="Velocidade de leitura (caracteres por segundo)"
                    >
                      {formatDecimal(cps, 0)} c/s
                    </span>
                  </li>
                );
              })}
              {!visible.length && <li className="sg-empty">Nenhuma legenda com “{filter}”.</li>}
            </ol>
            <p className="sg-tip">
              {fastCount
                ? `${fastCount} legenda(s) acima de ${MAX_CPS} caracteres por segundo (em vermelho): considere encurtar o texto.`
                : `Velocidade de leitura confortável em todas as legendas (até ${MAX_CPS} caracteres por segundo).`}
            </p>
          </>
        ) : (
          <p className="sg-empty">Nenhuma legenda gerada ainda.</p>
        )}
      </section>
    </div>
  );
}
