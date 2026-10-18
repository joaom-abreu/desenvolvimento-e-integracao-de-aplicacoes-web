import { Fragment, useMemo, useState } from "react";
import { explainPayload } from "../../core";

/**
 * "Raio X" do BR Code: o código com cada campo pintado de uma cor e,
 * embaixo, a tabela ID · tamanho · nome · valor. Passar o mouse (ou o foco)
 * numa linha destaca o trecho do código, e vice-versa.
 */
export default function PayloadBreakdown({ payload }) {
  const fields = useMemo(() => explainPayload(payload), [payload]);
  const [active, setActive] = useState(null);

  const hover = (id) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  });

  return (
    <section className="pix-card pix-breakdown" aria-labelledby="pix-breakdown-title">
      <div className="pix-card-head">
        <div>
          <h3 id="pix-breakdown-title">Campos do código</h3>
          <p className="pix-card-note">
            Cada campo é ID (2 dígitos) + tamanho (2 dígitos) + valor, no padrão EMV do Banco Central.
          </p>
        </div>
      </div>

      <p className="pix-ribbon" aria-label="Código Pix dividido em campos">
        {fields.map((field, index) => (
          <span
            key={field.start}
            className={`pix-seg c${index % 6} ${active === field.id ? "is-active" : ""}`}
            {...hover(field.id)}
          >
            <b>{field.id}</b>
            <i>{String(field.size).padStart(2, "0")}</i>
            {field.value}
          </span>
        ))}
      </p>

      <div className="pix-table-wrap">
        <table className="pix-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Tam.</th>
              <th scope="col">Campo</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <Fragment key={field.start}>
                <tr className={active === field.id ? "is-active" : ""} tabIndex={0} {...hover(field.id)}>
                  <td>
                    <span className={`pix-dot c${index % 6}`} aria-hidden="true" />
                    {field.id}
                  </td>
                  <td>{field.size}</td>
                  <td>{field.name}</td>
                  <td className="pix-break">{field.children ? <span className="pix-muted">subcampos abaixo</span> : <code>{field.value}</code>}</td>
                </tr>
                {field.children?.map((child) => (
                  <tr key={`${field.start}-${child.start}`} className={`is-child ${active === field.id ? "is-active" : ""}`}>
                    <td>{child.id}</td>
                    <td>{child.size}</td>
                    <td>{child.name}</td>
                    <td className="pix-break">
                      <code>{child.value}</code>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
