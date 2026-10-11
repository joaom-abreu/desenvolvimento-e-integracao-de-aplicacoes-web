import SPOTIFY_CONFIG from "../../config/spotifyConfig";

/**
 * Cards prontos (os mesmos do meu portfólio): imagens geradas por serviços de
 * terceiros a partir do seu id do Spotify. Não precisam de código nem de chave,
 * mas cada serviço pede um cadastro rápido (veja o README).
 *
 * <SpotifyCards />
 */

const { SPOTIFY_USER_ID, LASTFM_USER, EMBED_TRACK_ID } = SPOTIFY_CONFIG.CARDS;

const CARDS = [
  {
    key: "datacard",
    title: "Data Card for Spotify",
    note: "resumo do seu perfil",
    src: `https://data-card-for-spotify.herokuapp.com/api/card?user_id=${SPOTIFY_USER_ID}`,
    wide: true,
  },
  {
    key: "profile",
    title: "Spotify GitHub Profile",
    note: "tocando agora (ou a última)",
    src: `https://spotify-github-profile.kittinanx.com/api/view?uid=${SPOTIFY_USER_ID}&cover_image=true&theme=default&show_offline=false&background_color=121212&interchange=false`,
  },
  {
    key: "recent",
    title: "Spotify Recently Played",
    note: "as 10 últimas",
    src: `https://spotify-recently-played.jeffreyca.workers.dev/svg?user=${SPOTIFY_USER_ID}&count=10&width=540&radius=40&unique=1&duration=1&album=1&footer=wave`,
  },
  LASTFM_USER && {
    key: "lastfm",
    title: "Last.fm Recently Played",
    note: "histórico do Last.fm",
    src: `https://lastfm-recently-played.jeffreyca.workers.dev/svg?user=${LASTFM_USER}&count=10&radius=40&stats=compact&footer=wave&loved=off`,
    href: `https://www.last.fm/pt/user/${LASTFM_USER}`,
  },
].filter(Boolean);

export default function SpotifyCards() {
  return (
    <div className="spt-cards">
      <p className="spt-cards-intro">
        Estes cards são <strong>imagens</strong> geradas por serviços da comunidade: basta um{" "}
        <code>&lt;img&gt;</code> com o seu id do Spotify. Não usam a Web API deste projeto.
      </p>

      <div className="spt-cards-grid">
        {CARDS.map((card) => {
          const img = <img src={card.src} alt={card.title} loading="lazy" />;
          return (
            <figure key={card.key} className={`spt-card-img ${card.wide ? "wide" : ""}`}>
              <figcaption>
                <strong>{card.title}</strong> · {card.note}
              </figcaption>
              {card.href ? (
                <a href={card.href} target="_blank" rel="noopener noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
            </figure>
          );
        })}
      </div>

      <figure className="spt-card-img wide">
        <figcaption>
          <strong>Player oficial do Spotify</strong> · iframe de open.spotify.com/embed
        </figcaption>
        <iframe
          className="spt-embed"
          title="Spotify"
          src={`https://open.spotify.com/embed/track/${EMBED_TRACK_ID}?utm_source=generator&theme=0`}
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </figure>
    </div>
  );
}
