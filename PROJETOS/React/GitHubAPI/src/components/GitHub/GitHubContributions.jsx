import { fetchContributions } from "../../services/githubService";
import useGitHub, { formatDate, formatNumber } from "./useGitHub";
import "./GitHub.css";

const WEEKDAYS = ["", "seg", "", "qua", "", "sex", ""];

// Nível de cor (0 a 4) por quartis dos dias com contribuição, como no GitHub
function levelsFor(days) {
  const counts = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p) => counts[Math.floor((counts.length - 1) * p)] ?? 0;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  return (count) => {
    if (count === 0) return 0;
    if (count <= q1) return 1;
    if (count <= q2) return 2;
    if (count <= q3) return 3;
    return 4;
  };
}

// Maior sequência de dias seguidos e sequência atual (até hoje ou ontem)
function streaks(days) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let i = days.length - 1;
  if (days[i]?.count === 0) i -= 1; // hoje ainda sem contribuição não quebra a sequência
  for (; i >= 0 && days[i].count > 0; i -= 1) current += 1;
  return { longest, current };
}

// Agrupa os dias em semanas (colunas), começando no domingo
function toWeeks(days) {
  const weeks = [];
  const firstWeekday = new Date(`${days[0].date}T12:00:00`).getDay();
  let week = Array(firstWeekday).fill(null);
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);
  return weeks;
}

// Rótulo do mês na coluna em que o mês começa
function monthLabels(weeks) {
  let lastMonth = null;
  return weeks.map((week) => {
    const first = week.find(Boolean);
    const month = first ? new Date(`${first.date}T12:00:00`).getMonth() : null;
    if (month === null || month === lastMonth) return "";
    lastMonth = month;
    return new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(new Date(`${first.date}T12:00:00`))
      .replace(".", "");
  });
}

/**
 * Calendário de contribuições do último ano (os "quadradinhos" do perfil).
 *
 * <GitHubContributions username="joaopauloaramuni" />
 */
export default function GitHubContributions({ username }) {
  const { status, data } = useGitHub(fetchContributions, username);

  if (status === "loading") return <div className="gh-card gh-skeleton gh-skeleton-block" />;
  if (status === "error" || !data?.days?.length) return null;

  const days = data.days;
  const level = levelsFor(days);
  const weeks = toWeeks(days);
  const months = monthLabels(weeks);
  const { longest, current } = streaks(days);
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);

  return (
    <section className="gh-card">
      <div className="gh-card-head">
        <h3>
          {formatNumber(data.total)} contribuições <span className="gh-light">no último ano</span>
        </h3>
        <span className="gh-card-note">
          {formatDate(days[0].date)} – {formatDate(days.at(-1).date)}
        </span>
      </div>

      <div className="gh-heatmap-scroll">
        <div className="gh-heatmap" style={{ "--weeks": weeks.length }}>
          <span />
          {months.map((label, i) => (
            <span key={`m${i}`} className="gh-heatmap-month">
              {label}
            </span>
          ))}

          <div className="gh-heatmap-weekdays" aria-hidden="true">
            {WEEKDAYS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {weeks.map((week, w) => (
            <div key={w} className="gh-heatmap-week">
              {Array.from({ length: 7 }, (_, d) => {
                const day = week[d];
                if (!day) return <span key={d} className="gh-cell empty" />;
                const label = `${day.count} ${day.count === 1 ? "contribuição" : "contribuições"} em ${formatDate(day.date)}`;
                return (
                  <span
                    key={d}
                    className={`gh-cell l${level(day.count)}`}
                    title={label}
                    aria-label={label}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="gh-heatmap-footer">
        <ul className="gh-streaks">
          <li>
            <strong>{current}</strong> {current === 1 ? "dia" : "dias"} seguidos agora
          </li>
          <li>
            <strong>{longest}</strong> dias na maior sequência
          </li>
          <li>
            <strong>{best.count}</strong> no melhor dia ({formatDate(best.date)})
          </li>
        </ul>

        <div className="gh-scale" aria-hidden="true">
          menos
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`gh-cell l${l}`} />
          ))}
          mais
        </div>
      </div>
    </section>
  );
}
