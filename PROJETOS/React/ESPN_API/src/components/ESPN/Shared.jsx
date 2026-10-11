import { useState } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { resultLabel, resultTitle } from "./translate";

/* Pedaços usados pelo futebol e pelo basquete */

// Escudo do time; se a imagem não carregar, mostra a sigla
export function TeamLogo({ team, size = 32 }) {
  const [failed, setFailed] = useState(false);
  if (!team) return null;

  if (!team.logo || failed) {
    return (
      <span
        className="espn-logo espn-logo-fallback"
        style={{ width: size, height: size, "--team": team.color ?? "var(--brand)" }}
        aria-hidden="true"
      >
        {team.abbr?.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      className="espn-logo"
      src={team.logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// Logo pequeno do campeonato (some se não carregar)
export function LeagueLogo({ league }) {
  const [failed, setFailed] = useState(false);
  if (!league?.logo || failed) return null;
  return (
    <img
      className="espn-league-logo"
      src={league.logo}
      alt=""
      width={18}
      height={18}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// V / E / D
export function ResultBadge({ result }) {
  return (
    <span className={`espn-result espn-result-${result ?? "none"}`} title={resultTitle(result)}>
      {resultLabel(result)}
    </span>
  );
}

export function Kpis({ items }) {
  return (
    <ul className="espn-kpis">
      {items.filter(Boolean).map(({ icon: Icon, label, value, note }) => (
        <li key={label} className="espn-kpi">
          <span className="espn-kpi-label">
            {Icon && <Icon aria-hidden="true" />}
            {label}
          </span>
          <span className="espn-kpi-value">{value}</span>
          {note && <span className="espn-kpi-note">{note}</span>}
        </li>
      ))}
    </ul>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="espn-message error" role="alert">
      <strong>
        <FiAlertTriangle aria-hidden="true" /> Não foi possível carregar os dados da ESPN.
      </strong>
      <span>{error?.message ?? "Tente de novo em alguns segundos."}</span>
      {onRetry && (
        <button type="button" className="espn-retry" onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" /> Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Skeleton({ blocks = [96, 180, 320] }) {
  return (
    <div className="espn-skeleton" aria-hidden="true">
      {blocks.map((height, i) => (
        <span key={i} style={{ height }} />
      ))}
    </div>
  );
}

export function Card({ title, icon: Icon, action, className = "", children }) {
  return (
    <section className={`espn-card ${className}`}>
      {(title || action) && (
        <header className="espn-card-head">
          {title && (
            <h3>
              {Icon && <Icon aria-hidden="true" />}
              {title}
            </h3>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
