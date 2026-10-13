import { LuArrowRight, LuCalendarClock, LuCircleCheck, LuExternalLink, LuX } from "react-icons/lu";
import { buildShortLink } from "../../services/urlService";
import { formatDateTime, withoutProtocol } from "../../utils/format";
import CopyButton from "../CopyButton/CopyButton";
import "./ShortUrlResult.css";

/** Cartão com o link recém-criado: link curto em destaque, copiar e abrir. */
function ShortUrlResult({ url, onClose }) {
  const link = buildShortLink(url.shortUrl);

  return (
    <section className="result" aria-live="polite" aria-label="Link criado">
      <div className="result-header">
        <span className="result-badge">
          <LuCircleCheck aria-hidden="true" />
          Link criado
        </span>

        <button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar">
          <LuX aria-hidden="true" />
        </button>
      </div>

      <div className="result-body">
        <a className="result-link" href={link} target="_blank" rel="noreferrer">
          {withoutProtocol(link)}
        </a>

        <div className="result-actions">
          <CopyButton text={link} className="btn btn-primary" />
          <a className="btn" href={link} target="_blank" rel="noreferrer">
            <LuExternalLink aria-hidden="true" />
            <span>Abrir</span>
          </a>
        </div>
      </div>

      <p className="result-original" title={url.originalUrl}>
        <LuArrowRight aria-hidden="true" />
        <span>{url.originalUrl}</span>
      </p>

      {url.expirationDate && (
        <p className="result-meta">
          <LuCalendarClock aria-hidden="true" />
          Expira em {formatDateTime(url.expirationDate)}
        </p>
      )}
    </section>
  );
}

export default ShortUrlResult;
