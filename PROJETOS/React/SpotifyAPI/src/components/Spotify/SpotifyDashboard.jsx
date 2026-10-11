import { useEffect, useState } from "react";
import { FiClock, FiExternalLink, FiMusic, FiPlay, FiUsers } from "react-icons/fi";
import SPOTIFY_CONFIG from "../../config/spotifyConfig";
import { fetchSpotifyStats } from "../../services/spotifyService";
import NowPlaying from "./NowPlaying";
import SpotifyCards from "./SpotifyCards";
import { artistNames, formatAgo, formatDuration } from "./format";
import "./Spotify.css";

/**
 * Painel com a sua música no Spotify, lido da Web API:
 * tocando agora, músicas e artistas mais ouvidos e tocadas recentemente,
 * com o player oficial embutido. Na aba "Cards", os cards prontos do portfólio.
 *
 * Para usar no seu projeto, copie:
 *   • a pasta components/Spotify
 *   • services/spotifyService.js e config/spotifyConfig.js
 *   • api/_spotify.js, api/spotify.js e o plugin do vite.config.js
 *
 * <SpotifyDashboard />
 * <SpotifyDashboard initialRange="long_term" />
 * <SpotifyDashboard initialTab="cards" />
 */

const { RANGES, DEFAULT_RANGE, DEFAULT_TAB } = SPOTIFY_CONFIG;

function useStats(range) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let active = true;
    // Mantém os dados antigos na tela enquanto o novo período carrega
    setState((old) => ({ ...old, status: "loading", error: null }));
    fetchSpotifyStats(range)
      .then((data) => active && setState({ status: "ready", data, error: null }))
      .catch((error) => active && setState((old) => ({ status: "error", data: old.data, error })));
    return () => {
      active = false;
    };
  }, [range]);

  return state;
}

/* =====================================================================
   Pedaços da tela
   ===================================================================== */

