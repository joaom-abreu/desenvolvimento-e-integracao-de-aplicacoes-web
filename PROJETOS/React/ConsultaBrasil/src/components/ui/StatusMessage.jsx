import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiRefreshCw, FiSearch, FiWifiOff, FiClock } from "react-icons/fi";

const ICONS = {
  NotFoundError: FiSearch,
  NetworkError: FiWifiOff,
  TimeoutError: FiClock,
};

const TONE_ICONS = {
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  success: FiCheckCircle,
  info: FiInfo,
};

/**
 * Caixa de mensagem. Para erros de API, passe "error" e (opcional) "onRetry":
 *   <StatusMessage error={cep.error} onRetry={cep.retry} />
 * O ícone muda conforme o tipo do erro (sem rede, demorou, não encontrado...).
 */
export default function StatusMessage({ tone = "info", title, children, error, onRetry }) {
  const finalTone = error ? (error.name === "NotFoundError" ? "warning" : "error") : tone;
  const Icon = (error && ICONS[error.name]) || TONE_ICONS[finalTone];

  return (
    <div className={`cb-status is-${finalTone}`} role={finalTone === "error" ? "alert" : "status"}>
      <Icon className="cb-status-icon" aria-hidden="true" />
      <div className="cb-status-body">
        {title && <strong>{title}</strong>}
        {error ? <p>{error.message}</p> : children}
      </div>
      {error && onRetry && error.retryable !== false && (
        <button type="button" className="cb-link-button" onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" /> Tentar de novo
        </button>
      )}
    </div>
  );
}
