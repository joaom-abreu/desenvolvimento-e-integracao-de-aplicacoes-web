import { useEffect, useState } from "react";
import { FiExternalLink, FiPlayCircle } from "react-icons/fi";
import SPOTIFY_CONFIG from "../../config/spotifyConfig";
import { fetchNowPlaying } from "../../services/spotifyService";
import { artistNames, formatAgo, formatDuration } from "./format";

/**
 * Cartão "Tocando agora": a música que está tocando no seu Spotify neste
 * momento (em qualquer aparelho), com a barra de progresso andando.
 * Parado, mostra a última música que você ouviu.
 *
 * Pergunta de novo a cada NOW_REFRESH_SECONDS enquanto a aba está visível.
 *
 * <NowPlaying />
 * <NowPlaying onPlay={(track) => ...} />   → botão "Ouvir aqui" (player embutido)
 */

const REFRESH_MS = SPOTIFY_CONFIG.NOW_REFRESH_SECONDS * 1000;

function useNowPlaying() {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      fetchNowPlaying()
        .then((data) => alive && setState({ status: "ok", data }))
        .catch(() => alive && setState((old) => ({ status: old.data ? "ok" : "error", data: old.data })));
    };
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return state;
}

// Relógio de 1 em 1 s: a barra anda entre uma busca e outra
function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export default function NowPlaying({ onPlay }) {
  const { status, data } = useNowPlaying();
  const now = useNow(Boolean(data?.playing));

  // Carregando, sem chave ou erro: o cartão simplesmente não aparece
  // (o painel principal já mostra o aviso de configuração)
  if (status !== "ok" || !data?.track) return null;

  const { track, playing } = data;
  const progress = playing
    ? Math.min(track.durationMs, data.progressMs + (now - data.fetchedAt))
    : 0;

  return (
    <section className={`spt-now ${playing ? "is-playing" : "is-idle"}`} aria-live="polite">
      {track.album.image && <img className="spt-now-cover" src={track.album.image} alt="" />}

      <div className="spt-now-info">
        <span className="spt-now-status">
          {playing ? (
            <span className="spt-eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <span className="spt-now-dot" aria-hidden="true" />
          )}
          {playing ? "Tocando agora" : `Tocou por último ${formatAgo(data.playedAt, now)}`}
        </span>

        <a className="spt-now-title" href={track.url} target="_blank" rel="noopener noreferrer">
          {track.name}
        </a>
        <span className="spt-now-artist">{artistNames(track)}</span>
        <span className="spt-now-album">{track.album.name}</span>

        {playing && (
          <div className="spt-progress">
            <span>{formatDuration(progress)}</span>
            <span className="spt-progress-bar" aria-hidden="true">
              <span style={{ width: `${(progress / track.durationMs) * 100}%` }} />
            </span>
            <span>{formatDuration(track.durationMs)}</span>
          </div>
        )}

        <div className="spt-now-actions">
          {onPlay && (
            <button type="button" className="spt-btn" onClick={() => onPlay(track)}>
              <FiPlayCircle aria-hidden="true" /> Ouvir aqui
            </button>
          )}
          <a className="spt-btn ghost" href={track.url} target="_blank" rel="noopener noreferrer">
            Abrir no Spotify <FiExternalLink aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
