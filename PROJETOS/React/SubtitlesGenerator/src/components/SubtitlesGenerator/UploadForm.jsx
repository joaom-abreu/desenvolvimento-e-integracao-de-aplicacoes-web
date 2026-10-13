import { useRef, useState } from "react";
import { FiFilm, FiKey, FiPlay, FiSquare, FiUploadCloud, FiX } from "react-icons/fi";
import CONFIG from "../../config/subtitlesConfig";
import { fileExtension, formatBytes } from "./format";
import "./SubtitlesGenerator.css";

/**
 * Formulário: vídeo (arrastar e soltar ou escolher), opções e botões.
 * É "controlado": o arquivo, os valores e os setters vêm do componente pai.
 */
export default function UploadForm({ file, onFile, values, onChange, onSubmit, onCancel, running, server }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const set = (field) => (event) => {
    const { type, checked, value } = event.target;
    onChange({
      ...values,
      [field]: type === "checkbox" ? checked : type === "select-one" && /^\d+$/.test(value) ? Number(value) : value,
    });
  };

  const pick = (files) => {
    const chosen = files?.[0];
    if (chosen) onFile(chosen);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!running) pick(event.dataTransfer.files);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  const keyHint =
    server === null
      ? "Verificando a chave do Gemini no servidor…"
      : server.hasKey
        ? `GEMINI_API_KEY carregada do .env.local (fica só no servidor) · modelo ${server.model}.`
        : server.error
          ? server.error
          : "Sem GEMINI_API_KEY: configure o .env.local e reinicie o npm run dev.";

  return (
    <form className="sg-card sg-form" onSubmit={handleSubmit}>
      {/* Área de arrastar e soltar (é um <label>: clicar abre o seletor) */}
      <label
        className={`sg-drop${dragging ? " is-dragging" : ""}${file ? " has-file" : ""}${running ? " is-disabled" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!running) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={CONFIG.ACCEPT}
          onChange={(event) => {
            pick(event.target.files);
            event.target.value = ""; // permite escolher o mesmo arquivo de novo
          }}
          disabled={running}
        />

        {file ? (
          <span className="sg-file">
            <span className="sg-file-icon" aria-hidden="true">
              <FiFilm />
            </span>
            <span className="sg-file-info">
              <strong title={file.name}>{file.name}</strong>
              <small>
                {fileExtension(file.name) || "Arquivo"} · {formatBytes(file.size)} · clique ou arraste outro
                arquivo para trocar
              </small>
            </span>
            {!running && (
              <button
                type="button"
                className="sg-file-remove"
                title="Remover arquivo"
                aria-label="Remover arquivo"
                onClick={(event) => {
                  event.preventDefault();
                  onFile(null);
                }}
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </span>
        ) : (
          <span className="sg-drop-empty">
            <FiUploadCloud aria-hidden="true" />
            <strong>Arraste o vídeo para cá ou clique para escolher</strong>
            <small>MP4, AVI, MKV, MOV, WMV, WEBM ou só o áudio (MP3, WAV, M4A)</small>
          </span>
        )}
      </label>

      <div className="sg-form-grid">
        <label className="sg-field">
          <span>Idioma falado no vídeo</span>
          <select value={values.language} onChange={set("language")} disabled={running}>
            {CONFIG.LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sg-field">
          <span>Tamanho de cada trecho</span>
          <select value={values.chunkSeconds} onChange={set("chunkSeconds")} disabled={running}>
            {CONFIG.CHUNK_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sg-field">
          <span>Caracteres por linha</span>
          <select value={values.maxLine} onChange={set("maxLine")} disabled={running}>
            {CONFIG.LINE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} caracteres{n === 42 ? " (padrão)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sg-form-bottom">
        <div className="sg-checks">
          <label className="sg-check">
            <input type="checkbox" checked={values.sounds} onChange={set("sounds")} disabled={running} />
            Indicar sons entre colchetes ([música], [risos])
          </label>
        </div>

        <div className="sg-actions">
          <button
            type="button"
            className="sg-button sg-button-ghost"
            onClick={onCancel}
            disabled={!running}
            title="Cancelar (Esc)"
          >
            <FiSquare aria-hidden="true" /> Cancelar
          </button>
          <button type="submit" className="sg-button" disabled={running || !file}>
            <FiPlay aria-hidden="true" /> {running ? "Gerando…" : "Gerar legenda"}
          </button>
        </div>
      </div>

      <p className={`sg-key-hint${server && !server.hasKey ? " is-warning" : ""}`}>
        <FiKey aria-hidden="true" /> {keyHint}
      </p>
    </form>
  );
}
