import { useEffect } from "react";
import { REGIOES, UFS } from "../../config/appConfig";
import { normalize } from "../../core/text";
import { formatNumber } from "../../core/format";
import useCities from "../../hooks/useCities";
import Field from "../ui/Field";
import Spinner from "../ui/Spinner";
import StatusMessage from "../ui/StatusMessage";

/**
 * Dois selects ligados: escolha o estado e a lista de cidades é carregada
 * (IBGE, com a BrasilAPI de reserva). Trocar o estado limpa a cidade.
 *
 * <StateCitySelect
 *   uf="MG" cityCode="3106200"
 *   onUfChange={(uf) => ...}
 *   onCityChange={({ code, name }) => ...}
 * />
 *
 * Basta passar o código OU o nome da cidade: quando a lista chega, o outro
 * é completado (a BrasilAPI de CEP, por exemplo, não traz o código IBGE).
 */
export default function StateCitySelect({
  idPrefix,
  uf,
  cityCode,
  cityName,
  onUfChange,
  onCityChange,
  highlight = {},
  errors = {},
}) {
  const { cities, status, error, retry } = useCities(uf);

  // Quando a lista chega, completa o que falta: o nome (se só temos o código)
  // ou o código (se só temos o nome, como na BrasilAPI de CEP)
  useEffect(() => {
    if (cities.length === 0) return;
    if (cityCode) {
      const byCode = cities.find((c) => c.code === cityCode);
      if (byCode && byCode.name !== cityName) onCityChange(byCode);
      return;
    }
    if (cityName) {
      const byName = cities.find((c) => normalize(c.name) === normalize(cityName));
      if (byName) onCityChange(byName);
    }
  }, [cities, cityCode, cityName, onCityChange]);

  const handleCity = (event) => {
    const city = cities.find((c) => c.code === event.target.value);
    onCityChange(city ?? { code: "", name: "" });
  };

  const cityMessage =
    errors.city ||
    (!uf
      ? "Escolha o estado primeiro."
      : status === "loading"
        ? "Carregando as cidades..."
        : status === "success"
          ? `${formatNumber(cities.length)} cidades em ${uf}.`
          : null);

  return (
    <>
      <Field id={`${idPrefix}-uf`} label="Estado" highlight={highlight.uf} error={Boolean(errors.uf)} message={errors.uf}>
        <select
          id={`${idPrefix}-uf`}
          className="cb-select"
          value={uf}
          onChange={(e) => onUfChange(e.target.value)}
        >
          <option value="">Selecione</option>
          {REGIOES.map((regiao) => (
            <optgroup key={regiao} label={regiao}>
              {UFS.filter((u) => u.regiao === regiao).map((u) => (
                <option key={u.sigla} value={u.sigla}>
                  {u.nome} ({u.sigla})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <Field
        id={`${idPrefix}-city`}
        label="Cidade"
        highlight={highlight.city}
        error={Boolean(errors.city)}
        message={status === "error" ? null : cityMessage}
        adornment={status === "loading" && <Spinner label="Carregando cidades" />}
      >
        <select
          id={`${idPrefix}-city`}
          className="cb-select"
          value={cities.some((c) => c.code === cityCode) ? cityCode : ""}
          onChange={handleCity}
          disabled={!uf || status !== "success"}
        >
          <option value="">{status === "loading" ? "Carregando..." : "Selecione"}</option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {status === "error" && (
        <div className="cb-span-2">
          <StatusMessage error={error} onRetry={retry} />
        </div>
      )}
    </>
  );
}
