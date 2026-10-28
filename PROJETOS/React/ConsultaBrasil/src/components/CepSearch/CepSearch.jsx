import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { EXAMPLES, TIMING } from "../../config/appConfig";
import { formatNumber } from "../../core/format";
import { normalize } from "../../core/text";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useRequest from "../../hooks/useRequest";
import { searchCepByAddress } from "../../services/locationService";
import StateCitySelect from "../StateCitySelect/StateCitySelect";
import CopyButton from "../ui/CopyButton";
import Field from "../ui/Field";
import SourceInfo from "../ui/SourceInfo";
import Spinner from "../ui/Spinner";
import StatusMessage from "../ui/StatusMessage";
import "./CepSearch.css";

const MIN_STREET = 3;
const VIACEP_LIMIT = 50;

/**
 * Busca reversa: estado + cidade + parte do nome da rua → lista de CEPs.
 * Útil para o "Não sei meu CEP" do formulário.
 */
export default function CepSearch({ preset, onUse }) {
  const [uf, setUf] = useState("");
  const [city, setCity] = useState({ code: "", name: "" });
  const [street, setStreet] = useState("");
  const [filter, setFilter] = useState("");

  // Estado e cidade que vieram do formulário ("Não sei meu CEP")
  useEffect(() => {
    if (!preset) return;
    setUf(preset.uf || "");
    setCity({ code: preset.cityCode || "", name: "" });
  }, [preset]);

  const debouncedStreet = useDebouncedValue(street.trim(), TIMING.STREET_DEBOUNCE_MS);
  const ready = Boolean(uf && city.name && debouncedStreet.length >= MIN_STREET);
  const key = ready ? `${uf}|${city.name}|${debouncedStreet}` : null;

  const search = useRequest(
    (signal) => searchCepByAddress(uf, city.name, debouncedStreet, { signal }),
    key,
    { keepPrevious: true }
  );

  const results = useMemo(() => {
    const list = search.data?.addresses ?? [];
    const f = normalize(filter);
    return f ? list.filter((a) => normalize(`${a.neighborhood} ${a.street} ${a.complement}`).includes(f)) : list;
  }, [search.data, filter]);

  const handleUf = (value) => {
    setUf(value);
    setCity({ code: "", name: "" });
    setFilter("");
  };
  const handleCity = useCallback((c) => {
    setCity(c);
    setFilter("");
  }, []);

  const fillExample = () => {
    setUf(EXAMPLES.STREET.uf);
    setCity({ code: EXAMPLES.STREET.cityCode, name: "" });
    setStreet(EXAMPLES.STREET.street);
  };

  const total = search.data?.addresses.length ?? 0;
  const tooShort = street.trim().length > 0 && street.trim().length < MIN_STREET;
  const typing = street.trim() !== debouncedStreet;

  return (
    <div className="cb-stack">
      <section className="cb-card cb-form">
        <div className="cb-card-head">
          <div>
            <h3>Buscar CEP pelo endereço</h3>
            <p className="cb-card-note">Escolha o estado e a cidade e digite pelo menos 3 letras da rua.</p>
          </div>
          <button type="button" className="cb-link-button" onClick={fillExample}>
            Usar exemplo
          </button>
        </div>

        <div className="cb-grid cb-grid-3">
          <StateCitySelect
            idPrefix="search"
            uf={uf}
            cityCode={city.code}
            cityName={city.name}
            onUfChange={handleUf}
            onCityChange={handleCity}
          />
          <Field
            id="search-street"
            label="Rua"
            error={tooShort}
            message={tooShort ? `Digite pelo menos ${MIN_STREET} letras.` : "Pode ser só uma parte: “afonso” acha a Av. Afonso Pena."}
            adornment={search.status === "loading" || (ready && typing) ? <Spinner label="Buscando" /> : <FiSearch aria-hidden="true" />}
          >
            <input
              id="search-street"
              value={street}
              disabled={!city.name}
              placeholder={city.name ? "Nome da rua" : "Escolha a cidade primeiro"}
              onChange={(e) => setStreet(e.target.value)}
            />
          </Field>
        </div>
      </section>

      {search.status === "error" && <StatusMessage error={search.error} onRetry={search.retry} />}

      {search.data && search.status !== "error" && (
        <section className="cb-card">
          <div className="cb-card-head">
            <div>
              <h3>
                {total === VIACEP_LIMIT ? `${VIACEP_LIMIT} CEPs ou mais` : `${formatNumber(total)} ${total === 1 ? "CEP encontrado" : "CEPs encontrados"}`}
              </h3>
              {total === VIACEP_LIMIT && (
                <p className="cb-card-note">O ViaCEP mostra no máximo 50. Digite mais do nome da rua para achar o seu.</p>
              )}
            </div>
            {total > 5 && (
              <input
                className="cb-filter"
                type="search"
                placeholder="Filtrar por bairro..."
                aria-label="Filtrar resultados por bairro"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            )}
          </div>

          {results.length === 0 ? (
            <p className="cb-muted">Nenhum resultado com “{filter}”.</p>
          ) : (
            <div className="cb-table-wrap">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th scope="col">CEP</th>
                    <th scope="col">Rua</th>
                    <th scope="col">Bairro</th>
                    <th scope="col">
                      <span className="cb-sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((a) => (
                    <tr key={`${a.cep}-${a.complement}`}>
                      <td className="cb-nowrap">
                        <strong>{a.cep}</strong>
                      </td>
                      <td>
                        {a.street}
                        {a.complement && <span className="cb-sub">{a.complement}</span>}
                      </td>
                      <td>{a.neighborhood}</td>
                      <td>
                        <div className="cb-row-actions">
                          <CopyButton text={a.cep} label="Copiar" />
                          <button type="button" className="cb-link-button" onClick={() => onUse(a)}>
                            <FiArrowLeft aria-hidden="true" /> Usar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <SourceInfo result={search.data} />
        </section>
      )}
    </div>
  );
}
