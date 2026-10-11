import { useState } from "react";
import { FiAward, FiBarChart2, FiCalendar, FiExternalLink, FiList, FiTrendingUp, FiZap } from "react-icons/fi";
import ESPN_CONFIG from "../../config/espnConfig";
import { fetchNbaLeague, fetchNbaStandings, fetchNbaTeam, fetchNbaTeams } from "../../services/espnService";
import { Form, GameList, NextGame, ResultList } from "./Games";
import { Card, ErrorBox, Kpis, Skeleton, TeamLogo } from "./Shared";
import { NbaStandings } from "./Standings";
import { conferenceName, nbaSeasonType, standingText } from "./translate";
import { useEspn, useNow } from "./useEspn";

/**
 * Basquete (NBA): próximos jogos da liga ou de um time e a classificação
 * das conferências Leste e Oeste.
 *
 * <Basquete />                    → a liga toda
 * <Basquete initialTeam="lal" />  → só os jogos dos Lakers (sigla da ESPN)
 */

const { BASKETBALL } = ESPN_CONFIG;

// Liga toda ou um time: dois endereços diferentes na ESPN
const loadSchedule = (abbr) => (abbr ? fetchNbaTeam(abbr) : fetchNbaLeague());

// "W3" → "3 vitórias seguidas"
function streakText(streak) {
  const match = /^([WL])(\d+)$/.exec(streak ?? "");
  if (!match) return "—";
  const n = Number(match[2]);
  return match[1] === "W"
    ? `${n} ${n === 1 ? "vitória" : "vitórias"}`
    : `${n} ${n === 1 ? "derrota" : "derrotas"}`;
}

export default function Basquete({ initialTeam = BASKETBALL.DEFAULT_TEAM, showStandings = true }) {
  const [abbr, setAbbr] = useState(initialTeam);
  const [showAll, setShowAll] = useState(false);
  const now = useNow(30_000);

  const teams = useEspn(fetchNbaTeams, []);
  const schedule = useEspn(() => loadSchedule(abbr), [abbr]);
  const table = useEspn(fetchNbaStandings, []);

  const selectTeam = (value) => {
    setAbbr(value);
    setShowAll(false);
  };

  const data = schedule.data;
  // Enquanto troca de "liga" para "time" (ou o contrário), os dados antigos
  // podem ser do outro formato: só usa o que combina com a escolha atual
  const isTeam = Boolean(abbr) && Boolean(data?.team);
  const games = (isTeam ? data?.next : data?.games) ?? [];
  const [next, ...upcoming] = games;
  const limit = BASKETBALL.NEXT_GAMES - 1;
  const visible = showAll ? upcoming : upcoming.slice(0, limit);

  const team = isTeam ? data.team : null;
  const conference = table.data?.conferences.find((c) => c.rows.some((r) => r.team.id === team?.id));
  const row = conference?.rows.find((r) => r.team.id === team?.id);

  const pageUrl = abbr ? `${BASKETBALL.TEAM_PAGE}${abbr}` : BASKETBALL.SCHEDULE_PAGE;

  return (
    <div className="espn-sport">
      {/* ---------- Liga ou time ---------- */}
      <div className="espn-toolbar">
        <label className="espn-select">
          <span>Jogos de</span>
          <select value={abbr} onChange={(e) => selectTeam(e.target.value)}>
            <option value="">Toda a NBA</option>
            {(teams.data ?? []).map((t) => (
              <option key={t.id} value={t.abbr.toLowerCase()}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <a className="espn-link" href={pageUrl} target="_blank" rel="noopener noreferrer">
          Calendário na ESPN <FiExternalLink aria-hidden="true" />
        </a>
      </div>

      {schedule.status === "error" && <ErrorBox error={schedule.error} onRetry={schedule.reload} />}
      {schedule.status === "loading" && !data && <Skeleton />}

      {data && (
        <div className={schedule.status === "loading" ? "espn-body updating" : "espn-body"}>
          {/* ---------- Cabeçalho: liga ou time ---------- */}
          {team ? (
            <>
              <header className="espn-team">
                <TeamLogo team={team} size={64} />
                <div className="espn-team-info">
                  <h2>{team.name}</h2>
                  <p>
                    {[standingText(team.standing), data.season && `temporada ${data.season}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Form games={data.results.slice(0, 5)} />
              </header>

              <Kpis
                items={[
                  {
                    icon: FiBarChart2,
                    label: "Campanha",
                    value: row ? `${row.wins}V · ${row.losses}D` : (team.record ?? "—"),
                    note: row?.pct ? `aproveitamento ${row.pct}` : null,
                  },
                  {
                    icon: FiAward,
                    label: "Posição",
                    value: row?.seed ? `${row.seed}º` : "—",
                    note: conference ? conferenceName(conference.name) : null,
                  },
                  {
                    icon: FiTrendingUp,
                    label: "Sequência",
                    value: streakText(row?.streak),
                    note: row?.lastTen ? `${row.lastTen} nos últimos 10` : null,
                  },
                  {
                    icon: FiZap,
                    label: "Jogos atrás",
                    value: row?.gamesBehind ?? "—",
                    note: "do líder da conferência",
                  },
                ]}
              />
            </>
          ) : (
            <header className="espn-team">
              <TeamLogo team={{ abbr: "NBA", logo: BASKETBALL.LEAGUE_LOGO }} size={64} />
              <div className="espn-team-info">
                <h2>NBA</h2>
                <p>
                  {[nbaSeasonType(data.seasonType), data.season && `temporada ${data.season}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </header>
          )}

          {next ? (
            <NextGame game={next} title={team ? "Próximo jogo" : "Próximo jogo da liga"} />
          ) : (
            <p className="espn-empty">Nenhum jogo marcado nos próximos dias.</p>
          )}

          <div className={team ? "espn-grid" : ""}>
            <Card
              title={team ? "Próximos jogos" : "Próximos jogos da liga"}
              icon={FiCalendar}
              action={
                upcoming.length > limit && (
                  <button type="button" className="espn-more" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? "Ver menos" : `Ver todos (${upcoming.length})`}
                  </button>
                )
              }
            >
              <GameList games={visible} now={now} />
            </Card>

            {team && (
              <Card title="Últimos resultados" icon={FiList}>
                <ResultList games={data.results.slice(0, 5)} />
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ---------- Classificação ---------- */}
      {showStandings && (
        <Card
          title={`Classificação${table.data?.season ? ` · ${table.data.season}` : ""}`}
          icon={FiBarChart2}
        >
          {table.status === "error" && <ErrorBox error={table.error} onRetry={table.reload} />}
          {table.status === "loading" && !table.data && <Skeleton blocks={[420]} />}
          {table.data && (
            <NbaStandings
              key={team?.id ?? "liga"}
              conferences={table.data.conferences}
              highlight={team?.id}
              onSelect={selectTeam}
            />
          )}
        </Card>
      )}
    </div>
  );
}
