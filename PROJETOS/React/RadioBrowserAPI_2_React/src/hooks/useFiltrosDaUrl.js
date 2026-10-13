import { useCallback, useEffect, useState } from "react";

/** Os mesmos defaultValue do @RequestParam do controller Spring. */
export const COUNTRY_PADRAO = "Brazil";
export const STATE_PADRAO = "Minas Gerais";

/**
 * Lê country e state da URL, como o GET do Thymeleaf: /?country=Brazil&state=Minas+Gerais
 *
 * - parâmetro AUSENTE  → valor padrão (Brazil / Minas Gerais)
 * - state PRESENTE e vazio (?state=) → "Todos os estados"
 */
function lerDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    country: params.get("country") || COUNTRY_PADRAO,
    state: params.has("state") ? params.get("state") : STATE_PADRAO,
  };
}

export default function useFiltrosDaUrl() {
  const [filtros, setFiltros] = useState(lerDaUrl);

  // botão voltar / avançar do navegador
  useEffect(() => {
    const aoNavegar = () => setFiltros(lerDaUrl());
    window.addEventListener("popstate", aoNavegar);
    return () => window.removeEventListener("popstate", aoNavegar);
  }, []);

  /** Escreve os dois parâmetros na URL, inclusive o state vazio, como um formulário GET. */
  const aplicarFiltros = useCallback(({ country, state }) => {
    const params = new URLSearchParams({ country: country || COUNTRY_PADRAO, state: state ?? "" });
    window.history.pushState(null, "", `?${params}`);
    setFiltros(lerDaUrl());
  }, []);

  return { filtros, aplicarFiltros };
}
