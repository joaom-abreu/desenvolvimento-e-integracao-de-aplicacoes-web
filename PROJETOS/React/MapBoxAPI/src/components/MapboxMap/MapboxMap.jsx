import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import MAPBOX_CONFIG from "../../config/mapboxConfig";
import "./MapboxMap.css";

/**
 * Mapa do Mapbox GL JS com marcadores e popups.
 *
 * O mapbox-gl não é um componente React: ele desenha num <div> que nós
 * entregamos. Por isso o mapa fica num useRef, é criado UMA vez num
 * useEffect, e as mudanças de props (estilo, lugar escolhido, busca)
 * viram chamadas aos métodos dele (setStyle, flyTo, fitBounds...).
 *
 * <MapboxMap places={PLACES} selectedId="coreu" onSelect={setSelected} />
 */

// Popup montado com elementos do DOM (textContent): nada vira HTML de verdade
function popupContent(title, subtitle) {
  const box = document.createElement("div");
  box.className = "map-popup";
  const strong = document.createElement("strong");
  strong.textContent = title;
  const span = document.createElement("span");
  span.textContent = subtitle;
  box.append(strong, span);
  return box;
}

export default function MapboxMap({
  places = [],
  selectedId = null,
  onSelect,
  styleUrl = MAPBOX_CONFIG.STYLES[0].url,
  searchResult = null,
  fitKey = 0,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const styleRef = useRef(styleUrl);
  const markersRef = useRef(new Map()); // id → { marker, element }
  const searchMarkerRef = useRef(null);
  const onSelectRef = useRef(onSelect);

  // Sempre a versão mais nova do onSelect, sem recriar os marcadores
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  /* ---------- Cria o mapa uma única vez ---------- */
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_CONFIG.TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleRef.current,
      center: MAPBOX_CONFIG.CENTER,
      zoom: MAPBOX_CONFIG.ZOOM,
      language: MAPBOX_CONFIG.LANGUAGE,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }),
      "top-right"
    );
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      // Libera o WebGL quando o componente sai da tela
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, []);

  /* ---------- Troca de estilo (ruas, satélite...) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || styleRef.current === styleUrl) return;
    styleRef.current = styleUrl;
    map.setStyle(styleUrl); // os marcadores são HTML e continuam no lugar
  }, [styleUrl]);

  /* ---------- Marcadores dos lugares ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;

    places.forEach((place, index) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "map-marker";
      // O Mapbox posiciona o marcador com "transform" no próprio elemento,
      // então o pino girado fica num <span> de dentro
      const pin = document.createElement("span");
      pin.className = "map-marker-pin";
      const number = document.createElement("span");
      number.textContent = String(index + 1);
      pin.append(number);
      element.append(pin);
      element.setAttribute("aria-label", place.name);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current?.(place.id);
      });

      const popup = new mapboxgl.Popup({ offset: 22, closeButton: false, maxWidth: "260px" }).setDOMContent(
        popupContent(place.name, place.address ? `${place.address} · ${place.city}` : place.city)
      );

      const marker = new mapboxgl.Marker({ element, anchor: "bottom" })
        .setLngLat(place.coordinates)
        .setPopup(popup)
        .addTo(map);

      markers.set(place.id, { marker, element });
    });

    return () => {
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
    };
  }, [places]);

  /* ---------- Lugar escolhido: voa até ele e abre o popup ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(({ marker, element }, id) => {
      const active = id === selectedId;
      element.classList.toggle("active", active);
      const popup = marker.getPopup();
      if (active && !popup.isOpen()) marker.togglePopup();
      if (!active && popup.isOpen()) popup.remove();
    });

    const place = places.find((p) => p.id === selectedId);
    if (place) map.flyTo({ center: place.coordinates, zoom: 15, essential: true });
  }, [selectedId, places]);

  /* ---------- "Ver todos": enquadra todos os lugares ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fitKey === 0 || places.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    places.forEach((p) => bounds.extend(p.coordinates));
    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
  }, [fitKey, places]);

  /* ---------- Resultado da busca: marcador diferente ---------- */
  useEffect(() => {
    const map = mapRef.current;
    searchMarkerRef.current?.remove();
    searchMarkerRef.current = null;
    if (!map || !searchResult) return;

    const popup = new mapboxgl.Popup({ offset: 30, closeButton: false, maxWidth: "260px" }).setDOMContent(
      popupContent(searchResult.name, searchResult.address)
    );
    searchMarkerRef.current = new mapboxgl.Marker({ color: "#e11d48" })
      .setLngLat(searchResult.coordinates)
      .setPopup(popup)
      .addTo(map)
      .togglePopup();
    map.flyTo({ center: searchResult.coordinates, zoom: 15, essential: true });
  }, [searchResult]);

  return <div ref={containerRef} className="mapbox-map" />;
}
