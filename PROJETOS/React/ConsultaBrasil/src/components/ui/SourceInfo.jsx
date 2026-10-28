import { FiCode, FiZap } from "react-icons/fi";
import CopyButton from "./CopyButton";

/**
 * Mostra de onde veio o dado (API, tempo, cache, plano B) e, ao abrir,
 * a URL chamada e o JSON cru que a API devolveu. Bom para estudar.
 */
export default function SourceInfo({ result }) {
  if (!result) return null;
  const json = JSON.stringify(result.data, null, 2);

  return (
    <details className="cb-source">
      <summary>
        <span className="cb-source-chip">
          Fonte: <strong>{result.source}</strong>
        </span>
        {result.cached ? (
          <span className="cb-source-chip is-cache">
            <FiZap aria-hidden="true" /> do cache, sem requisição
          </span>
        ) : (
          <span className="cb-source-chip">{result.ms} ms</span>
        )}
        {result.fallbackFrom && (
          <span className="cb-source-chip is-fallback" title={result.fallbackReason}>
            {result.fallbackFrom} falhou, usei a reserva
          </span>
        )}
        <span className="cb-source-toggle">
          <FiCode aria-hidden="true" /> Ver resposta da API
        </span>
      </summary>

      <div className="cb-source-body">
        <div className="cb-source-url">
          <code>GET {result.url}</code>
          <CopyButton text={result.url} label="Copiar URL" />
        </div>
        <pre>{json}</pre>
      </div>
    </details>
  );
}
