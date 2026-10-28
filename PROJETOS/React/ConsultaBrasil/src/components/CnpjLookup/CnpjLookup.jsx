import { useState } from "react";
import { FiBriefcase, FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { EXAMPLES, TIMING } from "../../config/appConfig";
import { CNPJ_LENGTH, cleanCnpj, isAlphanumericCnpj, maskCnpj, validateCnpj } from "../../core/cnpj";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useRequest from "../../hooks/useRequest";
import { getCnpj } from "../../services/brasilApiService";
import Field from "../ui/Field";
import SourceInfo from "../ui/SourceInfo";
import Spinner from "../ui/Spinner";
import StatusMessage from "../ui/StatusMessage";
import CnpjResult from "./CnpjResult";
import "./CnpjLookup.css";

/**
 * Consulta de CNPJ na BrasilAPI (dados públicos da Receita Federal).
 * Os dígitos verificadores são conferidos ANTES da requisição: um CNPJ
 * digitado errado nem chega a sair do navegador.
 */
export default function CnpjLookup() {
  const [value, setValue] = useState("");
  const clean = cleanCnpj(value);
  const check = validateCnpj(clean);

  const debounced = useDebouncedValue(clean, TIMING.CNPJ_DEBOUNCE_MS);
  const ready = check.valid && debounced === clean;
  const request = useRequest((signal) => getCnpj(debounced, { signal }), ready ? debounced : null);

  let message = "Digite os 14 caracteres. A consulta começa sozinha.";
  let error = false;
  if (clean.length > 0 && clean.length < CNPJ_LENGTH) message = `Faltam ${CNPJ_LENGTH - clean.length} caracteres.`;
  else if (clean.length === CNPJ_LENGTH && !check.valid) {
    message = check.reason;
    error = true;
  } else if (check.valid && request.status === "loading") message = "Consultando a Receita Federal...";
  else if (check.valid) message = "Dígitos verificadores conferem.";

  return (
    <div className="cb-stack">
      <section className="cb-card cb-form">
        <div className="cb-card-head">
          <div>
            <h3>Consultar CNPJ</h3>
            <p className="cb-card-note">Aceita o CNPJ alfanumérico (com letras), emitido desde julho de 2026.</p>
          </div>
          <div className="cb-head-actions">
            <button type="button" className="cb-link-button" onClick={() => setValue(EXAMPLES.CNPJ)}>
              Usar exemplo
            </button>
            <button type="button" className="cb-link-button" onClick={() => setValue("")}>
              <FiRotateCcw aria-hidden="true" /> Limpar
            </button>
          </div>
        </div>

        <Field
          id="cnpj"
          label="CNPJ"
          message={message}
          error={error}
          adornment={
            request.status === "loading" ? (
              <Spinner label="Consultando" />
            ) : check.valid ? (
              <FiCheckCircle className="cb-ok" aria-label="CNPJ válido" />
            ) : (
              <FiBriefcase aria-hidden="true" />
            )
          }
        >
          <input
            id="cnpj"
            className="cb-input-lg"
            placeholder="00.000.000/0000-00"
            autoCapitalize="characters"
            spellCheck="false"
            value={value}
            onChange={(e) => setValue(maskCnpj(e.target.value))}
            aria-invalid={error}
            aria-describedby="cnpj-msg"
          />
        </Field>

        {check.valid && isAlphanumericCnpj(clean) && (
          <StatusMessage tone="info">
            <p>CNPJ alfanumérico: o formato é válido, mas a base pública pode ainda não ter empresas assim.</p>
          </StatusMessage>
        )}
      </section>

      {request.status === "error" && <StatusMessage error={request.error} onRetry={request.retry} />}

      {request.data && (
        <>
          <CnpjResult company={request.data.data} />
          <SourceInfo result={request.data} />
        </>
      )}
    </div>
  );
}
