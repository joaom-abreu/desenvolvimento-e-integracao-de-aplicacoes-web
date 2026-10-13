import { useMemo } from "react";
import SearchForm from "./components/SearchForm/SearchForm";
import StationsTable from "./components/StationsTable/StationsTable";
import TunerHeader from "./components/TunerHeader/TunerHeader";
import useFavoritos from "./hooks/useFavoritos";
import useFiltrosDaUrl from "./hooks/useFiltrosDaUrl";
import { useEstacoes, usePaisesEEstados } from "./hooks/useRadioBrowser";

/**
 * Página Home: filtros, lista de estações, player e favoritos.
 * Faz o papel do RadioBrowserApiController + home.html do projeto Spring Boot.
 */
function App() {
  const { filtros, aplicarFiltros } = useFiltrosDaUrl();
  const { countries, states } = usePaisesEEstados();
  const { stations, carregando, erro } = useEstacoes(filtros.country, filtros.state);
  const favoritos = useFavoritos();

  // Favoritas no topo, mantendo a ordem por votos dentro de cada grupo
  // (o sort do JavaScript é estável, como o Comparator do Java).
  const { favoriteUuids } = favoritos;
  const estacoesOrdenadas = useMemo(() => {
    const favorita = (station) => (favoriteUuids.has(station.stationuuid) ? 1 : 0);
    return [...stations].sort((a, b) => favorita(b) - favorita(a));
  }, [stations, favoriteUuids]);

  return (
    <div className="container">
      <TunerHeader />

      <SearchForm
        countries={countries}
        states={states}
        selectedCountry={filtros.country}
        selectedState={filtros.state}
        onBuscar={aplicarFiltros}
      />

      {favoritos.erro && (
        <p className="aviso" role="status">
          {favoritos.erro}
        </p>
      )}

      <StationsTable
        stations={estacoesOrdenadas}
        carregando={carregando}
        erro={erro}
        favoriteUuids={favoriteUuids}
        favoritosHabilitados={favoritos.habilitado}
        salvando={favoritos.salvando}
        onToggleFavorite={favoritos.alternarFavorito}
      />
    </div>
  );
}

export default App;
