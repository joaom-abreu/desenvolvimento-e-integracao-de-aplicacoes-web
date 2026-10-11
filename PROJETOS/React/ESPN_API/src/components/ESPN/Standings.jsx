import { useState } from "react";
import ESPN_CONFIG from "../../config/espnConfig";
import { formatSigned } from "./format";
import { TeamLogo } from "./Shared";
import { conferenceName } from "./translate";

/* =====================================================================
   Futebol: tabela do campeonato com as faixas (Libertadores, Z4...)
   ===================================================================== */

const zoneOf = (rank) =>
  ESPN_CONFIG.SOCCER.ZONES.find((zone) => rank >= zone.from && rank <= zone.to) ?? null;

export function SoccerStandings({ rows, highlight, onSelect }) {
  if (!rows.length) return <p className="espn-empty">Classificação indisponível.</p>;

  return (
    <>
      <div className="espn-table-wrap">
        <table className="espn-table">
          <thead>
            <tr>
              <th scope="col" className="num">#</th>
              <th scope="col" className="team">Time</th>
              <th scope="col" title="Pontos">P</th>
              <th scope="col" title="Jogos">J</th>
              <th scope="col" title="Vitórias">V</th>
              <th scope="col" title="Empates">E</th>
              <th scope="col" title="Derrotas">D</th>
              <th scope="col" title="Gols pró" className="hide-sm">GP</th>
              <th scope="col" title="Gols contra" className="hide-sm">GC</th>
              <th scope="col" title="Saldo de gols">SG</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const zone = zoneOf(row.rank);
              const mine = row.team.id === highlight;
              return (
                <tr
                  key={row.team.id}
                  className={`${zone ? `zone-${zone.key}` : ""} ${mine ? "is-mine" : ""}`}
                  aria-current={mine ? "true" : undefined}
                >
                  <td className="num">
                    <span className="espn-rank">{row.rank}</span>
                  </td>
                  <td className="team">
                    <button
                      type="button"
                      className="espn-team-btn"
                      onClick={() => onSelect?.(row.team.id)}
                      title={`Ver jogos do ${row.team.name}`}
                    >
                      <TeamLogo team={row.team} size={22} />
                      <span>{row.team.short}</span>
                    </button>
                  </td>
                  <td>
                    <strong>{row.points}</strong>
                  </td>
                  <td>{row.played}</td>
                  <td>{row.wins}</td>
                  <td>{row.draws}</td>
                  <td>{row.losses}</td>
                  <td className="hide-sm">{row.goalsFor}</td>
                  <td className="hide-sm">{row.goalsAgainst}</td>
                  <td>{formatSigned(row.goalDiff)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="espn-legend">
        {ESPN_CONFIG.SOCCER.ZONES.map((zone) => (
          <li key={zone.key} className={`zone-${zone.key}`}>
            <span aria-hidden="true" />
            {zone.label} ({zone.from}º{zone.to !== zone.from ? `–${zone.to}º` : ""})
          </li>
        ))}
      </ul>
    </>
  );
}

/* =====================================================================
   NBA: Conferência Leste e Oeste
   ===================================================================== */

// Na NBA, 1º a 6º vão direto para os playoffs; 7º a 10º disputam o play-in
const nbaZone = (seed) => (seed <= 6 ? "playoffs" : seed <= 10 ? "playin" : null);

export function NbaStandings({ conferences, highlight, onSelect }) {
  // Abre na conferência do time escolhido
  const mine = conferences.findIndex((c) => c.rows.some((row) => row.team.id === highlight));
  const [picked, setPicked] = useState(null);
  const index = picked ?? (mine >= 0 ? mine : 0);
  const conference = conferences[index];

  if (!conference) return <p className="espn-empty">Classificação indisponível.</p>;

  return (
    <>
      <div className="espn-tabs espn-tabs-small" role="tablist" aria-label="Conferência">
        {conferences.map((c, i) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? "active" : ""}
            onClick={() => setPicked(i)}
          >
            {conferenceName(c.name)}
          </button>
        ))}
      </div>

      <div className="espn-table-wrap">
        <table className="espn-table">
          <thead>
            <tr>
              <th scope="col" className="num">#</th>
              <th scope="col" className="team">Time</th>
              <th scope="col" title="Vitórias">V</th>
              <th scope="col" title="Derrotas">D</th>
              <th scope="col" title="Aproveitamento">%</th>
              <th scope="col" title="Jogos atrás do líder">JA</th>
              <th scope="col" title="Sequência" className="hide-sm">Seq.</th>
              <th scope="col" title="Últimos 10 jogos" className="hide-sm">Últ. 10</th>
            </tr>
          </thead>
          <tbody>
            {conference.rows.map((row) => {
              const zone = nbaZone(row.seed);
              const isMine = row.team.id === highlight;
              return (
                <tr
                  key={row.team.id}
                  className={`${zone ? `zone-${zone}` : ""} ${isMine ? "is-mine" : ""}`}
                  aria-current={isMine ? "true" : undefined}
                >
                  <td className="num">
                    <span className="espn-rank">{row.seed}</span>
                  </td>
                  <td className="team">
                    <button
                      type="button"
                      className="espn-team-btn"
                      onClick={() => onSelect?.(row.team.abbr.toLowerCase())}
                      title={`Ver jogos do ${row.team.name}`}
                    >
                      <TeamLogo team={row.team} size={22} />
                      <span>{row.team.short}</span>
                    </button>
                  </td>
                  <td>
                    <strong>{row.wins}</strong>
                  </td>
                  <td>{row.losses}</td>
                  <td>{row.pct}</td>
                  <td>{row.gamesBehind}</td>
                  <td className={`hide-sm streak ${row.streak.startsWith("W") ? "up" : "down"}`}>
                    {row.streak.replace("W", "V").replace("L", "D")}
                  </td>
                  <td className="hide-sm">{row.lastTen ?? "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="espn-legend">
        <li className="zone-playoffs">
          <span aria-hidden="true" />
          Playoffs (1º–6º)
        </li>
        <li className="zone-playin">
          <span aria-hidden="true" />
          Play-in (7º–10º)
        </li>
      </ul>
    </>
  );
}
