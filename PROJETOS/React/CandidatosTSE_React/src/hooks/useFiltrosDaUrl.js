import { useCallback, useEffect, useState } from "react";

/**
 * Guarda os filtros na URL, como o formulário GET do Thymeleaf fazia:
 *   /?cargo=GOVERNADOR&partido=PT&texto=ana
 *
 * Assim dá para copiar o link com o filtro aplicado, recarregar a página
 * e usar o botão "voltar" do navegador.
 *
 * const NOMES = ["cargo", "partido", "texto"]; // fora do componente
 * const { filtros, aplicarFiltros, limparFiltros } = useFiltrosDaUrl(NOMES);
 */
export default function useFiltrosDaUrl(nomes) {
  const lerDaUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    // parâmetro ausente vira "" (o "required = false" do @RequestParam)
    return Object.fromEntries(nomes.map((nome) => [nome, params.get(nome) ?? ""]));
  }, [nomes]);

  const [filtros, setFiltros] = useState(lerDaUrl);

  // botão voltar / avançar do navegador
  useEffect(() => {
    const aoNavegar = () => setFiltros(lerDaUrl());
    window.addEventListener("popstate", aoNavegar);
    return () => window.removeEventListener("popstate", aoNavegar);
  }, [lerDaUrl]);

  const aplicarFiltros = useCallback(
    (novos) => {
      const params = new URLSearchParams();
      for (const nome of nomes) {
        const valor = String(novos[nome] ?? "").trim();
        if (valor !== "") params.set(nome, valor); // vazio não vai para a URL
      }
      const busca = params.toString();
      window.history.pushState(null, "", busca ? `?${busca}` : window.location.pathname);
      setFiltros(lerDaUrl());
    },
    [nomes, lerDaUrl]
  );

  const limparFiltros = useCallback(() => {
    window.history.pushState(null, "", window.location.pathname);
    setFiltros(lerDaUrl());
  }, [lerDaUrl]);

  return { filtros, aplicarFiltros, limparFiltros };
}
