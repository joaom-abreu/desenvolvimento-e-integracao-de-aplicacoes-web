import ESPN_CONFIG from "../config/espnConfig";

// Chamadas à API pública da ESPN + normalização das respostas.
//
// A ESPN manda MUITA coisa (links, odds, estatísticas...). Aqui cada resposta
// vira um objeto pequeno, só com o que a tela usa, e com o mesmo formato no
// futebol e no basquete: os componentes não precisam saber de onde veio.
//
//   fetchSoccerTeams()          → times da liga (para o <select>)
//   fetchSoccerTeam(id)         → { team, next, results } de um time
//   fetchSoccerStandings()      → { season, rows } (classificação)
//   fetchNbaTeams()             → times da NBA
//   fetchNbaLeague()            → { season, phase, games } (próximos jogos da liga)
//   fetchNbaTeam(sigla)         → { team, next, results } de um time
//   fetchNbaStandings()         → { season, conferences } (Leste e Oeste)

const { SOCCER, BASKETBALL, CACHE_MS } = ESPN_CONFIG;

const ESPN_CDN = "https://a.espncdn.com/i";

/* =====================================================================
   fetch com cache (rodar de novo dentro de CACHE_MS não repete a chamada)
   ===================================================================== */

export class EspnError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const cache = new Map();

function cached(key, load) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.request;

  const request = load().catch((error) => {
    cache.delete(key); // deu erro: a próxima chamada tenta de novo
    throw error;
  });
  cache.set(key, { request, at: Date.now() });
  return request;
}

async function getJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new EspnError("network", "Sem conexão com a ESPN.");
  }
  if (!response.ok) {
    throw new EspnError("http", `A ESPN respondeu ${response.status}.`);
  }
  return response.json();
}

/* =====================================================================
   Normalização (futebol e basquete usam o mesmo formato de jogo)
   ===================================================================== */

// O placar vem como texto ("2"), número ou objeto ({ value: 2, displayValue: "2" })
function toNumber(value) {
  const raw = typeof value === "object" && value !== null ? value.value : value;
  if (raw === undefined || raw === null || raw === "") return null;
  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
}

// Escudo: o da lista "logos" (sem a versão cortada do placar) ou montado pelo id/sigla
function teamLogo(team = {}, sport) {
  const logos = team.logos ?? [];
  const find = (rel) =>
    logos.find((logo) => logo.rel?.includes(rel) && !logo.rel?.includes("scoreboard"))?.href;
  if (find("default")) return find("default");
  if (sport === "nba" && team.abbreviation) {
    return `${ESPN_CDN}/teamlogos/nba/500/${team.abbreviation.toLowerCase()}.png`;
  }
  if (sport === "soccer" && team.id) return `${ESPN_CDN}/teamlogos/soccer/500/${team.id}.png`;
  return team.logo ?? null;
}

export function normalizeTeam(team, sport) {
  if (!team) return null;
  return {
    id: String(team.id),
    name: team.displayName ?? team.name ?? "?",
    short: team.shortDisplayName ?? team.name ?? team.displayName ?? "?",
    abbr: team.abbreviation ?? "",
    logo: teamLogo(team, sport),
    color: team.color ? `#${team.color}` : null,
    // "12-8-9" (futebol: V-E-D) ou "2-1" (NBA: V-D)
    record: team.recordSummary ?? null,
    // "7th in Brazilian Serie A" / "1st in Pacific Division" (traduzido na tela)
    standing: team.standingSummary ?? null,
  };
}

// Campanha que vem junto do jogo: "records" no placar, "record" no calendário
function competitorRecord(competitor) {
  const pick = (list) => list?.find((r) => r.type === "total") ?? list?.[0];
  const value =
    pick(competitor.records)?.summary ?? pick(competitor.record)?.displayValue ?? null;
  return value === "0-0" || value === "0-0-0" ? null : value;
}

