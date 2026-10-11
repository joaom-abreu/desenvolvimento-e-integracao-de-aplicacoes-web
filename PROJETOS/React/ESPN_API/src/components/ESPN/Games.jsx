import { FiClock, FiExternalLink, FiMapPin, FiTv } from "react-icons/fi";
import { formatDay, formatDayMonth, formatLongDate, formatTime, formatUntil, timeParts } from "./format";
import { LeagueLogo, ResultBadge, TeamLogo } from "./Shared";
import { legName, liveStatus, leagueName, nbaSeasonType, noteText, phaseName } from "./translate";
import { useNow } from "./useEspn";

/* =====================================================================
   Pedaços de um jogo
   ===================================================================== */

// "Brasileirão Série A · Semifinal · Jogo de ida"
function competitionText(game) {
  if (game.sport === "nba") {
    return [nbaSeasonType(game.seasonType), noteText(game.note)].filter(Boolean).join(" · ");
  }
  return [leagueName(game.league.name), phaseName(game.phase), legName(game.leg)]
    .filter(Boolean)
    .join(" · ");
}

// Placar no meio do card ("2 x 1"), ou "x" antes do jogo
function Score({ game }) {
  const { home, away, state } = game;
  if (state === "pre" || home?.score === null || away?.score === null) {
    return <span className="espn-score espn-score-vs">x</span>;
  }
  const shootout = home.shootout !== null && away.shootout !== null;
  return (
    <span className={`espn-score ${state === "in" ? "live" : ""}`}>
      <b className={home.winner ? "won" : ""}>{home.score}</b>
      <i>x</i>
      <b className={away.winner ? "won" : ""}>{away.score}</b>
      {shootout && (
        <small>
          ({home.shootout} x {away.shootout} pên.)
        </small>
      )}
    </span>
  );
}

function Side({ team, align }) {
  if (!team) return <span />;
  return (
    <span className={`espn-side espn-side-${align}`}>
      <TeamLogo team={team} size={36} />
      <span className="espn-side-name">
        <strong title={team.name}>{team.short}</strong>
        {team.record && <small>{team.record}</small>}
      </span>
    </span>
  );
}

function LiveTag({ game }) {
  const text = liveStatus(game);
  if (!text) return null;
  return (
    <span className={`espn-live ${game.state === "in" ? "on" : "off"}`}>
      {game.state === "in" && <span className="espn-live-dot" aria-hidden="true" />}
      {game.state === "in" ? `Ao vivo · ${text}` : text}
    </span>
  );
}

function Meta({ game, now }) {
  const place = [game.venue, game.city].filter(Boolean).join(", ");
  return (
    <ul className="espn-game-meta">
      {place && (
        <li>
          <FiMapPin aria-hidden="true" />
          {place}
        </li>
      )}
      {game.tv.length > 0 && (
        <li>
          <FiTv aria-hidden="true" />
          {game.tv.join(", ")}
        </li>
      )}
      {game.state === "pre" && (
        <li className="espn-until">
          <FiClock aria-hidden="true" />
          {formatUntil(game, now)}
        </li>
      )}
      {game.link && (
        <li>
          <a href={game.link} target="_blank" rel="noopener noreferrer">
            ESPN <FiExternalLink aria-hidden="true" />
          </a>
        </li>
      )}
    </ul>
  );
}

/* =====================================================================
   Um jogo da lista
   ===================================================================== */

export function GameCard({ game, now }) {
  const note = game.sport === "soccer" ? noteText(game.note) : null;
  return (
    <li className={`espn-game ${game.state === "in" ? "is-live" : ""}`}>
      <div className="espn-game-head">
        <span className="espn-game-league">
          <LeagueLogo league={game.league} />
          {competitionText(game)}
        </span>
        <span className="espn-game-when">
          {formatDay(game.date, now)}
          {game.timeValid ? ` · ${formatTime(game.date)}` : " · a definir"}
        </span>
      </div>

      <div className="espn-match">
        <Side team={game.home} align="home" />
        <Score game={game} />
        <Side team={game.away} align="away" />
      </div>

      <LiveTag game={game} />
      {note && game.state === "post" && <p className="espn-game-note">{note}</p>}
      <Meta game={game} now={now} />
    </li>
  );
}

