import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiMapPin, FiRotateCcw, FiSave } from "react-icons/fi";
import { EXAMPLES, TIMING, UF_BY_SIGLA } from "../../config/appConfig";
import { isCityWideCep, isPlausibleCep, maskCep } from "../../core/cep";
import { onlyDigits } from "../../core/text";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import useRequest from "../../hooks/useRequest";
import useSavedAddresses from "../../hooks/useSavedAddresses";
import { lookupCep } from "../../services/locationService";
import StateCitySelect from "../StateCitySelect/StateCitySelect";
import Field from "../ui/Field";
import SourceInfo from "../ui/SourceInfo";
import Spinner from "../ui/Spinner";
import StatusMessage from "../ui/StatusMessage";
import CepDetails from "./CepDetails";
import SavedAddresses from "./SavedAddresses";

const EMPTY = {
  cep: "",
  street: "",
  number: "",
  noNumber: false,
  complement: "",
  neighborhood: "",
  uf: "",
  cityCode: "",
  cityName: "",
};

// Campos que o CEP preenche sozinho (ficam destacados até você mexer neles)
const AUTO_FIELDS = ["street", "neighborhood", "uf", "city"];

function validate(form) {
  const errors = {};
  if (onlyDigits(form.cep).length !== 8) errors.cep = "Digite os 8 números do CEP.";
  if (!form.street.trim()) errors.street = "Informe a rua.";
  if (!form.noNumber && !form.number.trim()) errors.number = "Informe o número ou marque “Sem número”.";
  if (!form.neighborhood.trim()) errors.neighborhood = "Informe o bairro.";
  if (!form.uf) errors.uf = "Escolha o estado.";
  if (!form.cityCode) errors.city = "Escolha a cidade.";
  return errors;
}

/**
 * Formulário de endereço com autocompletar pelo CEP.
 *
 * O caminho de uma busca:
 *   digita o CEP → máscara 00000-000 → espera 400 ms parado (debounce)
 *   → ViaCEP (ou BrasilAPI, se o ViaCEP falhar) → preenche rua, bairro,
 *   estado e cidade → o cursor pula para o número.
 */
