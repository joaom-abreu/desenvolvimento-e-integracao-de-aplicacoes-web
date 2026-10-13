import { useEffect, useState } from "react";
import "./SearchForm.css";

/**
 * Formulário de busca por país e estado.
 * Só aplica o filtro ao clicar em "Buscar", como o GET do Spring.
 */
function SearchForm({ countries, states, selectedCountry, selectedState, onBuscar }) {
  const [country, setCountry] = useState(selectedCountry);
  const [state, setState] = useState(selectedState);

  // mantém o filtro marcado na tela (inclusive ao usar o "voltar" do navegador)
  useEffect(() => {
    setCountry(selectedCountry);
    setState(selectedState);
  }, [selectedCountry, selectedState]);

  const enviar = (e) => {
    e.preventDefault();
    onBuscar({ country, state });
  };

  // Enquanto a lista de países não chega, mostra só o selecionado
  const opcoesPais = countries.length > 0 ? countries : [{ name: selectedCountry }];

  return (
    <form method="get" action="/" className="search-form" onSubmit={enviar}>
      <div className="select-wrap">
        <select
          name="country"
          aria-label="País"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          {opcoesPais.map((c) => (
            <option key={c.name} value={c.name}>
              {c.stationcount != null ? `${c.name} (${c.stationcount})` : c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="select-wrap">
        <select
          name="state"
          aria-label="Estado"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Todos os estados</option>
          {/* Enquanto a lista de estados não chega, mostra só o selecionado */}
          {states.length === 0 && selectedState && <option value={selectedState}>{selectedState}</option>}
          {states.map((s, i) => (
            // a API repete nomes de estado em países diferentes
            <option key={`${s.name}-${s.country}-${i}`} value={s.name}>
              {`${s.name} (${s.stationcount})`}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Buscar</button>
    </form>
  );
}

export default SearchForm;