export function GameList({ games, now, empty = "Nenhum jogo marcado." }) {
  if (!games.length) return <p className="espn-empty">{empty}</p>;
  return (
    <ul className="espn-games">
      {games.map((game) => (
        <GameCard key={game.id} game={game} now={now} />
      ))}
    </ul>
  );
}

/* =====================================================================
   Próximo jogo em destaque, com contagem regressiva
   ===================================================================== */

function Countdown({ ms }) {
  const { days, hours, minutes, seconds } = timeParts(Math.max(0, ms));
  const parts = [
    [days, days === 1 ? "dia" : "dias"],
    [hours, "horas"],
    [minutes, "min"],
    [seconds, "seg"],
  ];
  return (
    <ol className="espn-countdown" aria-label="Contagem regressiva">
      {parts.map(([value, label]) => (
        <li key={label}>
          <b>{String(value).padStart(2, "0")}</b>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function NextGame({ game, title = "Próximo jogo" }) {
  const now = useNow(1000);
  if (!game) return null;
  const live = game.state === "in";

  return (
    <section className={`espn-next ${live ? "is-live" : ""}`} aria-live={live ? "polite" : undefined}>
      <header className="espn-next-head">
        <span className="espn-next-title">{live ? "Acontecendo agora" : title}</span>
        <span className="espn-game-league">
          <LeagueLogo league={game.league} />
          {competitionText(game)}
        </span>
      </header>

      <div className="espn-next-match">
        <div className="espn-next-team">
          <TeamLogo team={game.home} size={72} />
          <strong>{game.home?.short}</strong>
          {game.home?.record && <small>{game.home.record}</small>}
        </div>

        <div className="espn-next-center">
          {live ? (
            <>
              <Score game={game} />
              <LiveTag game={game} />
            </>
          ) : (
            <>
              <span className="espn-next-date">
                {formatLongDate(game.date)}
                {game.timeValid ? ` · ${formatTime(game.date)}` : " · horário a definir"}
              </span>
              {game.timeValid ? (
                <Countdown ms={game.date - now} />
              ) : (
                <span className="espn-until">{formatUntil(game, now)}</span>
              )}
            </>
          )}
        </div>

        <div className="espn-next-team">
          <TeamLogo team={game.away} size={72} />
          <strong>{game.away?.short}</strong>
          {game.away?.record && <small>{game.away.record}</small>}
        </div>
      </div>

      <Meta game={{ ...game, state: "post" }} now={now} />
    </section>
  );
}

/* =====================================================================
   Últimos resultados (do ponto de vista de um time)
   ===================================================================== */

export function ResultList({ games }) {
  if (!games.length) return <p className="espn-empty">Nenhum resultado ainda.</p>;
  return (
    <ul className="espn-results">
      {games.map((game) => (
        <li key={game.id}>
          <ResultBadge result={game.result} />
          <span className="espn-results-date">{formatDayMonth(game.date)}</span>
          <span className="espn-results-where">{game.us?.home ? "casa" : "fora"}</span>
          <TeamLogo team={game.them} size={24} />
          <span className="espn-results-team" title={game.them?.name}>
            {game.them?.short}
          </span>
          <strong className="espn-results-score">
            {game.us?.score} x {game.them?.score}
            {game.us?.shootout !== null && game.them?.shootout !== null && (
              <small>
                {" "}
                ({game.us.shootout} x {game.them.shootout} pên.)
              </small>
            )}
          </strong>
          <span className="espn-results-league" title={leagueName(game.league.name)}>
            <LeagueLogo league={game.league} />
          </span>
        </li>
      ))}
    </ul>
  );
}

// Faixa com os últimos resultados (mais antigo → mais recente)
export function Form({ games }) {
  if (!games.length) return null;
  return (
    <span className="espn-form" aria-label="Últimos resultados">
      {[...games].reverse().map((game) => (
        <ResultBadge key={game.id} result={game.result} />
      ))}
    </span>
  );
}
