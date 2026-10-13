import { useState } from "react";
import { LuCircleAlert, LuLink, LuLoaderCircle, LuScissors } from "react-icons/lu";
import APP_CONFIG from "../../config/appConfig";
import { generateShortUrl } from "../../services/urlService";
import { nowForDateTimeLocal, withoutProtocol } from "../../utils/format";
import "./ShortenForm.css";

const PREFIXO = `${withoutProtocol(APP_CONFIG.SHORT_URL_BASE)}/`;

/**
 * Caixa principal: cola a URL longa e clica em Encurtar.
 * Embaixo, as opções: alias personalizado e data de expiração.
 * Faz o papel do POST /api/shorten do Spring.
 */
function ShortenForm({ onCreated, disabled = false }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiracao, setExpiracao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const bloqueado = disabled || enviando;

  const enviar = async (evento) => {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const novo = await generateShortUrl(url, { alias, expirationDate: expiracao });
      onCreated(novo);
      setUrl("");
      setAlias("");
      setExpiracao("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="shorten-form" onSubmit={enviar} noValidate>
      {/* =====================================================
          CAIXA DA URL LONGA + BOTÃO
          ===================================================== */}
      <label htmlFor="url-longa" className="sr-only">
        URL longa
      </label>

      <div className="shorten-main">
        <LuLink className="shorten-main-icon" aria-hidden="true" />

        <input
          id="url-longa"
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Cole aqui a sua URL longa"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={bloqueado}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "erro-encurtar" : undefined}
        />

        <button type="submit" className="btn btn-primary shorten-submit" disabled={bloqueado}>
          {enviando ? (
            <LuLoaderCircle className="spin" aria-hidden="true" />
          ) : (
            <LuScissors aria-hidden="true" />
          )}
          <span>{enviando ? "Encurtando..." : "Encurtar"}</span>
        </button>
      </div>

      {/* =====================================================
          OPÇÕES: ALIAS E EXPIRAÇÃO
          ===================================================== */}
      <div className="shorten-options">
        <div className="field">
          <label htmlFor="alias" className="field-label">
            Alias <small>(opcional)</small>
          </label>
          <div className="field-prefixed">
            <span className="field-prefix" aria-hidden="true">
              {PREFIXO}
            </span>
            <input
              id="alias"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={32}
              placeholder="meu-link"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              disabled={bloqueado}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="expiracao" className="field-label">
            Expira em <small>(opcional)</small>
          </label>
          <input
            id="expiracao"
            className="field-input"
            type="datetime-local"
            min={nowForDateTimeLocal()}
            value={expiracao}
            onChange={(e) => setExpiracao(e.target.value)}
            disabled={bloqueado}
          />
        </div>
      </div>

      {erro && (
        <p id="erro-encurtar" className="form-message error" role="alert">
          <LuCircleAlert aria-hidden="true" />
          {erro}
        </p>
      )}
    </form>
  );
}

export default ShortenForm;
