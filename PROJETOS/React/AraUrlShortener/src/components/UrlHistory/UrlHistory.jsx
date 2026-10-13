import { LuCircleAlert, LuHistory, LuRefreshCw } from "react-icons/lu";
import UrlHistoryItem from "./UrlHistoryItem";
import "./UrlHistory.css";

/** Lista "Seus links": os links criados neste navegador, com cliques e expiração. */
function UrlHistory({ urls, carregando, excluindo, erro, habilitado, onRefresh, onDelete }) {
  const vazio = !carregando && urls.length === 0;

  return (
    <section className="history" aria-labelledby="history-title">
      <header className="history-header">
        <div>
          <h2 id="history-title">
            <LuHistory aria-hidden="true" />
            Seus links
            {urls.length > 0 && <span className="history-count">{urls.length}</span>}
          </h2>
          <p>Salvos neste navegador</p>
        </div>

        <button
          type="button"
          className="btn btn-sm"
          onClick={onRefresh}
          disabled={!habilitado || carregando}
        >
          <LuRefreshCw className={carregando ? "spin" : undefined} aria-hidden="true" />
          <span>Atualizar</span>
        </button>
      </header>

      {erro && (
        <p className="form-message error" role="alert">
          <LuCircleAlert aria-hidden="true" />
          {erro}
        </p>
      )}

      {carregando && urls.length === 0 && (
        <ul className="history-list" aria-hidden="true">
          {[0, 1].map((i) => (
            <li key={i} className="history-item history-skeleton" />
          ))}
        </ul>
      )}

      {vazio && (
        <p className="history-empty">
          Os links que você encurtar aparecem aqui, com o número de cliques.
        </p>
      )}

      {urls.length > 0 && (
        <ul className="history-list">
          {urls.map((url) => (
            <UrlHistoryItem
              key={url.shortUrl}
              url={url}
              excluindo={excluindo === url.shortUrl}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default UrlHistory;
