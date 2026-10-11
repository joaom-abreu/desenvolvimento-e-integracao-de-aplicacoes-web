import MAPBOX_CONFIG from "../config/mapboxConfig";

/**
 * Busca endereços e lugares com a Mapbox Geocoding API v6 (forward geocoding).
 * Usa o mesmo token público do mapa. Devolve até 5 resultados:
 *   [{ id, name, address, coordinates: [lng, lat] }]
 *
 * proximity: [lng, lat] para dar preferência a resultados perto do centro do mapa
 */
export async function searchPlaces(query, { proximity, signal } = {}) {
  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_CONFIG.TOKEN,
    language: MAPBOX_CONFIG.LANGUAGE,
    country: MAPBOX_CONFIG.GEOCODING_COUNTRY,
    limit: "5",
  });
  if (proximity) params.set("proximity", proximity.map((n) => n.toFixed(4)).join(","));

  const response = await fetch(`${MAPBOX_CONFIG.GEOCODING_URL}?${params}`, { signal });
  if (response.status === 401) throw new Error("Token do Mapbox inválido.");
  if (!response.ok) throw new Error(`Geocoding: HTTP ${response.status}`);

  const { features = [] } = await response.json();
  return features.map((f) => ({
    id: f.id ?? f.properties?.mapbox_id,
    name: f.properties?.name ?? f.properties?.full_address,
    address: f.properties?.place_formatted ?? f.properties?.full_address ?? "",
    coordinates: f.geometry.coordinates,
  }));
}
