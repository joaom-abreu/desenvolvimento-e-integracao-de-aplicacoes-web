import { FaRegLightbulb } from "react-icons/fa";
import { FiRotateCcw } from "react-icons/fi";
import PIX_CONFIG from "../../config/pixConfig";

/** Um campo do formulário com rótulo, dica/erro e contador opcional. */
function Field({ id, label, hint, error, count, max, children }) {
  return (
    <div className={`pix-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {max != null && (
          <span className="pix-count" aria-hidden="true">
            {count}/{max}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="pix-field-msg is-error" id={`${id}-msg`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="pix-field-msg" id={`${id}-msg`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Formulário do Pix: tipo e chave, recebedor, valor e campos opcionais.
 * Todo o estado vem do usePixGenerator (via props).
 */
export default function PixForm({ form, errorOf, normalizedKey, descriptionMax, update, changeKeyType, touch, fillExample, reset }) {
  const keyType = PIX_CONFIG.KEY_TYPES.find((t) => t.value === form.keyType);
  const bind = (field) => ({
    id: `pix-${field}`,
    value: form[field],
    onChange: (event) => update(field, event.target.value),
    onBlur: () => touch(field),
    "aria-invalid": Boolean(errorOf(field)),
    "aria-describedby": `pix-${field}-msg`,
  });

  const keyHint =
    normalizedKey && normalizedKey !== form.key.trim() ? (
      <>
        No código: <code>{normalizedKey}</code>
      </>
    ) : null;

  return (
    <section className="pix-card pix-form" aria-labelledby="pix-form-title">
      <div className="pix-card-head">
        <h3 id="pix-form-title">Dados do Pix</h3>
        <div className="pix-head-actions">
          <button type="button" className="pix-link-button" onClick={fillExample}>
            <FaRegLightbulb aria-hidden="true" /> Preencher exemplo
          </button>
          <button type="button" className="pix-link-button" onClick={reset}>
            <FiRotateCcw aria-hidden="true" /> Limpar
          </button>
        </div>
      </div>

      {/* Tipo da chave */}
      <fieldset className="pix-key-types">
        <legend>Tipo de chave</legend>
        <div className="pix-segmented" role="radiogroup">
          {PIX_CONFIG.KEY_TYPES.map((type) => (
            <label key={type.value} className={form.keyType === type.value ? "is-active" : ""}>
              <input
                type="radio"
                name="keyType"
                value={type.value}
                checked={form.keyType === type.value}
                onChange={() => changeKeyType(type.value)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="pix-key" label="Chave Pix" error={errorOf("key")} hint={keyHint}>
        <input
          {...bind("key")}
          placeholder={keyType.placeholder}
          inputMode={form.keyType === "cpf" || form.keyType === "phone" ? "numeric" : form.keyType === "email" ? "email" : "text"}
          autoComplete="off"
          spellCheck="false"
        />
      </Field>

      <div className="pix-grid">
        <Field
          id="pix-name"
          label="Nome de quem recebe"
          error={errorOf("name")}
          hint="Sem acentos e em maiúsculas no código."
          count={form.name.length}
          max={PIX_CONFIG.MAX_NAME}
        >
          <input {...bind("name")} maxLength={PIX_CONFIG.MAX_NAME} placeholder="PUC Minas" autoComplete="name" />
        </Field>

        <Field id="pix-city" label="Cidade" error={errorOf("city")} count={form.city.length} max={PIX_CONFIG.MAX_CITY}>
          <input {...bind("city")} maxLength={PIX_CONFIG.MAX_CITY} placeholder="Belo Horizonte" autoComplete="address-level2" />
        </Field>
      </div>

      <div className="pix-grid">
        <Field id="pix-amount" label="Valor" error={errorOf("amount")} hint="Vazio: quem paga digita o valor.">
          <div className="pix-money">
            <span aria-hidden="true">R$</span>
            <input {...bind("amount")} inputMode="decimal" placeholder="0,00" autoComplete="off" />
          </div>
        </Field>

        <Field
          id="pix-txid"
          label="Identificador (opcional)"
          hint="Letras e números, para conciliar o pagamento."
          count={form.txid.length}
          max={PIX_CONFIG.MAX_TXID}
        >
          <input {...bind("txid")} maxLength={PIX_CONFIG.MAX_TXID} placeholder="PEDIDO123" autoComplete="off" spellCheck="false" />
        </Field>
      </div>

      <Field
        id="pix-description"
        label="Descrição (opcional)"
        error={errorOf("description")}
        hint="Alguns bancos mostram este texto para quem paga."
        count={form.description.length}
        max={descriptionMax}
      >
        <input {...bind("description")} placeholder="Lanche da cantina" autoComplete="off" />
      </Field>

      <label className="pix-check">
        <input type="checkbox" checked={form.singleUse} onChange={(event) => update("singleUse", event.target.checked)} />
        <span>
          Código de uso único
          <small>Adiciona o campo 01 = 12. Bancos podem recusar um segundo pagamento com o mesmo código.</small>
        </span>
      </label>
    </section>
  );
}
