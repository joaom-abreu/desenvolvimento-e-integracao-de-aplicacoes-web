import { memo, useEffect, useState } from "react";
import {
  LuCalendarClock,
  LuExternalLink,
  LuLoaderCircle,
  LuMousePointerClick,
  LuTrash2,
} from "react-icons/lu";
import { buildShortLink } from "../../services/urlService";
import { formatClicks, formatDateTime, withoutProtocol } from "../../utils/format";
import CopyButton from "../CopyButton/CopyButton";

/**
 * Um link do histórico.
 * Excluir pede confirmação: o 1º clique arma o botão, o 2º apaga.
 */
function UrlHistoryItem({ url, excluindo, onDelete }) {
  const [confirmando, setConfirmando] = useState(false);
  const link = buildShortLink(url.shortUrl);
  const expirado = url.expired;

  // Desarma a confirmação depois de alguns segundos
  useEffect(() => {
    if (!confirmando) return;
    const timer = setTimeout(() => setConfirmando(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmando]);

  const aoExcluir = () => {
    if (confirmando) onDelete(url.shortUrl);
    else setConfirmando(true);
  };

  return (
    <li className={`history-item${expirado ? " is-expired" : ""}`}>
      <div className="history-info">
        <a className="history-link" href={link} target="_blank" rel="noreferrer">
          {withoutProtocol(link)}
        </a>

        <p className="history-original" title={url.originalUrl}>
          {url.originalUrl}
        </p>

        <p className="history-meta">
          <span>Criado em {formatDateTime(url.createdAt)}</span>
          {url.expirationDate && (
            <span className={`history-tag${expirado ? " expired" : ""}`}>
              <LuCalendarClock aria-hidden="true" />
              {expirado ? "Expirado" : `Expira em ${formatDateTime(url.expirationDate)}`}
            </span>
          )}
        </p>
      </div>

      <div className="history-side">
        <span className="history-clicks" title="Cliques">
          <LuMousePointerClick aria-hidden="true" />
          {formatClicks(url.clicks)}
        </span>

        <div className="history-actions">
          <CopyButton text={link} label="Copiar" className="btn-icon" iconOnly />

          <a
            className="btn-icon"
            href={link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Abrir ${link}`}
            title="Abrir"
          >
            <LuExternalLink aria-hidden="true" />
          </a>

          <button
            type="button"
            className={confirmando ? "btn btn-sm history-confirm" : "btn-icon danger"}
            onClick={aoExcluir}
            disabled={excluindo}
            aria-label={confirmando ? `Confirmar exclusão de ${link}` : `Excluir ${link}`}
            title={confirmando ? undefined : "Excluir"}
          >
            {excluindo ? (
              <LuLoaderCircle className="spin" aria-hidden="true" />
            ) : (
              <LuTrash2 aria-hidden="true" />
            )}
            {confirmando && <span>Excluir?</span>}
          </button>
        </div>
      </div>
    </li>
  );
}

// memo: atualizar um item (ou copiar) não redesenha a lista inteira
export default memo(UrlHistoryItem);
