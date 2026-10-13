import { useCallback, useEffect, useState } from "react";
import { FiFileText, FiMessageSquare, FiTerminal } from "react-icons/fi";
import CONFIG from "../../config/subtitlesConfig";
import { downloadSrt, srtFilename } from "../../core";
import ExecutionLog from "./ExecutionLog";
import SrtPreview from "./SrtPreview";
import SubtitlePreview from "./SubtitlePreview";
import SubtitleStatCards from "./SubtitleStatCards";
import UploadForm from "./UploadForm";
import useSubtitlesGenerator from "./useSubtitlesGenerator";
import "./SubtitlesGenerator.css";

/**
 * Painel completo: vídeo + opções + indicadores + revisão + SRT + log.
 * Cada parte também funciona sozinha (ex.: <SrtPreview result={...} />).
 *
 * <SubtitlesGenerator />
 */
export default function SubtitlesGenerator() {
  const generator = useSubtitlesGenerator();
  const { result, running, start, cancel, addLog, setMessage, reset } = generator;
  const [file, setFile] = useState(null);
  const [tab, setTab] = useState("cues");
  const [form, setForm] = useState({
    language: CONFIG.DEFAULT_LANGUAGE,
    chunkSeconds: CONFIG.DEFAULT_CHUNK_SECONDS,
    maxLine: CONFIG.DEFAULT_MAX_LINE,
    sounds: CONFIG.DEFAULT_SOUNDS,
  });

  const handleFile = (next) => {
    setFile(next);
    reset(next ? `Pronto: ${next.name}. Clique em Gerar legenda.` : "Pronto. Escolha um vídeo e clique em Gerar legenda.");
  };

  const handleSubmit = async () => {
    await start(file, form);
  };

  // Quando termina (mesmo com erro parcial), volta para a aba de revisão
  const { status } = generator;
  useEffect(() => {
    if (status === "done") setTab("cues");
  }, [status]);

  const handleDownload = useCallback(() => {
    if (!result?.cues.length) return;
    const name = downloadSrt(result.cues, srtFilename(result.fileName, CONFIG.SRT_SUFFIX), {
      bom: CONFIG.SRT_BOM,
    });
    addLog(`Legenda baixada como ${name}`, "success");
    setMessage(`Legenda salva como ${name}`);
  }, [result, addLog, setMessage]);

  // Atalhos: Esc cancela · Ctrl+S / Cmd+S baixa o .srt
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") cancel();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleDownload();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancel, handleDownload]);

  const { progress } = generator;
  const percent = progress ? Math.round((progress.current / progress.total) * 100) : null;

  const tabs = [
    { id: "cues", icon: FiMessageSquare, label: "Legendas", count: result?.cues.length },
    { id: "srt", icon: FiFileText, label: "Arquivo SRT" },
    { id: "log", icon: FiTerminal, label: "Log de execução", count: generator.log.length },
  ];

  return (
    <div className="sg">
      <UploadForm
        file={file}
        onFile={handleFile}
        values={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={cancel}
        running={running}
        server={generator.server}
      />

      {/* Barra de status + progresso */}
      <div className={`sg-status is-${generator.status}`} role="status">
        <span className="sg-status-text" title={generator.message}>
          {generator.message}
        </span>
        {running && percent !== null && <span className="sg-status-percent">{percent}%</span>}
        <span
          className={`sg-progress${running && percent === null ? " is-indeterminate" : ""}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
        >
          <span style={{ width: percent === null ? undefined : `${percent}%` }} />
        </span>
      </div>

      {generator.status === "error" && generator.error && (
        <div className="sg-message" role="alert">
          <strong>Não foi possível gerar a legenda</strong>
          <span>{generator.error.message}</span>
          {result?.cues.length > 0 && (
            <span>As legendas dos trechos já processados estão abaixo e podem ser baixadas.</span>
          )}
        </div>
      )}

      <SubtitleStatCards result={result} />

      <div className="sg-tabs" role="tablist">
        {tabs.map(({ id, icon: Icon, label, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "is-active" : undefined}
            onClick={() => setTab(id)}
          >
            <Icon aria-hidden="true" /> {label}
            {count > 0 && <span className="sg-badge">{count}</span>}
          </button>
        ))}
      </div>

      {tab === "cues" && <SubtitlePreview file={file} result={result} onEdit={generator.updateCue} />}
      {tab === "srt" && <SrtPreview result={result} onDownload={handleDownload} onCopied={setMessage} />}
      {tab === "log" && <ExecutionLog entries={generator.log} />}
    </div>
  );
}