function normalizeCompetitor(competitor = {}, sport) {
  const team = normalizeTeam({ id: competitor.id, ...competitor.team }, sport);
  return {
    ...team,
    home: competitor.homeAway === "home",
    winner: competitor.winner === true,
    score: toNumber(competitor.score),
    aggregate: toNumber(competitor.score?.aggregateScore),
    shootout: toNumber(competitor.shootoutScore ?? competitor.score?.shootoutScore),
    record: competitorRecord(competitor),
  };
}

// Transmissão: "broadcasts[].names" no placar, "broadcasts[].media" no calendário
function broadcastNames(competition) {
  const names = (competition.broadcasts ?? []).flatMap(
    (b) => b.names ?? (b.media?.shortName ? [b.media.shortName] : [])
  );
  return [...new Set(names)];
}

// Fase do campeonato ("Semifinals", "Round of 16"...). Nos pontos corridos a
// ESPN manda o nome da temporada ("2026 Brasileiro Serie A"), que não é fase.
function phaseName(seasonType) {
  const name = seasonType?.name?.trim();
  if (!name || /\d{4}/.test(name) || /regular season|preseason/i.test(name)) return null;
  return name;
}

export function normalizeEvent(event, sport) {
  const competition = event.competitions?.[0] ?? {};
  const status = competition.status ?? event.status ?? {};
  const competitors = (competition.competitors ?? []).map((c) => normalizeCompetitor(c, sport));
  const home = competitors.find((c) => c.home) ?? competitors[0] ?? null;
  const away = competitors.find((c) => c !== home) ?? null;
  const league = event.league ?? {};
  const leagueLogoId = league.alternateId ?? league.id;
  const venue = competition.venue ?? {};
  const link = (event.links ?? []).find(
    (l) => l.rel?.includes("desktop") && (l.rel.includes("summary") || l.rel.includes("live"))
  )?.href;

  return {
    id: String(event.id),
    sport,
    date: Date.parse(competition.date ?? event.date),
    // Sem horário confirmado a ESPN manda uma hora qualquer: só vale o dia
    timeValid: event.timeValid !== false && competition.timeValid !== false,
    state: status.type?.state ?? "pre", // pre | in | post
    statusName: status.type?.name ?? "",
    statusDetail: status.type?.shortDetail ?? "",
    clock: status.displayClock ?? "",
    period: status.period ?? 0,
    league:
      sport === "nba"
        ? { name: "NBA", slug: "nba", logo: BASKETBALL.LEAGUE_LOGO }
        : {
            name: league.name ?? "",
            slug: league.slug ?? "",
            logo: leagueLogoId ? `${ESPN_CDN}/leaguelogos/soccer/500/${leagueLogoId}.png` : null,
          },
    // Tipo da temporada na NBA: 1 pré-temporada, 2 regular, 3 playoffs, 5 play-in
    seasonType: Number(event.season?.type ?? event.seasonType?.type) || null,
    phase: phaseName(event.seasonType),
    leg: competition.leg?.value ?? null, // 1 = ida, 2 = volta (mata-mata)
    note: competition.notes?.find((n) => n.type === "event" || n.headline)?.headline ?? null,
    venue: venue.fullName ?? null,
    city: venue.address?.city ?? null,
    tv: broadcastNames(competition),
    link: link ?? null,
    home,
    away,
  };
}

/* =====================================================================
   Ponto de vista de um time: "nós" x adversário e o resultado (V/E/D)
   ===================================================================== */

function fromTeamSide(game, teamId) {
  const us = [game.home, game.away].find((side) => side?.id === teamId) ?? null;
  const them = [game.home, game.away].find((side) => side && side.id !== teamId) ?? null;
  let result = null;
  if (game.state === "post" && us && them && us.score !== null && them.score !== null) {
    if (us.winner || us.score > them.score) result = "W";
    else if (them.winner || them.score > us.score) result = "L";
    else result = "D";
    // Empate no tempo normal decidido nos pênaltis: vale o "winner" da ESPN
    if (us.score === them.score && (us.winner || them.winner)) result = us.winner ? "W" : "L";
  }
  return { ...game, us, them, result };
}

