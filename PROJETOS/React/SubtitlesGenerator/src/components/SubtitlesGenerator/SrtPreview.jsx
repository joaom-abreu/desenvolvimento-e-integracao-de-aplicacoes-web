import { useState } from "react";
import { FiCheck, FiCopy, FiDownload } from "react-icons/fi";
import CONFIG from "../../config/subtitlesConfig";
import { buildSrt, srtFilename } from "../../core";
import "./SubtitlesGenerator.css";

/** Aba "Arquivo SRT": o conteúdo exato do arquivo, para copiar ou baixar. */
export default function SrtPreview({ result, onDownload, onCopied }) {
  const [copied, setCopied] = useState(false);
  const cues = result?.cues ?? [];
  const text = cues.length ? buildSrt(cues).replace(/\r\n/g, "\n") : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.("Conteúdo do .srt copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      onCopied?.("Não foi possível copiar: o navegador bloqueou a área de transferência.");
    }
  };

  return (
    <section className="sg-card">
      <div className="sg-card-head">
        <div>
          <h3>Arquivo SRT</h3>
          <p className="sg-card-note">
            {cues.length
              ? `${srtFilename(result.fileName, CONFIG.SRT_SUFFIX)} · UTF-8 · ${cues.length} legenda(s)`
              : "SubRip (.srt): o formato aceito pelo VLC, YouTube, players de TV e editores de vídeo"}
          </p>
        </div>
        <div className="sg-table-tools">
          <button type="button" className="sg-button sg-button-ghost sg-button-small" onClick={copy} disabled={!text}>
            {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />} {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            type="button"
            className="sg-button sg-button-small"
            onClick={onDownload}
            disabled={!text}
            title="Baixar .srt (Ctrl+S)"
          >
            <FiDownload aria-hidden="true" /> Baixar .srt
          </button>
        </div>
      </div>

      {text ? <pre className="sg-srt">{text}</pre> : <p className="sg-empty">Nenhuma legenda gerada ainda.</p>}
    </section>
  );
}