function ErrorBox({ error }) {
  const hint = {
    missing_config: "Siga o passo a passo do README: crie o app no Spotify, preencha o .env.local e gere o refresh token em /api/spotify/login.",
    invalid_refresh_token: "Abra http://127.0.0.1:5173/api/spotify/login no npm run dev e gere um token novo.",
    invalid_client: "Confira as chaves em developer.spotify.com/dashboard → seu app → Settings.",
  }[error?.code];

  return (
    <div className={`spt-message ${error?.code === "missing_config" ? "warning" : "error"}`} role="alert">
      <strong>{error?.message ?? "Não foi possível carregar o Spotify."}</strong>
      {hint && <span>{hint}</span>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="spt-skeleton" aria-hidden="true">
      <span style={{ height: 180 }} />
      <span style={{ height: 420 }} />
    </div>
  );
}

function Cover({ src, round = false, size = 48 }) {
  return src ? (
    <img className={`spt-cover ${round ? "round" : ""}`} src={src} alt="" width={size} height={size} loading="lazy" />
  ) : (
    <span className={`spt-cover spt-cover-empty ${round ? "round" : ""}`} style={{ width: size, height: size }}>
      <FiMusic aria-hidden="true" />
    </span>
  );
}

function TrackList({ tracks, selectedId, onPlay }) {
  if (!tracks.length) return <p className="spt-empty">Nenhuma música neste período.</p>;
  return (
    <ol className="spt-tracks">
      {tracks.map((track, i) => (
        <li key={track.id} className={track.id === selectedId ? "is-selected" : ""}>
          <span className="spt-rank">{i + 1}</span>
          <button
            type="button"
            className="spt-play"
            onClick={() => onPlay(track)}
            title={`Ouvir "${track.name}" no player`}
            aria-label={`Ouvir ${track.name}`}
          >
            <Cover src={track.album.image} />
            <FiPlay className="spt-play-icon" aria-hidden="true" />
          </button>
          <span className="spt-track-info">
            <a href={track.url} target="_blank" rel="noopener noreferrer" title={track.name}>
              {track.name}
              {track.explicit && <span className="spt-explicit">E</span>}
            </a>
            <span title={artistNames(track)}>{artistNames(track)}</span>
          </span>
          <span className="spt-duration">{formatDuration(track.durationMs)}</span>
        </li>
      ))}
    </ol>
  );
}

function ArtistGrid({ artists }) {
  if (!artists.length) return <p className="spt-empty">Nenhum artista neste período.</p>;
  return (
    <ol className="spt-artists">
      {artists.map((artist, i) => (
        <li key={artist.id}>
          <a href={artist.url} target="_blank" rel="noopener noreferrer" title={artist.name}>
            <Cover src={artist.image} round size={84} />
            <strong>
              <span className="spt-rank-inline">{i + 1}.</span> {artist.name}
            </strong>
            {artist.genres.length > 0 && <small>{artist.genres.join(" · ")}</small>}
          </a>
        </li>
      ))}
    </ol>
  );
}

function RecentList({ items }) {
  if (!items.length) return <p className="spt-empty">Nada tocado recentemente.</p>;
  return (
    <ul className="spt-recent">
      {items.map(({ track, playedAt }) => (
        <li key={`${track.id}-${playedAt}`}>
          <Cover src={track.album.image} size={40} />
          <span className="spt-track-info">
            <a href={track.url} target="_blank" rel="noopener noreferrer" title={track.name}>
              {track.name}
            </a>
            <span>{artistNames(track)}</span>
          </span>
          <span className="spt-ago">{formatAgo(playedAt)}</span>
        </li>
      ))}
    </ul>
  );
}

// Player oficial do Spotify (iframe): toca 30 s sem login, a música inteira logado
function Player({ track }) {
  if (!track) return null;
  return (
    <iframe
      key={track.id}
      className="spt-embed"
      title={`Spotify: ${track.name}`}
      src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

/* =====================================================================
   Componente principal
   ===================================================================== */

export default function SpotifyDashboard({ initialRange = DEFAULT_RANGE, initialTab = DEFAULT_TAB }) {
  const [tab, setTab] = useState(initialTab);
  const [range, setRange] = useState(initialRange);
  const [selected, setSelected] = useState(null);
  const { status, data, error } = useStats(range);

  // Sem música escolhida, o player abre na mais ouvida do período
  const playerTrack = selected ?? data?.topTracks[0] ?? data?.recent[0]?.track ?? null;

  return (
    <div className="spt">
      <div className="spt-tabs" role="tablist" aria-label="Aba">
        <button type="button" role="tab" aria-selected={tab === "api"} className={tab === "api" ? "active" : ""} onClick={() => setTab("api")}>
          Web API
        </button>
        <button type="button" role="tab" aria-selected={tab === "cards"} className={tab === "cards" ? "active" : ""} onClick={() => setTab("cards")}>
          Cards prontos
        </button>
      </div>

      {tab === "cards" && <SpotifyCards />}

      {tab === "api" && (
        <>
          {status === "error" && <ErrorBox error={error} />}
          {status === "loading" && !data && <Skeleton />}

          {data && (
            <>
              {/* ---------- Perfil ---------- */}
              <header className="spt-profile">
                <Cover src={data.profile.image} round size={56} />
                <div>
                  <h2>{data.profile.name}</h2>
                  <p>Minha música no Spotify</p>
                </div>
                {data.profile.url && (
                  <a className="spt-link" href={data.profile.url} target="_blank" rel="noopener noreferrer">
                    Ver perfil <FiExternalLink aria-hidden="true" />
                  </a>
                )}
              </header>

              {/* ---------- Tocando agora + player ---------- */}
              <div className="spt-top-grid">
                <NowPlaying onPlay={setSelected} />
                <section className="spt-card spt-player">
                  <h3>
                    <FiPlay aria-hidden="true" /> Player
                  </h3>
                  <Player track={playerTrack} />
                  <p className="spt-hint">Clique na capa de uma música para tocar aqui.</p>
                </section>
              </div>

              {/* ---------- Período ---------- */}
              <div className="spt-toolbar">
                <h3 className="spt-section-title">Mais ouvidas</h3>
                <div className="spt-ranges" role="group" aria-label="Período">
                  {RANGES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={option.value === range ? "active" : ""}
                      aria-pressed={option.value === range}
                      onClick={() => setRange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={status === "loading" ? "spt-body updating" : "spt-body"}>
                <div className="spt-grid">
                  <section className="spt-card">
                    <h3>
                      <FiMusic aria-hidden="true" /> Top músicas
                    </h3>
                    <TrackList tracks={data.topTracks} selectedId={playerTrack?.id} onPlay={setSelected} />
                  </section>

                  <section className="spt-card">
                    <h3>
                      <FiClock aria-hidden="true" /> Tocadas recentemente
                    </h3>
                    <RecentList items={data.recent} />
                  </section>
                </div>

                <section className="spt-card">
                  <h3>
                    <FiUsers aria-hidden="true" /> Top artistas
                  </h3>
                  <ArtistGrid artists={data.topArtists} />
                </section>
              </div>

              <p className="spt-source">Dados da Web API do Spotify · lidos no servidor com o seu refresh token</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