// Jogo ao vivo primeiro; depois por horário
const sortGames = (games) =>
  [...games].sort((a, b) => (b.state === "in") - (a.state === "in") || a.date - b.date);

/* =====================================================================
   FUTEBOL
   ===================================================================== */

export function fetchSoccerTeams() {
  return cached("soccer:teams", async () => {
    const body = await getJson(`${SOCCER.SITE_API}/${SOCCER.LEAGUE}/teams`);
    const teams = body.sports?.[0]?.leagues?.[0]?.teams ?? [];
    return teams
      .map(({ team }) => normalizeTeam(team, "soccer"))
      .sort((a, b) => a.short.localeCompare(b.short, "pt-BR"));
  });
}

// Calendário (?fixture=true) e resultados vêm de dois endereços diferentes
export function fetchSoccerTeam(teamId) {
  return cached(`soccer:team:${teamId}`, async () => {
    const base = `${SOCCER.SITE_API}/all/teams/${teamId}/schedule`;
    const [fixtures, results] = await Promise.allSettled([
      getJson(`${base}?fixture=true`),
      getJson(base),
    ]);
    if (fixtures.status === "rejected" && results.status === "rejected") throw fixtures.reason;

    const bodies = [fixtures, results].filter((r) => r.status === "fulfilled").map((r) => r.value);
    const games = new Map();
    for (const body of bodies) {
      for (const event of body.events ?? []) {
        const game = normalizeEvent(event, "soccer");
        // Jogo em andamento pode estar nas duas listas: fica o mais novo
        games.set(game.id, fromTeamSide(game, String(teamId)));
      }
    }
    const all = [...games.values()];

    return {
      team: normalizeTeam(bodies[0]?.team, "soccer"),
      next: sortGames(all.filter((g) => g.state !== "post")),
      results: all.filter((g) => g.state === "post").sort((a, b) => b.date - a.date),
    };
  });
}

// "entries[].stats" é uma lista de { name, value, displayValue }
const stat = (entry, name) => entry.stats?.find((s) => s.name === name);

export function fetchSoccerStandings() {
  return cached("soccer:standings", async () => {
    const body = await getJson(`${SOCCER.STANDINGS_API}/${SOCCER.LEAGUE}/standings`);
    const group = body.children?.[0]?.standings ?? body.standings ?? {};
    const rows = (group.entries ?? [])
      .map((entry) => ({
        rank: stat(entry, "rank")?.value ?? null,
        team: normalizeTeam(entry.team, "soccer"),
        played: stat(entry, "gamesPlayed")?.value ?? 0,
        wins: stat(entry, "wins")?.value ?? 0,
        draws: stat(entry, "ties")?.value ?? 0,
        losses: stat(entry, "losses")?.value ?? 0,
        goalsFor: stat(entry, "pointsFor")?.value ?? 0,
        goalsAgainst: stat(entry, "pointsAgainst")?.value ?? 0,
        goalDiff: stat(entry, "pointDifferential")?.value ?? 0,
        points: stat(entry, "points")?.value ?? 0,
      }))
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
      .map((row, i) => ({ ...row, rank: row.rank ?? i + 1 }));

    return { season: group.seasonDisplayName ?? body.name ?? "", rows };
  });
}

/* =====================================================================
   BASQUETE (NBA)
   ===================================================================== */

export function fetchNbaTeams() {
  return cached("nba:teams", async () => {
    const body = await getJson(`${BASKETBALL.SITE_API}/teams`);
    const teams = body.sports?.[0]?.leagues?.[0]?.teams ?? [];
    return teams
      .map(({ team }) => normalizeTeam(team, "nba"))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  });
}

// { year: 2027 } → "2026-27" (a ESPN chama a temporada pelo ano em que acaba)
function seasonName(season) {
  if (!season) return "";
  if (/\d{4}-\d{2}/.test(season.displayName ?? "")) return season.displayName;
  const year = Number(season.year);
  return year ? `${year - 1}-${String(year).slice(2)}` : "";
}

