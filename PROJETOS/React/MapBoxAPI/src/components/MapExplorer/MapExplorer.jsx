import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiMaximize, FiSearch, FiX } from "react-icons/fi";
import MAPBOX_CONFIG from "../../config/mapboxConfig";
import { searchPlaces } from "../../services/geocodingService";
import MapboxMap from "../MapboxMap/MapboxMap";
import TokenMissing from "./TokenMissing";
import "./MapExplorer.css";

/**
 * Mapa completo: lista de lugares + busca de endereços + troca de estilo.
 * Se não houver VITE_MAPBOX_TOKEN, mostra o passo a passo para criar o token.
 *
 * <MapExplorer places={PLACES} />
 */
export default function MapExplorer({ places }) {
  const [selectedId, setSelectedId] = useState(null);
  const [styleId, setStyleId] = useState(MAPBOX_CONFIG.STYLES[0].id);
  const [fitKey, setFitKey] = useState(0);

  // Busca
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const abortRef = useRef(null);

  // Busca enquanto digita, esperando 350 ms sem teclar (debounce)
  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) {
      setResults([]);
      setSearchError(null);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      try {
        setResults(await searchPlaces(text, { proximity: MAPBOX_CONFIG.CENTER, signal: controller.signal }));
        setSearchError(null);
      } catch (error) {
        if (error.name !== "AbortError") setSearchError(error.message);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  if (!MAPBOX_CONFIG.TOKEN) return <TokenMissing />;

  const style = MAPBOX_CONFIG.STYLES.find((s) => s.id === styleId);

  const choosePlace = (id) => {
    setSearchResult(null);
    setSelectedId(id);
  };

  const chooseResult = (result) => {
    setSelectedId(null);
    setSearchResult(result);
    setResults([]);
    setQuery(result.name);
  };

  const showAll = () => {
    setSelectedId(null);
    setSearchResult(null);
    setFitKey((k) => k + 1);
  };

  return (
    <div className="map-explorer">
      {/* ---------- Lateral: busca + lugares ---------- */}
      <aside className="map-sidebar">
        <div className="map-search">
          <FiSearch className="map-search-icon" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar endereço ou lugar"
            aria-label="Buscar endereço ou lugar"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="map-search-clear" onClick={() => setQuery("")} aria-label="Limpar busca">
              <FiX aria-hidden="true" />
            </button>
          )}

          {(results.length > 0 || searching || searchError) && (
            <ul className="map-results" role="listbox">
              {searching && <li className="map-results-info">Buscando...</li>}
              {searchError && <li className="map-results-info error">{searchError}</li>}
              {results.map((result) => (
                <li key={result.id}>
                  <button type="button" onClick={() => chooseResult(result)}>
                    <strong>{result.name}</strong>
                    <span>{result.address}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="map-places-head">
          <h3>Unidades PUC Minas</h3>
          <button type="button" onClick={showAll}>
            <FiMaximize aria-hidden="true" /> Ver todas
          </button>
        </div>

        <ol className="map-places">
          {places.map((place, index) => (
            <li key={place.id}>
              <button
                type="button"
                className={place.id === selectedId ? "active" : ""}
                aria-pressed={place.id === selectedId}
                onClick={() => choosePlace(place.id)}
              >
                <span className="map-places-number">{index + 1}</span>
                <span className="map-places-text">
                  <strong>{place.name}</strong>
                  <span>
                    <FiMapPin aria-hidden="true" /> {place.city}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {/* ---------- Mapa + estilos ---------- */}
      <div className="map-stage">
        <div className="map-styles" role="group" aria-label="Estilo do mapa">
          {MAPBOX_CONFIG.STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={s.id === styleId ? "active" : ""}
              aria-pressed={s.id === styleId}
              onClick={() => setStyleId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <MapboxMap
          places={places}
          selectedId={selectedId}
          onSelect={choosePlace}
          styleUrl={style.url}
          searchResult={searchResult}
          fitKey={fitKey}
        />
      </div>
    </div>
  );
}
