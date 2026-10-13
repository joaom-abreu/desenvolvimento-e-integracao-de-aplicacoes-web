import { memo } from "react";
import { FAVICON_PADRAO } from "../../services/radioBrowserApiService";

/** Troca o favicon quebrado pelo aradio.webp (o onerror do home.html). */
function usarFaviconPadrao(e) {
  const img = e.currentTarget;
  if (!img.src.endsWith(FAVICON_PADRAO)) {
    img.src = FAVICON_PADRAO; // só uma vez, para não entrar em loop
  }
}

function Tendencia({ valor }) {
  if (valor > 0) return <span className="trend up">▲ {valor}</span>;
  if (valor < 0) return <span className="trend down">▼ {valor}</span>;
  return <span className="trend flat">–</span>;
}

/** Uma linha da tabela. memo: só redesenha quando as props dela mudam (ex.: a estrela). */
function StationRow({ station, index, favorite, favoritosHabilitados, salvando, onToggleFavorite }) {
  const online = station.lastcheckok === 1;
  const temLocal = station.geoLat != null && station.geoLat !== 0;

  let tituloFavorito = favorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
  if (!favoritosHabilitados) tituloFavorito = "Configure o Supabase para usar os favoritos";

  return (
    <tr>
      <td>
        <button
          type="button"
          className={`fav-btn${favorite ? " active" : ""}`}
          onClick={() => onToggleFavorite(station.stationuuid)}
          disabled={!favoritosHabilitados || salvando}
          aria-pressed={favorite}
          aria-label={tituloFavorito}
          title={tituloFavorito}
        >
          {favorite ? "★" : "☆"}
        </button>
      </td>
      <td>{index + 1}</td>
      <td>
        <img
          className="favicon"
          src={station.favicon}
          alt="Favicon"
          loading="lazy"
          onError={usarFaviconPadrao}
        />
      </td>
      <td className="break-word">
        <a href={station.homepage}>{station.name}</a>
      </td>
      <td className="break-word">
        <a href={station.url}>{station.url}</a>
      </td>
      <td className="break-word">{station.tags}</td>
      <td>
        <span
          className={`status-dot ${online ? "online" : "offline"}`}
          title={online ? "Online" : "Offline"}
        >
          <span className="visually-hidden">{online ? "Online" : "Offline"}</span>
        </span>
      </td>
      <td className="break-word">{station.language}</td>
      <td>{station.votes}</td>
      <td>{station.clickcount}</td>
      <td>
        <Tendencia valor={station.clicktrend} />
      </td>
      <td>
        {temLocal ? (
          <a
            href={`https://www.google.com/maps?q=${station.geoLat},${station.geoLong}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver no mapa"
          >
            📍
          </a>
        ) : (
          <span className="no-data">—</span>
        )}
      </td>
      <td>{station.bitrate}</td>
      <td>{station.codec}</td>
      <td>
        <div className="audio-container">
          {/* preload="none": o stream só é baixado ao clicar em play */}
          <audio controls preload="none">
            <source src={station.url} type="audio/mpeg" />
            Seu navegador não suporta o elemento audio.
          </audio>
        </div>
      </td>
    </tr>
  );
}

export default memo(StationRow);
