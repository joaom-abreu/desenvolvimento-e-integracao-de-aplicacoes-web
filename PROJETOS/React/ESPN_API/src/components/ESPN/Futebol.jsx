import { useState } from "react";
import { FiAward, FiBarChart2, FiCalendar, FiExternalLink, FiList, FiTarget, FiTrendingUp } from "react-icons/fi";
import ESPN_CONFIG from "../../config/espnConfig";
import { fetchSoccerStandings, fetchSoccerTeam, fetchSoccerTeams } from "../../services/espnService";
import { formatPercent, formatSigned } from "./format";
import { Form, GameList, NextGame, ResultList } from "./Games";
import { Card, ErrorBox, Kpis, Skeleton, TeamLogo } from "./Shared";
import { SoccerStandings } from "./Standings";
import { standingText } from "./translate";
import { useEspn, useNow } from "./useEspn";

/**
 * Futebol: próximos jogos, últimos resultados e a tabela do campeonato.
 *
 * <Futebol />                      → time de ESPN_CONFIG.SOCCER.DEFAULT_TEAM_ID
 * <Futebol initialTeam="2022" />   → outro time (id da ESPN)
 * <Futebol showStandings={false} />
 */

const { SOCCER } = ESPN_CONFIG;

// "12-8-9" → "12V · 8E · 9D"
function recordText(record) {
  const [w, d, l] = (record ?? "").split("-");
  return record ? `${w}V · ${d}E · ${l}D` : "—";
}

export default function Futebol({ initialTeam = SOCCER.DEFAULT_TEAM_ID, showStandings = true }) {
  const [teamId, setTeamId] = useState(String(initialTeam));
  const [showAll, setShowAll] = useState(false);
  const now = useNow(30_000);

  const teams = useEspn(fetchSoccerTeams, []);
  const schedule = useEspn(() => fetchSoccerTeam(teamId), [teamId]);
  const table = useEspn(fetchSoccerStandings, []);

  const selectTeam = (id) => {
    setTeamId(String(id));
    setShowAll(false);
  };

  const data = schedule.data;
  const team = data?.team;
  const row = table.data?.rows.find((r) => r.team.id === teamId);
  const [next, ...upcoming] = data?.next ?? [];
  const visible = showAll ? upcoming : upcoming.slice(0, SOCCER.NEXT_GAMES - 1);

  // Time fora da lista da liga (ex.: id trocado no config) também aparece no select
  const options = teams.data ?? [];
  const teamOptions =
    team && !options.some((t) => t.id === team.id) ? [team, ...options] : options;

  return (
    <div className="espn-sport">
      {/* ---------- Escolha do time ---------- */}
      <div className="espn-toolbar">
        <label className="espn-select">
          <span>Time</span>
          <select value={teamId} onChange={(e) => selectTeam(e.target.value)}>
            {teamOptions.length === 0 && <option value={teamId}>Carregando times…</option>}
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <a className="espn-link" href={`${SOCCER.TEAM_PAGE}${teamId}`} target="_blank" rel="noopener noreferrer">
          Calendário na ESPN <FiExternalLink aria-hidden="true" />
        </a>
      </div>

      {schedule.status === "error" && <ErrorBox error={schedule.error} onRetry={schedule.reload} />}
      {schedule.status === "loading" && !data && <Skeleton />}

      {data && (
        <div className={schedule.status === "loading" ? "espn-body updating" : "espn-body"}>
          {/* ---------- Time ---------- */}
          <header className="espn-team">
            <TeamLogo team={team} size={64} />
            <div className="espn-team-info">
              <h2>{team?.name}</h2>
              <p>{standingText(team?.standing) ?? SOCCER.LEAGUE_NAME}</p>
            </div>
            <Form games={data.results.slice(0, SOCCER.LAST_RESULTS)} />
          </header>

          <Kpis
            items={[
              {
                icon: FiAward,
                label: "Posição",
                value: row ? `${row.rank}º` : "—",
                note: SOCCER.LEAGUE_NAME,
              },
              {
                icon: FiTarget,
                label: "Pontos",
                value: row ? row.points : "—",
                note: row ? `em ${row.played} jogos` : null,
              },
              {
                icon: FiBarChart2,
                label: "Campanha",
                value: recordText(row ? `${row.wins}-${row.draws}-${row.losses}` : team?.record),
                note: row ? `saldo ${formatSigned(row.goalDiff)}` : null,
              },
              {
                icon: FiTrendingUp,
                label: "Aproveitamento",
                value: row?.played ? formatPercent(row.points / (row.played * 3)) : "—",
                note: "dos pontos disputados",
              },
            ]}
          />

          {next ? (
            <NextGame game={next} />
          ) : (
            <p className="espn-empty">Nenhum jogo marcado por enquanto.</p>
          )}

          <div className="espn-grid">
            <Card
              title="Próximos jogos"
              icon={FiCalendar}
              action={
                upcoming.length > SOCCER.NEXT_GAMES - 1 && (
                  <button type="button" className="espn-more" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? "Ver menos" : `Ver todos (${upcoming.length})`}
                  </button>
                )
              }
            >
              <GameList games={visible} now={now} empty="Só o jogo em destaque está marcado." />
            </Card>

            <Card title="Últimos resultados" icon={FiList}>
              <ResultList games={data.results.slice(0, SOCCER.LAST_RESULTS)} />
            </Card>
          </div>
        </div>
      )}

      {/* ---------- Classificação ---------- */}
      {showStandings && (
        <Card
          title={`Classificação · ${SOCCER.LEAGUE_NAME}`}
          icon={FiBarChart2}
          action={
            <a className="espn-link" href={SOCCER.STANDINGS_PAGE} target="_blank" rel="noopener noreferrer">
              ESPN <FiExternalLink aria-hidden="true" />
            </a>
          }
        >
          {table.status === "error" && <ErrorBox error={table.error} onRetry={table.reload} />}
          {table.status === "loading" && !table.data && <Skeleton blocks={[420]} />}
          {table.data && (
            <SoccerStandings rows={table.data.rows} highlight={teamId} onSelect={selectTeam} />
          )}
        </Card>
      )}
    </div>
  );
}
