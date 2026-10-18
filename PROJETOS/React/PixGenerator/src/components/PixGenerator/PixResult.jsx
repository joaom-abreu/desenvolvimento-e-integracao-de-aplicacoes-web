import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { FaPix } from "react-icons/fa6";
import { FiCheck, FiCopy, FiDownload, FiImage } from "react-icons/fi";
import PIX_CONFIG from "../../config/pixConfig";
import { detectKeyType, formatKey } from "../../core";
import { copyText } from "../../utils/clipboard";
import { downloadPng, downloadSvg } from "../../utils/download";
import { fileNameFor, formatMoney, KEY_LABELS } from "./format";

/**
 * QR Code + Pix copia e cola + resumo de quem recebe.
 * Serve tanto para o código gerado quanto para o código lido no leitor.
 */
export default function PixResult({ result, title = "Seu Pix", emptyText }) {
  const qrRef = useRef(null);
  const [size, setSize] = useState(PIX_CONFIG.DEFAULT_QR_SIZE);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  if (!result) {
    return (
      <section className="pix-card pix-result is-empty" aria-live="polite">
        <div className="pix-qr-placeholder" aria-hidden="true">
          <FaPix />
        </div>
        <p className="pix-empty">{emptyText}</p>
      </section>
    );
  }

  const svg = () => qrRef.current?.querySelector("svg");
  const keyType = result.key ? detectKeyType(result.key) : "dynamic";

  const copy = async () => {
    try {
      await copyText(result.payload);
      setCopied(true);
      setMessage("Código copiado.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Não foi possível copiar. Selecione o código e use Ctrl+C.");
    }
  };

  const savePng = async () => {
    try {
      await downloadPng(svg(), fileNameFor(result, "png"), PIX_CONFIG.QR_DOWNLOAD_SIZE);
      setMessage("PNG baixado.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveSvg = () => {
    downloadSvg(svg(), fileNameFor(result, "svg"));
    setMessage("SVG baixado.");
  };

  return (
    <section className="pix-card pix-result" aria-labelledby="pix-result-title">
      <div className="pix-card-head">
        <h3 id="pix-result-title">{title}</h3>
        <select
          className="pix-select"
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
          aria-label="Tamanho do QR Code na tela"
        >
          {PIX_CONFIG.QR_SIZES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pix-qr" ref={qrRef}>
        <QRCodeSVG
          value={result.payload}
          size={size}
          level={PIX_CONFIG.QR_LEVEL}
          marginSize={PIX_CONFIG.QR_MARGIN}
          title={`QR Code Pix para ${result.name}`}
        />
      </div>

      <dl className="pix-summary">
        <div className={`pix-summary-amount ${result.amount == null ? "is-free" : ""}`}>
          <dt>Valor</dt>
          <dd>{formatMoney(result.amount)}</dd>
        </div>
        <div>
          <dt>Recebedor</dt>
          <dd>
            {result.name} · {result.city}
          </dd>
        </div>
        <div>
          <dt>Chave ({KEY_LABELS[keyType]})</dt>
          <dd className="pix-break">{result.key ? formatKey(keyType, result.key) : result.dynamicUrl}</dd>
        </div>
        {result.txid && result.txid !== PIX_CONFIG.EMPTY_TXID && (
          <div>
            <dt>Identificador</dt>
            <dd>{result.txid}</dd>
          </div>
        )}
        {result.description && (
          <div>
            <dt>Descrição</dt>
            <dd>{result.description}</dd>
          </div>
        )}
      </dl>

      <div className="pix-copy">
        <label htmlFor="pix-payload">Pix copia e cola</label>
        <textarea id="pix-payload" readOnly value={result.payload} rows={5} onFocus={(event) => event.target.select()} />
      </div>

      <div className="pix-actions">
        <button type="button" className="pix-button" onClick={copy}>
          {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
          {copied ? "Copiado" : "Copiar código"}
        </button>
        <button type="button" className="pix-button pix-button-ghost" onClick={savePng}>
          <FiImage aria-hidden="true" /> Baixar PNG
        </button>
        <button type="button" className="pix-button pix-button-ghost" onClick={saveSvg}>
          <FiDownload aria-hidden="true" /> Baixar SVG
        </button>
      </div>

      <p className="pix-sr-only" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
