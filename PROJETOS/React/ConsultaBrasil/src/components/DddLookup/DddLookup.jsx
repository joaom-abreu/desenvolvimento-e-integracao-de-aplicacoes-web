import { useMemo, useState } from "react";
import { FiPhone } from "react-icons/fi";
import { TIMING, UF_BY_SIGLA } from "../../config/appConfig";
import { formatNumber } from "../../core/format";
import { normalize, onlyDigits } from "../../core/text";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useRequest from "../../hooks/useRequest";
import { getDdd } from "../../services/brasilApiService";
import Field from "../ui/Field";
import SourceInfo from "../ui/SourceInfo";
import Spinner from "../ui/Spinner";
import StatusMessage from "../ui/StatusMessage";
import "./DddLookup.css";

// Capitais, para o atalho
const SHORTCUTS = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "91"];

/** Todo DDD tem 2 dígitos, de 11 a 99, e nenhum termina em 0. */
const dddProblem = (ddd) => {
  if (ddd.length < 2) return null;
  if (ddd[0] === "0") return "DDD não começa com 0. Digite sem o zero da operadora.";
  if (ddd[1] === "0") return "Nenhum DDD termina em 0.";
  return null;
};

/** Estado e cidades atendidas por um DDD (BrasilAPI /ddd/v1). */
export default function DddLookup() {
  const [ddd, setDdd] = useState("");
  const [filter, setFilter] = useState("");
  const debounced = useDebouncedValue(ddd, TIMING.DDD_DEBOUNCE_MS);
  const problem = dddProblem(ddd);
  const ready = ddd.length === 2 && !problem && debounced === ddd;

  const request = useRequest((signal) => getDdd(debounced, { signal }), ready ? debounced : null);

  const cities = useMemo(() => {
    const list = request.data?.cities ?? [];
    const f = normalize(filter);
    return f ? list.filter((c) => normalize(c).includes(f)) : list;
  }, [request.data, filter]);

  const choose = (value) => {
    setDdd(value);
    setFilter("");
  };

  const state = request.data ? UF_BY_SIGLA[request.data.state] : null;

  return (
    <div className="cb-stack">
      <section className="cb-card cb-form">
        <div className="cb-card-head">
          <div>
            <h3>De onde é esse DDD?</h3>
            <p className="cb-card-note">Veja o estado e todas as cidades atendidas por um código de área.</p>
          </div>
        </div>

        <div className="ddd-row">
          <Field
            id="ddd"
            label="DDD"
            error={Boolean(problem)}
            message={problem || "Dois números, sem o zero."}
            adornment={request.status === "loading" ? <Spinner label="Consultando" /> : <FiPhone aria-hidden="true" />}
          >
            <input
              id="ddd"
              className="cb-input-lg ddd-input"
              inputMode="numeric"
              placeholder="31"
              value={ddd}
              onChange={(e) => choose(onlyDigits(e.target.value).slice(0, 2))}
              aria-invalid={Boolean(problem)}
            />
          </Field>

          <div className="ddd-shortcuts" role="group" aria-label="DDDs das capitais">
            <span className="cb-card-note">Capitais:</span>
            {SHORTCUTS.map((d) => (
              <button
                key={d}
                type="button"
                className={`cb-chip${d === ddd ? " is-active" : ""}`}
                aria-pressed={d === ddd}
                onClick={() => choose(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {request.status === "error" && <StatusMessage error={request.error} onRetry={request.retry} />}

      {request.data && (
        <section className="cb-card">
          <div className="cb-card-head">
            <div>
              <h3>
                DDD {debounced}: {state ? `${state.nome} (${state.sigla})` : request.data.state}
              </h3>
              <p className="cb-card-note">
                {formatNumber(request.data.cities.length)} {request.data.cities.length === 1 ? "cidade" : "cidades"}
                {state && `, região ${state.regiao}`}
              </p>
            </div>
            {request.data.cities.length > 8 && (
              <input
                className="cb-filter"
                type="search"
                placeholder="Filtrar cidades..."
                aria-label="Filtrar cidades"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            )}
          </div>
          {cities.length === 0 ? (
            <p className="cb-muted">Nenhuma cidade com “{filter}”.</p>
          ) : (
            <ul className="ddd-cities">
              {cities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          <SourceInfo result={request.data} />
        </section>
      )}
    </div>
  );
}
