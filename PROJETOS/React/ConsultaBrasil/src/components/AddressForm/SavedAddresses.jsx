import { FiMap, FiTrash2 } from "react-icons/fi";
import CopyButton from "../ui/CopyButton";
import { formatLines, formatOneLine, mapsUrl } from "./addressText";

/** Lista dos endereços salvos no localStorage. */
export default function SavedAddresses({ list, onRemove }) {
  return (
    <section className="cb-card">
      <div className="cb-card-head">
        <div>
          <h3>Endereços salvos</h3>
          <p className="cb-card-note">Ficam só neste navegador (localStorage).</p>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="cb-muted">Nenhum endereço salvo ainda.</p>
      ) : (
        <ul className="cb-saved">
          {list.map((a) => (
            <li key={a.id}>
              <address>
                {formatLines(a).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <div className="cb-saved-actions">
                <CopyButton text={formatLines(a).join("\n")} />
                <a className="cb-link-button" href={mapsUrl(formatOneLine(a))} target="_blank" rel="noreferrer">
                  <FiMap aria-hidden="true" /> Mapa
                </a>
                <button type="button" className="cb-link-button is-danger" onClick={() => onRemove(a.id)}>
                  <FiTrash2 aria-hidden="true" /> Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
