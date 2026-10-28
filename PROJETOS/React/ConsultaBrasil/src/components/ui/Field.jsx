/**
 * Campo com rótulo, mensagem embaixo e um "adorno" à direita (rodinha, ícone).
 *   <Field id="cep" label="CEP" message="..." error adornment={<Spinner />}>
 *     <input id="cep" ... />
 *   </Field>
 */
export default function Field({ id, label, hint, message, error, adornment, highlight, className = "", children }) {
  const classes = ["cb-field", error && "has-error", highlight && "is-filled", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <label htmlFor={id}>
        {label}
        {hint && <span className="cb-hint">{hint}</span>}
      </label>
      <div className="cb-control">
        {children}
        {adornment && <span className="cb-adornment">{adornment}</span>}
      </div>
      {message && (
        <p id={`${id}-msg`} className={`cb-field-msg${error ? " is-error" : ""}`}>
          {message}
        </p>
      )}
    </div>
  );
}