export default function AddressForm({ incoming, onFindCep }) {
  const [form, setForm] = useState(EMPTY);
  const [filled, setFilled] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [savedNotice, setSavedNotice] = useState(false);
  const numberRef = useRef(null);
  const streetRef = useRef(null);
  const saved = useSavedAddresses();

  // ---- Busca do CEP (com debounce) -------------------------------------
  const cepDigits = onlyDigits(form.cep);
  const debouncedCep = useDebouncedValue(cepDigits, TIMING.CEP_DEBOUNCE_MS);
  const canSearch = debouncedCep.length === 8 && debouncedCep === cepDigits && isPlausibleCep(debouncedCep);

  const lookup = useRequest((signal) => lookupCep(debouncedCep, { signal }), canSearch ? debouncedCep : null);
  const address = lookup.data?.address;

  // Quando a resposta chega, preenche o formulário
  useEffect(() => {
    if (!lookup.data) return;
    const a = lookup.data.address;
    setForm((prev) => ({
      ...prev,
      street: a.street || prev.street,
      neighborhood: a.neighborhood || prev.neighborhood,
      uf: a.uf,
      cityCode: a.cityCode,
      cityName: a.city,
    }));
    setFilled(new Set(AUTO_FIELDS.filter((f) => f === "uf" || f === "city" || a[f])));
    setErrors({});
    // CEP da cidade toda não tem rua: o cursor vai para a rua; senão, para o número
    (isCityWideCep(a) ? streetRef : numberRef).current?.focus();
  }, [lookup.data]);

  // Endereço vindo da aba "Buscar CEP"
  useEffect(() => {
    if (!incoming) return;
    setForm({
      ...EMPTY,
      cep: maskCep(incoming.cep),
      street: incoming.street,
      neighborhood: incoming.neighborhood,
      uf: incoming.uf,
      cityCode: incoming.cityCode,
      cityName: incoming.city,
    });
    setErrors({});
  }, [incoming]);

  // ---- Edição ------------------------------------------------------------
  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFilled((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSavedNotice(false);
  };

  const handleUf = (uf) => {
    setForm((prev) => ({ ...prev, uf, cityCode: "", cityName: "" }));
    setFilled((prev) => new Set([...prev].filter((f) => f !== "uf" && f !== "city")));
    setErrors((prev) => ({ ...prev, uf: undefined, city: undefined }));
  };

  const handleCity = useCallback(({ code, name }) => {
    setForm((prev) => ({ ...prev, cityCode: code, cityName: name }));
    setErrors((prev) => (prev.city ? { ...prev, city: undefined } : prev));
  }, []);

  const reset = () => {
    setForm(EMPTY);
    setFilled(new Set());
    setErrors({});
    setSavedNotice(false);
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    saved.save({
      cep: maskCep(form.cep),
      street: form.street.trim(),
      number: form.noNumber ? "S/N" : form.number.trim(),
      complement: form.complement.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.cityName,
      uf: form.uf,
    });
    setSavedNotice(true);
  };

  // ---- Mensagem embaixo do CEP --------------------------------------------
  let cepMessage = "Digite o CEP e o endereço aparece sozinho.";
  let cepError = Boolean(errors.cep);
  if (errors.cep) cepMessage = errors.cep;
  else if (cepDigits.length === 8 && !isPlausibleCep(cepDigits)) {
    cepMessage = "CEP com todos os números iguais não existe.";
    cepError = true;
  } else if (cepDigits.length > 0 && cepDigits.length < 8) cepMessage = `Faltam ${8 - cepDigits.length} números.`;
  else if (lookup.status === "loading") cepMessage = "Buscando o endereço...";
  else if (lookup.status === "success") {
    cepMessage = isCityWideCep(address)
      ? `CEP geral de ${address.city}: preencha a rua e o bairro.`
      : `${address.city} – ${address.uf}`;
  }

  return (
    <div className="cb-columns">
      <form className="cb-card cb-form" onSubmit={submit} noValidate>
        <div className="cb-card-head">
          <div>
            <h3>Endereço de entrega</h3>
            <p className="cb-card-note">Os campos em azul foram preenchidos pelo CEP.</p>
          </div>
          <div className="cb-head-actions">
            <button type="button" className="cb-link-button" onClick={() => set("cep", EXAMPLES.CEP)}>
              Usar exemplo
            </button>
            <button type="button" className="cb-link-button" onClick={reset}>
              <FiRotateCcw aria-hidden="true" /> Limpar
            </button>
          </div>
        </div>

        <div className="cb-grid">
          <Field
            id="addr-cep"
            label="CEP"
            message={cepMessage}
            error={cepError}
            adornment={
              lookup.status === "loading" ? (
                <Spinner label="Buscando CEP" />
              ) : lookup.status === "success" ? (
                <FiCheckCircle className="cb-ok" aria-label="CEP encontrado" />
              ) : null
            }
          >
            <input
              id="addr-cep"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              value={form.cep}
              onChange={(e) => set("cep", maskCep(e.target.value))}
              aria-describedby="addr-cep-msg"
              aria-invalid={cepError}
            />
          </Field>

          <div className="cb-field cb-field-link">
            <button
              type="button"
              className="cb-link-button"
              onClick={() => onFindCep({ uf: form.uf, cityCode: form.cityCode })}
            >
              <FiMapPin aria-hidden="true" /> Não sei meu CEP
            </button>
          </div>

          {lookup.status === "error" && (
            <div className="cb-span-2">
              <StatusMessage error={lookup.error} onRetry={lookup.retry} />
              {lookup.error.name === "NotFoundError" && (
                <p className="cb-card-note">Confira o CEP ou preencha o endereço à mão.</p>
              )}
            </div>
          )}

          <Field
            id="addr-street"
            label="Rua"
            className="cb-span-2"
            highlight={filled.has("street")}
            error={Boolean(errors.street)}
            message={errors.street}
          >
            <input
              id="addr-street"
              ref={streetRef}
              autoComplete="address-line1"
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              aria-invalid={Boolean(errors.street)}
            />
          </Field>

          <Field
            id="addr-number"
            label="Número"
            error={Boolean(errors.number)}
            message={errors.number || (address?.complement ? `O CEP indica: ${address.complement}.` : null)}
          >
            <input
              id="addr-number"
              ref={numberRef}
              inputMode="numeric"
              value={form.noNumber ? "" : form.number}
              placeholder={form.noNumber ? "S/N" : ""}
              disabled={form.noNumber}
              onChange={(e) => set("number", e.target.value)}
              aria-invalid={Boolean(errors.number)}
            />
            <label className="cb-check">
              <input
                type="checkbox"
                checked={form.noNumber}
                onChange={(e) => {
                  set("noNumber", e.target.checked);
                  setErrors((prev) => ({ ...prev, number: undefined }));
                }}
              />
              Sem número
            </label>
          </Field>

          <Field id="addr-complement" label="Complemento" hint="opcional">
            <input
              id="addr-complement"
              autoComplete="address-line2"
              placeholder="Apto, bloco, sala..."
              value={form.complement}
              onChange={(e) => set("complement", e.target.value)}
            />
          </Field>

          <Field
            id="addr-neighborhood"
            label="Bairro"
            className="cb-span-2"
            highlight={filled.has("neighborhood")}
            error={Boolean(errors.neighborhood)}
            message={errors.neighborhood}
          >
            <input
              id="addr-neighborhood"
              value={form.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              aria-invalid={Boolean(errors.neighborhood)}
            />
          </Field>

          <StateCitySelect
            idPrefix="addr"
            uf={form.uf}
            cityCode={form.cityCode}
            cityName={form.cityName}
            onUfChange={handleUf}
            onCityChange={handleCity}
            highlight={{ uf: filled.has("uf"), city: filled.has("city") }}
            errors={{ uf: errors.uf, city: errors.city }}
          />
        </div>

        {savedNotice && (
          <StatusMessage tone="success" title="Endereço salvo">
            <p>Ele está na lista ao lado, guardado neste navegador.</p>
          </StatusMessage>
        )}

        <button type="submit" className="cb-button">
          <FiSave aria-hidden="true" /> Salvar endereço
        </button>

        {lookup.data && <SourceInfo result={lookup.data} />}
      </form>

      <div className="cb-stack">
        <CepDetails address={address} state={address ? UF_BY_SIGLA[address.uf] : null} />
        <SavedAddresses list={saved.list} onRemove={saved.remove} />
      </div>
    </div>
  );
}
