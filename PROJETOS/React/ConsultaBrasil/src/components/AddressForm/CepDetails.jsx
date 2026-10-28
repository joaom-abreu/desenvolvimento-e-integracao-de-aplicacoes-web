import { FiMap } from "react-icons/fi";
import { formatOneLine, mapsUrl } from "./addressText";

/** Tudo o que o CEP diz além do endereço: DDD, código IBGE, região... */
export default function CepDetails({ address, state }) {
  if (!address) {
    return (
      <section className="cb-card cb-empty">
        <FiMap className="cb-empty-icon" aria-hidden="true" />
        <p>Digite um CEP para ver de onde ele é: cidade, DDD, código IBGE e região.</p>
      </section>
    );
  }

  const rows = [
    ["CEP", address.cep],
    ["Cidade", `${address.city} – ${address.uf}`],
    ["Estado", address.state || state?.nome],
    ["Região", address.region || state?.regiao],
    ["DDD", address.ddd],
    ["Código IBGE", address.cityCode],
    ["Complemento do CEP", address.complement],
    ["Unidade", address.unit],
  ].filter(([, value]) => value);

  return (
    <section className="cb-card">
      <div className="cb-card-head">
        <h3>Sobre este CEP</h3>
        <a
          className="cb-link-button"
          href={mapsUrl(formatOneLine({ ...address, number: "" }))}
          target="_blank"
          rel="noreferrer"
        >
          <FiMap aria-hidden="true" /> Ver no mapa
        </a>
      </div>
      <dl className="cb-facts">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