// O calendário vem como lista de datas ("2026-10-09T07:00Z") ou de objetos
function calendarDays(league) {
  return (league?.calendar ?? [])
    .map((day) => (typeof day === "string" ? day : (day?.startDate ?? day?.value)))
    .filter(Boolean)
    .map((day) => day.slice(0, 10));
}

export function fetchNbaLeague() {
  return cached("nba:league", async () => {
    const scoreboard = `${BASKETBALL.SITE_API}/scoreboard`;
    const today = await getJson(scoreboard);
    const todayDate = today.day?.date ?? new Date().toISOString().slice(0, 10);
    const nextDays = calendarDays(today.leagues?.[0])
      .filter((day) => day > todayDate)
      .slice(0, BASKETBALL.DAYS_MAX);

    const games = new Map();
    const add = (events = []) =>
      events.forEach((event) => {
        const game = normalizeEvent(event, "nba");
        if (game.state !== "post") games.set(game.id, game);
      });
    add(today.events);

    // De 3 em 3 dias, até ter NEXT_GAMES jogos (na pré-temporada há dias com 1 jogo só)
    for (let i = 0; i < nextDays.length && games.size < BASKETBALL.NEXT_GAMES; i += 3) {
      const days = nextDays.slice(i, i + 3);
      const responses = await Promise.allSettled(
        days.map((day) => getJson(`${scoreboard}?dates=${day.replaceAll("-", "")}`))
      );
      responses.forEach((r) => r.status === "fulfilled" && add(r.value.events));
    }

    return {
      season: seasonName(today.season ?? today.leagues?.[0]?.season),
      seasonType: Number(today.season?.type) || null,
      games: sortGames([...games.values()]),
    };
  });
}

// Sem parâmetro a ESPN manda só a fase atual (na pré-temporada, só os amistosos):
// por isso vai junto a temporada regular (?seasontype=2)
export function fetchNbaTeam(abbr) {
  return cached(`nba:team:${abbr}`, async () => {
    const base = `${BASKETBALL.SITE_API}/teams/${abbr}/schedule`;
    const [current, regular] = await Promise.allSettled([
      getJson(base),
      getJson(`${base}?seasontype=2`),
    ]);
    if (current.status === "rejected" && regular.status === "rejected") throw current.reason;

    const bodies = [current, regular].filter((r) => r.status === "fulfilled").map((r) => r.value);
    const team = normalizeTeam(bodies[0].team, "nba");
    const games = new Map();
    for (const body of bodies) {
      for (const event of body.events ?? []) {
        const game = normalizeEvent(event, "nba");
        games.set(game.id, fromTeamSide(game, team.id));
      }
    }
    const all = [...games.values()];

    return {
      team,
      season: seasonName(bodies[0].requestedSeason ?? bodies[0].season),
      next: sortGames(all.filter((g) => g.state !== "post")),
      results: all.filter((g) => g.state === "post").sort((a, b) => b.date - a.date),
    };
  });
}

export function fetchNbaStandings() {
  return cached("nba:standings", async () => {
    const body = await getJson(BASKETBALL.STANDINGS_API);
    const conferences = (body.children ?? []).map((conference) => {
      const group = conference.standings ?? {};
      const rows = (group.entries ?? [])
        .map((entry) => ({
          seed: Number(stat(entry, "playoffSeed")?.value) || null,
          team: normalizeTeam(entry.team, "nba"),
          wins: stat(entry, "wins")?.value ?? 0,
          losses: stat(entry, "losses")?.value ?? 0,
          pct: stat(entry, "winPercent")?.displayValue ?? "",
          gamesBehind: stat(entry, "gamesBehind")?.displayValue ?? "-",
          streak: stat(entry, "streak")?.displayValue ?? "",
          lastTen: stat(entry, "Last Ten Games")?.displayValue ?? null,
        }))
        .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));
      return {
        key: (conference.abbreviation ?? conference.name ?? "").toLowerCase(),
        name: conference.name ?? "",
        season: group.seasonDisplayName ?? "",
        rows,
      };
    });
    return { season: conferences[0]?.season ?? "", conferences };
  });
}
