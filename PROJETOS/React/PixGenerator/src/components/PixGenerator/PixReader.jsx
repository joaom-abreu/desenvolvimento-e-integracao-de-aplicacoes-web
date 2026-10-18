import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiClipboard, FiSearch, FiTool } from "react-icons/fi";
import { parsePix, PixParseError } from "../../core";
import PayloadBreakdown from "./PayloadBreakdown";
import PixResult from "./PixResult";

// Exemplo oficial do Manual de Padrões para Iniciação do Pix (Banco Central)
const BCB_EXAMPLE =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D";

/**
 * Leitor: cola um "Pix copia e cola", confere o CRC16 e mostra os campos.
 */
export default function PixReader() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");

  const read = (value = text) => {
    try {
      setParsed(parsePix(value));
      setError("");
    } catch (err) {
      if (!(err instanceof PixParseError)) throw err;
      setParsed(null);
      setError(err.message);
    }
  };

  const paste = async () => {
    try {
      const value = await navigator.clipboard.readText();
      setText(value);
      read(value);
    } catch {
      setError("O navegador não deixou ler a área de transferência. Cole com Ctrl+V.");
    }
  };

  const useExample = () => {
    setText(BCB_EXAMPLE);
    read(BCB_EXAMPLE);
  };

  const fixCrc = () => {
    const fixed = parsed.payload.slice(0, -4) + parsed.crcExpected;
    setText(fixed);
    read(fixed);
  };

  return (
    <div className="pix-stack">
      <section className="pix-card" aria-labelledby="pix-reader-title">
        <div className="pix-card-head">
          <h3 id="pix-reader-title">Ler um Pix copia e cola</h3>
          <button type="button" className="pix-link-button" onClick={useExample}>
            Usar exemplo do Banco Central
          </button>
        </div>

        <div className={`pix-field ${error ? "has-error" : ""}`}>
          <label htmlFor="pix-reader-input">Código</label>
          <textarea
            id="pix-reader-input"
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="00020126580014br.gov.bcb.pix0136..."
            spellCheck="false"
            aria-describedby="pix-reader-msg"
          />
          {error && (
            <p className="pix-field-msg is-error" id="pix-reader-msg" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="pix-actions">
          <button type="button" className="pix-button" onClick={() => read()} disabled={!text.trim()}>
            <FiSearch aria-hidden="true" /> Ler código
          </button>
          <button type="button" className="pix-button pix-button-ghost" onClick={paste}>
            <FiClipboard aria-hidden="true" /> Colar e ler
          </button>
        </div>

        {parsed && (
          <div className={`pix-status ${parsed.crcOk ? "is-ok" : "is-bad"}`} role="status">
            {parsed.crcOk ? (
              <>
                <FiCheckCircle aria-hidden="true" />
                <span>
                  CRC16 confere (<code>{parsed.crcFound}</code>). O código está íntegro.
                </span>
              </>
            ) : (
              <>
                <FiAlertTriangle aria-hidden="true" />
                <span>
                  CRC16 não confere: o código traz <code>{parsed.crcFound}</code>, mas o correto é{" "}
                  <code>{parsed.crcExpected}</code>. Os bancos vão recusar este código.
                </span>
                <button type="button" className="pix-button pix-button-small pix-button-ghost" onClick={fixCrc}>
                  <FiTool aria-hidden="true" /> Corrigir CRC
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {parsed && (
        <div className="pix-columns">
          <PayloadBreakdown payload={parsed.payload} />
          <PixResult result={parsed} title="QR Code deste código" />
        </div>
      )}
    </div>
  );
}
